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
  isService?: boolean;
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
  reason?: string;
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
  variationId?: string;
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

export type ServiceOrder = {
  id: string;
  customerId?: string;
  saleId?: string;
  type: string;
  description?: string;
  status: "Aberta" | "Em andamento" | "Finalizada" | "Cancelada";
  serviceValue: number;
  createdAt: number;
};

export type ServiceOrderItem = {
  id: string;
  orderId: string;
  productId: string;
  variationId?: string;
  quantity: number;
  unitPrice: number;
};

export type Quote = {
  id: string;
  customerId?: string;
  status: "Pendente" | "Aprovado" | "Recusado" | "Expirado";
  laborValue: number;
  subtotal: number;
  discount: number;
  total: number;
  validityDate?: string;
  notes?: string;
  paymentConditions?: string;
  createdAt: number;
};

export type QuoteItem = {
  id: string;
  quoteId: string;
  productId?: string;
  variationId?: string;
  manualName?: string;
  quantity: number;
  unitPrice: number;
  isService: boolean;
};

export type BusinessSettings = {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  logoUrl: string | null;
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
  serviceOrders: ServiceOrder[];
  serviceOrderItems: ServiceOrderItem[];
  quotes: Quote[];
  quoteItems: QuoteItem[];
  businessSettings: BusinessSettings | null;
  taxRate: number;
  taxMode: "margin" | "final";
  loaded: boolean;
};

let state: State = { 
  products: [], movements: [], suppliers: [], categories: [], priceHistory: [], 
  kits: [], kitItems: [], customers: [], sales: [], saleItems: [], 
  purchases: [], purchaseItems: [], serviceOrders: [], serviceOrderItems: [],
  quotes: [], quoteItems: [], businessSettings: null,
  taxRate: 0, taxMode: "margin", loaded: false 
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
  purchases: [], purchaseItems: [], serviceOrders: [], serviceOrderItems: [],
  quotes: [], quoteItems: [],
  taxRate: 0, taxMode: "margin", loaded: false 
};
const getServer = () => serverSnap;

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(subscribe, () => selector(getSnapshot()), () => selector(getServer()));
}

