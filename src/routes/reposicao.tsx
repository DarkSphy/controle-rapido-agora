import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useStore, productEffectiveStock } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/reposicao")({
  head: () => ({
    meta: [
      { title: "Lista de reposição — ControleJá" },
      { name: "description", content: "Produtos com estoque baixo ou zerado prontos para reposição." },
    ],
  }),
  component: RestockPage,
});

function RestockPage() {
  const products = useStore((s) => s.products);

  const list = useMemo(() => {
    return products
      .map((p) => ({ p, stock: productEffectiveStock(p) }))
      .filter(({ p, stock }) => stock <= p.minStock)
      .sort((a, b) => a.stock - b.stock);
  }, [products]);

  function copy() {
    if (list.length === 0) return;
    const text = `🛒 *Lista de reposição*\n\n` + list.map(({ p, stock }) => {
      const need = Math.max(p.minStock - stock, 1);
      return `• ${p.name} — ${stock} em estoque (repor ${need})`;
    }).join("\n");
    navigator.clipboard.writeText(text);
    toast.success("Lista copiada!");
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-10 max-w-3xl mx-auto">
      <header className="flex items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Lista de reposição</h1>
          <p className="text-muted-foreground text-sm mt-1">{list.length} produto(s) precisam de reposição</p>
        </div>
        {list.length > 0 && (
          <Button onClick={copy}>
            <Copy className="h-4 w-4" /> Copiar lista
          </Button>
        )}
      </header>

      {list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-success font-semibold">Tudo em ordem! 🎉</p>
          <p className="text-muted-foreground text-sm mt-1">Nenhum produto abaixo do estoque mínimo.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {list.map(({ p, stock }) => {
            const empty = stock <= 0;
            const need = Math.max(p.minStock - stock, 1);
            return (
              <div key={p.id} className="flex items-center justify-between px-4 py-3 border-b border-border last:border-0">
                <div className="min-w-0">
                  <div className="font-medium truncate">{p.name}</div>
                  <div className={`text-xs mt-0.5 ${empty ? "text-destructive" : "text-warning-foreground"}`}>
                    {empty ? "Sem estoque" : `${stock} em estoque (mínimo ${p.minStock})`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Repor</div>
                  <div className="font-bold text-lg text-primary tabular-nums">{need}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
