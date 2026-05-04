import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore, Product } from "@/lib/store";
import { ProductCard } from "@/components/ProductCard";
import { ProductDialog } from "@/components/ProductDialog";
import { MoveDialog } from "@/components/MoveDialog";
import { SearchBar, searchProducts } from "@/components/SearchBar";

export const Route = createFileRoute("/produtos")({
  head: () => ({
    meta: [
      { title: "Produtos — ControleJá" },
      { name: "description", content: "Cadastre, edite e movimente produtos do seu estoque." },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const products = useStore((s) => s.products);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [moveProduct, setMoveProduct] = useState<Product | null>(null);
  const [moveType, setMoveType] = useState<"in" | "out">("in");
  const [moveOpen, setMoveOpen] = useState(false);

  const filtered = useMemo(() => searchProducts(products, q), [products, q]);

  return (
    <div className="px-4 md:px-8 py-6 md:py-10 max-w-6xl mx-auto">
      <header className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Produtos</h1>
          <p className="text-muted-foreground text-sm mt-1">{products.length} cadastrados</p>
        </div>
        <Button onClick={() => { setEditing(null); setEditOpen(true); }}>
          <Plus className="h-4 w-4" /> Novo produto
        </Button>
      </header>

      <div className="mb-6">
        <SearchBar value={q} onChange={setQ} />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground">Nenhum produto encontrado.</p>
          <Button className="mt-4" onClick={() => { setEditing(null); setEditOpen(true); }}>
            <Plus className="h-4 w-4" /> Cadastrar primeiro produto
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onEdit={() => { setEditing(p); setEditOpen(true); }}
              onIn={() => { setMoveProduct(p); setMoveType("in"); setMoveOpen(true); }}
              onOut={() => { setMoveProduct(p); setMoveType("out"); setMoveOpen(true); }}
            />
          ))}
        </div>
      )}

      <ProductDialog product={editing} open={editOpen} onOpenChange={setEditOpen} />
      <MoveDialog product={moveProduct} type={moveType} open={moveOpen} onOpenChange={setMoveOpen} />
    </div>
  );
}
