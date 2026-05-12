import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/movimentacoes")({
  head: () => ({
    meta: [
      { title: "Movimentações — ControleJá" },
      { name: "description", content: "Histórico de entradas e saídas de estoque." },
    ],
  }),
  component: MovementsPage,
});

type Filter = "all" | "in" | "out";

function MovementsPage() {
  const movements = useStore((s) => s.movements);
  const [filter, setFilter] = useState<Filter>("all");

  const list = useMemo(() => {
    return filter === "all" ? movements : movements.filter((m) => m.type === filter);
  }, [movements, filter]);

  const grouped = useMemo(() => {
    const groups = new Map<string, typeof list>();
    list.forEach((m) => {
      const d = new Date(m.date);
      d.setHours(0, 0, 0, 0);
      const key = d.toISOString();
      const arr = groups.get(key) ?? [];
      arr.push(m);
      groups.set(key, arr);
    });
    return Array.from(groups.entries());
  }, [list]);

  return (
    <div className="px-4 md:px-8 py-6 md:py-10 max-w-3xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Movimentações</h1>
        <p className="text-muted-foreground text-sm mt-1">Extrato de entradas e saídas</p>
      </header>

      <div className="flex gap-2 mb-6">
        {[
          { k: "all", l: "Todas" },
          { k: "in", l: "Entradas" },
          { k: "out", l: "Saídas" },
        ].map((f) => (
          <Button
            key={f.k}
            size="sm"
            variant={filter === f.k ? "default" : "outline"}
            onClick={() => setFilter(f.k as Filter)}
          >
            {f.l}
          </Button>
        ))}
      </div>

      {grouped.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
          Nenhuma movimentação registrada.
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([day, items]) => (
            <div key={day}>
              <h3 className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-2">
                {new Date(day).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
              </h3>
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                {items.map((m) => (
                  <div key={m.id} className="flex items-center justify-between px-4 py-3 border-b border-border last:border-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn(
                        "h-9 w-9 rounded-full grid place-items-center font-bold text-sm",
                        m.type === "in" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive",
                      )}>
                        {m.type === "in" ? "+" : "−"}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium truncate">
                          {m.productName}{m.variationName ? ` — ${m.variationName}` : ""}
                        </div>
                        <div className="text-xs text-muted-foreground flex gap-2">
                          <span>{new Date(m.date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                          {m.reason && (
                            <span className="px-1.5 py-0.5 bg-muted rounded-md text-[10px] leading-none flex items-center font-medium">
                              {m.reason}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className={cn(
                      "tabular-nums font-semibold",
                      m.type === "in" ? "text-success" : "text-destructive",
                    )}>
                      {m.type === "in" ? "+" : "−"}{m.quantity}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
