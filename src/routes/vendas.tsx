import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useStore, formatBRL, actions } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, ShoppingBasket, Repeat, FileText, Trash2, ChevronDown, Search } from "lucide-react";
import { SaleDialog } from "@/components/SaleDialog";
import { generateSaleReceiptPDF } from "@/lib/saleReceipt";
import { cn } from "@/lib/utils";

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
  const products = useStore((s) => s.products);
  const [open, setOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sales;
    return sales.filter((s) => {
      const customer = customers.find((c) => c.id === s.customerId);
      if (customer?.name.toLowerCase().includes(q)) return true;
      const items = saleItems.filter((si) => si.saleId === s.id);
      return items.some((si) => {
        const p = products.find((p) => p.id === si.productId);
        return p?.name.toLowerCase().includes(q);
      });
    });
  }, [sales, saleItems, customers, products, query]);

  function downloadPDF(sale: any) {
    const customer = customers.find((c) => c.id === sale.customerId);
    const items = saleItems.filter((si) => si.saleId === sale.id).map((si) => {
      const p = products.find((p) => p.id === si.productId);
      return { name: p?.name || "Produto", quantity: si.quantity, unitPrice: si.unitPrice };
    });
    generateSaleReceiptPDF({
      saleId: sale.id,
      date: new Date(sale.createdAt),
      customerName: customer?.name,
      customerPhone: customer?.phone,
      customerEmail: customer?.email,
      paymentMethod: sale.paymentMethod,
      items,
      total: sale.totalAmount,
    });
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-10 max-w-5xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Vendas</h1>
          <p className="text-muted-foreground text-sm mt-1">Acompanhe seu faturamento e pedidos</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2 shrink-0 h-12 px-6 text-lg">
          <Plus className="h-5 w-5" /> Nova venda
        </Button>
      </header>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por cliente ou produto..."
          className="pl-9 h-11"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-muted grid place-items-center mb-4">
            <ShoppingBasket className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">{query ? "Nenhuma venda encontrada." : "Nenhuma venda registrada ainda."}</p>
          {!query && <Button variant="link" onClick={() => setOpen(true)}>Começar agora</Button>}
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((s) => {
            const customer = customers.find((c) => c.id === s.customerId);
            const items = saleItems.filter((si) => si.saleId === s.id);
            const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);
            const date = new Date(s.createdAt);
            const isOpen = expanded === s.id;

            return (
              <div key={s.id} className="rounded-xl border border-border bg-card transition-all hover:border-brand/40">
                <div className="p-4 flex items-center justify-between gap-3">
                  <button
                    className="flex items-center gap-4 flex-1 min-w-0 text-left"
                    onClick={() => setExpanded(isOpen ? null : s.id)}
                  >
                    <div className="h-10 w-10 rounded-full bg-success/10 text-success grid place-items-center font-bold shrink-0">
                      $
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-lg">{formatBRL(s.totalAmount)}</div>
                      <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span>{date.toLocaleDateString("pt-BR")} {date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                        {customer && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                            <span className="font-medium text-foreground">{customer.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </button>

                  <div className="flex items-center gap-1 shrink-0">
                    <div className="text-right mr-2 hidden sm:block">
                      <div className="text-sm font-medium">{totalQty} {totalQty === 1 ? "item" : "itens"}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.paymentMethod || "—"}</div>
                    </div>
                    <Button variant="outline" size="icon" title="Repetir venda" onClick={() => setSelectedSale(s)}>
                      <Repeat className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" title="Gerar comprovante PDF" onClick={() => downloadPDF(s)}>
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" title="Excluir venda" onClick={() => setConfirmDelete(s.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title={isOpen ? "Recolher" : "Ver detalhes"}
                      onClick={() => setExpanded(isOpen ? null : s.id)}
                    >
                      <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
                    </Button>
                  </div>
                </div>

                {isOpen && (
                  <div className="px-4 pb-4 border-t border-border pt-4 space-y-3 text-sm">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Cliente</div>
                        <div className="font-medium">{customer?.name || "Avulso"}</div>
                        {customer?.phone && <div className="text-xs text-muted-foreground">{customer.phone}</div>}
                        {customer?.email && <div className="text-xs text-muted-foreground">{customer.email}</div>}
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Pagamento</div>
                        <div className="font-medium capitalize">{s.paymentMethod || "—"}</div>
                        <div className="text-xs text-muted-foreground">Pedido #{s.id.slice(0, 8).toUpperCase()}</div>
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Itens</div>
                      <div className="rounded-lg border border-border divide-y divide-border">
                        {items.map((si) => {
                          const p = products.find((p) => p.id === si.productId);
                          return (
                            <div key={si.id} className="flex items-center justify-between p-2.5">
                              <div className="min-w-0">
                                <div className="font-medium truncate">{p?.name || "Produto excluído"}</div>
                                <div className="text-xs text-muted-foreground">{si.quantity} × {formatBRL(si.unitPrice)}</div>
                              </div>
                              <div className="font-semibold tabular-nums">{formatBRL(si.quantity * si.unitPrice)}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-border">
                      <span className="font-semibold">Total</span>
                      <span className="text-lg font-bold text-brand">{formatBRL(s.totalAmount)}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <SaleDialog open={open} onOpenChange={setOpen} repeatSale={selectedSale} onRepeatDone={() => setSelectedSale(null)} />

      {confirmDelete && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => setConfirmDelete(null)}>
          <div className="bg-card border border-border rounded-xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-2">Excluir venda?</h3>
            <p className="text-sm text-muted-foreground mb-4">Esta ação não pode ser desfeita. O estoque não será restaurado automaticamente.</p>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setConfirmDelete(null)}>Cancelar</Button>
              <Button variant="destructive" onClick={async () => { await actions.deleteSale(confirmDelete); setConfirmDelete(null); }}>
                Excluir
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
