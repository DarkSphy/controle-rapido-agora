import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useStore, formatBRL, productEffectiveStock } from "@/lib/store";
import { Package, TrendingUp, TrendingDown, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  const products = useStore((s) => s.products);
  const movements = useStore((s) => s.movements);

  const bestSellers = useMemo(() => {
    const counts: Record<string, number> = {};
    movements.filter(m => m.type === "out").forEach(m => {
      counts[m.productId] = (counts[m.productId] || 0) + m.quantity;
    });
    return Object.entries(counts)
      .map(([id, qty]) => ({ product: products.find(p => p.id === id), qty }))
      .filter(item => item.product)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 10);
  }, [movements, products]);

  const stagnant = useMemo(() => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentlyMoved = new Set(movements.filter(m => m.date > thirtyDaysAgo).map(m => m.productId));
    return products
      .filter(p => !recentlyMoved.has(p.id) && productEffectiveStock(p) > 0)
      .sort((a, b) => productEffectiveStock(b) - productEffectiveStock(a))
      .slice(0, 10);
  }, [movements, products]);

  function exportCSV(type: "products" | "movements") {
    let content = "";
    let filename = "";
    
    if (type === "products") {
      content = "Nome,Estoque,Custo,Margem,Preço\n" + 
        products.map(p => `${p.name},${productEffectiveStock(p)},${p.cost},${p.margin},${(p.cost * (1 + p.margin/100)).toFixed(2)}`).join("\n");
      filename = "produtos.csv";
    } else {
      content = "Data,Produto,Tipo,Quantidade\n" + 
        movements.map(m => `${new Date(m.date).toLocaleString()},${m.productName},${m.type === "in" ? "Entrada" : "Saída"},${m.quantity}`).join("\n");
      filename = "movimentacoes.csv";
    }
    
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-10 max-w-6xl mx-auto">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Relatórios e Performance</h1>
          <p className="text-muted-foreground text-sm mt-1">Análise de vendas e exportação de dados.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportCSV("products")}>
            <Download className="h-4 w-4" /> Produtos
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportCSV("movements")}>
            <Download className="h-4 w-4" /> Movimentações
          </Button>
        </div>
      </header>

      <div className="grid md:grid-cols-2 gap-8">
        <section>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-success" />
            <h2 className="text-xl font-bold">Mais vendidos (geral)</h2>
          </div>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {bestSellers.map(({ product, qty }, i) => (
              <div key={product!.id} className="flex items-center justify-between p-4 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                  <span className="font-medium truncate max-w-[200px]">{product!.name}</span>
                </div>
                <span className="font-bold text-success">{qty} un sold</span>
              </div>
            ))}
            {bestSellers.length === 0 && <p className="p-8 text-center text-sm text-muted-foreground">Nenhuma venda registrada.</p>}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="h-5 w-5 text-destructive" />
            <h2 className="text-xl font-bold">Produtos parados (+30 dias)</h2>
          </div>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {stagnant.map((p, i) => (
              <div key={p.id} className="flex items-center justify-between p-4 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                  <span className="font-medium truncate max-w-[200px]">{p.name}</span>
                </div>
                <span className="text-sm font-semibold text-muted-foreground">{productEffectiveStock(p)} em estoque</span>
              </div>
            ))}
            {stagnant.length === 0 && <p className="p-8 text-center text-sm text-muted-foreground">Todos os produtos tiveram movimentação recente.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
