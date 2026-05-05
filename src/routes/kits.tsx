import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, actions, Kit, KitItem, Product, formatBRL, priceFromCostMargin } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Edit2, Package, Search } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export const Route = createFileRoute("/kits")({
  component: KitsPage,
});

function KitsPage() {
  const kits = useStore((s) => s.kits);
  const kitItems = useStore((s) => s.kitItems);
  const products = useStore((s) => s.products);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Kit | null>(null);
  const [name, setName] = useState("");
  const [selectedItems, setSelectedItems] = useState<KitItem[]>([]);
  const [q, setQ] = useState("");

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(q.toLowerCase())).slice(0, 5);

  function startEdit(k: Kit | null) {
    setEditing(k);
    setName(k?.name ?? "");
    setSelectedItems(k ? kitItems.filter(ki => ki.kitId === k.id) : []);
    setOpen(true);
  }

  function addItem(p: Product) {
    if (selectedItems.find(i => i.productId === p.id)) return toast.error("Produto já adicionado");
    setSelectedItems([...selectedItems, { kitId: editing?.id || "", productId: p.id, quantity: 1 }]);
    setQ("");
  }

  function removeItem(productId: string) {
    setSelectedItems(selectedItems.filter(i => i.productId !== productId));
  }

  function updateQty(productId: string, qty: number) {
    setSelectedItems(selectedItems.map(i => i.productId === productId ? { ...i, quantity: Math.max(1, qty) } : i));
  }

  async function save() {
    if (!name.trim()) return toast.error("Nome do kit é obrigatório");
    if (selectedItems.length === 0) return toast.error("Adicione pelo menos um produto ao kit");
    
    if (editing) {
      await actions.updateKit(editing.id, name, selectedItems);
      toast.success("Kit atualizado");
    } else {
      await actions.addKit(name, selectedItems);
      toast.success("Kit criado");
    }
    setOpen(false);
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-10 max-w-4xl mx-auto">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Kits e Combos</h1>
          <p className="text-muted-foreground text-sm mt-1">{kits.length} kits cadastrados</p>
        </div>
        <Button onClick={() => startEdit(null)}>
          <Plus className="h-4 w-4" /> Novo kit
        </Button>
      </header>

      <div className="grid gap-3">
        {kits.map((k) => {
          const items = kitItems.filter(ki => ki.kitId === k.id);
          const totalValue = items.reduce((sum, item) => {
            const p = products.find(prod => prod.id === item.productId);
            return sum + (p ? priceFromCostMargin(p.cost, p.margin) * item.quantity : 0);
          }, 0);

          return (
            <div key={k.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-brand-foreground" />
                  <h3 className="font-bold text-lg">{k.name}</h3>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => startEdit(k)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => actions.deleteKit(k.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
              <div className="space-y-1">
                {items.map(item => {
                  const p = products.find(prod => prod.id === item.productId);
                  return (
                    <div key={item.productId} className="text-sm flex justify-between text-muted-foreground">
                      <span>{item.quantity}x {p?.name ?? "Produto removido"}</span>
                      <span>{p ? formatBRL(priceFromCostMargin(p.cost, p.margin) * item.quantity) : ""}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                <span className="text-sm font-medium">Valor total dos itens:</span>
                <span className="font-bold text-lg text-primary">{formatBRL(totalValue)}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-4" 
                onClick={() => {
                  if (confirm(`Registrar saída de 1 unidade do kit "${k.name}"?`)) {
                    actions.move({ productId: k.id, quantity: 1, type: "out", isKit: true });
                    toast.success("Saída do kit registrada!");
                  }
                }}
              >
                Registrar saída (Venda Kit)
              </Button>
            </div>
          );
        })}
        {kits.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
            Nenhum kit cadastrado. Crie um para agrupar produtos.
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar" : "Novo"} Kit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="kn">Nome do Kit</Label>
              <Input id="kn" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Combo Churrasco" />
            </div>
            
            <div className="space-y-2">
              <Label>Adicionar produtos</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  className="pl-9" 
                  placeholder="Buscar produto..." 
                  value={q} 
                  onChange={e => setQ(e.target.value)}
                />
              </div>
              {q && (
                <div className="mt-2 border border-border rounded-lg overflow-hidden bg-muted/50">
                  {filteredProducts.map(p => (
                    <button 
                      key={p.id} 
                      className="w-full px-4 py-2 text-left text-sm hover:bg-accent border-b border-border last:border-0"
                      onClick={() => addItem(p)}
                    >
                      {p.name} — {formatBRL(priceFromCostMargin(p.cost, p.margin))}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Produtos no Kit</Label>
              <div className="space-y-2">
                {selectedItems.map(item => {
                  const p = products.find(prod => prod.id === item.productId);
                  return (
                    <div key={item.productId} className="flex items-center gap-3 bg-muted p-2 rounded-lg">
                      <div className="flex-1 text-sm font-medium">{p?.name}</div>
                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQty(item.productId, item.quantity - 1)}>−</Button>
                        <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQty(item.productId, item.quantity + 1)}>+</Button>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeItem(item.productId)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  );
                })}
                {selectedItems.length === 0 && <p className="text-xs text-muted-foreground italic">Nenhum produto adicionado.</p>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save}>Salvar Kit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
