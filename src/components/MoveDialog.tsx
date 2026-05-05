import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Product, actions, useStore } from "@/lib/store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function MoveDialog({
  product,
  type,
  open,
  onOpenChange,
}: {
  product: Product | null;
  type: "in" | "out";
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [qty, setQty] = useState("1");
  const [variationId, setVariationId] = useState<string | undefined>();
  const [price, setPrice] = useState("");
  const [supplierId, setSupplierId] = useState<string | undefined>();
  const suppliers = useStore((s) => s.suppliers);

  useEffect(() => {
    if (open) {
      setQty("1");
      setVariationId(product?.variations[0]?.id);
    }
  }, [open, product]);

  if (!product) return null;
  const isIn = type === "in";

  function submit() {
    const n = parseInt(qty, 10);
    if (!n || n <= 0) return toast.error("Quantidade inválida");
    if (product!.variations.length > 0 && !variationId) return toast.error("Selecione uma variação");
    
    actions.move({ 
      productId: product!.id, 
      variationId, 
      quantity: n, 
      type,
      purchasePrice: price ? parseFloat(price) : undefined,
      supplierId
    });
    
    toast.success(isIn ? "Entrada registrada" : "Saída registrada");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isIn ? "Entrada" : "Saída"} — {product.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {product.variations.length > 0 && (
            <div className="space-y-2">
              <Label>Variação</Label>
              <div className="grid grid-cols-3 gap-2">
                {product.variations.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVariationId(v.id)}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-sm text-left",
                      variationId === v.id
                        ? "border-primary bg-accent"
                        : "border-border hover:border-primary/40",
                    )}
                  >
                    <div className="font-medium">{v.name}</div>
                    <div className="text-xs text-muted-foreground">{v.stock} em estoque</div>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="qty">Quantidade</Label>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="icon" onClick={() => setQty(String(Math.max(1, (parseInt(qty) || 1) - 1)))}>
                −
              </Button>
              <Input
                id="qty"
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="text-center text-lg h-12"
                autoFocus
              />
              <Button type="button" variant="outline" size="icon" onClick={() => setQty(String((parseInt(qty) || 0) + 1))}>
                +
              </Button>
            </div>
          </div>

          {isIn && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="price">Preço de compra (un)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sup">Fornecedor</Label>
                <select
                  id="sup"
                  value={supplierId ?? ""}
                  onChange={(e) => setSupplierId(e.target.value || undefined)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Selecione...</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button
            onClick={submit}
            className={cn(!isIn && "bg-destructive hover:bg-destructive/90 text-destructive-foreground")}
          >
            Confirmar {isIn ? "entrada" : "saída"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
