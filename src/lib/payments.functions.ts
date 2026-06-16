import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { type StripeEnv, createStripeClient } from "@/lib/stripe.server";

/**
 * Cria sessão de checkout para a assinatura do ControleJá:
 *  - Linha 1: assinatura mensal R$ 39,90 (controleja_monthly)
 *  - Linha 2: taxa de ativação R$ 100,00 única (controleja_activation_fee)
 * Resultado: primeiro mês R$ 139,90, depois R$ 39,90/mês.
 */
export const createSignupCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: {
    email: string;
    userId: string;
    returnUrl: string;
    environment: StripeEnv;
  }) => {
    if (!data.email?.includes("@")) throw new Error("Email inválido");
    if (!data.userId) throw new Error("userId obrigatório");
    return data;
  })
  .handler(async ({ data, context }) => {
    if (data.userId !== context.userId) {
      throw new Error("userId não corresponde ao usuário autenticado");
    }
    const stripe = createStripeClient(data.environment);

    const [monthly, activation] = await Promise.all([
      stripe.prices.list({ lookup_keys: ["controleja_monthly"], limit: 1 }),
      stripe.prices.list({ lookup_keys: ["controleja_activation_fee"], limit: 1 }),
    ]);

    if (!monthly.data.length) throw new Error("Preço mensal não encontrado");
    if (!activation.data.length) throw new Error("Preço de ativação não encontrado");

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      ui_mode: "embedded_page",
      return_url: data.returnUrl,
      customer_email: data.email,
      line_items: [
        { price: monthly.data[0].id, quantity: 1 },
        { price: activation.data[0].id, quantity: 1 },
      ],
      metadata: { userId: data.userId },
      subscription_data: { metadata: { userId: data.userId } },
    });

    return session.client_secret;
  });

export const createPortalSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { returnUrl?: string; environment: StripeEnv }) => data)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: sub, error } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id, grandfathered")
      .eq("user_id", userId)
      .eq("environment", data.environment)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!sub || sub.grandfathered || !sub.stripe_customer_id) {
      throw new Error("Sem assinatura ativa para gerenciar");
    }

    const stripe = createStripeClient(data.environment);
    const portal = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      ...(data.returnUrl && { return_url: data.returnUrl }),
    });
    return portal.url;
  });
