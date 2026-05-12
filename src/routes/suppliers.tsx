import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useStore, actions, Supplier } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Phone, Trash2, Edit2, Search } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export const Route = createFileRoute("/suppliers")({
  component: SuppliersPage,
});

function SuppliersPage() {
  const suppliers = useStore((s) => s.suppliers);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return suppliers;
    return suppliers.filter((s) => s.name.toLowerCase().includes(q) || (s.phone || "").toLowerCase().includes(q));
  }, [suppliers, query]);

  function startEdit(s: Supplier | null) {
    setEditing(s);
    setName(s?.name ?? "");
    setPhone(s?.phone ?? "");
    setOpen(true);
  }

  async function save() {
    if (!name.trim()) return toast.error("Nome é obrigatório");
    if (editing) {
      await actions.updateSupplier(editing.id, { name, phone });
      toast.success("Fornecedor atualizado");
    } else {
      await actions.addSupplier({ name, phone });
      toast.success("Fornecedor adicionado");
    }
    setOpen(false);
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-10 max-w-4xl mx-auto">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Fornecedores</h1>
          <p className="text-muted-foreground text-sm mt-1">{suppliers.length} cadastrados</p>
        </div>
        <Button onClick={() => startEdit(null)}>
          <Plus className="h-4 w-4" /> Novo fornecedor
        </Button>
      </header>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar fornecedor por nome ou telefone..." className="pl-9 h-11" />
      </div>

      <div className="grid gap-3">
        {filtered.map((s) => (
          <div key={s.id} className="rounded-xl border border-border bg-card p-4 flex items-center justify-between">
            <div className="min-w-0">
              <h3 className="font-semibold truncate text-lg">{s.name}</h3>
              {s.phone && (
                <a
                  href={`https://wa.me/${s.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-brand-foreground flex items-center gap-1.5 hover:underline"
                >
                  <Phone className="h-3 w-3" /> {s.phone}
                </a>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => startEdit(s)}>
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => actions.deleteSupplier(s.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
            {query ? "Nenhum fornecedor encontrado." : "Nenhum fornecedor cadastrado."}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar" : "Novo"} Fornecedor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="sn">Nome</Label>
              <Input id="sn" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome da empresa ou contato" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sp">Telefone / WhatsApp</Label>
              <Input id="sp" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ex: 11999999999" />
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
