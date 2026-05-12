import { useSyncExternalStore } from "react";
import { supabase as supabaseTyped } from "@/integrations/supabase/client";
const supabase: any = supabaseTyped;
import { toast } from "sonner";

export type Variation = {
  id: string;
  name: string;
  stock: number;
  cost: number;
  margin: number;
};

export type Supplier = {
  id: string;
  name: string;
  phone?: string;
  createdAt: number;
  updatedAt: number;
};

export type Category = {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
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
  supplierId?: string;
  categoryId?: string;
};

export type PriceHistory = {
  id: string;
  productId: string;
  supplierId?: string;
  purchasePrice: number;
  createdAt: number;
};

export type Kit = {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
};

export type KitItem = {
  kitId: string;
  productId: string;
  quantity: number;
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

export type Customer = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  cpf?: string;
  address?: string;
  createdAt: number;
};

export type Sale = {
  id: string;
  customerId?: string;
  totalAmount: number;
  paymentMethod?: string;
  createdAt: number;
};

export type SaleItem = {
  id: string;
  saleId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
};

export type Purchase = {
  id: string;
  supplierId?: string;
  totalAmount: number;
  createdAt: number;
};

export type PurchaseItem = {
  id: string;
  purchaseId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
};

type State = {
  products: Product[];
  movements: Movement[];
  suppliers: Supplier[];
  categories: Category[];
  priceHistory: PriceHistory[];
  kits: Kit[];
  kitItems: KitItem[];
  customers: Customer[];
  sales: Sale[];
  saleItems: SaleItem[];
  purchases: Purchase[];
  purchaseItems: PurchaseItem[];
  loaded: boolean;
};

let state: State = { 
  products: [], movements: [], suppliers: [], categories: [], priceHistory: [], 
  kits: [], kitItems: [], customers: [], sales: [], saleItems: [], 
  purchases: [], purchaseItems: [], loaded: false 
};
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
const serverSnap: State = { 
  products: [], movements: [], suppliers: [], categories: [], priceHistory: [], 
  kits: [], kitItems: [], customers: [], sales: [], saleItems: [], 
  purchases: [], purchaseItems: [], loaded: false 
};
const getServer = () => serverSnap;

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(subscribe, () => selector(getSnapshot()), () => selector(getServer()));
}

export function productEffectiveStock(p: Product): number {
  if (p.variations && p.variations.length > 0) {
    return p.variations.reduce((sum, v) => sum + (v.stock ?? 0), 0);
  }
  return p.stock ?? 0;
}

export function stockStatus(stock: number, minStock: number): "ok" | "low" | "empty" {
  if (stock <= 0) return "empty";
  if (stock <= minStock) return "low";
  return "ok";
}

