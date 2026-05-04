import { useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type Variation = {
  id: string;
  name: string;
  stock: number;
  cost: number;
  margin: number;
};

export type Product = {
  id: string;
  name: string;
  image?: string;
  cost: number;
  margin: number;
  stock: number;
  minStock: number;
  variations: Variation[];
  usage: number;
  createdAt: number;
};

export type Movement = {
  id: string;
  productId: string;
  productName: string;
  variationId?: string;
  variationName?: string;
  type: "in" | "out";
  quantity: number;
  date: number;
};

type State = {
  products: Product[];
  movements: Movement[];
  loaded: boolean;
};

let state: State = { products: [], movements: [], loaded: false };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const setState = (patch: Partial<State>) => {
  state = { ...state, ...patch };
  emit();
};

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const getSnapshot = () => state;
const serverSnap: State = { products: [], movements: [], loaded: false };
const getServer = () => serverSnap;

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(subscribe, () => selector(getSnapshot()), () => selector(getServer()));
}

function rowToProduct(p: any, vars: any[]): Product {
  return {
    id: p.id,
    name: p.name,
    image: p.image ?? undefined,
    cost: Number(p.cost),
    margin: Number(p.margin),
    stock: p.stock,
    minStock: p.min_stock,
    usage: p.usage,
    createdAt: new Date(p.created_at).getTime(),
    variations: vars
      .filter((v) => v.product_id === p.id)
      .map((v) => ({ id: v.id, name: v.name, stock: v.stock, cost: Number(v.cost), margin: Number(v.margin) })),
  };
}

function rowToMovement(m: any): Movement {
  return {
    id: m.id,
    productId: m.product_id,
    productName: m.product_name,
    variationId: m.variation_id ?? undefined,
    variationName: m.variation_name ?? undefined,
    type: m.type,
    quantity: m.quantity,
    date: new Date(m.created_at).getTime(),
  };
}

