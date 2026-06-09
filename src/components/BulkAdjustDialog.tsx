import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { actions, useStore } from "@/lib/store";
import { toast } from "sonner";
import { Search } from "lucide-react";

export function BulkAdjustDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [categoryId, setCategoryId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [supplierSearch, setSupplierSearch] = useState("");
  const [percentage, setPercentage] = useState("");
  
  const categories = useStore((s) => s.categories);
  const suppliers = useStore((s) => s.suppliers);

  const filteredSuppliers = suppliers.filter(s => s.name.toLowerCase().includes(supplierSearch.toLowerCase()));

  async function submit() {
    const p = parseFloat(percentage);
    if (isNaN(p)) return toast.error("Porcentagem inválida");
    
    await actions.bulkAdjustPrices(categoryId || null, supplierId || null, p);
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
              <option value="">Todas as categorias</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2 relative">
            <Label>Filtrar por Fornecedor</Label>
            {!supplierId ? (
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  className="pl-9" 
                  placeholder="Buscar fornecedor..." 
                  value={supplierSearch} 
                  onChange={e => setSupplierSearch(e.target.value)}
                />
                {supplierSearch && (
                  <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-40 overflow-auto">
                    {filteredSuppliers.map(s => (
                      <button 
                        key={s.id} 
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
                        onClick={() => {
                          setSupplierId(s.id);
                          setSupplierSearch("");
                        }}
                      >
                        {s.name}
                      </button>
                    ))}
                    {filteredSuppliers.length === 0 && (
                      <div className="px-3 py-2 text-sm text-muted-foreground">Nenhum fornecedor encontrado</div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between p-2 border border-border rounded-md bg-muted/50">
                <span className="text-sm font-medium">{suppliers.find(s => s.id === supplierId)?.name}</span>
                <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => setSupplierId("")}>Limpar</Button>
              </div>
            )}
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
