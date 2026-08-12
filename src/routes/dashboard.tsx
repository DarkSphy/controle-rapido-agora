import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useStore, productEffectiveStock, formatBRL, productInventoryValue } from "@/lib/store";
import { 
  ArrowUpRight, ArrowDownLeft, PackageX, BarChart4, Settings2, 
  Receipt, ShoppingBag, Sparkles, Activity, FileSpreadsheet, Sliders, Wallet, AlertCircle, TrendingUp, Package,
  ShoppingBasket, Truck, Lightbulb, BarChart3, FileText, ArrowLeftRight
} from "lucide-react";
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
    sales.slice(0, 3).forEach(s => list.push({ type: "venda", date: s.createdAt, title: "Venda realizada", subtitle: `${formatBRL(s.totalAmount)}`, icon: Receipt, color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10" }));
    quotes.slice(0, 2).forEach(q => list.push({ type: "orcamento", date: q.createdAt, title: "Orçamento criado", subtitle: `${formatBRL(q.total)}`, icon: FileSpreadsheet, color: "text-amber-500 bg-amber-500/10" }));
    return list.sort((a, b) => b.date - a.date).slice(0, 5);
  }, [sales, quotes]);

  const empty = products.filter((p) => !p.isService && productEffectiveStock(p) <= 0);
  const totalValue = products.reduce((sum, p) => {
    if (p.isService) return sum;
    return sum + productInventoryValue(p, showCostValue);
  }, 0);

  const stats = [
    { label: "Vendas hoje", value: formatBRL(today.productSales), icon: ArrowUpRight, color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20", trend: "+12% vs ontem" },
    { label: "Mão de obra hoje", value: formatBRL(today.laborSales), icon: Sliders, color: "text-brand bg-brand/10 border-brand/20", trend: "estável" },
    { label: "Gasto hoje", value: formatBRL(today.purchases), icon: ArrowDownLeft, color: "text-primary bg-primary/10 border-primary/20", trend: "-5% vs ontem" },
    { label: "Estoque zerado", value: empty.length.toString(), icon: PackageX, color: "text-destructive bg-destructive/10 border-destructive/20", trend: "crítico" },
    { label: "Valor em estoque", value: formatBRL(totalValue), icon: Wallet, color: "text-muted-foreground bg-muted border-border", action: (
      <button onClick={() => setShowCostValue(!showCostValue)} className="text-[10px] font-bold uppercase tracking-widest text-brand hover:underline">
        {showCostValue ? "Ver Final" : "Ver Custo"}
      </button>
    )},
  ];

  return (
    <div className="px-4 md:px-10 py-6 md:py-10 max-w-7xl mx-auto space-y-8">
      {/* NOTION CALLOUT WELCOME BANNER */}
      <div className="p-6 md:p-8 rounded-2xl border border-border bg-card shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="text-2xl">👋</span>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
              Resumo da Operação
            </h1>
          </div>
          <p className="text-sm text-muted-foreground font-medium pl-8 capitalize">
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 z-10">
          <Button asChild className="h-10 px-5 rounded-xl bg-brand text-brand-foreground hover:bg-brand/90 font-semibold text-xs shadow-sm transition-all">
            <Link to="/vendas">
              <ShoppingBasket className="mr-2 h-4 w-4" /> Nova Venda
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-10 px-5 rounded-xl border-border bg-card hover:bg-muted font-semibold text-xs transition-all">
            <Link to="/compras">
              <Truck className="mr-2 h-4 w-4" /> Nova Compra
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-card rounded-2xl border border-border p-5 shadow-sm hover:shadow-md hover:border-brand/40 transition-all duration-300 group flex flex-col justify-between">
            <div className="flex items-start justify-between mb-4">
              <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105", s.color)}>
                <s.icon className="h-5 w-5" />
              </div>
              {s.trend && (
                <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border", 
                  s.trend.includes("+") 
                    ? "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20" 
                    : "text-muted-foreground bg-muted border-border"
                )}>
                  {s.trend}
                </span>
              )}
              {s.action}
            </div>
            <div className="space-y-1">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{s.label}</div>
              <div className="text-2xl font-extrabold tabular-nums tracking-tight text-foreground">{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* MIDDLE SECTION: CRITICAL STOCK & RECENT SALES */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Estoque Crítico (Notion Database List style) */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border overflow-hidden flex flex-col shadow-sm">
          <div className="p-5 flex items-center justify-between border-b border-border bg-muted/20">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">Estoque Crítico</h2>
            </div>
            <Link to="/reposicao" className="text-xs font-bold text-brand hover:underline flex items-center gap-1">
              Ver reposição completa <TrendingUp className="h-3 w-3" />
            </Link>
          </div>
          <div className="p-5 flex-1 divide-y divide-border/60">
            {products.filter(p => !p.isService && productEffectiveStock(p) <= p.minStock).slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center justify-between py-3 group hover:bg-muted/30 px-2 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <Package className="h-4 w-4 text-muted-foreground opacity-60" />
                  <span className="font-semibold text-sm group-hover:text-brand transition-colors">{p.name}</span>
                </div>
                <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full border", 
                  productEffectiveStock(p) <= 0 
                    ? "text-destructive bg-destructive/10 border-destructive/20" 
                    : "text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/20"
                )}>
                  {productEffectiveStock(p)} un. em estoque
                </span>
              </div>
            ))}
            {products.filter(p => !p.isService && productEffectiveStock(p) <= p.minStock).length === 0 && (
              <div className="h-40 flex flex-col items-center justify-center text-muted-foreground text-center">
                <Package className="h-8 w-8 mb-2 opacity-30" />
                <p className="text-sm font-medium">Estoque 100% regularizado!</p>
              </div>
            )}
          </div>
        </div>

        {/* Últimas Vendas */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col shadow-sm">
          <div className="p-5 flex items-center justify-between border-b border-border bg-muted/20">
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">Últimas Vendas</h2>
            <Link to="/vendas" className="text-xs font-bold text-brand hover:underline">Ver todas</Link>
          </div>
          <div className="p-5 flex-1 space-y-3.5">
            {sales.slice(0, 4).map((s) => (
              <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-xl border border-border/50 bg-background/50 hover:bg-muted/40 transition-colors">
                <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <ShoppingBasket className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-foreground">{formatBRL(s.totalAmount)}</span>
                    <span className="text-[10px] text-muted-foreground font-medium">{new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">{s.paymentMethod || "Venda"}</span>
                    <span className="text-[10px] text-muted-foreground truncate">#{s.id.slice(0,8).toUpperCase()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* QUICK WORKSPACE PAGES & TOOLS */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ActionTile title="Insights Inteligentes" icon={Lightbulb} color="text-amber-500" link="/insights" description="Análise de giro de estoque e lucratividade." />
        <ActionTile title="Gestão Financeira" icon={BarChart3} color="text-brand" link="/financeiro" description="Controle detalhado de entradas e saídas." />
        
        {/* ORÇAMENTOS SUMMARY TILE */}
        <div className="bg-card rounded-2xl border border-border p-5 flex flex-col shadow-sm justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Orçamentos do Mês</h3>
            <FileText className="h-4 w-4 text-amber-500" />
          </div>
          <div className="space-y-2 my-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground font-medium">Pendentes</span>
              <span className="font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded">{today.pendingQuotes}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground font-medium">Aprovados</span>
              <span className="font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded">{today.approvedQuotesCount}</span>
            </div>
          </div>
          <div className="pt-2 border-t border-border flex justify-between items-center text-xs font-bold">
            <span>Total Aprovado</span>
            <span className="text-brand">{formatBRL(today.approvedQuotesValue)}</span>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm flex flex-col justify-between">
          <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-3">Ferramentas de Ajuste</h3>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start font-semibold text-xs h-9 px-3 rounded-xl border-border hover:bg-muted" onClick={() => setBulkOpen(true)}>
              <Settings2 className="mr-2 h-3.5 w-3.5" /> Ajustar Preços em Massa
            </Button>
            <Button variant="outline" className="w-full justify-start font-semibold text-xs h-9 px-3 rounded-xl border-border hover:bg-muted" onClick={() => setTaxOpen(true)}>
              <Settings2 className="mr-2 h-3.5 w-3.5" /> Configurar Tributos Globais
            </Button>
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITIES */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">Atividades Recentes</h2>
        </div>
        <div className="bg-card rounded-2xl border border-border p-2 shadow-sm overflow-x-auto scrollbar-none">
          <div className="flex gap-2 min-w-max">
            {recentActivities.map((act, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-background/60 hover:bg-muted/40 transition-colors border border-border/40">
                <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0 text-xs", act.color)}>
                  <act.icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground">{act.title}</div>
                  <div className="text-[11px] text-muted-foreground">{act.subtitle} • {new Date(act.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
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
    <Link to={link} className="bg-card rounded-2xl border border-border p-5 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-brand/40 transition-all group">
      <div>
        <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform bg-muted", color)}>
          <Icon className="h-4.5 w-4.5" />
        </div>
        <h3 className="font-bold text-sm text-foreground mb-1">{title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </div>
      <div className="mt-4 text-xs font-bold text-brand group-hover:translate-x-1 transition-transform flex items-center gap-1">
        Acessar módulo &rarr;
      </div>
    </Link>
  );
}
