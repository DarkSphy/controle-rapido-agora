import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Edit2, Wrench, Search, Trash2, Printer, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore, actions, ServiceOrder, formatBRL } from "@/lib/store";
import { OSDialog } from "@/components/OSDialog";
import { cn } from "@/lib/utils";
import { generateOSPDF } from "@/lib/osReceipt";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export const Route = createFileRoute("/os")({
  head: () => ({
    meta: [
      { title: "Ordens de Serviço — ControleJá" },
      { name: "description", content: "Gerencie suas ordens de serviço." },
    ],
  }),
  component: OSPage,
});

function OSPage() {
  const serviceOrders = useStore((s) => s.serviceOrders);
  const customers = useStore((s) => s.customers);
  const items = useStore((s) => s.serviceOrderItems);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<ServiceOrder | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!q) return serviceOrders;
    const lower = q.toLowerCase();
    return serviceOrders.filter(o => {
      const customer = customers.find(c => c.id === o.customerId)?.name.toLowerCase() || "";
      return o.type.toLowerCase().includes(lower) || 
             customer.includes(lower) || 
             o.id.toLowerCase().includes(lower);
    });
  }, [serviceOrders, q, customers]);

  function getStatusColor(status: string) {
    switch (status) {
      case "Aberta": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "Em andamento": return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "Finalizada": return "bg-success/10 text-success border-success/20";
      case "Cancelada": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-muted text-muted-foreground border-border";
    }
  }

  const products = useStore((s) => s.products);
  const bs = useStore((s) => s.businessSettings);

  async function handlePrint(o: ServiceOrder) {
    const customer = customers.find((c) => c.id === o.customerId);
    const myItems = items.filter(i => i.orderId === o.id).map(item => {
      let name = "Item";
      if (item.productId) {
        const p = products.find(p => p.id === item.productId);
        if (p) {
          name = p.name;
          if (item.variationId) {
            const v = p.variations?.find(v => v.id === item.variationId);
            if (v) name = `${p.name} — ${v.name}`;
          }
        }
      }
      return {
        name,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      };
    });

    const partsTotal = myItems.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);

    try {
      await generateOSPDF({
        osId: o.id,
        date: new Date(o.createdAt),
        customerName: customer?.name,
        customerPhone: customer?.phone,
        customerEmail: customer?.email,
        type: o.type,
        description: o.description,
        status: o.status,
        items: myItems,
        serviceValue: o.serviceValue,
        total: partsTotal + o.serviceValue,
        businessName: bs?.name,
        businessPhone: bs?.phone,
        businessEmail: bs?.email,
        businessAddress: bs?.address,
        businessLogoUrl: bs?.logoUrl,
      });
    } catch (e: any) {
      console.error(e);
      alert("Erro ao gerar PDF: " + (e?.message || e));
    }
  }

  const [finalizingOS, setFinalizingOS] = useState<ServiceOrder | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("Dinheiro");

  function handleApprove(o: ServiceOrder) {
    setFinalizingOS(o);
    setPaymentMethod("Dinheiro");
  }

  function confirmFinalize() {
    if (finalizingOS) {
      actions.updateServiceOrder(finalizingOS.id, { status: "Finalizada", paymentMethod });
      setFinalizingOS(null);
    }
  }

  function handleDelete(id: string) {
    if (confirm("Excluir esta ordem de serviço definitivamente?")) {
      actions.deleteServiceOrder(id);
    }
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-10 max-w-6xl mx-auto">
      <header className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Ordens de Serviço</h1>
          <p className="text-muted-foreground text-sm mt-1">{serviceOrders.length} ordens cadastradas</p>
        </div>
        <Button onClick={() => { setEditing(null); setEditOpen(true); }}>
          <Plus className="h-4 w-4" /> Nova OS
        </Button>
      </header>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          value={q} 
          onChange={e => setQ(e.target.value)} 
          placeholder="Buscar por cliente, tipo ou número da OS..." 
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <div className="mx-auto h-12 w-12 bg-muted rounded-full grid place-items-center mb-4 text-muted-foreground">
            <Wrench className="h-6 w-6" />
          </div>
          <p className="text-muted-foreground font-medium mb-4">Nenhuma ordem de serviço encontrada.</p>
          <Button onClick={() => { setEditing(null); setEditOpen(true); }}>
            <Plus className="h-4 w-4" /> Criar primeira OS
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((o) => {
            const customer = customers.find((c) => c.id === o.customerId);
            const myItems = items.filter(i => i.orderId === o.id);
            const partsTotal = myItems.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
            const totalAmount = partsTotal + o.serviceValue;
            
            return (
              <div key={o.id} className="rounded-xl border border-border bg-card p-4 transition-all hover:border-brand/40 group flex flex-col">
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                      #{o.id.slice(0, 6)} • {new Date(o.createdAt).toLocaleDateString("pt-BR")}
                    </div>
                    <h3 className="font-semibold text-lg truncate" title={o.type}>{o.type}</h3>
                    <div className="text-sm text-muted-foreground truncate">{customer?.name || "Sem cliente vinculado"}</div>
                  </div>
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-brand bg-muted/50" onClick={() => handlePrint(o)} title="Imprimir PDF">
                      <Printer className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-brand bg-muted/50" onClick={() => { setEditing(o); setEditOpen(true); }} title="Editar OS">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    {o.status !== "Finalizada" && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-success bg-muted/50" onClick={() => handleApprove(o)} title="Finalizar OS">
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive bg-muted/50" onClick={() => handleDelete(o.id)} title="Excluir OS">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="mt-auto pt-4 border-t border-border flex justify-between items-end">
                  <div className={cn("text-xs font-semibold px-2.5 py-1 rounded-full border", getStatusColor(o.status))}>
                    {o.status}
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-foreground tabular-nums leading-none">
                      {formatBRL(totalAmount)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <OSDialog order={editing} open={editOpen} onOpenChange={setEditOpen} />
      
      <Dialog open={!!finalizingOS} onOpenChange={(o) => !o && setFinalizingOS(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finalizar Ordem de Serviço</DialogTitle>
            <DialogDescription>
              Isso dará baixa no estoque das peças e lançará o valor total no seu financeiro.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Forma de Pagamento</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              >
                <option value="Dinheiro">Dinheiro</option>
                <option value="PIX">PIX</option>
                <option value="Cartão de Crédito">Cartão de Crédito</option>
                <option value="Cartão de Débito">Cartão de Débito</option>
                <option value="Transferência">Transferência</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFinalizingOS(null)}>Cancelar</Button>
            <Button onClick={confirmFinalize}>Confirmar e Finalizar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