export function priceFromCostMargin(cost: number, margin: number): number {
  return cost * (1 + (margin ?? 0) / 100);
}

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
export function formatBRL(value: number): string {
  return brl.format(value ?? 0);
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
    supplierId: p.supplier_id ?? undefined,
    categoryId: p.category_id ?? undefined,
    variations: vars
      .filter((v) => v.product_id === p.id)
      .map((v) => ({
        id: v.id,
        name: v.name,
        stock: v.stock,
        cost: Number(v.cost),
        margin: Number(v.margin),
      })),
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

function rowToSupplier(s: any): Supplier {
  return {
    id: s.id,
    name: s.name,
    phone: s.phone ?? undefined,
    createdAt: new Date(s.created_at).getTime(),
    updatedAt: new Date(s.updated_at).getTime(),
  };
}

function rowToCategory(c: any): Category {
  return {
    id: c.id,
    name: c.name,
    createdAt: new Date(c.created_at).getTime(),
    updatedAt: new Date(c.updated_at).getTime(),
  };
}

function rowToPriceHistory(ph: any): PriceHistory {
  return {
    id: ph.id,
    productId: ph.product_id,
    supplierId: ph.supplier_id ?? undefined,
    purchasePrice: Number(ph.purchase_price),
    createdAt: new Date(ph.created_at).getTime(),
  };
}

function rowToKit(k: any): Kit {
  return {
    id: k.id,
    name: k.name,
    createdAt: new Date(k.created_at).getTime(),
    updatedAt: new Date(k.updated_at).getTime(),
  };
}

function rowToKitItem(ki: any): KitItem {
  return {
    kitId: ki.kit_id,
    productId: ki.product_id,
    quantity: ki.quantity,
  };
}

function rowToCustomer(c: any): Customer {
  return {
    id: c.id,
    name: c.name,
    phone: c.phone ?? undefined,
    email: c.email ?? undefined,
    cpf: c.cpf ?? undefined,
    address: c.address ?? undefined,
    createdAt: new Date(c.created_at).getTime(),
  };
}

function rowToSale(s: any): Sale {
  return {
    id: s.id,
    customerId: s.customer_id ?? undefined,
    totalAmount: Number(s.total_amount),
    paymentMethod: s.payment_method ?? undefined,
    createdAt: new Date(s.created_at).getTime(),
  };
}

function rowToSaleItem(si: any): SaleItem {
  return {
    id: si.id,
    saleId: si.sale_id,
    productId: si.product_id,
    quantity: si.quantity,
    unitPrice: Number(si.unit_price),
  };
}

function rowToPurchase(p: any): Purchase {
  return {
    id: p.id,
    supplierId: p.supplier_id ?? undefined,
    totalAmount: Number(p.total_amount),
    createdAt: new Date(p.created_at).getTime(),
  };
}

function rowToPurchaseItem(pi: any): PurchaseItem {
  return {
    id: pi.id,
    purchaseId: pi.purchase_id,
    productId: pi.product_id,
    quantity: pi.quantity,
    unitPrice: Number(pi.unit_price),
  };
}

export const actions = {
  async loadAll() {
    const fetchTable = async (table: string, query: any = null) => {
      const q = query || supabase.from(table).select("*");
      const { data, error } = await q;
      if (error) {
        console.error(`Erro ao buscar tabela ${table}:`, error);
        return [];
      }
      return data || [];
    };

    const [
      prods,
      vars,
      movs,
      sups,
      cats,
      phist,
      kits,
      kitItems,
      customers,
      sales,
      saleItems,
      purchases,
      purchaseItems,
    ] = await Promise.all([
      fetchTable("products", supabase.from("products").select("*").order("created_at", { ascending: false })),
      fetchTable("variations"),
      fetchTable("movements", supabase.from("movements").select("*").order("created_at", { ascending: false }).limit(500)),
      fetchTable("suppliers"),
      fetchTable("categories"),
      fetchTable("price_history"),
      fetchTable("kits"),
      fetchTable("kit_items"),
      fetchTable("customers"),
      fetchTable("sales", supabase.from("sales").select("*").order("created_at", { ascending: false })),
      fetchTable("sale_items"),
      fetchTable("purchases", supabase.from("purchases").select("*").order("created_at", { ascending: false })),
      fetchTable("purchase_items"),
    ]);

    const products = (prods ?? []).map((p: any) => rowToProduct(p, vars ?? []));
    const movements = (movs ?? []).map(rowToMovement);
    const suppliers = (sups ?? []).map(rowToSupplier);
    const categories = (cats ?? []).map(rowToCategory);
    const priceHistory = (phist ?? []).map(rowToPriceHistory);
    const kitsList = (kits ?? []).map(rowToKit);
    const kitItemsList = (kitItems ?? []).map(rowToKitItem);
    const customersList = (customers ?? []).map(rowToCustomer);
    const salesList = (sales ?? []).map(rowToSale);
    const saleItemsList = (saleItems ?? []).map(rowToSaleItem);
    const purchasesList = (purchases ?? []).map(rowToPurchase);
    const purchaseItemsList = (purchaseItems ?? []).map(rowToPurchaseItem);

    setState({
      products,
      movements,
      suppliers,
      categories,
      priceHistory,
      kits: kitsList,
      kitItems: kitItemsList,
      customers: customersList,
      sales: salesList,
      saleItems: saleItemsList,
      purchases: purchasesList,
      purchaseItems: purchaseItemsList,
      loaded: true,
    });
  },

  reset() {
    setState({ 
      products: [], movements: [], suppliers: [], categories: [], priceHistory: [], 
      kits: [], kitItems: [], customers: [], sales: [], saleItems: [], 
      purchases: [], purchaseItems: [], loaded: false 
    });
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
        supplier_id: (p as any).supplierId,
        category_id: (p as any).categoryId,
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
    if ((patch as any).supplierId !== undefined) update.supplier_id = (patch as any).supplierId;
    if ((patch as any).categoryId !== undefined) update.category_id = (patch as any).categoryId;
    if (Object.keys(update).length > 0) {
      const { error } = await supabase.from("products").update(update).eq("id", id);
      if (error) return toast.error(error.message);
    }

    let newVars: Variation[] | undefined;
    if (patch.variations) {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;
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
              ...(patch as any).supplierId !== undefined && { supplierId: (patch as any).supplierId },
              ...(patch as any).categoryId !== undefined && { categoryId: (patch as any).categoryId },
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

  // Supplier CRUD
  async addSupplier(s: { name: string; phone?: string }) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return toast.error("Faça login");
    const { data: row, error } = await supabase
      .from("suppliers")
      .insert({
        user_id: user.user.id,
        name: s.name,
        phone: s.phone ?? null,
      })
      .select()
      .single();
    if (error || !row) return toast.error(error?.message ?? "Erro ao salvar fornecedor");
    const supplier = rowToSupplier(row);
    setState({ suppliers: [supplier, ...state.suppliers] });
  },

  async updateSupplier(id: string, patch: Partial<{ name: string; phone: string }>) {
    const update: any = {};
    if (patch.name !== undefined) update.name = patch.name;
    if (patch.phone !== undefined) update.phone = patch.phone;
    if (Object.keys(update).length > 0) {
      const { error } = await supabase.from("suppliers").update(update).eq("id", id);
      if (error) return toast.error(error.message);
    }
    setState({
      suppliers: state.suppliers.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    });
  },

  async deleteSupplier(id: string) {
    const { error } = await supabase.from("suppliers").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setState({ suppliers: state.suppliers.filter((s) => s.id !== id) });
  },

  // Category CRUD
  async addCategory(c: { name: string }) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return toast.error("Faça login");
    const { data: row, error } = await supabase
      .from("categories")
      .insert({
        user_id: user.user.id,
        name: c.name,
      })
      .select()
      .single();
    if (error || !row) return toast.error(error?.message ?? "Erro ao salvar categoria");
    const category = rowToCategory(row);
    setState({ categories: [category, ...state.categories] });
  },

  async updateCategory(id: string, patch: Partial<{ name: string }>) {
    const update: any = {};
    if (patch.name !== undefined) update.name = patch.name;
    if (Object.keys(update).length > 0) {
      const { error } = await supabase.from("categories").update(update).eq("id", id);
      if (error) return toast.error(error.message);
    }
    setState({
      categories: state.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    });
  },

  async deleteCategory(id: string) {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setState({ categories: state.categories.filter((c) => c.id !== id) });
  },

  // Bulk Price Adjustment
  async bulkAdjustPrices(categoryId: string | null, percentage: number) {
    const filtered = categoryId ? state.products.filter((p) => p.categoryId === categoryId) : state.products;
    if (filtered.length === 0) return toast.error("Nenhum produto encontrado");

    const updates = filtered.map(async (p) => {
      const newMargin = p.margin + percentage;
      return supabase.from("products").update({ margin: newMargin }).eq("id", p.id);
    });

    await Promise.all(updates);
    setState({
      products: state.products.map((p) => {
        if (!categoryId || p.categoryId === categoryId) {
          return { ...p, margin: p.margin + percentage };
        }
        return p;
      }),
    });
    toast.success("Preços ajustados com sucesso");
  },

  // Kit CRUD
  async addKit(name: string, items: KitItem[]) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return toast.error("Faça login");
    const { data: row, error } = await supabase.from("kits").insert({ user_id: user.user.id, name }).select().single();
    if (error || !row) return toast.error(error?.message ?? "Erro ao salvar kit");
    
    if (items.length > 0) {
      await supabase.from("kit_items").insert(items.map(i => ({ ...i, kit_id: row.id })));
    }
    
    const kit = rowToKit(row);
    setState({ 
      kits: [kit, ...state.kits],
      kitItems: [...state.kitItems, ...items.map(i => ({ ...i, kitId: row.id }))]
    });
  },

  async updateKit(id: string, name: string, items: KitItem[]) {
    await supabase.from("kits").update({ name }).eq("id", id);
    await supabase.from("kit_items").delete().eq("kit_id", id);
    if (items.length > 0) {
      await supabase.from("kit_items").insert(items.map(i => ({ kit_id: id, product_id: i.productId, quantity: i.quantity })));
    }
    setState({
      kits: state.kits.map((k) => (k.id === id ? { ...k, name } : k)),
      kitItems: [...state.kitItems.filter(ki => ki.kitId !== id), ...items.map(i => ({ ...i, kitId: id }))]
    });
  },

  async deleteKit(id: string) {
    await supabase.from("kits").delete().eq("id", id);
    setState({ 
      kits: state.kits.filter((k) => k.id !== id),
      kitItems: state.kitItems.filter(ki => ki.kitId !== id)
    });
  },

  async move(args: {
    productId: string;
    variationId?: string;
    quantity: number;
    type: "in" | "out";
    purchasePrice?: number;
    supplierId?: string;
    isKit?: boolean;
  }) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return toast.error("Faça login");

    if (args.isKit) {
      const kitItems = state.kitItems.filter(ki => ki.kitId === args.productId);
      for (const item of kitItems) {
        await actions.move({
          productId: item.productId,
          quantity: item.quantity * args.quantity,
          type: args.type,
        });
      }
      return;
    }

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

    if (args.type === "in" && args.purchasePrice !== undefined) {
      await supabase.from("price_history").insert({
        product_id: product.id,
        supplier_id: args.supplierId ?? null,
        purchase_price: args.purchasePrice,
      });
      // Also update product cost if it's the main product entry
      if (!args.variationId) {
        await supabase.from("products").update({ cost: args.purchasePrice }).eq("id", product.id);
        updatedProduct.cost = args.purchasePrice;
      }
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
      priceHistory: args.type === "in" && args.purchasePrice !== undefined 
        ? [rowToPriceHistory({ product_id: product.id, supplier_id: args.supplierId, purchase_price: args.purchasePrice, created_at: new Date() }), ...state.priceHistory]
        : state.priceHistory
    });
  },

  // Customer CRUD
  async addCustomer(c: { name: string; phone?: string; email?: string; cpf?: string; address?: string }) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      toast.error("Faça login");
      return null;
    }
    const { data: row, error } = await supabase.from("customers").insert({ user_id: user.user.id, ...c }).select().single();
    if (error || !row) {
      toast.error(error?.message ?? "Erro ao salvar cliente");
      return null;
    }
    const newCustomer = rowToCustomer(row);
    setState({ customers: [newCustomer, ...state.customers] });
    return newCustomer;
  },

  async updateCustomer(id: string, patch: Partial<{ name: string; phone: string; email: string; cpf: string; address: string }>) {
    await supabase.from("customers").update(patch).eq("id", id);
    setState({ customers: state.customers.map(c => c.id === id ? { ...c, ...patch } : c) });
  },

  async deleteCustomer(id: string) {
    await supabase.from("customers").delete().eq("id", id);
    setState({ customers: state.customers.filter(c => c.id !== id) });
  },

  // Sales Integration
  async addSale(s: { customerId?: string; totalAmount: number; paymentMethod?: string }, items: Omit<SaleItem, "id" | "saleId">[]) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;
    
    const { data: saleRow, error } = await supabase.from("sales").insert({
      user_id: user.user.id,
      customer_id: s.customerId || null,
      total_amount: s.totalAmount,
      payment_method: s.paymentMethod
    }).select().single();
    
    if (error || !saleRow) return toast.error("Erro ao registrar venda");
    
    const itemRows = items.map(i => ({
      sale_id: saleRow.id,
      product_id: i.productId,
      quantity: i.quantity,
      unit_price: i.unitPrice,
    }));
    const { data: siRows, error: siError } = await supabase.from("sale_items").insert(itemRows).select();
    if (siError) toast.error("Erro ao salvar itens da venda");
    
    // Deduct stock
    for (const item of items) {
      await actions.move({ productId: item.productId, quantity: item.quantity, type: "out" });
    }
    
    setState({
      sales: [rowToSale(saleRow), ...state.sales],
      saleItems: [...(siRows ?? []).map(rowToSaleItem), ...state.saleItems]
    });
    toast.success("Venda finalizada com sucesso");
  },

  async deleteSale(id: string) {
    const { error } = await supabase.from("sales").delete().eq("id", id);
    if (error) return toast.error("Erro ao excluir venda");
    setState({
      sales: state.sales.filter(s => s.id !== id),
      saleItems: state.saleItems.filter(si => si.saleId !== id),
    });
    toast.success("Venda excluída");
  },

  // Purchase Integration
  async addPurchase(p: { supplierId?: string; totalAmount: number }, items: Omit<PurchaseItem, "id" | "purchaseId">[]) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;
    
    const { data: purRow, error } = await supabase.from("purchases").insert({
      user_id: user.user.id,
      supplier_id: p.supplierId || null,
      total_amount: p.totalAmount
    }).select().single();
    
    if (error || !purRow) return toast.error("Erro ao registrar compra");
    
    const itemRows = items.map(i => ({
      purchase_id: purRow.id,
      product_id: i.productId,
      quantity: i.quantity,
      unit_price: i.unitPrice,
    }));
    const { data: piRows, error: piError } = await supabase.from("purchase_items").insert(itemRows).select();
    if (piError) toast.error("Erro ao salvar itens da compra");
    
    // Add stock and price history
    for (const item of items) {
      await actions.move({ 
        productId: item.productId, 
        quantity: item.quantity, 
        type: "in", 
        purchasePrice: item.unitPrice, 
        supplierId: p.supplierId 
      });
    }
    
    setState({
      purchases: [rowToPurchase(purRow), ...state.purchases],
      purchaseItems: [...(piRows ?? []).map(rowToPurchaseItem), ...state.purchaseItems]
    });
    toast.success("Compra registrada com sucesso");
  },
};


