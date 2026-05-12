import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useStore, actions } from "@/lib/store";

export function BulkTaxDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const currentTaxRate = useStore((s) => s.taxRate);
  const currentTaxMode = useStore((s) => s.taxMode);

  const [taxRate, setTaxRate] = useState(currentTaxRate.toString());
  const [taxMode, setTaxMode] = useState<"margin" | "final">(currentTaxMode);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setTaxRate(currentTaxRate.toString());
      setTaxMode(currentTaxMode);
    }
  }, [open, currentTaxRate, currentTaxMode]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await actions.setGlobalTaxes(Number(taxRate), taxMode);
    setLoading(false);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configurar Tributos Globais</DialogTitle>
          <DialogDescription>
            Esse imposto será aplicado no preço de venda de todos os seus produtos automaticamente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-2">
          <div className="space-y-2">
            <Label>Alíquota de Imposto (%)</Label>
            <div className="relative">
              <Input
                type="number"
                step="0.01"
                min="0"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className="pl-8"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
            </div>
            <p className="text-xs text-muted-foreground">Ex: 6 para Simples Nacional (6%)</p>
          </div>

          <div className="space-y-3">
            <Label>Como o imposto deve ser calculado?</Label>
            
            <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${taxMode === "margin" ? "border-brand bg-brand/5" : "hover:bg-muted"}`}>
              <input 
                type="radio" 
                name="taxMode" 
                value="margin" 
                checked={taxMode === "margin"} 
                onChange={() => setTaxMode("margin")}
                className="mt-1"
              />
              <div>
                <div className="font-semibold text-sm">Somar à Margem de Lucro</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Ex: Custo R$ 10,00. Margem 50% + Imposto 10% = 60%.<br/>
                  Preço de venda será R$ 16,00.
                </div>
              </div>
            </label>

            <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${taxMode === "final" ? "border-brand bg-brand/5" : "hover:bg-muted"}`}>
              <input 
                type="radio" 
                name="taxMode" 
                value="final" 
                checked={taxMode === "final"} 
                onChange={() => setTaxMode("final")}
                className="mt-1"
              />
              <div>
                <div className="font-semibold text-sm">Aplicar sobre o Preço Final</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Ex: Custo R$ 10,00 com Margem 50% = R$ 15,00.<br/>
                  Aplica-se 10% sobre R$ 15,00. Preço final R$ 16,50.
                </div>
              </div>
            </label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
