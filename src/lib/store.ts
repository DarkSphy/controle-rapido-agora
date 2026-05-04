import { useSyncExternalStore } from "react";

export type Variation = {
  id: string;
  name: string;
  stock: number;
  cost: number;
  margin: number; // percent
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
  usage: number; // for "frequently used" search ranking
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
};

const STORAGE_KEY = "controleja:v1";
const isBrowser = typeof window !== "undefined";

let state: State = { products: [], movements: [] };
const listeners = new Set<() => void>();

function load() {
  if (!isBrowser) return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) state = JSON.parse(raw);
  } catch {}
}
function persist() {
  if (!isBrowser) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
function emit() {
  persist();
  listeners.forEach((l) => l());
}

if (isBrowser) load();

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const getSnapshot = () => state;
const getServerSnapshot = () => ({ products: [], movements: [] }) as State;

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(getSnapshot()),
    () => selector(getServerSnapshot()),
  );
}

const uid = () => Math.random().toString(36).slice(2, 10);

export const actions = {
  addProduct(p: Omit<Product, "id" | "usage" | "createdAt" | "variations"> & { variations?: Variation[] }) {
    const product: Product = {
      ...p,
      id: uid(),
      usage: 0,
      createdAt: Date.now(),
      variations: p.variations ?? [],
    };
    state = { ...state, products: [product, ...state.products] };
    emit();
    return product;
  },
  updateProduct(id: string, patch: Partial<Product>) {
    state = {
      ...state,
      products: state.products.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    };
    emit();
  },
  deleteProduct(id: string) {
    state = { ...state, products: state.products.filter((p) => p.id !== id) };
    emit();
  },
  addVariation(productId: string, v: Omit<Variation, "id">) {
    state = {
      ...state,
      products: state.products.map((p) =>
        p.id === productId ? { ...p, variations: [...p.variations, { ...v, id: uid() }] } : p,
      ),
    };
    emit();
  },
  updateVariation(productId: string, variationId: string, patch: Partial<Variation>) {
    state = {
      ...state,
      products: state.products.map((p) =>
        p.id === productId
          ? { ...p, variations: p.variations.map((v) => (v.id === variationId ? { ...v, ...patch } : v)) }
          : p,
      ),
    };
    emit();
  },
  deleteVariation(productId: string, variationId: string) {
    state = {
      ...state,
      products: state.products.map((p) =>
        p.id === productId ? { ...p, variations: p.variations.filter((v) => v.id !== variationId) } : p,
      ),
    };
    emit();
  },
  move(args: {
    productId: string;
    variationId?: string;
    quantity: number;
    type: "in" | "out";
  }) {
    const product = state.products.find((p) => p.id === args.productId);
    if (!product) return;
    const qty = Math.abs(args.quantity);
    const delta = args.type === "in" ? qty : -qty;
    let updated: Product;
    let variationName: string | undefined;
    if (args.variationId) {
      updated = {
        ...product,
        usage: product.usage + 1,
        variations: product.variations.map((v) =>
          v.id === args.variationId ? { ...v, stock: Math.max(0, v.stock + delta) } : v,
        ),
      };
      variationName = product.variations.find((v) => v.id === args.variationId)?.name;
    } else {
      updated = { ...product, usage: product.usage + 1, stock: Math.max(0, product.stock + delta) };
    }
    const movement: Movement = {
      id: uid(),
      productId: product.id,
      productName: product.name,
      variationId: args.variationId,
      variationName,
      type: args.type,
      quantity: qty,
      date: Date.now(),
    };
    state = {
      products: state.products.map((p) => (p.id === product.id ? updated : p)),
      movements: [movement, ...state.movements],
    };
    emit();
  },
  bumpUsage(productId: string) {
    state = {
      ...state,
      products: state.products.map((p) =>
        p.id === productId ? { ...p, usage: p.usage + 1 } : p,
      ),
    };
    emit();
  },
  seedDemo() {
    if (state.products.length > 0) return;
    const demo: Product[] = [
      {
        id: uid(),
        name: "Camiseta Básica",
        cost: 25,
        margin: 80,
        stock: 0,
        minStock: 5,
        variations: [
          { id: uid(), name: "P", stock: 3, cost: 25, margin: 80 },
          { id: uid(), name: "M", stock: 1, cost: 25, margin: 80 },
          { id: uid(), name: "G", stock: 8, cost: 25, margin: 80 },
        ],
        usage: 5,
        createdAt: Date.now(),
      },
      {
        id: uid(),
        name: "Caneca Personalizada",
        cost: 12,
        margin: 100,
        stock: 14,
        minStock: 6,
        variations: [],
        usage: 3,
        createdAt: Date.now(),
      },
      {
        id: uid(),
        name: "Caderno A5",
        cost: 8,
        margin: 75,
        stock: 0,
        minStock: 10,
        variations: [],
        usage: 1,
        createdAt: Date.now(),
      },
    ];
    state = { ...state, products: demo };
    emit();
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
