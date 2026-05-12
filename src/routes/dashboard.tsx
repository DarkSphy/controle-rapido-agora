import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useStore, productEffectiveStock, formatBRL, priceFromCostMargin } from "@/lib/store";
import { 
  TrendingUp, TrendingDown, AlertCircle, Package, BarChart3, Settings2, 
  ShoppingBasket, Truck, Lightbulb, ArrowLeftRight, FileText, Wrench
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BulkAdjustDialog } from "@/components/BulkAdjustDialog";
import { BulkTaxDialog } from "@/components/BulkTaxDialog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Resumo do dia — ControleJá" },
      { name: "description", content: "Visão rápida do dia: entradas, saídas, estoque crítico." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const products = useStore((s) => s.products);
  const movements = useStore((s) => s.movements);
  const categories = useStore((s) => s.categories);
  const sales = useStore((s) => s.sales);
  const saleItems = useStore((s) => s.saleItems);
  const purchases = useStore((s) => s.purchases);
  const quotes = useStore((s) => s.quotes);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [taxOpen, setTaxOpen] = useState(false);
  const [showCostValue, setShowCostValue] = useState(false);

  const today = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const t = start.getTime();
    
    const todaySalesList = sales.filter(s => s.createdAt >= t);
    
    let productSales = 0;
    let laborSales = 0;

    todaySalesList.forEach(s => {
      const myItems = saleItems.filter(si => si.saleId === s.id);
      let partsTotal = 0;

      myItems.forEach(si => {
        const p = products.find(prod => prod.id === si.productId);
        if (!p?.isService) {
          partsTotal += (si.unitPrice * si.quantity);
        }
      });
      
      const pVal = Math.min(s.totalAmount, partsTotal);
      const lVal = Math.max(0, s.totalAmount - partsTotal);
      
      productSales += pVal;
      laborSales += lVal;
    });

    const todayPurchases = purchases.filter(p => p.createdAt >= t).reduce((sum, p) => sum + p.totalAmount, 0);
    
    // Month start for quotes
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const tm = monthStart.getTime();

    const pendingQuotes = quotes.filter(q => q.status === "Pendente").length;
    const approvedQuotesMonth = quotes.filter(q => q.status === "Aprovado" && q.createdAt >= tm);
    const approvedQuotesValue = approvedQuotesMonth.reduce((sum, q) => sum + q.total, 0);
    
    return { 
      productSales,
      laborSales,
      totalSales: productSales + laborSales,
      purchases: todayPurchases,
      pendingQuotes,
      approvedQuotesCount: approvedQuotesMonth.length,
      approvedQuotesValue
    };
  }, [sales, saleItems, purchases, quotes]);

  const recentActivities = useMemo(() => {
    const list: any[] = [];
    sales.slice(0, 3).forEach(s => list.push({ type: "venda", date: s.createdAt, title: "Venda realizada", subtitle: `${formatBRL(s.totalAmount)}`, icon: ShoppingBasket, color: "text-success bg-success/10" }));
    quotes.slice(0, 2).forEach(q => list.push({ type: "orcamento", date: q.createdAt, title: "Orçamento criado", subtitle: `${formatBRL(q.total)}`, icon: FileText, color: "text-amber-500 bg-amber-500/10" }));
    return list.sort((a, b) => b.date - a.date).slice(0, 5);
  }, [sales, quotes]);

  const empty = products.filter((p) => !p.isService && productEffectiveStock(p) <= 0);
  const totalValue = products.reduce((sum, p) => {
    if (p.isService) return sum;
    const unitValue = showCostValue ? p.cost : priceFromCostMargin(p.cost, p.margin);
    return sum + productEffectiveStock(p) * unitValue;
  }, 0);

  const stats = [
    { label: "Vendas hoje", value: formatBRL(today.productSales), icon: TrendingUp, color: "text-success bg-success/10", trend: "+12% vs ontem" },
    { label: "Mão de obra hoje", value: formatBRL(today.laborSales), icon: Wrench, color: "text-brand bg-brand/10", trend: "estável" },
    { label: "Gasto hoje", value: formatBRL(today.purchases), icon: TrendingDown, color: "text-primary bg-primary/10", trend: "-5% vs ontem" },
    { label: "Estoque zerado", value: empty.length.toString(), icon: AlertCircle, color: "text-destructive bg-destructive/10", trend: "crítico" },
    { label: "Valor em estoque", value: formatBRL(totalValue), icon: Package, color: "text-slate-500 bg-slate-100", action: (
      <button onClick={() => setShowCostValue(!showCostValue)} className="text-[10px] font-bold uppercase tracking-widest text-brand hover:underline">
        {showCostValue ? "Ver Final" : "Ver Custo"}
      </button>
    )},
  ];

  return (
    <div className="px-4 md:px-10 py-8 md:py-12 max-w-7xl mx-auto space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">Resumo do dia</h1>
          <p className="text-muted-foreground font-medium">
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild className="h-12 px-6 rounded-2xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all font-bold">
            <Link to="/vendas">
              <ShoppingBasket className="mr-2 h-5 w-5" /> Nova Venda
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-12 px-6 rounded-2xl border-2 hover:bg-muted font-bold">
            <Link to="/compras">
              <Truck className="mr-2 h-5 w-5" /> Nova Compra
            </Link>
          </Button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-card rounded-[2rem] border border-border/50 p-6 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start mb-6">
              <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", s.color)}>
                <s.icon className="h-6 w-6" />
              </div>
              {s.trend && (
                <span className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full", 
                  s.trend.includes("+") ? "text-success bg-success/10" : "text-muted-foreground bg-muted"
                )}>
                  {s.trend}
                </span>
              )}
              {s.action}
            </div>
            <div className="space-y-1">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{s.label}</div>
              <div className="text-2xl font-black tabular-nums tracking-tight">{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Middle Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Estoque Crítico */}
        <div className="lg:col-span-2 bg-card rounded-[2rem] border border-border/50 overflow-hidden flex flex-col shadow-sm">
          <div className="p-6 flex items-center justify-between border-b border-border/50">
            <h2 className="text-lg font-black flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" /> Estoque crítico
            </h2>
            <Link to="/reposicao" className="text-xs font-bold uppercase tracking-widest text-brand hover:underline flex items-center gap-1">
              Ver reposição <TrendingUp className="h-3 w-3" />
            </Link>
          </div>
          <div className="p-6 flex-1">
            <div className="space-y-1">
              {products.filter(p => !p.isService && productEffectiveStock(p) <= p.minStock).slice(0, 4).map((p) => (
                <div key={p.id} className="flex items-center justify-between py-4 border-b border-border/30 last:border-0 group">
                  <span className="font-bold text-sm group-hover:text-brand transition-colors">{p.name}</span>
                  <span className={cn("text-xs font-black px-3 py-1 rounded-full", 
                    productEffectiveStock(p) <= 0 ? "text-destructive bg-destructive/10" : "text-amber-600 bg-amber-50"
                  )}>
                    {productEffectiveStock(p)} un.
                  </span>
                </div>
              ))}
              {products.filter(p => !p.isService && productEffectiveStock(p) <= p.minStock).length === 0 && (
                <div className="h-40 flex flex-col items-center justify-center text-muted-foreground">
                   <Package className="h-10 w-10 mb-2 opacity-20" />
                   <p className="text-sm font-medium">Tudo em dia por aqui!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Últimas Vendas */}
        <div className="bg-card rounded-[2rem] border border-border/50 overflow-hidden flex flex-col shadow-sm">
          <div className="p-6 flex items-center justify-between border-b border-border/50">
            <h2 className="text-lg font-black">Últimas vendas</h2>
            <Link to="/vendas" className="text-xs font-bold uppercase tracking-widest text-brand hover:underline">Ver todas</Link>
          </div>
          <div className="p-6 flex-1 space-y-4">
            {sales.slice(0, 4).map((s) => (
              <div key={s.id} className="flex items-center gap-4 group">
                <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center text-success shrink-0">
                  <ShoppingBasket className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-sm font-black tracking-tight">{formatBRL(s.totalAmount)}</span>
                    <span className="text-[10px] text-muted-foreground font-medium">{new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-success">{s.paymentMethod || "Venda"}</span>
                    <span className="text-[10px] text-muted-foreground truncate">Pedido #{s.id.slice(0,8).toUpperCase()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ActionTile title="Insights" icon={Lightbulb} color="text-brand" link="/insights" description="Sugestões inteligentes para o seu negócio." />
        <ActionTile title="Financeiro" icon={BarChart3} color="text-primary" link="/financeiro" description="Fluxo de caixa e lucratividade detalhada." />
        <div className="bg-card rounded-[2rem] border border-border/50 p-6 flex flex-col shadow-sm">
           <h3 className="font-black text-sm uppercase tracking-widest text-muted-foreground mb-4">Orçamentos</h3>
           <div className="space-y-4 flex-1">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-muted-foreground">Pendentes</span>
                <span className="text-sm font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-lg">{today.pendingQuotes}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-muted-foreground">Aprovados</span>
                <span className="text-sm font-black text-success bg-success/10 px-2 py-0.5 rounded-lg">{today.approvedQuotesCount}</span>
              </div>
              <div className="pt-2 border-t border-border/50 flex justify-between items-center">
                 <span className="text-sm font-bold">Total (Mês)</span>
                 <span className="text-sm font-black text-brand">{formatBRL(today.approvedQuotesValue)}</span>
              </div>
           </div>
        </div>
        <div className="bg-card rounded-[2rem] border border-border/50 p-6 shadow-sm space-y-3">
          <h3 className="font-black text-sm uppercase tracking-widest text-muted-foreground mb-1">Ações rápidas</h3>
          <Button variant="ghost" className="w-full justify-start font-bold h-10 px-3 rounded-xl hover:bg-muted" onClick={() => setBulkOpen(true)}>
            <Settings2 className="mr-2 h-4 w-4" /> Preços em massa
          </Button>
          <Button variant="ghost" className="w-full justify-start font-bold h-10 px-3 rounded-xl hover:bg-muted" onClick={() => setTaxOpen(true)}>
            <Settings2 className="mr-2 h-4 w-4" /> Tributos Globais
          </Button>
        </div>
      </div>

      {/* Recent Activities */}
      <section className="space-y-6">
        <h2 className="text-xl font-black flex items-center gap-2">
          <ArrowLeftRight className="h-5 w-5 text-muted-foreground" /> Atividades recentes
        </h2>
        <div className="bg-card rounded-[2.5rem] border border-border/50 p-2 shadow-sm overflow-x-auto scrollbar-none">
          <div className="flex gap-2 min-w-max">
            {recentActivities.map((act, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 rounded-[2rem] hover:bg-muted/30 transition-colors border border-transparent hover:border-border/50">
                <div className={cn("h-10 w-10 rounded-full flex items-center justify-center shrink-0", act.color)}>
                  <act.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-black tracking-tight">{act.title}</div>
                  <div className="text-[10px] text-muted-foreground font-medium">{act.subtitle} • {new Date(act.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <BulkAdjustDialog open={bulkOpen} onOpenChange={setBulkOpen} />
      <BulkTaxDialog open={taxOpen} onOpenChange={setTaxOpen} />
    </div>
  );
}

function ActionTile({ title, icon: Icon, color, link, description }: any) {
  return (
    <Link to={link} className="bg-card rounded-[2rem] border border-border/50 p-6 flex flex-col shadow-sm hover:shadow-md transition-all group">
      <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform", color, "bg-current/10")}>
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-black text-base mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed font-medium">{description}</p>
      <div className="mt-4 text-[10px] font-black uppercase tracking-widest text-brand group-hover:translate-x-1 transition-transform">Ver mais →</div>
    </Link>
  );
}
