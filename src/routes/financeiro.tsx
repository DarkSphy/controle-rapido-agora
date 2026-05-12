import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useStore, formatBRL } from "@/lib/store";
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, DollarSign, Wrench, ShoppingBasket } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/financeiro")({
  head: () => ({
    meta: [
      { title: "Financeiro — ControleJá" },
      { name: "description", content: "Visão básica de entradas, saídas e lucro." },
    ],
  }),
  component: FinanceiroPage,
});

function FinanceiroPage() {
  const sales = useStore((s) => s.sales);
  const saleItems = useStore((s) => s.saleItems);
  const purchases = useStore((s) => s.purchases);

  const stats = useMemo(() => {
    let productSales = 0;
    let laborSales = 0;

    sales.forEach(s => {
      const myItems = saleItems.filter(si => si.saleId === s.id);
      const itemsTotal = myItems.reduce((sum, si) => sum + (si.unitPrice * si.quantity), 0);
      
      productSales += Math.min(s.totalAmount, itemsTotal);
      laborSales += Math.max(0, s.totalAmount - itemsTotal);
    });

    const totalSales = productSales + laborSales;
    const totalPurchases = purchases.reduce((sum, p) => sum + p.totalAmount, 0);
    const profit = totalSales - totalPurchases;
    return { productSales, laborSales, totalSales, totalPurchases, profit };
  }, [sales, saleItems, purchases]);

  const transactions = useMemo(() => {
    const s = sales.map(x => ({ ...x, type: "sale" as const }));
    const p = purchases.map(x => ({ ...x, type: "purchase" as const }));
    return [...s, ...p].sort((a, b) => b.createdAt - a.createdAt);
  }, [sales, purchases]);

  return (
    <div className="px-4 md:px-8 py-6 md:py-10 max-w-5xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Financeiro</h1>
        <p className="text-muted-foreground text-sm mt-1">Resumo básico de caixa do seu negócio</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <FinCard 
          label="Total Produtos" 
          value={stats.productSales} 
          icon={ShoppingBasket} 
          trend="up"
          color="bg-success/10 text-success" 
        />
        <FinCard 
          label="Total Mão de Obra" 
          value={stats.laborSales} 
          icon={Wrench} 
          trend="up"
          color="bg-success/10 text-success" 
        />
        <FinCard 
          label="Total Comprado" 
          value={stats.totalPurchases} 
          icon={TrendingDown} 
          trend="down"
          color="bg-destructive/10 text-destructive" 
        />
        <FinCard 
          label="Lucro Estimado" 
          value={stats.profit} 
          icon={Wallet} 
          trend={stats.profit >= 0 ? "up" : "down"}
          color={stats.profit >= 0 ? "bg-brand/10 text-brand" : "bg-destructive/10 text-destructive"} 
        />
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
          <h2 className="font-bold flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-brand" /> Fluxo de Caixa Recente
          </h2>
        </div>
        <div className="divide-y divide-border">
          {transactions.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">Nenhuma transação registrada.</div>
          ) : (
            transactions.slice(0, 20).map((t, i) => (
              <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "h-10 w-10 rounded-full grid place-items-center",
                    t.type === "sale" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                  )}>
                    {t.type === "sale" ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">
                      {t.type === "sale" ? "Venda realizada" : "Compra de estoque"}
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-0.5">
                      {new Date(t.createdAt).toLocaleDateString("pt-BR")} às {new Date(t.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
                <div className={cn(
                  "font-black text-lg tabular-nums",
                  t.type === "sale" ? "text-success" : "text-destructive"
                )}>
                  {t.type === "sale" ? "+" : "−"} {formatBRL(t.totalAmount)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function FinCard({ label, value, icon: Icon, color, trend }: any) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("h-10 w-10 rounded-xl grid place-items-center", color)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className={cn(
          "text-[10px] font-black uppercase px-2 py-0.5 rounded-full",
          trend === "up" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
        )}>
          {trend === "up" ? "Entrada" : "Saída"}
        </div>
      </div>
      <div className="text-xs text-muted-foreground font-medium mb-1">{label}</div>
      <div className={cn("text-2xl font-black tabular-nums", value < 0 && "text-destructive")}>
        {formatBRL(value)}
      </div>
    </div>
  );
}
