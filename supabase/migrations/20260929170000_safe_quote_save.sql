-- Keep the entered order and replace the entire quote in one transaction.
-- Historical insertion order was not recorded; do not guess it or delete old items.
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS labor_label text DEFAULT 'Mão de Obra';
ALTER TABLE public.quote_items ADD COLUMN IF NOT EXISTS position integer;
CREATE UNIQUE INDEX IF NOT EXISTS quote_items_quote_position_idx
  ON public.quote_items (quote_id, position);

CREATE OR REPLACE FUNCTION public.save_quote(
  p_quote_id uuid,
  p_quote jsonb,
  p_items jsonb DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  saved public.quotes;
  fields jsonb;
  owner_id uuid := auth.uid();
BEGIN
  IF owner_id IS NULL THEN
    RAISE EXCEPTION 'Sessão expirada. Entre novamente para salvar.';
  END IF;
  IF p_quote_id IS NULL OR jsonb_typeof(p_quote) IS DISTINCT FROM 'object' THEN
    RAISE EXCEPTION 'Orçamento inválido';
  END IF;

  -- Serializes concurrent saves, including retries of a newly created quote.
  PERFORM pg_advisory_xact_lock(hashtextextended(p_quote_id::text, 0));
  SELECT * INTO saved FROM public.quotes WHERE id = p_quote_id FOR UPDATE;
  IF FOUND THEN
    IF saved.user_id <> owner_id THEN
      RAISE EXCEPTION 'Orçamento não encontrado';
    END IF;
    IF saved.status = 'Aprovado' AND p_items IS NOT NULL THEN
      RAISE EXCEPTION 'Orçamentos aprovados não podem ser editados';
    END IF;
    fields := to_jsonb(saved) || p_quote;
  ELSE
    IF p_items IS NULL THEN
      RAISE EXCEPTION 'Orçamento não encontrado';
    END IF;
    fields := p_quote;
  END IF;

  IF NULLIF(fields->>'customer_id', '') IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.customers
    WHERE id = (fields->>'customer_id')::uuid AND user_id = owner_id
  ) THEN
    RAISE EXCEPTION 'Cliente inválido';
  END IF;

  IF p_items IS NOT NULL THEN
    IF jsonb_typeof(p_items) IS DISTINCT FROM 'array' THEN
      RAISE EXCEPTION 'Lista de itens inválida';
    END IF;
    IF EXISTS (
      SELECT 1 FROM jsonb_array_elements(p_items) AS item
      WHERE COALESCE((item->>'quantity')::numeric, 0) <= 0
        OR (item->>'quantity')::numeric <> trunc((item->>'quantity')::numeric)
        OR COALESCE((item->>'unit_price')::numeric, -1) < 0
    ) THEN
      RAISE EXCEPTION 'Verifique as quantidades e os preços dos itens';
    END IF;
    IF EXISTS (
      SELECT 1 FROM jsonb_array_elements(p_items) AS item
      WHERE (NULLIF(item->>'product_id', '') IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM public.products p
        WHERE p.id = (item->>'product_id')::uuid AND p.user_id = owner_id
      )) OR (NULLIF(item->>'variation_id', '') IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM public.variations v JOIN public.products p ON p.id = v.product_id
        WHERE v.id = (item->>'variation_id')::uuid
          AND v.product_id = (item->>'product_id')::uuid AND p.user_id = owner_id
      ))
    ) THEN
      RAISE EXCEPTION 'Produto ou variação inválida';
    END IF;
    -- Derive totals from the same items that are committed.
    fields := fields || jsonb_build_object('subtotal', (
      SELECT COALESCE(sum((item->>'quantity')::numeric * (item->>'unit_price')::numeric), 0)
      FROM jsonb_array_elements(p_items) AS item
    ));
    fields := fields || jsonb_build_object('total',
      (fields->>'subtotal')::numeric + COALESCE((fields->>'labor_value')::numeric, 0)
      - COALESCE((fields->>'discount')::numeric, 0));
  END IF;

  INSERT INTO public.quotes (
    id, user_id, customer_id, status, subtotal, labor_value, labor_label,
    discount, total, validity_date, notes, payment_conditions
  ) VALUES (
    p_quote_id, owner_id, NULLIF(fields->>'customer_id', '')::uuid,
    COALESCE(fields->>'status', 'Pendente'), COALESCE((fields->>'subtotal')::numeric, 0),
    COALESCE((fields->>'labor_value')::numeric, 0), COALESCE(fields->>'labor_label', 'Mão de Obra'),
    COALESCE((fields->>'discount')::numeric, 0), COALESCE((fields->>'total')::numeric, 0),
    NULLIF(fields->>'validity_date', '')::date, fields->>'notes', fields->>'payment_conditions'
  ) ON CONFLICT (id) DO UPDATE SET
    customer_id = EXCLUDED.customer_id, status = EXCLUDED.status,
    subtotal = EXCLUDED.subtotal, labor_value = EXCLUDED.labor_value,
    labor_label = EXCLUDED.labor_label, discount = EXCLUDED.discount,
    total = EXCLUDED.total, validity_date = EXCLUDED.validity_date,
    notes = EXCLUDED.notes, payment_conditions = EXCLUDED.payment_conditions
  RETURNING * INTO saved;

  IF p_items IS NOT NULL THEN
    DELETE FROM public.quote_items WHERE quote_id = p_quote_id;
    INSERT INTO public.quote_items (
      quote_id, product_id, variation_id, manual_name, quantity, unit_price, is_service, position
    ) SELECT
      p_quote_id, NULLIF(item->>'product_id', '')::uuid,
      NULLIF(item->>'variation_id', '')::uuid, item->>'manual_name',
      (item->>'quantity')::integer, (item->>'unit_price')::numeric,
      COALESCE((item->>'is_service')::boolean, false), (ordinality - 1)::integer
    FROM jsonb_array_elements(p_items) WITH ORDINALITY AS entries(item, ordinality);
  END IF;

  RETURN jsonb_build_object('quote', to_jsonb(saved), 'items', (
    SELECT COALESCE(jsonb_agg(to_jsonb(i) ORDER BY i.position NULLS LAST, i.id), '[]'::jsonb)
    FROM public.quote_items i WHERE i.quote_id = p_quote_id
  ));
END;
$$;

REVOKE ALL ON FUNCTION public.save_quote(uuid, jsonb, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.save_quote(uuid, jsonb, jsonb) TO authenticated;