export const actions = {
  async loadAll() {
    const [{ data: prods }, { data: vars }, { data: movs }] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("variations").select("*"),
      supabase.from("movements").select("*").order("created_at", { ascending: false }).limit(500),
    ]);
    const products = (prods ?? []).map((p) => rowToProduct(p, vars ?? []));
    const movements = (movs ?? []).map(rowToMovement);
    setState({ products, movements, loaded: true });
  },

  reset() {
    setState({ products: [], movements: [], loaded: false });
  },

  async addProduct(p: Omit<Product, "id" | "usage" | "createdAt" | "variations"> & { variations?: Omit<Variation, "id">[] }) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return toast.error("Faça login");
    const { data: row, error } = await supabase
      .from("products")
      .insert({
        user_id: user.user.id,
        name: p.name,
        image: p.image,
        cost: p.cost,
        margin: p.margin,
        stock: p.stock,
        min_stock: p.minStock,
      })
      .select()
      .single();
    if (error || !row) return toast.error(error?.message ?? "Erro ao salvar");
    let varRows: any[] = [];
    if (p.variations && p.variations.length > 0) {
      const { data: vRows } = await supabase
        .from("variations")
        .insert(
          p.variations.map((v) => ({
            user_id: user.user!.id,
            product_id: row.id,
            name: v.name,
            stock: v.stock,
            cost: v.cost,
            margin: v.margin,
          })),
        )
        .select();
      varRows = vRows ?? [];
    }
    const product = rowToProduct(row, varRows);
    setState({ products: [product, ...state.products] });
  },

  async updateProduct(id: string, patch: Partial<Omit<Product, "variations">> & { variations?: (Omit<Variation, "id"> & { id?: string })[] }) {
    const update: any = {};
    if (patch.name !== undefined) update.name = patch.name;
    if (patch.image !== undefined) update.image = patch.image;
    if (patch.cost !== undefined) update.cost = patch.cost;
    if (patch.margin !== undefined) update.margin = patch.margin;
    if (patch.stock !== undefined) update.stock = patch.stock;
    if (patch.minStock !== undefined) update.min_stock = patch.minStock;
    if (Object.keys(update).length > 0) {
      const { error } = await supabase.from("products").update(update).eq("id", id);
      if (error) return toast.error(error.message);
    }

    let newVars: Variation[] | undefined;
    if (patch.variations) {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;
      // simple sync: delete all then re-insert
      await supabase.from("variations").delete().eq("product_id", id);
      if (patch.variations.length > 0) {
        const { data: inserted } = await supabase
          .from("variations")
          .insert(
            patch.variations.map((v) => ({
              user_id: user.user!.id,
              product_id: id,
              name: v.name,
              stock: v.stock,
              cost: v.cost,
              margin: v.margin,
            })),
          )
          .select();
        newVars = (inserted ?? []).map((v: any) => ({
          id: v.id,
          name: v.name,
          stock: v.stock,
          cost: Number(v.cost),
          margin: Number(v.margin),
        }));
      } else {
        newVars = [];
      }
    }

    setState({
      products: state.products.map((p) =>
        p.id === id
          ? {
              ...p,
              ...(patch.name !== undefined && { name: patch.name }),
              ...(patch.image !== undefined && { image: patch.image }),
              ...(patch.cost !== undefined && { cost: patch.cost }),
              ...(patch.margin !== undefined && { margin: patch.margin }),
              ...(patch.stock !== undefined && { stock: patch.stock }),
              ...(patch.minStock !== undefined && { minStock: patch.minStock }),
              ...(newVars !== undefined && { variations: newVars }),
            }
          : p,
      ),
    });
  },

  async deleteProduct(id: string) {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setState({ products: state.products.filter((p) => p.id !== id) });
  },

  async move(args: { productId: string; variationId?: string; quantity: number; type: "in" | "out" }) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return toast.error("Faça login");
    const product = state.products.find((p) => p.id === args.productId);
    if (!product) return;
    const qty = Math.abs(args.quantity);
    const delta = args.type === "in" ? qty : -qty;

    let variationName: string | undefined;
    let updatedProduct: Product;
    if (args.variationId) {
      const v = product.variations.find((x) => x.id === args.variationId);
      variationName = v?.name;
      const newStock = Math.max(0, (v?.stock ?? 0) + delta);
      await supabase.from("variations").update({ stock: newStock }).eq("id", args.variationId);
      updatedProduct = {
        ...product,
        usage: product.usage + 1,
        variations: product.variations.map((x) => (x.id === args.variationId ? { ...x, stock: newStock } : x)),
      };
    } else {
      const newStock = Math.max(0, product.stock + delta);
      await supabase.from("products").update({ stock: newStock, usage: product.usage + 1 }).eq("id", product.id);
      updatedProduct = { ...product, usage: product.usage + 1, stock: newStock };
    }

    if (args.variationId) {
      await supabase.from("products").update({ usage: product.usage + 1 }).eq("id", product.id);
    }

    const { data: mRow } = await supabase
      .from("movements")
      .insert({
        user_id: user.user.id,
        product_id: product.id,
        product_name: product.name,
        variation_id: args.variationId ?? null,
        variation_name: variationName ?? null,
        type: args.type,
        quantity: qty,
      })
      .select()
      .single();

    setState({
      products: state.products.map((p) => (p.id === product.id ? updatedProduct : p)),
      movements: mRow ? [rowToMovement(mRow), ...state.movements] : state.movements,
    });
  },
};

export function priceFromCostMargin(cost: number, margin: number) {
  return cost * (1 + margin / 100);
}
export function productEffectiveStock(p: Product) {
  if (p.variations.length > 0) return p.variations.reduce((s, v) => s + v.stock, 0);
  return p.stock;
}
export function stockStatus(stock: number, min: number): "ok" | "low" | "empty" {
  if (stock <= 0) return "empty";
  if (stock <= min) return "low";
  return "ok";
}
export function formatBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
