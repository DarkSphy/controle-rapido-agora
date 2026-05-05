import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore, actions, formatBRL } from "@/lib/store";
import { SearchBar, searchProducts } from "@/components/SearchBar";
import { Trash2, Plus, Minus, Truck, Package, Info } from "lucide-react";

type PurchaseItem = {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
};

export function PurchaseDialog({ open, onOpenChange }: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) {
  const products = useStore((s) => s.products);
  const suppliers = useStore((s) => s.suppliers);
  
  const [q, setQ] = useState("");
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [supplierId, setSupplierId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filtered = useMemo(() => {
    if (!q) return [];
    return searchProducts(products, q).slice(0, 5);
  }, [products, q]);

  const total = useMemo(() => items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0), [items]);

  function addItem(p: any) {
    setItems(prev => {
      const existing = prev.find(i => i.productId === p.id);
      if (existing) {
        return prev.map(i => i.productId === p.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { productId: p.id, name: p.name, quantity: 1, unitPrice: p.cost }];
    });
    setQ("");
  }

  function updateItem(id: string, patch: Partial<PurchaseItem>) {
    setItems(prev => prev.map(i => i.productId === id ? { ...i, ...patch } : i));
  }

  function removeItem(id: string) {
    setItems(prev => prev.filter(i => i.productId !== id));
  }

  async function handleSave() {
    if (items.length === 0) return;
    setIsSubmitting(true);
    try {
      await actions.addPurchase(
        { supplierId: supplierId || undefined, totalAmount: total },
        items.map(i => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice }))
      );
      setItems([]);
      setQ("");
      setSupplierId("");
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-brand" /> Nova compra de estoque
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-2">
            <Label>Fornecedor</Label>
            <select 
              className="w-full h-11 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              value={supplierId}
              onChange={e => setSupplierId(e.target.value)}
            >
              <option value="">Fornecedor Avulso / Não cadastrado</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Label className="mb-2 block">Adicionar produtos à compra</Label>
            <SearchBar value={q} onChange={setQ} placeholder="Busque produtos para dar entrada..." />
            {filtered.length > 0 && (
              <div className="absolute z-20 left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-xl overflow-hidden">
                {filtered.map(p => (
                  <button
                    key={p.id}
                    onClick={() => addItem(p)}
                    className="w-full flex items-center justify-between p-3 hover:bg-muted transition-colors border-b border-border last:border-0"
                  >
                    <div className="text-left">
                      <div className="font-medium">{p.name}</div>
                      <div className="text-[10px] text-muted-foreground uppercase">Custo atual: {formatBRL(p.cost)}</div>
                    </div>
                    <Plus className="h-4 w-4 text-brand" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Package className="h-4 w-4" /> Itens da compra
            </h3>
            {items.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
                Adicione produtos para registrar a compra.
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-12 px-4 text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">
                  <div className="col-span-5">Produto</div>
                  <div className="col-span-3 text-center">Quantidade</div>
                  <div className="col-span-3 text-right">Valor Unit.</div>
                  <div className="col-span-1"></div>
                </div>
                {items.map(item => (
                  <div key={item.productId} className="grid grid-cols-12 gap-2 items-center p-3 rounded-xl border border-border bg-muted/20">
                    <div className="col-span-5 min-w-0">
                      <div className="font-bold truncate text-sm">{item.name}</div>
                    </div>
                    <div className="col-span-3 flex justify-center">
                      <div className="flex items-center gap-2 bg-background rounded-lg border border-border p-1">
                        <button onClick={() => updateItem(item.productId, { quantity: Math.max(1, item.quantity - 1) })} className="h-7 w-7 rounded grid place-items-center hover:bg-muted"><Minus className="h-3 w-3" /></button>
                        <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                        <button onClick={() => updateItem(item.productId, { quantity: item.quantity + 1 })} className="h-7 w-7 rounded grid place-items-center hover:bg-muted"><Plus className="h-3 w-3" /></button>
                      </div>
                    </div>
                    <div className="col-span-3">
                      <Input 
                        type="number"
                        className="text-right font-bold h-9"
                        value={item.unitPrice}
                        onChange={e => updateItem(item.productId, { unitPrice: Number(e.target.value) })}
                      />
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button onClick={() => removeItem(item.productId)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                ))}
                
                <div className="bg-brand text-brand-foreground rounded-xl p-5 flex items-center justify-between shadow-lg">
                  <div>
                    <div className="text-[10px] uppercase font-bold tracking-widest opacity-80">Total da Compra</div>
                    <div className="text-2xl font-black tabular-nums">{formatBRL(total)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-bold tracking-widest opacity-80">{items.length} itens</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-xl bg-warning/10 p-4 border border-warning/20 flex gap-3 items-start">
            <Info className="h-5 w-5 text-warning-foreground shrink-0 mt-0.5" />
            <p className="text-xs text-warning-foreground leading-relaxed">
              <strong>Nota:</strong> Ao salvar, o estoque dos produtos será aumentado e o custo base do produto será atualizado para o valor unitário informado nesta compra.
            </p>
          </div>
        </div>

        <DialogFooter className="p-6 pt-2 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancelar</Button>
          <Button onClick={handleSave} disabled={items.length === 0 || isSubmitting} className="h-12 px-8 text-lg font-bold">
            {isSubmitting ? "Registrando..." : "Registrar Compra"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
