import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Product, actions } from "@/lib/store";
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
    actions.move({ productId: product!.id, variationId, quantity: n, type });
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
