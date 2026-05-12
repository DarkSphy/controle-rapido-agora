import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Product, actions, formatBRL, priceFromCostMargin, useStore } from "@/lib/store";
import { toast } from "sonner";
import { Share2 } from "lucide-react";

type Draft = {
  name: string;
  cost: string;
  margin: string;
  categoryId?: string;
};

const empty: Draft = {
  name: "",
  cost: "0",
  margin: "50",
  categoryId: "",
};

export function ServiceDialog({
  service,
  open,
  onOpenChange,
}: {
  service: Product | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [d, setD] = useState<Draft>(empty);
  const categories = useStore(s => s.categories);

  useEffect(() => {
    if (open) {
      if (service) {
        setD({
          name: service.name,
          cost: String(service.cost),
          margin: String(service.margin),
          categoryId: service.categoryId ?? "",
        });
      } else {
        setD(empty);
      }
    }
  }, [open, service]);

  function save() {
    if (!d.name.trim()) return toast.error("Informe o nome do serviço");
    const cost = parseFloat(d.cost) || 0;
    const margin = parseFloat(d.margin) || 0;
    const payload = {
      name: d.name.trim(),
      cost,
      margin,
      stock: 0,
      minStock: 0,
      categoryId: d.categoryId || undefined,
      isService: true,
      variations: [],
    };
    if (service) {
      actions.updateProduct(service.id, payload);
      toast.success("Serviço atualizado");
    } else {
      actions.addProduct(payload);
      toast.success("Serviço cadastrado");
    }
    onOpenChange(false);
  }

  function share() {
    if (!service) return;
    const text = `*Serviço: ${service.name}*\nValor: ${formatBRL(priceFromCostMargin(service.cost, service.margin))}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  const cost = parseFloat(d.cost) || 0;
  const margin = parseFloat(d.margin) || 0;
  const price = priceFromCostMargin(cost, margin);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="flex-row items-center justify-between space-y-0 pb-2">
          <DialogTitle>{service ? "Editar serviço" : "Novo serviço"}</DialogTitle>
          {service && (
            <Button variant="ghost" size="icon" onClick={share}>
              <Share2 className="h-4 w-4" />
            </Button>
          )}
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="n">Nome do Serviço</Label>
            <Input id="n" value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} placeholder="Ex: Mão de obra de instalação" autoFocus />
          </div>

          <div className="space-y-2">
            <Label>Categoria</Label>
            <select
              value={d.categoryId}
              onChange={(e) => setD({ ...d, categoryId: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            >
              <option value="">Sem categoria</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
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
              <Label>Valor final</Label>
              <div className="h-9 px-3 rounded-md bg-muted grid items-center text-sm font-medium tabular-nums text-brand">
                {formatBRL(price)}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between mt-4">
          {service ? (
            <Button
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={() => {
                actions.deleteProduct(service.id);
                toast.success("Serviço excluído");
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
