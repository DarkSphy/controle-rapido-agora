import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useRef } from "react";
import { Plus, Edit2, Search, FileText, Send, CheckCircle2, Clock, XCircle, Printer, ArrowRight, Wrench, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore, actions, Quote, formatBRL } from "@/lib/store";
import { generateQuotePDF } from "@/lib/quoteReceipt";
import { QuoteDialog } from "@/components/QuoteDialog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/orcamentos")({
  head: () => ({
    meta: [
      { title: "Orçamentos — ControleJá" },
      { name: "description", content: "Crie e gerencie orçamentos para seus clientes." },
    ],
  }),
  component: OrcamentosPage,
});

function OrcamentosPage() {
  const quotes = useStore((s) => s.quotes);
  const customers = useStore((s) => s.customers);
  const quoteItems = useStore((s) => s.quoteItems);
  const products = useStore((s) => s.products);

  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Quote | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const bs = useStore((s) => s.businessSettings);

  const filtered = useMemo(() => {
    if (!q) return quotes;
    const lower = q.toLowerCase();
    return quotes.filter(o => {
      const customer = customers.find(c => c.id === o.customerId)?.name.toLowerCase() || "";
      return o.status.toLowerCase().includes(lower) || 
             customer.includes(lower) || 
             o.id.toLowerCase().includes(lower);
    });
  }, [quotes, q, customers]);

  const stats = useMemo(() => {
    return {
      total: quotes.length,
      pendentes: quotes.filter(q => q.status === "Pendente").length,
      aprovados: quotes.filter(q => q.status === "Aprovado").length,
      recusados: quotes.filter(q => q.status === "Recusado").length,
      valorAprovado: quotes.filter(q => q.status === "Aprovado").reduce((sum, q) => sum + q.total, 0)
    };
  }, [quotes]);

  function getStatusColor(status: string) {
    switch (status) {
      case "Pendente": return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "Aprovado": return "bg-success/10 text-success border-success/20";
      case "Recusado": return "bg-destructive/10 text-destructive border-destructive/20";
      case "Expirado": return "bg-muted text-muted-foreground border-border";
      default: return "bg-muted text-muted-foreground border-border";
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case "Pendente": return <Clock className="h-4 w-4" />;
      case "Aprovado": return <CheckCircle2 className="h-4 w-4" />;
      case "Recusado": return <XCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  }

  async function handlePrint(quote: Quote) {
    const customer = customers.find(c => c.id === quote.customerId);
    const items = quoteItems.filter(i => i.quoteId === quote.id).map(item => {
      let name = item.manualName || "Item";
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
        isService: item.isService,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      };
    });

    try {
      await generateQuotePDF({
        quoteId: quote.id,
        date: new Date(quote.createdAt),
        validityDate: quote.validityDate,
        customerName: customer?.name,
        customerPhone: customer?.phone,
        customerEmail: customer?.email,
        paymentConditions: quote.paymentConditions,
        notes: quote.notes,
        items,
        subtotal: quote.subtotal,
        laborValue: quote.laborValue || 0,
        discount: quote.discount,
        total: quote.total,
        businessName: bs?.name,
        businessPhone: bs?.phone,
        businessEmail: bs?.email,
        businessAddress: bs?.address,
        businessLogoUrl: bs?.logoUrl,
      });
    } catch (e: any) {
      console.error("Erro ao gerar PDF do orçamento:", e);
      alert("Erro ao gerar PDF: " + (e?.message || e));
    }
  }

  function handleWhatsApp(quote: Quote) {
    const customer = customers.find(c => c.id === quote.customerId);
    const phone = customer?.phone?.replace(/\D/g, '');
    
    let msg = `Olá${customer ? ` ${customer.name}` : ''}!\nSegue o detalhamento do seu orçamento:\n\n`;
    msg += `*Orçamento #${quote.id.slice(0,6)}*\n`;
    msg += `Emissão: ${new Date(quote.createdAt).toLocaleDateString("pt-BR")}\n`;
    if (quote.validityDate) msg += `Validade: ${new Date(quote.validityDate).toLocaleDateString("pt-BR")}\n`;
    
    msg += `\n*Itens do Orçamento:*\n`;
    const items = quoteItems.filter(i => i.quoteId === quote.id);
    items.forEach(item => {
      let name = item.manualName || "Item";
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
      msg += `- ${item.quantity}x ${name} (${formatBRL(item.unitPrice)})\n`;
    });

    msg += `\n*Subtotal:* ${formatBRL(quote.subtotal)}\n`;
    if ((quote.laborValue || 0) > 0) msg += `*Mão de Obra:* ${formatBRL(quote.laborValue || 0)}\n`;
    if (quote.discount > 0) msg += `*Desconto:* -${formatBRL(quote.discount)}\n`;
    msg += `*Total:* ${formatBRL(quote.total)}\n`;

    if (quote.paymentConditions) msg += `\n*Condições de Pagamento:*\n${quote.paymentConditions}\n`;
    if (quote.notes) msg += `\n*Observações:*\n${quote.notes}\n`;
    
    msg += `\nQualquer dúvida, estamos à disposição!`;
    
    const url = phone 
      ? `https://wa.me/55${phone}?text=${encodeURIComponent(msg)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    
    // Create an anchor element to bypass popup blockers in sandboxes
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function handleConvertSale(quote: Quote) {
    if (confirm("Isto criará uma venda no financeiro e dará baixa nos produtos do estoque. Deseja continuar?")) {
      actions.convertQuoteToSale(quote.id);
    }
  }

  function handleConvertOS(quote: Quote) {
    if (confirm("Isto enviará o orçamento para uma Ordem de Serviço aberta. Deseja continuar?")) {
      actions.convertQuoteToOS(quote.id);
    }
  }

  return (
    <>
      <div className="px-4 md:px-8 py-6 md:py-10 max-w-6xl mx-auto print:hidden">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Orçamentos</h1>
            <p className="text-muted-foreground text-sm mt-1">Crie e gerencie as propostas para seus clientes</p>
          </div>
          <Button onClick={() => { setEditing(null); setEditOpen(true); }} className="w-full sm:w-auto">
            <Plus className="h-4 w-4" /> Novo Orçamento
          </Button>
        </header>

        {/* Resumo Rápido */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-center">
            <div className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1">Total Criados</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-700 rounded-xl p-4 flex flex-col justify-center">
            <div className="text-amber-600/80 text-xs font-semibold uppercase tracking-wider mb-1">Pendentes</div>
            <div className="text-2xl font-bold">{stats.pendentes}</div>
          </div>
          <div className="bg-success/10 border border-success/20 text-success rounded-xl p-4 flex flex-col justify-center">
            <div className="text-success/80 text-xs font-semibold uppercase tracking-wider mb-1">Aprovados</div>
            <div className="text-2xl font-bold">{stats.aprovados}</div>
          </div>
          <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-4 flex flex-col justify-center">
            <div className="text-destructive/80 text-xs font-semibold uppercase tracking-wider mb-1">Recusados</div>
            <div className="text-2xl font-bold">{stats.recusados}</div>
          </div>
          <div className="bg-brand/10 border border-brand/20 text-brand rounded-xl p-4 flex flex-col justify-center col-span-2 md:col-span-1">
            <div className="text-brand/80 text-xs font-semibold uppercase tracking-wider mb-1">Valor Aprovado</div>
            <div className="text-2xl font-bold tabular-nums">{formatBRL(stats.valorAprovado)}</div>
          </div>
        </div>

        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            value={q} 
            onChange={e => setQ(e.target.value)} 
            placeholder="Buscar por cliente, status ou número..." 
            className="pl-9"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center">
            <div className="mx-auto h-12 w-12 bg-muted rounded-full grid place-items-center mb-4 text-muted-foreground">
              <FileText className="h-6 w-6" />
            </div>
            <p className="text-muted-foreground font-medium mb-4">Nenhum orçamento encontrado.</p>
            <Button onClick={() => { setEditing(null); setEditOpen(true); }}>
              <Plus className="h-4 w-4" /> Criar primeiro orçamento
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.map((o) => {
              const customer = customers.find((c) => c.id === o.customerId);
              
              return (
                <div key={o.id} className="rounded-xl border border-border bg-card p-4 transition-all hover:border-brand/40 group flex flex-col">
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          #{o.id.slice(0, 6)} • {new Date(o.createdAt).toLocaleDateString("pt-BR")}
                        </div>
                        {o.validityDate && (
                          <div className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                            Válido até: {new Date(o.validityDate).toLocaleDateString("pt-BR")}
                          </div>
                        )}
                      </div>
                      <h3 className="font-semibold text-lg truncate">{customer?.name || "Cliente não informado"}</h3>
                    </div>
                    <div className={cn("text-xs font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1.5 shrink-0", getStatusColor(o.status))}>
                      {getStatusIcon(o.status)} {o.status}
                    </div>
                  </div>

                  <div className="flex items-baseline gap-2 mb-4">
                    <div className="text-2xl font-bold text-foreground tabular-nums leading-none">
                      {formatBRL(o.total)}
                    </div>
                    {o.discount > 0 && (
                      <div className="text-xs text-muted-foreground line-through">
                        {formatBRL(o.subtotal)}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-border flex flex-wrap gap-2 justify-between">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => { setEditing(o); setEditOpen(true); }}>
                        <Edit2 className="h-4 w-4 mr-2" /> Editar
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handlePrint(o)}>
                        <Printer className="h-4 w-4 mr-2" /> PDF
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleWhatsApp(o)} className="text-green-600 border-green-600/20 hover:bg-green-50">
                        <Send className="h-4 w-4 mr-2" /> WhatsApp
                      </Button>
                    </div>

                    {o.status !== "Recusado" && (
                      <div className="flex gap-2 ml-auto">
                        <Button size="sm" onClick={() => handleConvertSale(o)}>
                          <ArrowRight className="h-4 w-4 mr-2" /> P/ Venda
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => handleConvertOS(o)}>
                          <Wrench className="h-4 w-4 mr-2" /> P/ OS
                        </Button>
                      </div>
                    )}
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 ml-auto"
                      onClick={() => {
                        if (confirm("Tem certeza que deseja excluir este orçamento?")) {
                          actions.deleteQuote(o.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <QuoteDialog quote={editing} open={editOpen} onOpenChange={setEditOpen} />
      </div>


    </>
  );
}
