import { useEffect, useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useStore, actions, ServiceOrder, ServiceOrderItem, formatBRL, priceFromCostMargin } from "@/lib/store";
import { toast } from "sonner";
import { SearchBar, searchProducts } from "@/components/SearchBar";
import { Plus, Minus, Trash2, AlertTriangle, UserPlus, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type Draft = {
  customerId: string;
  type: string;
  description: string;
  serviceValue: string;
  status: "Aberta" | "Em andamento" | "Finalizada" | "Cancelada";
};

type DraftItem = {
  cartItemId: string;
  productId: string;
  variationId?: string;
  name: string;
  quantity: number;
  price: number;
};

const empty: Draft = {
  customerId: "",
  type: "",
  description: "",
  serviceValue: "0",
  status: "Aberta",
};

export function OSDialog({
  order,
  open,
  onOpenChange,
}: {
  order: ServiceOrder | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const products = useStore((s) => s.products);
  const customers = useStore((s) => s.customers);
  const orderItems = useStore((s) => s.serviceOrderItems);

  const [d, setD] = useState<Draft>(empty);
  const [items, setItems] = useState<DraftItem[]>([]);
  const [q, setQ] = useState("");
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");

  const isFinalized = order?.saleId !== undefined;

  useEffect(() => {
    if (open) {
      if (order) {
        setD({
          customerId: order.customerId ?? "",
          type: order.type,
          description: order.description ?? "",
          serviceValue: String(order.serviceValue),
          status: order.status,
        });
        
        const currentItems = orderItems.filter(i => i.orderId === order.id).map(si => {
          const p = products.find(p => p.id === si.productId);
          const variation = p?.variations?.find(v => v.id === si.variationId);
          return {
            cartItemId: si.variationId ? `${si.productId}-${si.variationId}` : si.productId,
            productId: si.productId,
            variationId: si.variationId,
            name: variation ? `${p?.name} — ${variation.name}` : (p?.name || "Produto excluído"),
            quantity: si.quantity,
            price: si.unitPrice
          };
        });
        setItems(currentItems);
      } else {
        setD(empty);
        setItems([]);
      }
      setQ("");
      setShowNewCustomer(false);
    }
  }, [open, order, orderItems, products]);

  // Busca de produtos para adicionar peças
  const searchProds = useMemo(() => products.filter(p => !p.isService), [products]);
  const filtered = useMemo(() => searchProducts(searchProds, q), [searchProds, q]);

  function addPart(p: any, v?: any) {
    if (isFinalized) return;
    const price = v ? priceFromCostMargin(v.cost, v.margin) : priceFromCostMargin(p.cost, p.margin);
    const name = v ? `${p.name} — ${v.name}` : p.name;
    const variationId = v?.id;
    const cartItemId = variationId ? `${p.id}-${variationId}` : p.id;

    setItems(prev => {
      const existing = prev.find(i => i.cartItemId === cartItemId);
      if (existing) {
        return prev.map(i => i.cartItemId === cartItemId ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { cartItemId, productId: p.id, variationId, name, quantity: 1, price }];
    });
    setQ("");
  }

  function updateQty(id: string, delta: number) {
    if (isFinalized) return;
    setItems(prev => prev.map(i => i.cartItemId === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
  }

  function removePart(id: string) {
    if (isFinalized) return;
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
    if (!d.type.trim()) return toast.error("Informe o tipo de serviço");
    const serviceValue = parseFloat(d.serviceValue) || 0;

    const payloadItems = items.map(i => ({
      productId: i.productId,
      variationId: i.variationId,
      quantity: i.quantity,
      unitPrice: i.price
    }));

    if (order) {
      if (d.status === "Finalizada" && order.status !== "Finalizada") {
        if (!confirm("Ao finalizar, as peças serão baixadas do estoque e o valor irá para o financeiro. Deseja continuar?")) {
          return;
        }
      }
      await actions.updateServiceOrder(order.id, {
        customerId: d.customerId || undefined,
        type: d.type,
        description: d.description,
        serviceValue,
        status: d.status
      }, payloadItems);
    } else {
      await actions.addServiceOrder({
        customerId: d.customerId || undefined,
        type: d.type,
        description: d.description,
        serviceValue,
      }, payloadItems);
    }
    onOpenChange(false);
  }

  const partsTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const serviceValue = parseFloat(d.serviceValue) || 0;
  const totalAmount = partsTotal + serviceValue;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden gap-0">
        <DialogHeader className="px-6 py-4 border-b border-border bg-muted/20">
          <DialogTitle>{order ? `Ordem de Serviço #${order.id.slice(0,6)}` : "Nova Ordem de Serviço"}</DialogTitle>
          <DialogDescription>
            Preencha os detalhes do serviço prestado e as peças utilizadas.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isFinalized && (
            <div className="mb-6 p-4 rounded-xl bg-success/10 border border-success/20 text-success text-sm flex gap-3 items-start">
              <Info className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <strong className="block mb-1">Ordem de Serviço Finalizada</strong>
                O valor já foi lançado no seu financeiro e as peças já foram baixadas do estoque. Por isso, as edições estão bloqueadas.
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Cliente</Label>
                {showNewCustomer ? (
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Nome do cliente" 
                      value={newCustomerName} 
                      onChange={e => setNewCustomerName(e.target.value)} 
                      disabled={isFinalized}
                    />
                    <Button onClick={handleCreateCustomer} disabled={isFinalized}>Salvar</Button>
                    <Button variant="ghost" onClick={() => setShowNewCustomer(false)} disabled={isFinalized}>Cancelar</Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <select
                      value={d.customerId}
                      onChange={(e) => setD({ ...d, customerId: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:opacity-50"
                      disabled={isFinalized}
                    >
                      <option value="">Selecione ou deixe em branco</option>
                      {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    {!isFinalized && (
                      <Button variant="outline" size="icon" onClick={() => setShowNewCustomer(true)}>
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Tipo de Serviço</Label>
                <Input 
                  value={d.type} 
                  onChange={e => setD({ ...d, type: e.target.value })} 
                  placeholder="Ex: Manutenção, Instalação, Reparo" 
                  disabled={isFinalized}
                />
              </div>

              <div className="space-y-2">
                <Label>Descrição do problema/serviço</Label>
                <Textarea 
                  value={d.description} 
                  onChange={e => setD({ ...d, description: e.target.value })} 
                  placeholder="Descreva o que foi feito..."
                  className="min-h-[100px]"
                  disabled={isFinalized}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valor da Mão de Obra (R$)</Label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    value={d.serviceValue} 
                    onChange={e => setD({ ...d, serviceValue: e.target.value })} 
                    disabled={isFinalized}
                  />
                </div>
                
                {order && !isFinalized && (
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <select
                      value={d.status}
                      onChange={(e) => setD({ ...d, status: e.target.value as any })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    >
                      <option value="Aberta">Aberta</option>
                      <option value="Em andamento">Em andamento</option>
                      <option value="Finalizada">Finalizada (Lança Finan/Estoque)</option>
                      <option value="Cancelada">Cancelada</option>
                    </select>
                  </div>
                )}
                
                {order && isFinalized && (
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <div className="h-10 px-3 rounded-md bg-muted grid items-center text-sm font-medium">
                      Finalizada
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <Label className="block">Peças e Produtos Utilizados</Label>
              
              {!isFinalized && (
                <div className="relative">
                  <SearchBar value={q} onChange={setQ} placeholder="Buscar peça..." />
                  {filtered.length > 0 && (
                    <div className="absolute z-20 left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 max-h-60 overflow-y-auto">
                      {filtered.flatMap(p => {
                        if (p.variations && p.variations.length > 0) {
                          return p.variations.map(v => (
                            <button
                              key={v.id}
                              onClick={() => addPart(p, v)}
                              className="w-full flex items-center justify-between p-3 hover:bg-muted transition-colors border-b border-border last:border-0"
                            >
                              <div className="text-left">
                                <div className="font-medium">{p.name} — {v.name}</div>
                                <div className="text-xs text-muted-foreground">{v.stock} em estoque</div>
                              </div>
                              <div className="font-bold text-brand">{formatBRL(priceFromCostMargin(v.cost, v.margin))}</div>
                            </button>
                          ));
                        }
                        return (
                          <button
                            key={p.id}
                            onClick={() => addPart(p)}
                            className="w-full flex items-center justify-between p-3 hover:bg-muted transition-colors border-b border-border last:border-0"
                          >
                            <div className="text-left">
                              <div className="font-medium">{p.name}</div>
                              <div className="text-xs text-muted-foreground">{p.stock} em estoque</div>
                            </div>
                            <div className="font-bold text-brand">{formatBRL(priceFromCostMargin(p.cost, p.margin))}</div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {items.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center p-6 border border-dashed rounded-xl">
                  Nenhuma peça selecionada.
                </div>
              ) : (
                <div className="border border-border rounded-xl overflow-hidden bg-muted/30">
                  {items.map(item => (
                    <div key={item.cartItemId} className="flex items-center gap-3 p-3 border-b border-border last:border-0">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate text-sm">{item.name}</div>
                        <div className="text-xs text-muted-foreground">{formatBRL(item.price)} / un</div>
                      </div>
                      
                      {!isFinalized ? (
                        <div className="flex items-center gap-1 bg-background rounded-lg border border-border p-1">
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
                      ) : (
                        <div className="text-xs font-semibold px-2 py-1 bg-background border border-border rounded-md">
                          {item.quantity} un
                        </div>
                      )}

                      <div className="font-bold text-sm min-w-[70px] text-right">{formatBRL(item.price * item.quantity)}</div>
                      
                      {!isFinalized && (
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
              
              <div className="space-y-1 pt-4 border-t border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Mão de obra</span>
                  <span>{formatBRL(serviceValue)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Peças ({items.length})</span>
                  <span>{formatBRL(partsTotal)}</span>
                </div>
                <div className="flex justify-between font-black text-lg pt-2 text-brand">
                  <span>Total</span>
                  <span>{formatBRL(totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border flex-row justify-between sm:justify-between items-center bg-muted/20">
          {order && !isFinalized ? (
            <Button
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={() => {
                if (confirm("Tem certeza que deseja excluir esta OS?")) {
                  actions.deleteServiceOrder(order.id);
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
              {isFinalized ? "Fechar" : "Cancelar"}
            </Button>
            {!isFinalized && (
              <Button onClick={save}>
                {order ? "Salvar alterações" : "Criar Ordem"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
