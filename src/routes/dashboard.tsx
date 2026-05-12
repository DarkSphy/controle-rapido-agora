import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useStore, productEffectiveStock, formatBRL, priceFromCostMargin } from "@/lib/store";
import { 
  TrendingUp, TrendingDown, AlertCircle, Package, BarChart3, Settings2, 
  ShoppingBasket, Truck, Lightbulb 
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BulkAdjustDialog } from "@/components/BulkAdjustDialog";
import { BulkTaxDialog } from "@/components/BulkTaxDialog";

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
  const purchases = useStore((s) => s.purchases);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [taxOpen, setTaxOpen] = useState(false);

  const today = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const t = start.getTime();
    
    const todaySales = sales.filter(s => s.createdAt >= t).reduce((sum, s) => sum + s.totalAmount, 0);
    const todayPurchases = purchases.filter(p => p.createdAt >= t).reduce((sum, p) => sum + p.totalAmount, 0);
    
    return { sales: todaySales, purchases: todayPurchases };
  }, [sales, purchases]);

  const empty = products.filter((p) => productEffectiveStock(p) <= 0);
  const totalValue = products.reduce((sum, p) => sum + productEffectiveStock(p) * priceFromCostMargin(p.cost, p.margin), 0);

  return (
    <div className="px-4 md:px-8 py-6 md:py-10 max-w-6xl mx-auto">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Resumo do dia</h1>
          <p className="text-muted-foreground mt-1 lowercase">
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild className="gap-2 h-11 px-5">
            <Link to="/vendas">
              <ShoppingBasket className="h-4 w-4" /> Nova Venda
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2 h-11 px-5">
            <Link to="/compras">
              <Truck className="h-4 w-4" /> Nova Compra
            </Link>
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
        <Stat icon={TrendingUp} label="Vendas hoje" value={formatBRL(today.sales)} accent="brand" small />
        <Stat icon={TrendingDown} label="Gasto hoje" value={formatBRL(today.purchases)} accent="primary" small />
        <Stat icon={AlertCircle} label="Estoque zerado" value={empty.length} accent="destructive" />
        <Stat icon={Package} label="Valor em estoque" value={formatBRL(totalValue)} accent="default" small />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card title="Estoque crítico" empty="Tudo certo!" link="/reposicao" linkLabel="Ver reposição">
          {products.filter(p => productEffectiveStock(p) <= p.minStock).slice(0, 5).map((p) => (
            <Row key={p.id} name={p.name} value={productEffectiveStock(p)} status={productEffectiveStock(p) <= 0 ? "empty" : "low"} />
          ))}
        </Card>
        <Card title="Últimas vendas" empty="Sem vendas registradas." link="/vendas" linkLabel="Ver todas">
          {sales.slice(0, 5).map((s) => (
            <div key={s.id} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
              <div className="min-w-0">
                <div className="font-medium truncate">{formatBRL(s.totalAmount)}</div>
                <div className="text-xs text-muted-foreground uppercase font-bold tracking-widest">{s.paymentMethod || "Venda"}</div>
              </div>
              <div className="text-[10px] text-muted-foreground">
                {new Date(s.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          ))}
        </Card>
      </div>

      <div className="mt-8 grid md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-5 relative overflow-hidden group hover:border-brand/50 transition-all">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-brand/10 group-hover:scale-110 transition-transform" />
          <h2 className="font-bold mb-1 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-brand" /> Insights
          </h2>
          <p className="text-xs text-muted-foreground mb-4">Veja sugestões inteligentes para seu negócio.</p>
          <Button asChild variant="link" className="p-0 h-auto text-brand text-xs font-bold uppercase tracking-widest">
            <Link to="/insights">Ver recomendações →</Link>
          </Button>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-semibold mb-4">Financeiro</h2>
          <Button asChild variant="outline" className="w-full justify-start gap-2 mb-2">
            <Link to="/financeiro">
              <BarChart3 className="h-4 w-4" /> Fluxo de caixa e lucro
            </Link>
          </Button>
          <p className="text-[10px] text-muted-foreground uppercase">Acompanhe entradas e saídas detalhadas.</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-semibold mb-4">Ações rápidas</h2>
          <Button variant="outline" className="w-full justify-start gap-2 mb-2" onClick={() => setBulkOpen(true)}>
            <Settings2 className="h-4 w-4" /> Ajuste de preço em massa
          </Button>
          <Button variant="outline" className="w-full justify-start gap-2 mb-2" onClick={() => setTaxOpen(true)}>
            <Settings2 className="h-4 w-4" /> Configurar Tributos Globais
          </Button>
          <p className="text-[10px] text-muted-foreground uppercase">Aumente margens ou defina impostos de forma global.</p>
        </div>
      </div>

      <BulkAdjustDialog open={bulkOpen} onOpenChange={setBulkOpen} />
      <BulkTaxDialog open={taxOpen} onOpenChange={setTaxOpen} />
    </div>
  );
}

function Stat({
  icon: Icon, label, value, accent, small,
}: { icon: any; label: string; value: number | string; accent: "brand" | "primary" | "destructive" | "default"; small?: boolean }) {
  const colors = {
    brand: "bg-brand/15 text-brand-foreground",
    primary: "bg-primary/10 text-primary",
    destructive: "bg-destructive/10 text-destructive",
    default: "bg-muted text-foreground",
  } as const;
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className={`h-9 w-9 rounded-lg grid place-items-center mb-3 ${colors[accent]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`font-bold tabular-nums ${small ? "text-lg" : "text-2xl"}`}>{value}</div>
    </div>
  );
}

function Card({ title, children, empty, link, linkLabel }: { title: string; children: React.ReactNode; empty: string; link: string; linkLabel: string }) {
  const arr = Array.isArray(children) ? children : [children];
  const hasContent = arr.filter(Boolean).length > 0;
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">{title}</h2>
        <Link to={link} className="text-xs text-brand-foreground font-medium hover:underline">{linkLabel}</Link>
      </div>
      {hasContent ? <div>{children}</div> : <p className="text-sm text-muted-foreground py-6 text-center">{empty}</p>}
    </div>
  );
}

function Row({ name, value, status }: { name: string; value: number; status: "low" | "empty" }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
      <span className="font-medium truncate">{name}</span>
      <span className={`text-sm font-semibold tabular-nums ${status === "empty" ? "text-destructive" : "text-warning-foreground"}`}>
        {value} un
      </span>
    </div>
  );
}
