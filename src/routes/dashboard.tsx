import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useStore, productEffectiveStock, formatBRL, productInventoryValue } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { 
  ArrowUpRight, ShoppingCart, Lock, PackageX, FileText, ChevronRight, TrendingUp, Package,
  BarChart4, ArrowDownLeft, Sliders, Wallet, Settings2, ChevronDown, AlertCircle, Sparkles, Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Resumo do dia — ControleJá" },
      { name: "description", content: "Visão rápida do dia: entradas, saídas, estoque crítico." },
    ],
  }),
  component: Dashboard,
});

const chartData = [
  { name: '05/08', total: Math.floor(Math.random() * 2000) + 1000 },
  { name: '06/08', total: Math.floor(Math.random() * 2000) + 1000 },
  { name: '07/08', total: Math.floor(Math.random() * 2000) + 1000 },
  { name: '08/08', total: Math.floor(Math.random() * 2000) + 1000 },
  { name: '09/08', total: Math.floor(Math.random() * 2000) + 1000 },
  { name: '10/08', total: Math.floor(Math.random() * 2000) + 1000 },
  { name: '11/08', total: Math.floor(Math.random() * 2000) + 2000 },
];

function Dashboard() {
  const { user } = useAuth();
  const products = useStore((s) => s.products);
  const sales = useStore((s) => s.sales);
  const purchases = useStore((s) => s.purchases);

  const today = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const t = start.getTime();
    
    const todaySalesList = sales.filter(s => s.createdAt >= t);
    
    let productSales = 0;
    todaySalesList.forEach(s => {
      productSales += s.totalAmount;
    });

    const todayPurchases = purchases.filter(p => p.createdAt >= t).reduce((sum, p) => sum + p.totalAmount, 0);
    
    return { 
      productSales,
      salesCount: todaySalesList.length,
      purchases: todayPurchases,
    };
  }, [sales, purchases]);

  const empty = products.filter((p) => !p.isService && productEffectiveStock(p) <= 0);
  const totalValue = products.reduce((sum, p) => {
    if (p.isService) return sum;
    return sum + productInventoryValue(p, false);
  }, 0);

  const stats = [
    { label: "VENDAS HOJE", value: formatBRL(today.productSales), icon: ArrowUpRight, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10", trend: "+12% vs ontem", trendColor: "text-emerald-500" },
    { label: "PEDIDOS HOJE", value: today.salesCount.toString(), icon: BarChart4, color: "text-blue-500 bg-blue-50 dark:bg-blue-500/10", trend: "+8% vs ontem", trendColor: "text-emerald-500" },
    { label: "COMPRAS HOJE", value: formatBRL(today.purchases), icon: Lock, color: "text-orange-500 bg-orange-50 dark:bg-orange-500/10", trend: "-5% vs ontem", trendColor: "text-red-500" },
    { label: "PRODUTOS CRÍTICOS", value: empty.length.toString(), icon: PackageX, color: "text-purple-500 bg-purple-50 dark:bg-purple-500/10", action: <Link to="/reposicao" className="text-xs text-brand font-medium hover:underline">Ver detalhes</Link> },
    { label: "VALOR EM ESTOQUE", value: formatBRL(totalValue), icon: FileText, color: "text-blue-500 bg-blue-50 dark:bg-blue-500/10", action: <Link to="/produtos" className="text-xs text-brand font-medium hover:underline">Ver estoque</Link> },
  ];

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-[1400px] mx-auto space-y-8">
      {/* HEADER: Welcome & Primary Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-[28px] font-extrabold tracking-tight text-foreground flex items-center gap-2">
            Olá, {user?.email?.split('@')[0] || "Mariana"}! <span className="text-2xl">👋</span>
          </h1>
          <p className="text-sm text-muted-foreground font-medium mt-1 capitalize">
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button asChild className="h-11 px-6 rounded-xl bg-brand text-white hover:bg-brand/90 font-semibold shadow-md shadow-brand/20 transition-all">
            <Link to="/vendas">
              <ShoppingCart className="mr-2 h-4 w-4" /> Nova Venda
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-11 px-6 rounded-xl bg-card border-border hover:bg-muted font-semibold transition-all">
            <Link to="/compras">
              <Package className="mr-2 h-4 w-4" /> Nova Compra
            </Link>
          </Button>
        </div>
      </div>

      {/* 5-COLUMN METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-card rounded-2xl border border-border p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className={cn("h-10 w-10 rounded-full flex items-center justify-center", s.color)}>
                <s.icon className="h-5 w-5" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-extrabold tabular-nums tracking-tight text-foreground mb-1">{s.value}</div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{s.label}</div>
              
              <div className="mt-3 min-h-[20px]">
                {s.trend && (
                  <span className={cn("text-xs font-semibold", s.trendColor)}>
                    {s.trend}
                  </span>
                )}
                {s.action}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MIDDLE SECTION: CHART & RECENT SALES */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Gráfico */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-brand" />
              <h2 className="text-base font-bold text-foreground">Evolução de vendas</h2>
            </div>
            <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs font-semibold border-border">
              7 dias <ChevronDown className="ml-2 h-3 w-3" />
            </Button>
          </div>
          <div className="flex-1 min-h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0066ff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0066ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} tickFormatter={(val) => `R$ ${val}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#0066ff', fontWeight: 'bold' }}
                  formatter={(val: number) => [formatBRL(val), "Total"]}
                />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <Area type="monotone" dataKey="total" stroke="#0066ff" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" activeDot={{ r: 6, fill: '#0066ff', stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Últimas Vendas (Right side) */}
        <div className="bg-card rounded-2xl border border-border flex flex-col shadow-sm">
          <div className="p-5 flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-brand" />
              <h2 className="text-sm font-bold text-foreground">Últimas vendas</h2>
            </div>
            <Link to="/vendas" className="text-xs font-bold text-brand hover:underline">Ver todas</Link>
          </div>
          <div className="p-5 flex-1 space-y-1">
            {sales.slice(0, 4).map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                    <ShoppingCart className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">Cliente #{s.id.slice(0,4).toUpperCase()}</div>
                    <div className="text-xs text-muted-foreground font-medium">1 item • {s.paymentMethod || "PIX"}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-foreground">{formatBRL(s.totalAmount)}</div>
                  <div className="text-[10px] text-muted-foreground">{new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
            ))}
            {sales.length === 0 && (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm font-medium">
                Nenhuma venda hoje
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: 3 Columns */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Estoque Crítico */}
        <div className="bg-card rounded-2xl border border-border flex flex-col shadow-sm">
          <div className="p-5 flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <h2 className="text-sm font-bold text-foreground">Estoque crítico</h2>
            </div>
            <Link to="/reposicao" className="text-xs font-bold text-brand hover:underline">Ver reposição completa</Link>
          </div>
          <div className="p-5 flex-1 divide-y divide-border/60">
            {products.filter(p => !p.isService && productEffectiveStock(p) <= p.minStock).slice(0, 4).map((p) => (
              <div key={p.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <Package className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-foreground">{p.name}</div>
                    <div className="text-[10px] text-muted-foreground">Estoque atual: Depósito 1</div>
                  </div>
                </div>
                <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", 
                  productEffectiveStock(p) <= 0 ? "text-destructive bg-destructive/10" : "text-amber-600 bg-amber-100 dark:bg-amber-500/10"
                )}>
                  {productEffectiveStock(p)}
                </span>
              </div>
            ))}
            {products.filter(p => !p.isService && productEffectiveStock(p) <= p.minStock).length === 0 && (
               <div className="h-full flex items-center justify-center text-muted-foreground text-sm font-medium">Estoque OK</div>
            )}
          </div>
        </div>

        {/* Produtos mais vendidos */}
        <div className="bg-card rounded-2xl border border-border flex flex-col shadow-sm">
          <div className="p-5 flex items-center justify-between border-b border-border">
            <h2 className="text-sm font-bold text-foreground">Produtos mais vendidos</h2>
            <Link to="/insights" className="text-xs font-bold text-brand hover:underline">Ver relatório</Link>
          </div>
          <div className="p-5 flex-1 space-y-4">
            {products.filter(p => !p.isService).slice(0, 5).map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-brand text-white flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </div>
                <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                  <Package className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="font-semibold text-sm text-foreground">{p.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Movimentações recentes */}
        <div className="bg-card rounded-2xl border border-border flex flex-col shadow-sm">
          <div className="p-5 flex items-center justify-between border-b border-border">
            <h2 className="text-sm font-bold text-foreground">Movimentações recentes</h2>
            <Link to="/movimentacoes" className="text-xs font-bold text-brand hover:underline">Ver todas</Link>
          </div>
          <div className="p-5 flex-1 divide-y divide-border/60">
            {[
              { n: 'Camiseta básica — M', t: 'Venda • há 2 min', v: '-1', c: 'text-destructive' },
              { n: 'Caneca personalizada', t: 'Compra • há 1h', v: '+14', c: 'text-emerald-500' },
              { n: 'Cabo HDMI 2m', t: 'Venda • há 3h', v: '-2', c: 'text-destructive' },
              { n: 'Carregador Turbo', t: 'Compra • há 5h', v: '+20', c: 'text-emerald-500' },
              { n: 'Mouse Sem Fio', t: 'Venda • há 6h', v: '-1', c: 'text-destructive' },
            ].map((m, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                   <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-foreground">{m.n}</div>
                    <div className="text-[10px] text-muted-foreground">{m.t}</div>
                  </div>
                </div>
                <span className={cn("text-sm font-bold", m.c)}>{m.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TIP BANNER */}
      <div className="bg-brand/5 dark:bg-brand/10 rounded-2xl p-6 border border-brand/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="font-bold text-brand dark:text-brand-foreground text-lg mb-1">Dica do ControleJá</div>
          <div className="text-sm text-muted-foreground font-medium">Mantenha seus produtos sempre atualizados e evite perder vendas. Acompanhe os relatórios diários.</div>
        </div>
        <Button variant="outline" className="shrink-0 rounded-xl font-bold bg-card border-brand/20 text-brand hover:bg-brand/5 dark:bg-transparent">
          Ver dicas <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>

    </div>
  );
}
