import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, formatBRL } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Plus, ShoppingBasket, Repeat, ExternalLink } from "lucide-react";
import { SaleDialog } from "@/components/SaleDialog";

export const Route = createFileRoute("/vendas")({
  head: () => ({
    meta: [
      { title: "Vendas — ControleJá" },
      { name: "description", content: "Gerencie suas vendas e acompanhe faturamento." },
    ],
  }),
  component: VendasPage,
});

function VendasPage() {
  const sales = useStore((s) => s.sales);
  const saleItems = useStore((s) => s.saleItems);
  const customers = useStore((s) => s.customers);
  const [open, setOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<any>(null);

  return (
    <div className="px-4 md:px-8 py-6 md:py-10 max-w-5xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Vendas</h1>
          <p className="text-muted-foreground text-sm mt-1">Acompanhe seu faturamento e pedidos</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2 shrink-0 h-12 px-6 text-lg">
          <Plus className="h-5 w-5" /> Nova venda
        </Button>
      </header>

      {sales.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-muted grid place-items-center mb-4">
            <ShoppingBasket className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">Nenhuma venda registrada ainda.</p>
          <Button variant="link" onClick={() => setOpen(true)}>Começar agora</Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {sales.map((s) => {
            const customer = customers.find(c => c.id === s.customerId);
            const items = saleItems.filter(si => si.saleId === s.id);
            const date = new Date(s.createdAt);
            
            return (
              <div key={s.id} className="rounded-xl border border-border bg-card p-4 flex items-center justify-between group transition-all hover:border-brand/40">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-success/10 text-success grid place-items-center font-bold">
                    $
                  </div>
                  <div>
                    <div className="font-semibold text-lg">
                      {formatBRL(s.totalAmount)}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <span>{date.toLocaleDateString("pt-BR")} às {date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                      {customer && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                          <span className="font-medium text-foreground">{customer.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="text-right mr-4 hidden sm:block">
                    <div className="text-sm font-medium">{items.length} {items.length === 1 ? "item" : "itens"}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.paymentMethod || "Pagamento não inf."}</div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedSale(s)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Repeat className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <SaleDialog open={open} onOpenChange={setOpen} repeatSale={selectedSale} onRepeatDone={() => setSelectedSale(null)} />
    </div>
  );
}
