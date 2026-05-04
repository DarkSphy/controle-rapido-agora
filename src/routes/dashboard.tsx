import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useStore, productEffectiveStock, formatBRL, priceFromCostMargin } from "@/lib/store";
import { TrendingUp, TrendingDown, AlertCircle, Package } from "lucide-react";

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

  const today = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const t = start.getTime();
    const todayMoves = movements.filter((m) => m.date >= t);
    const ins = todayMoves.filter((m) => m.type === "in").reduce((s, m) => s + m.quantity, 0);
    const outs = todayMoves.filter((m) => m.type === "out").reduce((s, m) => s + m.quantity, 0);
    return { ins, outs, count: todayMoves.length };
  }, [movements]);

  const empty = products.filter((p) => productEffectiveStock(p) <= 0);
  const low = products.filter((p) => {
    const s = productEffectiveStock(p);
    return s > 0 && s <= p.minStock;
  });
  const totalValue = products.reduce((sum, p) => sum + productEffectiveStock(p) * priceFromCostMargin(p.cost, p.margin), 0);

  return (
    <div className="px-4 md:px-8 py-6 md:py-10 max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Resumo do dia</h1>
        <p className="text-muted-foreground mt-1">
          {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
        </p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
        <Stat icon={TrendingUp} label="Entradas hoje" value={today.ins} accent="brand" />
        <Stat icon={TrendingDown} label="Saídas hoje" value={today.outs} accent="primary" />
        <Stat icon={AlertCircle} label="Estoque zerado" value={empty.length} accent="destructive" />
        <Stat icon={Package} label="Valor em estoque" value={formatBRL(totalValue)} accent="default" small />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card title="Estoque crítico" empty="Tudo certo!" link="/reposicao" linkLabel="Ver reposição">
          {[...empty, ...low].slice(0, 5).map((p) => (
            <Row key={p.id} name={p.name} value={productEffectiveStock(p)} status={productEffectiveStock(p) <= 0 ? "empty" : "low"} />
          ))}
        </Card>
        <Card title="Movimentações recentes" empty="Sem movimentos hoje." link="/movimentacoes" linkLabel="Ver tudo">
          {movements.slice(0, 5).map((m) => (
            <div key={m.id} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
              <div className="min-w-0">
                <div className="font-medium truncate">{m.productName}{m.variationName ? ` — ${m.variationName}` : ""}</div>
                <div className="text-xs text-muted-foreground">{new Date(m.date).toLocaleString("pt-BR")}</div>
              </div>
              <div className={`text-sm font-semibold tabular-nums ${m.type === "in" ? "text-success" : "text-destructive"}`}>
                {m.type === "in" ? "+" : "−"}{m.quantity}
              </div>
            </div>
          ))}
        </Card>
      </div>
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
