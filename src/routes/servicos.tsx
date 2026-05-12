import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore, Product, formatBRL, priceFromCostMargin } from "@/lib/store";
import { ServiceDialog } from "@/components/ServiceDialog";
import { SearchBar, searchProducts } from "@/components/SearchBar";

export const Route = createFileRoute("/servicos")({
  head: () => ({
    meta: [
      { title: "Serviços — ControleJá" },
      { name: "description", content: "Cadastre e edite os serviços prestados." },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const products = useStore((s) => s.products);
  const categories = useStore((s) => s.categories);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  // Filtramos apenas os que são serviços
  const services = useMemo(() => products.filter(p => p.isService), [products]);
  const filtered = useMemo(() => searchProducts(services, q), [services, q]);

  return (
    <div className="px-4 md:px-8 py-6 md:py-10 max-w-6xl mx-auto">
      <header className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Serviços</h1>
          <p className="text-muted-foreground text-sm mt-1">{services.length} cadastrados</p>
        </div>
        <Button onClick={() => { setEditing(null); setEditOpen(true); }}>
          <Plus className="h-4 w-4" /> Novo serviço
        </Button>
      </header>

      <div className="mb-6">
        <SearchBar value={q} onChange={setQ} placeholder="Buscar serviço..." />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground">Nenhum serviço encontrado.</p>
          <Button className="mt-4" onClick={() => { setEditing(null); setEditOpen(true); }}>
            <Plus className="h-4 w-4" /> Cadastrar primeiro serviço
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s) => {
            const cat = categories.find((c) => c.id === s.categoryId);
            const price = priceFromCostMargin(s.cost, s.margin);
            
            return (
              <div key={s.id} className="rounded-xl border border-border bg-card p-4 transition-all hover:border-brand/40 group">
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-lg truncate" title={s.name}>{s.name}</h3>
                    {cat && <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{cat.name}</div>}
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => { setEditing(s); setEditOpen(true); }}>
                    <Edit2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
                
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Valor</div>
                    <div className="text-xl font-bold text-brand tabular-nums">{formatBRL(price)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Custo</div>
                    <div className="text-sm font-medium tabular-nums">{formatBRL(s.cost)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ServiceDialog service={editing} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}
