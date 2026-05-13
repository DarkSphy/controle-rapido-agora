import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useStore, productEffectiveStock, formatBRL, priceFromCostMargin, formatProductPrice, stockStatus, Product } from "@/lib/store";
import { SearchBar, searchProducts } from "@/components/SearchBar";
import { MoveDialog } from "@/components/MoveDialog";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/balcao")({
  head: () => ({
    meta: [
      { title: "Balcão — ControleJá" },
      { name: "description", content: "Modo balcão: busca rápida, preço e estoque na mão." },
    ],
  }),
  component: BalcaoPage,
});

function BalcaoPage() {
  const products = useStore((s) => s.products);
  const [q, setQ] = useState("");
  const [moveProduct, setMoveProduct] = useState<Product | null>(null);
  const [moveType, setMoveType] = useState<"in" | "out">("out");
  const [moveOpen, setMoveOpen] = useState(false);

  const filtered = useMemo(() => searchProducts(products, q).slice(0, 12), [products, q]);

  return (
    <div className="px-4 md:px-8 py-6 md:py-10 max-w-3xl mx-auto">
      <header className="mb-5">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Modo balcão</h1>
        <p className="text-muted-foreground text-sm mt-1">Busque, veja preço e dê baixa em segundos</p>
      </header>

      <div className="mb-6 sticky top-0 z-10 bg-background/80 backdrop-blur py-2">
        <SearchBar value={q} onChange={setQ} size="lg" placeholder="Digite o nome do produto..." />
      </div>

      <div className="space-y-2">
        {filtered.map((p) => {
          const stock = productEffectiveStock(p);
          const status = stockStatus(stock, p.minStock);
          const price = priceFromCostMargin(p.cost, p.margin);
          return (
            <div key={p.id} className="rounded-xl border border-border bg-card p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold truncate text-lg">{p.name}</h3>
                  {!p.isService && (
                    <span className={cn(
                      "text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full",
                      status === "ok" && "bg-success/10 text-success",
                      status === "low" && "bg-warning/15 text-warning-foreground",
                      status === "empty" && "bg-destructive/10 text-destructive",
                    )}>
                      {stock} un
                    </span>
                  )}
                </div>
                <div className="text-2xl font-bold text-primary tabular-nums mt-0.5">{formatBRL(price)}</div>
              </div>
              <div className="flex flex-col gap-2">
                <Button size="lg" onClick={() => { setMoveProduct(p); setMoveType("out"); setMoveOpen(true); }}>
                  <Minus className="h-4 w-4" /> Vender
                </Button>
                {!p.isService && (
                  <Button size="sm" variant="outline" onClick={() => { setMoveProduct(p); setMoveType("in"); setMoveOpen(true); }}>
                    <Plus className="h-4 w-4" /> Entrada
                  </Button>
                )}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
            {q ? "Nada encontrado." : "Comece a digitar para buscar produtos."}
          </div>
        )}
      </div>

      <MoveDialog product={moveProduct} type={moveType} open={moveOpen} onOpenChange={setMoveOpen} />
    </div>
  );
}
