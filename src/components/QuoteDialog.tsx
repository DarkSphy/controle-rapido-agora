import { useEffect, useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useStore, actions, Quote, QuoteItem, formatBRL, priceFromCostMargin } from "@/lib/store";
import { toast } from "sonner";
import { SearchBar, searchProducts } from "@/components/SearchBar";
import { Plus, Minus, Trash2, UserPlus, Info, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Draft = {
  customerId: string;
  status: "Pendente" | "Aprovado" | "Recusado" | "Expirado";
  laborValue: string;
  discount: string;
  validityDate: string;
  notes: string;
  paymentConditions: string;
};

type DraftItem = {
  cartItemId: string; // unique for UI
  productId?: string;
  variationId?: string;
  name: string;
  quantity: number;
  price: string; // storing as string for easy editing
  isService: boolean;
};

const empty: Draft = {
  customerId: "",
  status: "Pendente",
  laborValue: "0",
  discount: "0",
  validityDate: "",
  notes: "",
  paymentConditions: "",
};

export function QuoteDialog({
  quote,
  open,
  onOpenChange,
}: {
  quote: Quote | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const products = useStore((s) => s.products);
  const customers = useStore((s) => s.customers);
  const quoteItems = useStore((s) => s.quoteItems);

  const [d, setD] = useState<Draft>(empty);
  const [items, setItems] = useState<DraftItem[]>([]);
  const [q, setQ] = useState("");
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");

  const [manualName, setManualName] = useState("");
  const [manualPrice, setManualPrice] = useState("");

  const isApproved = quote?.status === "Aprovado";

  useEffect(() => {
    if (open) {
      if (quote) {
        setD({
          customerId: quote.customerId ?? "",
          status: quote.status,
          discount: String(quote.discount),
          validityDate: quote.validityDate ?? "",
          notes: quote.notes ?? "",
          paymentConditions: quote.paymentConditions ?? "",
        });
        
        const currentItems = quoteItems.filter(i => i.quoteId === quote.id).map(qi => {
          let name = qi.manualName || "Item excluído";
          if (qi.productId) {
            const p = products.find(p => p.id === qi.productId);
            if (p) {
              name = p.name;
              if (qi.variationId) {
                const v = p.variations.find(v => v.id === qi.variationId);
                if (v) name = `${p.name} — ${v.name}`;
              }
            }
          }
          return {
            cartItemId: qi.id,
            productId: qi.productId,
            variationId: qi.variationId,
            name,
            quantity: qi.quantity,
            price: String(qi.unitPrice),
            isService: qi.isService,
          };
        });
        setItems(currentItems);
      } else {
        setD(empty);
        setItems([]);
      }
      setQ("");
      setShowNewCustomer(false);
      setManualName("");
      setManualPrice("");
    }
  }, [open, quote, quoteItems, products]);

  const filtered = useMemo(() => searchProducts(products, q), [products, q]);

  function addProductOrService(p: any, v?: any) {
    if (isApproved) return;
    const price = v ? priceFromCostMargin(v.cost, v.margin) : priceFromCostMargin(p.cost, p.margin);
    const name = v ? `${p.name} — ${v.name}` : p.name;
    const variationId = v?.id;
    const cartItemId = variationId ? `${p.id}-${variationId}` : p.id;

    setItems(prev => {
      const existing = prev.find(i => i.cartItemId === cartItemId);
      if (existing) {
        return prev.map(i => i.cartItemId === cartItemId ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { cartItemId, productId: p.id, variationId, name, quantity: 1, price: String(price), isService: p.isService }];
    });
    setQ("");
  }

  function addManualItem() {
    if (isApproved) return;
    if (!manualName.trim()) return toast.error("Informe o nome do item manual");
    const p = parseFloat(manualPrice) || 0;
    
    setItems(prev => [...prev, { 
      cartItemId: `manual-${Date.now()}`, 
      name: manualName, 
      quantity: 1, 
      price: String(p), 
      isService: false 
    }]);
    
    setManualName("");
    setManualPrice("");
  }

  function updateQty(id: string, delta: number) {
    if (isApproved) return;
    setItems(prev => prev.map(i => i.cartItemId === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
  }

  function updatePrice(id: string, newPrice: string) {
    if (isApproved) return;
    setItems(prev => prev.map(i => i.cartItemId === id ? { ...i, price: newPrice } : i));
  }

  function removePart(id: string) {
    if (isApproved) return;
    setItems(prev => prev.filter(i => i.cartItemId !== id));
  }

  async function handleCreateCustomer() {
    if (!newCustomerName.trim()) return toast.error("Informe o nome do cliente");
    const customer = await actions.addCustomer({ name: newCustomerName });
    if (customer) {
      setD(prev => ({ ...prev, customerId: customer.id }));
      setShowNewCustomer(false);
      setNewCustomerName("");
      toast.success("Cliente criado e selecionado!");
    }
  }

  async function save() {
    const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.price) || 0) * item.quantity, 0);
    const labor = parseFloat(d.laborValue) || 0;
    const discount = parseFloat(d.discount) || 0;
    const total = subtotal + labor - discount;

    const payloadItems = items.map(i => ({
      productId: i.productId,
      variationId: i.variationId,
      manualName: !i.productId ? i.name : undefined,
      quantity: i.quantity,
      unitPrice: parseFloat(i.price) || 0,
      isService: i.isService
    }));

    if (quote) {
      await actions.updateQuote(quote.id, {
        customerId: d.customerId || undefined,
        status: d.status,
        laborValue: labor,
        subtotal,
        discount,
        total,
        validityDate: d.validityDate,
        notes: d.notes,
        paymentConditions: d.paymentConditions,
      }, payloadItems);
    } else {
      await actions.addQuote({
        customerId: d.customerId || undefined,
        status: d.status,
        laborValue: labor,
        subtotal,
        discount,
        total,
        validityDate: d.validityDate,
        notes: d.notes,
        paymentConditions: d.paymentConditions,
      }, payloadItems);
    }
    onOpenChange(false);
  }

  const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.price) || 0) * item.quantity, 0);
  const labor = parseFloat(d.laborValue) || 0;
  const discount = parseFloat(d.discount) || 0;
  const totalAmount = subtotal + labor - discount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] flex flex-col p-0 overflow-hidden gap-0">
        <DialogHeader className="px-6 py-4 border-b border-border bg-muted/20">
          <DialogTitle>{quote ? `Orçamento #${quote.id.slice(0,6)}` : "Novo Orçamento"}</DialogTitle>
          <DialogDescription>
            Crie um orçamento personalizado sem alterar seu estoque ou financeiro.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isApproved && (
            <div className="mb-6 p-4 rounded-xl bg-success/10 border border-success/20 text-success text-sm flex gap-3 items-start">
              <Info className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <strong className="block mb-1">Orçamento Aprovado</strong>
                Este orçamento já foi convertido em Venda ou OS. A edição está desabilitada para manter o histórico íntegro.
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Esquerda: Informações Gerais */}
            <div className="lg:col-span-5 space-y-4">
              <div className="space-y-2">
                <Label>Cliente</Label>
                {showNewCustomer ? (
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Nome do cliente" 
                      value={newCustomerName} 
                      onChange={e => setNewCustomerName(e.target.value)} 
                      disabled={isApproved}
                    />
                    <Button onClick={handleCreateCustomer} disabled={isApproved}>Salvar</Button>
                    <Button variant="ghost" onClick={() => setShowNewCustomer(false)} disabled={isApproved}>Cancelar</Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <select
                      value={d.customerId}
                      onChange={(e) => setD({ ...d, customerId: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:opacity-50"
                      disabled={isApproved}
                    >
                      <option value="">Selecione ou deixe em branco</option>
                      {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    {!isApproved && (
                      <Button variant="outline" size="icon" onClick={() => setShowNewCustomer(true)}>
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Validade (Opcional)</Label>
                  <Input 
                    type="date"
                    value={d.validityDate} 
                    onChange={e => setD({ ...d, validityDate: e.target.value })} 
                    disabled={isApproved}
                  />
                </div>
                
                {quote && !isApproved && (
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <select
                      value={d.status}
                      onChange={(e) => setD({ ...d, status: e.target.value as any })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    >
                      <option value="Pendente">Pendente</option>
                      <option value="Recusado">Recusado</option>
                      <option value="Expirado">Expirado</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Condições de Pagamento</Label>
                <Input 
                  value={d.paymentConditions} 
                  onChange={e => setD({ ...d, paymentConditions: e.target.value })} 
                  placeholder="Ex: 50% entrada, 50% na entrega" 
                  disabled={isApproved}
                />
              </div>

              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea 
                  value={d.notes} 
                  onChange={e => setD({ ...d, notes: e.target.value })} 
                  placeholder="Observações que sairão no PDF..."
                  className="min-h-[100px]"
                  disabled={isApproved}
                />
              </div>
            </div>

            {/* Direita: Itens e Totais */}
            <div className="lg:col-span-7 space-y-4 flex flex-col">
              <Label className="block">Itens do Orçamento</Label>
              
              {!isApproved && (
                <div className="space-y-2">
                  <div className="relative">
                    <SearchBar value={q} onChange={setQ} placeholder="Buscar produto ou serviço do sistema..." />
                    {q && filtered.length > 0 && (
                      <div className="absolute z-20 left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 max-h-60 overflow-y-auto">
                        {filtered.flatMap(p => {
                          if (p.variations && p.variations.length > 0) {
                            return p.variations.map(v => (
                              <button
                                key={v.id}
                                onClick={() => addProductOrService(p, v)}
                                className="w-full flex items-center justify-between p-3 hover:bg-muted transition-colors border-b border-border last:border-0"
                              >
                                <div className="text-left">
                                  <div className="font-medium">{p.name} — {v.name}</div>
                                  <div className="text-xs text-muted-foreground">{p.isService ? "Serviço" : `${v.stock} em estoque`}</div>
                                </div>
                                <div className="font-bold text-brand">{formatBRL(priceFromCostMargin(v.cost, v.margin))}</div>
                              </button>
                            ));
                          }
                          return (
                            <button
                              key={p.id}
                              onClick={() => addProductOrService(p)}
                              className="w-full flex items-center justify-between p-3 hover:bg-muted transition-colors border-b border-border last:border-0"
                            >
                              <div className="text-left">
                                <div className="font-medium">{p.name}</div>
                                <div className="text-xs text-muted-foreground">{p.isService ? "Serviço" : `${p.stock} em estoque`}</div>
                              </div>
                              <div className="font-bold text-brand">{formatBRL(priceFromCostMargin(p.cost, p.margin))}</div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 pt-2 items-center">
                    <span className="text-xs font-semibold uppercase text-muted-foreground">Ou adicione manual:</span>
                    <Input 
                      placeholder="Descrição" 
                      className="h-8 text-sm flex-1" 
                      value={manualName} 
                      onChange={e => setManualName(e.target.value)} 
                    />
                    <Input 
                      placeholder="Valor" 
                      type="number" 
                      className="h-8 text-sm w-24" 
                      value={manualPrice} 
                      onChange={e => setManualPrice(e.target.value)} 
                    />
                    <Button size="sm" variant="secondary" className="h-8 px-2" onClick={addManualItem}>
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {items.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center p-6 border border-dashed rounded-xl flex-1 flex items-center justify-center">
                  Nenhum item adicionado ao orçamento.
                </div>
              ) : (
                <div className="border border-border rounded-xl overflow-hidden bg-muted/30 flex-1 max-h-[300px] overflow-y-auto">
                  {items.map(item => (
                    <div key={item.cartItemId} className="flex flex-wrap sm:flex-nowrap items-center gap-3 p-3 border-b border-border last:border-0">
                      <div className="flex-1 min-w-[120px]">
                        <div className="font-medium text-sm">{item.name}</div>
                        <div className="text-xs text-muted-foreground">{item.isService ? "Serviço" : (item.productId ? "Produto" : "Manual")}</div>
                      </div>
                      
                      {!isApproved ? (
                        <>
                          <div className="w-24">
                            <Input 
                              type="number" 
                              className="h-7 text-xs" 
                              value={item.price} 
                              onChange={(e) => updatePrice(item.cartItemId, e.target.value)}
                              step="0.01"
                            />
                          </div>
                          <div className="flex items-center gap-1 bg-background rounded-lg border border-border p-0.5">
                            <button 
                              onClick={() => updateQty(item.cartItemId, -1)}
                              className="h-6 w-6 rounded flex items-center justify-center hover:bg-muted"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-6 text-center font-semibold text-xs tabular-nums">{item.quantity}</span>
                            <button 
                              onClick={() => updateQty(item.cartItemId, 1)}
                              className="h-6 w-6 rounded flex items-center justify-center hover:bg-muted"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-xs text-muted-foreground">{formatBRL(parseFloat(item.price))} / un</div>
                          <div className="text-xs font-semibold px-2 py-1 bg-background border border-border rounded-md">
                            {item.quantity} un
                          </div>
                        </>
                      )}

                      <div className="font-bold text-sm min-w-[70px] text-right">
                        {formatBRL((parseFloat(item.price) || 0) * item.quantity)}
                      </div>
                      
                      {!isApproved && (
                        <button 
                          onClick={() => removePart(item.cartItemId)}
                          className="text-muted-foreground hover:text-destructive p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              <div className="space-y-2 pt-4 border-t border-border mt-auto">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatBRL(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground font-semibold">Mão de Obra (R$)</span>
                  {!isApproved ? (
                    <Input 
                      type="number" 
                      className="w-24 h-7 text-xs text-right font-semibold" 
                      value={d.laborValue} 
                      onChange={(e) => setD({ ...d, laborValue: e.target.value })}
                    />
                  ) : (
                    <span>{formatBRL(labor)}</span>
                  )}
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Desconto (R$)</span>
                  {!isApproved ? (
                    <Input 
                      type="number" 
                      className="w-24 h-7 text-xs text-right text-destructive" 
                      value={d.discount} 
                      onChange={(e) => setD({ ...d, discount: e.target.value })}
                    />
                  ) : (
                    <span className="text-destructive">-{formatBRL(discount)}</span>
                  )}
                </div>
                <div className="flex justify-between font-black text-xl pt-2 text-brand border-t border-border mt-2">
                  <span>Total do Orçamento</span>
                  <span>{formatBRL(totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border flex-row justify-between sm:justify-between items-center bg-muted/20">
          {quote && !isApproved ? (
            <Button
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={() => {
                if (confirm("Tem certeza que deseja excluir este orçamento?")) {
                  actions.deleteQuote(quote.id);
                  onOpenChange(false);
                }
              }}
            >
              Excluir
            </Button>
          ) : (
            <span />
          )}
          
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              {isApproved ? "Fechar" : "Cancelar"}
            </Button>
            {!isApproved && (
              <Button onClick={save}>
                {quote ? "Salvar alterações" : "Criar Orçamento"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
