import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, actions, formatBRL } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Users, Phone, Trash2, Edit2, Search, ShoppingBag } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/clientes")({
  head: () => ({
    meta: [
      { title: "Clientes — ControleJá" },
      { name: "description", content: "Cadastro de clientes e histórico de compras." },
    ],
  }),
  component: ClientesPage,
});

function ClientesPage() {
  const customers = useStore((s) => s.customers);
  const sales = useStore((s) => s.sales);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [address, setAddress] = useState("");

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(q.toLowerCase()) || 
    c.phone?.includes(q)
  );

  function resetForm() {
    setName("");
    setPhone("");
    setEmail("");
    setCpf("");
    setAddress("");
    setEditing(null);
  }

  async function handleSave() {
    if (!name) return toast.error("Nome é obrigatório");
    const data = { name, phone, email, cpf, address };
    if (editing) {
      await actions.updateCustomer(editing.id, data);
      toast.success("Cliente atualizado");
    } else {
      await actions.addCustomer(data);
      toast.success("Cliente cadastrado");
    }
    setOpen(false);
    resetForm();
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-10 max-w-5xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground text-sm mt-1">Gerencie seu cadastro de clientes</p>
        </div>
        <Button onClick={() => { resetForm(); setOpen(true); }} className="gap-2 h-12 px-6">
          <Plus className="h-5 w-5" /> Novo cliente
        </Button>
      </header>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por nome ou telefone..." 
            className="pl-10 h-11"
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.length === 0 ? (
          <div className="md:col-span-2 rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
            {q ? "Nenhum cliente encontrado." : "Nenhum cliente cadastrado ainda."}
          </div>
        ) : (
          filtered.map(c => {
            const customerSales = sales.filter(s => s.customerId === c.id);
            const totalSpent = customerSales.reduce((sum, s) => sum + s.totalAmount, 0);
            
            return (
              <div key={c.id} className="rounded-2xl border border-border bg-card p-5 flex flex-col justify-between hover:border-brand/40 transition-colors group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-brand/10 text-brand grid place-items-center font-bold text-lg uppercase">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg leading-tight">{c.name}</h3>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {c.phone || "Sem telefone"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" onClick={() => {
                      setEditing(c);
                      setName(c.name);
                      setPhone(c.phone || "");
                      setEmail(c.email || "");
                      setCpf(c.cpf || "");
                      setAddress(c.address || "");
                      setOpen(true);
                    }}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => {
                      if (confirm("Excluir cliente?")) actions.deleteCustomer(c.id);
                    }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2 pt-4 border-t border-border/50">
                  <div className="bg-muted/50 rounded-xl p-3">
                    <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Compras</div>
                    <div className="font-black text-brand flex items-center gap-1.5">
                      <ShoppingBag className="h-3.5 w-3.5" /> {customerSales.length}
                    </div>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-3">
                    <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Total Gasto</div>
                    <div className="font-black text-foreground">{formatBRL(totalSpent)}</div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: João Silva" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Telefone / WhatsApp</Label>
                <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="(11) 99999-9999" />
              </div>
              <div className="space-y-2">
                <Label>CPF</Label>
                <Input value={cpf} onChange={e => setCpf(e.target.value)} placeholder="000.000.000-00" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="joao@exemplo.com" type="email" />
            </div>
            <div className="space-y-2">
              <Label>Endereço Completo</Label>
              <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="Rua, número, bairro, cidade..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>{editing ? "Salvar Alterações" : "Cadastrar Cliente"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
