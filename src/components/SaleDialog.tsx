import { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore, actions, formatBRL, priceFromCostMargin } from "@/lib/store";
import { SearchBar, searchProducts } from "@/components/SearchBar";
import { Trash2, Plus, Minus, ShoppingCart, User, CreditCard, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type CartItem = {
  cartItemId: string;
  productId: string;
  variationId?: string;
  name: string;
  quantity: number;
  price: number;
};

export function SaleDialog({ open, onOpenChange, repeatSale, onRepeatDone }: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  repeatSale?: any;
  onRepeatDone?: () => void;
}) {
  const products = useStore((s) => s.products);
  const kits = useStore((s) => s.kits);
  const kitItems = useStore((s) => s.kitItems);
  const customers = useStore((s) => s.customers);
  const saleItems = useStore((s) => s.saleItems);
  
  const [q, setQ] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerId, setCustomerId] = useState<string>("");
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [newCustomerEmail, setNewCustomerEmail] = useState("");
  const [newCustomerCpf, setNewCustomerCpf] = useState("");
  const [newCustomerAddress, setNewCustomerAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("dinheiro");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle repeat sale
  useEffect(() => {
    if (repeatSale) {
      const items = saleItems.filter(si => si.saleId === repeatSale.id).map(si => {
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
      setCart(items);
      setCustomerId(repeatSale.customerId || "");
      setPaymentMethod(repeatSale.paymentMethod || "dinheiro");
      onOpenChange(true);
      onRepeatDone?.();
    }
  }, [repeatSale]);

  const filteredProducts = useMemo(() => {
    if (!q) return [];
    return searchProducts(products, q).slice(0, 5);
  }, [products, q]);

  const filteredKits = useMemo(() => {
    if (!q) return [];
    return kits.filter(k => k.name.toLowerCase().includes(q.toLowerCase())).slice(0, 3);
  }, [kits, q]);

  const total = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

  function addToCart(p: any, v?: any) {
    const price = v ? priceFromCostMargin(v.cost, v.margin) : priceFromCostMargin(p.cost, p.margin);
    const name = v ? `${p.name} — ${v.name}` : p.name;
    const variationId = v?.id;
    const cartItemId = variationId ? `${p.id}-${variationId}` : p.id;

    setCart(prev => {
      const existing = prev.find(i => i.cartItemId === cartItemId);
      if (existing) {
        return prev.map(i => i.cartItemId === cartItemId ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { cartItemId, productId: p.id, variationId, name, quantity: 1, price }];
    });
    setQ("");
  }

  function addKitToCart(k: any, items: any[]) {
    items.forEach(item => {
      const p = products.find(prod => prod.id === item.productId);
      if (p) {
        const price = priceFromCostMargin(p.cost, p.margin);
        const cartItemId = p.id;
        setCart(prev => {
          const existing = prev.find(i => i.cartItemId === cartItemId);
          if (existing) {
            return prev.map(i => i.cartItemId === cartItemId ? { ...i, quantity: i.quantity + item.quantity } : i);
          }
          return [...prev, { cartItemId, productId: p.id, name: `${p.name} (Kit ${k.name})`, quantity: item.quantity, price }];
        });
      }
    });
    setQ("");
  }

  function updateQty(id: string, delta: number) {
    setCart(prev => prev.map(i => i.cartItemId === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
  }

  function removeFromCart(id: string) {
    setCart(prev => prev.filter(i => i.cartItemId !== id));
  }

  async function handleFinish() {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    try {
      let finalCustomerId = customerId;

      if (isNewCustomer) {
        if (!newCustomerName) {
          setIsSubmitting(false);
          return toast.error("Nome do cliente é obrigatório");
        }
        const newCustomer = await actions.addCustomer({ 
          name: newCustomerName, 
          phone: newCustomerPhone || undefined,
          email: newCustomerEmail || undefined,
          cpf: newCustomerCpf || undefined,
          address: newCustomerAddress || undefined
        });
        if (newCustomer) {
          finalCustomerId = newCustomer.id;
        } else {
          setIsSubmitting(false);
          return; // Error handled in action
        }
      }

      await actions.addSale(
        { customerId: finalCustomerId || undefined, totalAmount: total, paymentMethod },
        cart.map(i => ({ productId: i.productId, variationId: i.variationId, quantity: i.quantity, unitPrice: i.price }))
      );
      setCart([]);
      setQ("");
      setCustomerId("");
      setIsNewCustomer(false);
      setNewCustomerName("");
      setNewCustomerPhone("");
      setNewCustomerEmail("");
      setNewCustomerCpf("");
      setNewCustomerAddress("");
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-brand" /> Nova venda
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Product Search */}
          <div className="relative">
            <Label className="mb-2 block">Adicionar produtos ou kits</Label>
            <SearchBar value={q} onChange={setQ} placeholder="Busque por nome, código ou kit..." />
            {q && (filteredProducts.length > 0 || filteredKits.length > 0) && (
              <div className="absolute z-20 left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 max-h-60 overflow-y-auto">
                {filteredKits.map(k => {
                  const items = kitItems.filter(ki => ki.kitId === k.id);
                  const totalValue = items.reduce((sum, item) => {
                    const p = products.find(prod => prod.id === item.productId);
                    return sum + (p ? priceFromCostMargin(p.cost, p.margin) * item.quantity : 0);
                  }, 0);
                  
                  return (
                    <button
                      key={`kit-${k.id}`}
                      onClick={() => addKitToCart(k, items)}
                      className="w-full flex items-center justify-between p-3 bg-brand/5 hover:bg-brand/10 transition-colors border-b border-border last:border-0"
                    >
                      <div className="text-left flex items-center gap-2">
                        <Package className="h-4 w-4 text-brand" />
                        <div>
                          <div className="font-medium text-brand">Kit: {k.name}</div>
                          <div className="text-xs text-muted-foreground">{items.length} itens</div>
                        </div>
                      </div>
                      <div className="font-bold text-brand">{formatBRL(totalValue)}</div>
                    </button>
                  );
                })}
                {filteredProducts.flatMap(p => {
                  if (p.variations && p.variations.length > 0) {
                    return p.variations.map(v => (
                      <button
                        key={v.id}
                        onClick={() => addToCart(p, v)}
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
                      onClick={() => addToCart(p)}
                      className="w-full flex items-center justify-between p-3 hover:bg-muted transition-colors border-b border-border last:border-0"
                    >
                      <div className="text-left">
                        <div className="font-medium">{p.name}</div>
                        {!p.isService && <div className="text-xs text-muted-foreground">{p.stock} em estoque</div>}
                      </div>
                      <div className="font-bold text-brand">{formatBRL(priceFromCostMargin(p.cost, p.margin))}</div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Cart Table */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center justify-between">
              Carrinho
              <span className="text-xs text-muted-foreground font-normal">{cart.length} itens</span>
            </h3>
            {cart.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
                O carrinho está vazio.
              </div>
            ) : (
              <div className="border border-border rounded-xl overflow-hidden bg-muted/30">
                {cart.map(item => (
                  <div key={item.cartItemId} className="flex items-center gap-4 p-3 border-b border-border last:border-0">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate text-sm">{item.name}</div>
                      <div className="text-xs text-muted-foreground">{formatBRL(item.price)} / un</div>
                    </div>
                    <div className="flex items-center gap-2 bg-background rounded-lg border border-border p-1">
                      <button 
                        onClick={() => updateQty(item.cartItemId, -1)}
                        className="h-7 w-7 rounded grid place-items-center hover:bg-muted"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center font-semibold text-sm tabular-nums">{item.quantity}</span>
                      <button 
                        onClick={() => updateQty(item.cartItemId, 1)}
                        className="h-7 w-7 rounded grid place-items-center hover:bg-muted"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="font-bold text-sm min-w-[70px] text-right">{formatBRL(item.price * item.quantity)}</div>
                    <button 
                      onClick={() => removeFromCart(item.cartItemId)}
                      className="text-muted-foreground hover:text-destructive p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <div className="bg-brand/5 p-4 flex items-center justify-between">
                  <span className="font-bold uppercase text-[10px] tracking-wider text-brand">Total da Venda</span>
                  <span className="text-xl font-black text-brand tabular-nums">{formatBRL(total)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Customer & Payment */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-muted-foreground" /> Cliente (Opcional)
              </Label>
              <select 
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                value={isNewCustomer ? "new" : customerId}
                onChange={e => {
                  if (e.target.value === "new") {
                    setIsNewCustomer(true);
                    setCustomerId("");
                  } else {
                    setIsNewCustomer(false);
                    setCustomerId(e.target.value);
                  }
                }}
              >
                <option value="">Consumidor Final</option>
                <option value="new">+ Novo Cliente</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              {isNewCustomer && (
                <div className="pt-2 space-y-3 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Nome do Cliente</Label>
                    <Input 
                      placeholder="Nome completo" 
                      value={newCustomerName} 
                      onChange={e => setNewCustomerName(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">Telefone</Label>
                      <Input 
                        placeholder="(00) 00000-0000" 
                        value={newCustomerPhone} 
                        onChange={e => setNewCustomerPhone(e.target.value)}
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">CPF</Label>
                      <Input 
                        placeholder="000.000.000-00" 
                        value={newCustomerCpf} 
                        onChange={e => setNewCustomerCpf(e.target.value)}
                        className="h-9 text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">E-mail</Label>
                    <Input 
                      placeholder="email@exemplo.com" 
                      value={newCustomerEmail} 
                      onChange={e => setNewCustomerEmail(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Endereço</Label>
                    <Input 
                      placeholder="Rua, número, bairro..." 
                      value={newCustomerAddress} 
                      onChange={e => setNewCustomerAddress(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CreditCard className="h-3.5 w-3.5 text-muted-foreground" /> Forma de Pagamento
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {["dinheiro", "pix", "cartão"].map(m => (
                  <button
                    key={m}
                    onClick={() => setPaymentMethod(m)}
                    className={cn(
                      "h-10 text-xs font-semibold uppercase rounded-md border border-border transition-all",
                      paymentMethod === m ? "bg-brand text-brand-foreground border-brand" : "hover:bg-muted"
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 pt-2 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancelar</Button>
          <Button onClick={handleFinish} disabled={cart.length === 0 || isSubmitting} className="h-12 px-8 text-lg font-bold">
            {isSubmitting ? "Finalizando..." : "Finalizar Venda"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
