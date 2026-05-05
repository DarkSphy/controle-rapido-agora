import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, actions, Category } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Edit2, Tag } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export const Route = createFileRoute("/categories")({
  component: CategoriesPage,
});

function CategoriesPage() {
  const categories = useStore((s) => s.categories);
  const products = useStore((s) => s.products);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");

  function startEdit(c: Category | null) {
    setEditing(c);
    setName(c?.name ?? "");
    setOpen(true);
  }

  async function save() {
    if (!name.trim()) return toast.error("Nome é obrigatório");
    if (editing) {
      await actions.updateCategory(editing.id, { name });
      toast.success("Categoria atualizada");
    } else {
      await actions.addCategory({ name });
      toast.success("Categoria adicionada");
    }
    setOpen(false);
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-10 max-w-3xl mx-auto">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Categorias</h1>
          <p className="text-muted-foreground text-sm mt-1">{categories.length} cadastradas</p>
        </div>
        <Button onClick={() => startEdit(null)}>
          <Plus className="h-4 w-4" /> Nova categoria
        </Button>
      </header>

      <div className="grid gap-3">
        {categories.map((c) => {
          const count = products.filter(p => p.categoryId === c.id).length;
          return (
            <div key={c.id} className="rounded-xl border border-border bg-card p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-lg bg-muted grid place-items-center flex-shrink-0">
                  <Tag className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold truncate">{c.name}</h3>
                  <p className="text-xs text-muted-foreground">{count} produtos vinculados</p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => startEdit(c)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => actions.deleteCategory(c.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          );
        })}
        {categories.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
            Nenhuma categoria cadastrada.
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar" : "Nova"} Categoria</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="cn">Nome da Categoria</Label>
              <Input id="cn" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Bebidas, Camisetas..." autoFocus />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
