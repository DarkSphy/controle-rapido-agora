import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { actions, useStore } from "@/lib/store";
import { toast } from "sonner";

export function BulkAdjustDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [categoryId, setCategoryId] = useState("");
  const [percentage, setPercentage] = useState("");
  const categories = useStore((s) => s.categories);

  async function submit() {
    const p = parseFloat(percentage);
    if (isNaN(p)) return toast.error("Porcentagem inválida");
    
    await actions.bulkAdjustPrices(categoryId || null, p);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajuste de preço em massa</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Aumente ou reduza a margem de lucro de vários produtos ao mesmo tempo.
          </p>
          <div className="space-y-2">
            <Label>Filtrar por Categoria</Label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Todos os produtos</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Ajuste percentual (%)</Label>
            <Input
              type="number"
              placeholder="Ex: 10 ou -5"
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
            />
            <p className="text-[10px] text-muted-foreground uppercase">
              Use valores positivos para aumentar e negativos para reduzir.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={submit}>Aplicar ajuste</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