export function productEffectiveStock(p: Product): number {
  if (p.isService) return 999999;
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
  const s = getSnapshot();
  const basePrice = cost * (1 + (margin ?? 0) / 100);
  if (!s.taxRate) return basePrice;
  if (s.taxMode === "final") {
    return basePrice * (1 + s.taxRate / 100);
  } else {
    // taxMode === "margin"
    return cost * (1 + ((margin ?? 0) + s.taxRate) / 100);
  }
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
    isService: p.is_service ?? false,
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
    reason: m.reason ?? undefined,
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
    variationId: si.variation_id ?? undefined,
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

function rowToServiceOrder(so: any): ServiceOrder {
  return {
    id: so.id,
    customerId: so.customer_id ?? undefined,
    saleId: so.sale_id ?? undefined,
    type: so.type,
    description: so.description ?? undefined,
    status: so.status as any,
    serviceValue: Number(so.service_value),
    createdAt: new Date(so.created_at).getTime(),
  };
}

function rowToServiceOrderItem(soi: any): ServiceOrderItem {
  return {
    id: soi.id,
    orderId: soi.order_id,
    productId: soi.product_id,
    variationId: soi.variation_id ?? undefined,
    quantity: soi.quantity,
    unitPrice: Number(soi.unit_price),
  };
}

function rowToQuote(q: any): Quote {
  return {
    id: q.id,
    customerId: q.customer_id ?? undefined,
    status: q.status as any,
    laborValue: Number(q.labor_value || 0),
    subtotal: Number(q.subtotal),
    discount: Number(q.discount),
    total: Number(q.total),
    validityDate: q.validity_date ?? undefined,
    notes: q.notes ?? undefined,
    paymentConditions: q.payment_conditions ?? undefined,
    createdAt: new Date(q.created_at).getTime(),
  };
}

function rowToQuoteItem(qi: any): QuoteItem {
  return {
    id: qi.id,
    quoteId: qi.quote_id,
    productId: qi.product_id ?? undefined,
    variationId: qi.variation_id ?? undefined,
    manualName: qi.manual_name ?? undefined,
    quantity: qi.quantity,
    unitPrice: Number(qi.unit_price),
    isService: qi.is_service ?? false,
  };
}

export const actions = {
  async loadAll() {
    const { data: { user } } = await supabase.auth.getUser();
    const taxRate = user?.user_metadata?.tax_rate ?? 0;
    const taxMode = user?.user_metadata?.tax_mode ?? "margin";

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
      serviceOrders,
      serviceOrderItems,
      quotes,
      quoteItems,
      businessSettingsData,
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
      fetchTable("service_orders", supabase.from("service_orders").select("*").order("created_at", { ascending: false })),
      fetchTable("service_order_items"),
      fetchTable("quotes", supabase.from("quotes").select("*").order("created_at", { ascending: false })),
      fetchTable("quote_items"),
      fetchTable("business_settings", supabase.from("business_settings").select("*").limit(1)),
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
    const serviceOrdersList = (serviceOrders ?? []).map(rowToServiceOrder);
    const serviceOrderItemsList = (serviceOrderItems ?? []).map(rowToServiceOrderItem);
    const quotesList = (quotes ?? []).map(rowToQuote);
    const quoteItemsList = (quoteItems ?? []).map(rowToQuoteItem);
    
    let businessSettings = null;
    if (businessSettingsData && businessSettingsData.length > 0) {
      const bs = businessSettingsData[0];
      businessSettings = {
        id: bs.id,
        name: bs.name,
        phone: bs.phone,
        email: bs.email,
        address: bs.address,
        logoUrl: bs.logo_url
      };
    }

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
      serviceOrderItems: serviceOrderItemsList,
      quotes: quotesList,
      quoteItems: quoteItemsList,
      businessSettings,
      taxRate,
      taxMode,
      loaded: true,
    });
  },

  reset() {
    setState({ 
      products: [], movements: [], suppliers: [], categories: [], priceHistory: [], 
      kits: [], kitItems: [], customers: [], sales: [], saleItems: [], 
      purchases: [], purchaseItems: [], serviceOrders: [], serviceOrderItems: [],
      quotes: [], quoteItems: [],
      taxRate: 0, taxMode: "margin", loaded: false 
    });
  },

  async setGlobalTaxes(taxRate: number, taxMode: "margin" | "final") {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return toast.error("Faça login");
    const { error } = await supabase.auth.updateUser({
      data: { tax_rate: taxRate, tax_mode: taxMode }
    });
    if (error) return toast.error("Erro ao salvar impostos: " + error.message);
    setState({ taxRate, taxMode });
    toast.success("Impostos atualizados com sucesso");
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
        is_service: (p as any).isService ?? false,
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
    if ((patch as any).isService !== undefined) update.is_service = (patch as any).isService;
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
              ...(patch as any).isService !== undefined && { isService: (patch as any).isService },
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
    reason?: string;
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
          reason: args.reason,
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
      if (!product.isService) {
        const newStock = Math.max(0, product.stock + delta);
        await supabase.from("products").update({ stock: newStock, usage: product.usage + 1 }).eq("id", product.id);
        updatedProduct = { ...product, usage: product.usage + 1, stock: newStock };
      } else {
        await supabase.from("products").update({ usage: product.usage + 1 }).eq("id", product.id);
        updatedProduct = { ...product, usage: product.usage + 1 };
      }
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
        reason: args.reason ?? null,
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
      await actions.move({ productId: item.productId, variationId: item.variationId, quantity: item.quantity, type: "out", reason: "Venda Direta" });
    }
    
    setState({
      sales: [rowToSale(saleRow), ...state.sales],
      saleItems: [...(siRows ?? []).map(rowToSaleItem), ...state.saleItems]
    });
    toast.success("Venda finalizada com sucesso");
  },

  async deleteSale(id: string) {
    const { error } = await supabase.from("sales").delete().eq("id", id);
    if (error) return toast.error("Erro ao excluir venda. Certifique-se de executar o script SQL de atualização.");

    // Check if there was an OS linked to this sale and revert it
    const linkedOS = state.serviceOrders.find(o => o.saleId === id);
    if (linkedOS) {
      await supabase.from("service_orders").update({ status: "Em andamento", sale_id: null }).eq("id", linkedOS.id);
      const updatedOS = { ...linkedOS, status: "Em andamento" as const, saleId: null };
      setState({
        serviceOrders: state.serviceOrders.map(o => o.id === linkedOS.id ? updatedOS : o)
      });
    }

    setState({
      sales: state.sales.filter(s => s.id !== id),
      saleItems: state.saleItems.filter(si => si.saleId !== id),
    });
    toast.success("Venda excluída com sucesso");
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

  // Service Order CRUD
  async addServiceOrder(o: { customerId?: string; type: string; description?: string; serviceValue: number }, items: Omit<ServiceOrderItem, "id" | "orderId">[]) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;
    
    const { data: row, error } = await supabase.from("service_orders").insert({
      user_id: user.user.id,
      customer_id: o.customerId || null,
      type: o.type,
      description: o.description || null,
      service_value: o.serviceValue,
      status: "Aberta"
    }).select().single();
    if (error || !row) return toast.error(error?.message ?? "Erro ao salvar OS");

    let soItems: any[] = [];
    if (items.length > 0) {
      const itemRows = items.map(i => ({
        order_id: row.id,
        product_id: i.productId,
        variation_id: i.variationId || null,
        quantity: i.quantity,
        unit_price: i.unitPrice,
      }));
      const { data: iRows } = await supabase.from("service_order_items").insert(itemRows).select();
      soItems = iRows || [];
    }

    const order = rowToServiceOrder(row);
    setState({
      serviceOrders: [order, ...state.serviceOrders],
      serviceOrderItems: [...soItems.map(rowToServiceOrderItem), ...state.serviceOrderItems],
    });
    toast.success("Ordem de serviço criada");
    return order;
  },

  async updateServiceOrder(id: string, patch: Partial<{ customerId: string; type: string; description: string; serviceValue: number; status: "Aberta" | "Em andamento" | "Finalizada" | "Cancelada", paymentMethod?: string }>, items?: Omit<ServiceOrderItem, "id" | "orderId">[]) {
    const order = state.serviceOrders.find(o => o.id === id);
    if (!order) return;

    // Determine if we are transitioning to Finalizada
    const isFinalizing = patch.status === "Finalizada" && order.status !== "Finalizada" && !order.saleId;

    const update: any = {};
    if (patch.customerId !== undefined) update.customer_id = patch.customerId || null;
    if (patch.type !== undefined) update.type = patch.type;
    if (patch.description !== undefined) update.description = patch.description;
    if (patch.serviceValue !== undefined) update.service_value = patch.serviceValue;
    if (patch.status !== undefined) update.status = patch.status;

    let saleId = order.saleId;
    if (isFinalizing) {
      // Create a sale to process financial entry and stock deduct
      const currentItems = items || state.serviceOrderItems.filter(i => i.orderId === id);
      const partsTotal = currentItems.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
      const serviceVal = patch.serviceValue !== undefined ? patch.serviceValue : order.serviceValue;
      const totalAmount = partsTotal + serviceVal;

      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        const { data: saleRow, error: saleErr } = await supabase.from("sales").insert({
          user_id: user.user.id,
          customer_id: patch.customerId !== undefined ? patch.customerId : order.customerId,
          total_amount: totalAmount,
          payment_method: patch.paymentMethod || "Dinheiro" // Set via UI
        }).select().single();

        if (saleRow && !saleErr) {
          saleId = saleRow.id;
          update.sale_id = saleId;
          
          if (currentItems.length > 0) {
            const saleItemsRows = currentItems.map(i => ({
              sale_id: saleId,
              product_id: i.productId,
              variation_id: i.variationId || null,
              quantity: i.quantity,
              unit_price: i.unitPrice,
            }));
            await supabase.from("sale_items").insert(saleItemsRows);
            
            // Deduct stock
            for (const item of currentItems) {
              await actions.move({ productId: item.productId, variationId: item.variationId, quantity: item.quantity, type: "out", reason: "Serviço (OS Finalizada)" });
            }
          }
          
          // We need to fetch the newly created sale and sale_items to update state directly
          const newSale = rowToSale(saleRow);
          const { data: newSaleItems } = await supabase.from("sale_items").select("*").eq("sale_id", saleId);
          setState({
            sales: [newSale, ...state.sales],
            saleItems: [...(newSaleItems || []).map(rowToSaleItem), ...state.saleItems]
          });
        }
      }
    }

    if (Object.keys(update).length > 0) {
      const { error } = await supabase.from("service_orders").update(update).eq("id", id);
      if (error) return toast.error(error.message);
    }

    let newItems = state.serviceOrderItems;
    if (items !== undefined && !isFinalizing && order.status !== "Finalizada") {
      // Update items only if not finalized
      await supabase.from("service_order_items").delete().eq("order_id", id);
      let soItems: any[] = [];
      if (items.length > 0) {
        const itemRows = items.map(i => ({
          order_id: id,
          product_id: i.productId,
          variation_id: i.variationId || null,
          quantity: i.quantity,
          unit_price: i.unitPrice,
        }));
        const { data: iRows } = await supabase.from("service_order_items").insert(itemRows).select();
        soItems = iRows || [];
      }
      newItems = [...state.serviceOrderItems.filter(i => i.orderId !== id), ...soItems.map(rowToServiceOrderItem)];
    }

    setState({
      serviceOrders: state.serviceOrders.map(o => o.id === id ? { ...o, ...patch, saleId: saleId || o.saleId } : o),
      serviceOrderItems: newItems
    });
    toast.success("Ordem de serviço atualizada");
  },

  async deleteServiceOrder(id: string) {
    const order = state.serviceOrders.find(o => o.id === id);
    if (order?.saleId) {
      toast.error("Não é possível excluir uma OS finalizada (já lançada no financeiro)");
      return;
    }
    const { error } = await supabase.from("service_orders").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setState({ 
      serviceOrders: state.serviceOrders.filter((o) => o.id !== id),
      serviceOrderItems: state.serviceOrderItems.filter((i) => i.orderId !== id)
    });
    toast.success("Ordem de serviço excluída");
  },

  // Quote CRUD
  async addQuote(q: Omit<Quote, "id" | "createdAt" | "status"> & { status?: string }, items: Omit<QuoteItem, "id" | "quoteId">[]) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;

    const { data: row, error } = await supabase.from("quotes").insert({
      user_id: user.user.id,
      customer_id: q.customerId || null,
      status: q.status || "Pendente",
      subtotal: q.subtotal,
      labor_value: q.laborValue,
      discount: q.discount,
      total: q.total,
      validity_date: q.validityDate || null,
      notes: q.notes || null,
      payment_conditions: q.paymentConditions || null,
    }).select().single();

    if (error || !row) return toast.error(error?.message ?? "Erro ao salvar Orçamento");

    let qItems: any[] = [];
    if (items.length > 0) {
      const itemRows = items.map(i => ({
        quote_id: row.id,
        product_id: i.productId || null,
        variation_id: i.variationId || null,
        manual_name: i.manualName || null,
        quantity: i.quantity,
        unit_price: i.unitPrice,
        is_service: i.isService
      }));
      const { data: iRows } = await supabase.from("quote_items").insert(itemRows).select();
      qItems = iRows || [];
    }

    const quote = rowToQuote(row);
    setState({
      quotes: [quote, ...state.quotes],
      quoteItems: [...qItems.map(rowToQuoteItem), ...state.quoteItems],
    });
    toast.success("Orçamento criado");
    return quote;
  },

  async updateQuote(id: string, patch: Partial<Omit<Quote, "id" | "createdAt">>, items?: Omit<QuoteItem, "id" | "quoteId">[]) {
    const quote = state.quotes.find(q => q.id === id);
    if (!quote) return;

    const update: any = {};
    if (patch.customerId !== undefined) update.customer_id = patch.customerId || null;
    if (patch.status !== undefined) update.status = patch.status;
    if (patch.subtotal !== undefined) update.subtotal = patch.subtotal;
    if (patch.laborValue !== undefined) update.labor_value = patch.laborValue;
    if (patch.discount !== undefined) update.discount = patch.discount;
    if (patch.total !== undefined) update.total = patch.total;
    if (patch.validityDate !== undefined) update.validity_date = patch.validityDate || null;
    if (patch.notes !== undefined) update.notes = patch.notes || null;
    if (patch.paymentConditions !== undefined) update.payment_conditions = patch.paymentConditions || null;

    if (Object.keys(update).length > 0) {
      const { error } = await supabase.from("quotes").update(update).eq("id", id);
      if (error) return toast.error(error.message);
    }

    let newItems = state.quoteItems;
    if (items !== undefined) {
      await supabase.from("quote_items").delete().eq("quote_id", id);
      let qItems: any[] = [];
      if (items.length > 0) {
        const itemRows = items.map(i => ({
          quote_id: id,
          product_id: i.productId || null,
          variation_id: i.variationId || null,
          manual_name: i.manualName || null,
          quantity: i.quantity,
          unit_price: i.unitPrice,
          is_service: i.isService
        }));
        const { data: iRows } = await supabase.from("quote_items").insert(itemRows).select();
        qItems = iRows || [];
      }
      newItems = [...state.quoteItems.filter(i => i.quoteId !== id), ...qItems.map(rowToQuoteItem)];
    }

    setState({
      quotes: state.quotes.map(q => q.id === id ? { ...q, ...patch } : q),
      quoteItems: newItems
    });
    toast.success("Orçamento atualizado");
  },

  async deleteQuote(id: string) {
    const { error } = await supabase.from("quotes").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setState({ 
      quotes: state.quotes.filter((q) => q.id !== id),
      quoteItems: state.quoteItems.filter((i) => i.quoteId !== id)
    });
    toast.success("Orçamento excluído");
  },

  async convertQuoteToSale(id: string) {
    const quote = state.quotes.find(q => q.id === id);
    if (!quote) return;
    const items = state.quoteItems.filter(i => i.quoteId === id);

    // Convert only actual products (skip pure manual items and services for stock, addSale will handle it)
    // Wait, addSale expects productId. For manual items, we might not have a productId.
    // Let's create a sale manually.
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;
    
    const { data: saleRow, error } = await supabase.from("sales").insert({
      user_id: user.user.id,
      customer_id: quote.customerId || null,
      total_amount: quote.total,
      payment_method: "Dinheiro" // Default, can be edited later
    }).select().single();
    
    if (error || !saleRow) return toast.error("Erro ao registrar venda a partir do orçamento");
    
    // We only create sale_items and deduct stock for items that have a valid productId
    const validItems = items.filter(i => i.productId && !i.isService);
    if (validItems.length > 0) {
      const itemRows = validItems.map(i => ({
        sale_id: saleRow.id,
        product_id: i.productId,
        variation_id: i.variationId || null,
        quantity: i.quantity,
        unit_price: i.unitPrice,
      }));
      await supabase.from("sale_items").insert(itemRows);
      
      for (const item of validItems) {
        await actions.move({ productId: item.productId!, variationId: item.variationId, quantity: item.quantity, type: "out", reason: "Venda via Orçamento" });
      }
    }

    // Mark quote as approved
    await actions.updateQuote(id, { status: "Aprovado" });
    
    // Refresh sales in state
    const { data: newSaleItems } = await supabase.from("sale_items").select("*").eq("sale_id", saleRow.id);
    setState({
      sales: [rowToSale(saleRow), ...state.sales],
      saleItems: [...(newSaleItems ?? []).map(rowToSaleItem), ...state.saleItems]
    });
    toast.success("Orçamento convertido em venda!");
  },

  async convertQuoteToOS(id: string) {
    const quote = state.quotes.find(q => q.id === id);
    if (!quote) return;
    const items = state.quoteItems.filter(i => i.quoteId === id);

    const serviceVal = items.filter(i => i.isService || !i.productId).reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0);
    const prodItems = items.filter(i => i.productId && !i.isService).map(i => ({
      productId: i.productId!,
      variationId: i.variationId,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
    }));

    const finalServiceValue = serviceVal + (quote.laborValue || 0) - quote.discount;

    await actions.addServiceOrder({
      customerId: quote.customerId,
      type: "Orçamento Convertido",
      description: quote.notes,
      serviceValue: finalServiceValue
    }, prodItems);

    await actions.updateQuote(id, { status: "Aprovado" });
    toast.success("Orçamento convertido em Ordem de Serviço!");
  },

  async updateBusinessSettings(patch: Partial<BusinessSettings>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return toast.error("Usuário não autenticado");

    const bs = state.businessSettings;
    const payload = {
      user_id: user.id,
      name: patch.name !== undefined ? patch.name : bs?.name,
      phone: patch.phone !== undefined ? patch.phone : bs?.phone,
      email: patch.email !== undefined ? patch.email : bs?.email,
      address: patch.address !== undefined ? patch.address : bs?.address,
      logo_url: patch.logoUrl !== undefined ? patch.logoUrl : bs?.logoUrl,
      updated_at: new Date().toISOString()
    };

    if (bs) {
      const { error } = await supabase.from("business_settings").update(payload).eq("id", bs.id);
      if (error) {
        console.error("Erro ao atualizar configurações:", error);
        return toast.error("Erro ao salvar configurações");
      }
      setState({ businessSettings: { ...bs, ...patch } });
      toast.success("Configurações atualizadas");
    } else {
      const { data, error } = await supabase.from("business_settings").insert([payload]).select().single();
      if (error) {
        console.error("Erro ao criar configurações:", error);
        return toast.error("Erro ao salvar configurações");
      }
      setState({ businessSettings: {
        id: data.id,
        name: data.name,
        phone: data.phone,
        email: data.email,
        address: data.address,
        logoUrl: data.logo_url
      }});
      toast.success("Configurações salvas");
    }
  },

  async uploadLogo(file: File): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Usuário não autenticado");
      return null;
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('logos')
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      console.error("Erro ao fazer upload da logo:", uploadError);
      toast.error("Erro ao enviar a imagem");
      return null;
    }

    const { data } = supabase.storage.from('logos').getPublicUrl(fileName);
    return data.publicUrl;
  }
};


