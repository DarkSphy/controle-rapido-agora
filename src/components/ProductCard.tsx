import { Product, productEffectiveStock, stockStatus, formatProductPrice } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Pencil } from "lucide-react";

const statusStyles: Record<string, string> = {
  ok: "bg-success/10 text-success border-success/20",
  low: "bg-warning/15 text-warning-foreground border-warning/30",
  empty: "bg-destructive/10 text-destructive border-destructive/20",
};
const statusLabel: Record<string, string> = {
  ok: "Em estoque",
  low: "Estoque baixo",
  empty: "Sem estoque",
};

export function ProductCard({
  product,
  onIn,
  onOut,
  onEdit,
}: {
  product: Product;
  onIn: () => void;
  onOut: () => void;
  onEdit: () => void;
}) {
  const stock = productEffectiveStock(product);
  const status = stockStatus(stock, product.minStock);
  const priceLabel = formatProductPrice(product);

  return (
    <div className="group rounded-xl border border-border bg-card p-4 flex flex-col gap-3 hover:shadow-md hover:border-primary/30 transition-all">
      <div className="flex items-start gap-3">
        {product.image ? (
          <img src={product.image} alt={product.name} className="h-14 w-14 rounded-lg object-cover" />
        ) : (
          <div className="h-14 w-14 rounded-lg bg-muted grid place-items-center text-muted-foreground font-semibold">
            {product.name.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold truncate">{product.name}</h3>
            <button onClick={onEdit} className="text-muted-foreground hover:text-foreground p-1 -m-1">
              <Pencil className="h-4 w-4" />
            </button>
          </div>
          <div className="text-sm text-muted-foreground mt-0.5">{priceLabel}</div>
          {product.variations.length > 0 && (
            <div className="text-xs text-muted-foreground mt-1">
              {product.variations.length} variações
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold tabular-nums">{stock}</div>
          <div className="text-xs text-muted-foreground">em estoque</div>
        </div>
        <span
          className={cn(
            "text-xs font-medium px-2.5 py-1 rounded-full border",
            statusStyles[status],
          )}
        >
          {statusLabel[status]}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button size="sm" variant="secondary" onClick={onOut}>
          <Minus className="h-4 w-4" /> Saída
        </Button>
        <Button size="sm" onClick={onIn}>
          <Plus className="h-4 w-4" /> Entrada
        </Button>
      </div>
    </div>
  );
}
