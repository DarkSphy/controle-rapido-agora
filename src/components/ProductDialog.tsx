import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Product, Variation, actions, formatBRL, priceFromCostMargin } from "@/lib/store";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

type Draft = {
  name: string;
  image?: string;
  cost: string;
  margin: string;
  stock: string;
  minStock: string;
  variations: (Omit<Variation, "id"> & { id?: string })[];
};

const empty: Draft = {
  name: "",
  cost: "",
  margin: "50",
  stock: "0",
  minStock: "0",
  variations: [],
};

export function ProductDialog({
  product,
  open,
  onOpenChange,
}: {
  product: Product | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [d, setD] = useState<Draft>(empty);

  useEffect(() => {
    if (open) {
      if (product) {
        setD({
          name: product.name,
          image: product.image,
          cost: String(product.cost),
          margin: String(product.margin),
          stock: String(product.stock),
          minStock: String(product.minStock),
          variations: product.variations,
        });
      } else {
        setD(empty);
      }
    }
  }, [open, product]);

  function setVar(idx: number, patch: Partial<Variation>) {
    setD((prev) => ({
      ...prev,
      variations: prev.variations.map((v, i) => (i === idx ? { ...v, ...patch } : v)),
    }));
  }
  function addVar() {
    setD((p) => ({
      ...p,
      variations: [...p.variations, { name: "", stock: 0, cost: parseFloat(p.cost) || 0, margin: parseFloat(p.margin) || 0 }],
    }));
  }
  function removeVar(i: number) {
    setD((p) => ({ ...p, variations: p.variations.filter((_, idx) => idx !== i) }));
  }

  function save() {
    if (!d.name.trim()) return toast.error("Informe o nome");
    const cost = parseFloat(d.cost) || 0;
    const margin = parseFloat(d.margin) || 0;
    const payload = {
      name: d.name.trim(),
      image: d.image,
      cost,
      margin,
      stock: parseInt(d.stock) || 0,
      minStock: parseInt(d.minStock) || 0,
      variations: d.variations.map((v) => ({
        id: v.id ?? Math.random().toString(36).slice(2, 10),
        name: v.name,
        stock: Number(v.stock) || 0,
        cost: Number(v.cost) || 0,
        margin: Number(v.margin) || 0,
      })),
    };
    if (product) {
      actions.updateProduct(product.id, payload);
      toast.success("Produto atualizado");
    } else {
      actions.addProduct(payload);
      toast.success("Produto cadastrado");
    }
    onOpenChange(false);
  }

  function onImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setD((p) => ({ ...p, image: r.result as string }));
    r.readAsDataURL(f);
  }

  const cost = parseFloat(d.cost) || 0;
  const margin = parseFloat(d.margin) || 0;
  const price = priceFromCostMargin(cost, margin);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Editar produto" : "Novo produto"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-3 items-start">
            <label className="h-16 w-16 rounded-lg border border-dashed border-border grid place-items-center cursor-pointer overflow-hidden bg-muted">
              {d.image ? (
                <img src={d.image} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs text-muted-foreground">Foto</span>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={onImage} />
            </label>
            <div className="flex-1 space-y-2">
              <Label htmlFor="n">Nome</Label>
              <Input id="n" value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} placeholder="Ex: Camiseta básica" autoFocus />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Custo (R$)</Label>
              <Input type="number" step="0.01" value={d.cost} onChange={(e) => setD({ ...d, cost: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Margem %</Label>
              <Input type="number" step="1" value={d.margin} onChange={(e) => setD({ ...d, margin: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Preço</Label>
              <div className="h-9 px-3 rounded-md bg-muted grid items-center text-sm font-medium tabular-nums">
                {formatBRL(price)}
              </div>
            </div>
          </div>

          {d.variations.length === 0 && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Estoque atual</Label>
                <Input type="number" value={d.stock} onChange={(e) => setD({ ...d, stock: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Estoque mínimo</Label>
                <Input type="number" value={d.minStock} onChange={(e) => setD({ ...d, minStock: e.target.value })} />
              </div>
            </div>
          )}

          {d.variations.length > 0 && (
            <div className="space-y-2">
              <Label>Estoque mínimo (do produto)</Label>
              <Input type="number" value={d.minStock} onChange={(e) => setD({ ...d, minStock: e.target.value })} />
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Variações</Label>
              <Button type="button" variant="ghost" size="sm" onClick={addVar}>
                <Plus className="h-4 w-4" /> Adicionar
              </Button>
            </div>
            {d.variations.length === 0 && (
              <p className="text-xs text-muted-foreground">Sem variações. Use o estoque do produto acima.</p>
            )}
            <div className="space-y-2">
              {d.variations.map((v, i) => (
                <div key={i} className="grid grid-cols-[1fr_70px_70px_70px_auto] gap-2 items-end">
                  <div>
                    <Label className="text-xs">Nome</Label>
                    <Input value={v.name} onChange={(e) => setVar(i, { name: e.target.value })} placeholder="P / Azul" />
                  </div>
                  <div>
                    <Label className="text-xs">Estoque</Label>
                    <Input type="number" value={v.stock} onChange={(e) => setVar(i, { stock: Number(e.target.value) })} />
                  </div>
                  <div>
                    <Label className="text-xs">Custo</Label>
                    <Input type="number" step="0.01" value={v.cost} onChange={(e) => setVar(i, { cost: Number(e.target.value) })} />
                  </div>
                  <div>
                    <Label className="text-xs">Margem%</Label>
                    <Input type="number" value={v.margin} onChange={(e) => setVar(i, { margin: Number(e.target.value) })} />
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeVar(i)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter className="flex-row justify-between sm:justify-between">
          {product ? (
            <Button
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={() => {
                actions.deleteProduct(product.id);
                toast.success("Produto excluído");
                onOpenChange(false);
              }}
            >
              Excluir
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={save}>Salvar</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
