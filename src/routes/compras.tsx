import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useStore, formatBRL } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Truck, Calendar, Tag, Search } from "lucide-react";
import { PurchaseDialog } from "@/components/PurchaseDialog";

export const Route = createFileRoute("/compras")({
  head: () => ({
    meta: [
      { title: "Compras — ControleJá" },
      { name: "description", content: "Controle suas entradas de mercadoria e custos." },
    ],
  }),
  component: ComprasPage,
});

function ComprasPage() {
  const purchases = useStore((s) => s.purchases);
  const purchaseItems = useStore((s) => s.purchaseItems);
  const suppliers = useStore((s) => s.suppliers);
  const products = useStore((s) => s.products);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return purchases;
    return purchases.filter((p) => {
      const sup = suppliers.find((s) => s.id === p.supplierId);
      if (sup?.name.toLowerCase().includes(q)) return true;
      const items = purchaseItems.filter((pi) => pi.purchaseId === p.id);
      return items.some((pi) => {
        const prod = products.find((pr) => pr.id === pi.productId);
        return prod?.name.toLowerCase().includes(q);
      });
    });
  }, [purchases, purchaseItems, suppliers, products, query]);

  return (
    <div className="px-4 md:px-8 py-6 md:py-10 max-w-5xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Compras</h1>
          <p className="text-muted-foreground text-sm mt-1">Gestão de entradas e custos de fornecedores</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2 shrink-0 h-12 px-6 text-lg">
          <Plus className="h-5 w-5" /> Nova compra
        </Button>
      </header>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por fornecedor ou produto..." className="pl-9 h-11" />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-muted grid place-items-center mb-4">
            <Truck className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">{query ? "Nenhuma compra encontrada." : "Nenhuma compra registrada."}</p>
          {!query && <Button variant="link" onClick={() => setOpen(true)}>Registrar primeira compra</Button>}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((p) => {
            const supplier = suppliers.find(s => s.id === p.supplierId);
            const items = purchaseItems.filter(pi => pi.purchaseId === p.id);
            const date = new Date(p.createdAt);
            
            return (
              <div key={p.id} className="rounded-2xl border border-border bg-card p-6 transition-all hover:border-brand/30">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
                      <Truck className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-bold text-lg leading-tight mb-1">
                        {supplier?.name || "Fornecedor avulso"}
                      </div>
                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {date.toLocaleDateString("pt-BR")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          {items.length} {items.length === 1 ? "produto" : "produtos"}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:text-right border-t md:border-t-0 pt-4 md:pt-0 border-border">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Investimento Total</div>
                    <div className="text-2xl font-black text-brand tabular-nums">{formatBRL(p.totalAmount)}</div>
                  </div>
                </div>
                
                {/* Micro list of items */}
                <div className="mt-4 pt-4 border-t border-border/50 flex flex-wrap gap-2">
                  {items.slice(0, 3).map(i => {
                    const prod = products.find((pr) => pr.id === i.productId);
                    return (
                      <span key={i.id} className="text-[10px] bg-muted px-2 py-1 rounded-md text-muted-foreground border border-border/50">
                        {i.quantity}x {prod?.name || "Produto"}
                      </span>
                    );
                  })}
                  {items.length > 3 && <span className="text-[10px] text-muted-foreground py-1">+{items.length - 3} mais</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <PurchaseDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
