import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useStore, productEffectiveStock } from "@/lib/store";
import { Lightbulb, AlertTriangle, TrendingUp, TrendingDown, Info, ShoppingBasket, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "Insights Estratégicos — ControleJá" },
      { name: "description", content: "Sugestões automáticas para melhorar seu negócio." },
    ],
  }),
  component: InsightsPage,
});

function InsightsPage() {
  const products = useStore((s) => s.products);
  const movements = useStore((s) => s.movements);
  const sales = useStore((s) => s.sales);

  const insights = useMemo(() => {
    const list: any[] = [];
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

    // 1. Low stock items
    const critical = products.filter(p => productEffectiveStock(p) <= p.minStock && productEffectiveStock(p) > 0);
    critical.forEach(p => {
      list.push({
        type: "warning",
        title: "Reposição necessária",
        message: `O produto "${p.name}" está com estoque crítico (${productEffectiveStock(p)} un). Considere comprar mais.`,
        icon: AlertTriangle,
        link: "/reposicao"
      });
    });

    // 2. High demand (most sold in last 30 days)
    const recentMovements = movements.filter(m => m.date > thirtyDaysAgo && m.type === "out");
    const counts = new Map<string, number>();
    recentMovements.forEach(m => counts.set(m.productId, (counts.get(m.productId) || 0) + m.quantity));
    
    const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
    if (sorted.length > 0) {
      const topId = sorted[0][0];
      const topProd = products.find(p => p.id === topId);
      if (topProd) {
        list.push({
          type: "success",
          title: "Alta demanda detectada",
          message: `"${topProd.name}" é o seu produto mais vendido nos últimos 30 dias (${sorted[0][1]} unidades).`,
          icon: TrendingUp,
          link: "/reports"
        });
      }
    }

    // 3. Stagnant products (no "out" movement in last 30 days)
    const stagnant = products.filter(p => {
      const hasOut = movements.some(m => m.productId === p.id && m.type === "out" && m.date > thirtyDaysAgo);
      return !hasOut && productEffectiveStock(p) > 0;
    });
    
    stagnant.slice(0, 3).forEach(p => {
      list.push({
        type: "info",
        title: "Produto parado",
        message: `"${p.name}" não teve saídas nos últimos 30 dias. Considere uma promoção.`,
        icon: Info,
        link: "/produtos"
      });
    });

    // 4. Low margin
    const lowMargin = products.filter(p => p.margin < 20);
    if (lowMargin.length > 0) {
      list.push({
        type: "warning",
        title: "Margem de lucro baixa",
        message: `Você tem ${lowMargin.length} produtos com margem inferior a 20%. Isso pode afetar seu lucro.`,
        icon: TrendingDown,
        link: "/reports"
      });
    }

    return list;
  }, [products, movements]);

  return (
    <div className="px-4 md:px-8 py-6 md:py-10 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Insights Estratégicos</h1>
        <p className="text-muted-foreground text-sm mt-1">Dicas automáticas baseadas nos seus dados</p>
      </header>

      {insights.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-muted grid place-items-center mb-4">
            <Lightbulb className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">Continue usando o sistema para gerar insights.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {insights.map((ins, i) => (
            <div key={i} className={cn(
              "rounded-2xl border p-6 flex gap-4 transition-all hover:translate-x-1",
              ins.type === "warning" && "bg-warning/5 border-warning/20",
              ins.type === "success" && "bg-success/5 border-success/20",
              ins.type === "info" && "bg-brand/5 border-brand/20",
              ins.type === "danger" && "bg-destructive/5 border-destructive/20",
            )}>
              <div className={cn(
                "h-12 w-12 rounded-xl grid place-items-center shrink-0",
                ins.type === "warning" && "bg-warning/10 text-warning-foreground",
                ins.type === "success" && "bg-success/10 text-success",
                ins.type === "info" && "bg-brand/10 text-brand",
                ins.type === "danger" && "bg-destructive/10 text-destructive",
              )}>
                <ins.icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">{ins.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{ins.message}</p>
                <Link 
                  to={ins.link} 
                  className={cn(
                    "inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest",
                    ins.type === "warning" && "text-warning-foreground",
                    ins.type === "success" && "text-success",
                    ins.type === "info" && "text-brand",
                  )}
                >
                  Ver Detalhes <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-12 rounded-2xl bg-muted/30 p-8 border border-border flex flex-col md:flex-row items-center gap-6">
        <div className="h-16 w-16 rounded-2xl bg-brand grid place-items-center text-brand-foreground shrink-0 shadow-[var(--shadow-glow)]">
          <ShoppingBasket className="h-8 w-8" />
        </div>
        <div>
          <h4 className="font-bold text-lg mb-1">Como os insights funcionam?</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Nossa inteligência analisa suas vendas, o tempo que os produtos ficam parados e o histórico de compras para sugerir ações que aumentam seu lucro e evitam falta de estoque.
          </p>
        </div>
      </div>
    </div>
  );
}
