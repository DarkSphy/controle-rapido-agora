import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase as supabaseTyped } from "@/integrations/supabase/client";
const supabase: any = supabaseTyped;
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Logo } from "@/components/Logo";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, Edit, Plus, Users, Search, AlertCircle, LogOut } from "lucide-react";
import { format, differenceInDays } from "date-fns";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setIsAdmin(false); return; }
    (async () => {
      const { data, error } = await supabase.rpc("is_current_user_admin");
      if (error) {
        console.error(error);
        setIsAdmin(false);
        return;
      }
      setIsAdmin(!!data);
    })();
  }, [user, authLoading]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setSigningIn(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSigningIn(false);
    if (error) toast.error("Credenciais inválidas");
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  if (authLoading || (user && isAdmin === null)) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Carregando...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/40 px-5">
        <div className="w-full max-w-sm bg-card p-8 rounded-2xl border border-border shadow-xl">
          <div className="flex justify-center mb-6"><Logo /></div>
          <h1 className="text-xl font-bold text-center mb-6">Painel Administrativo</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label>E-mail</Label>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Senha</Label>
              <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={signingIn}>{signingIn ? "Entrando..." : "Entrar"}</Button>
          </form>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/40 px-5">
        <div className="w-full max-w-sm bg-card p-8 rounded-2xl border border-border shadow-xl text-center space-y-4">
          <div className="flex justify-center"><Logo /></div>
          <h1 className="text-xl font-bold">Acesso negado</h1>
          <p className="text-sm text-muted-foreground">Sua conta não possui permissão de administrador.</p>
          <Button variant="outline" className="w-full" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" /> Sair
          </Button>
        </div>
      </div>
    );
  }

  return <AdminDashboard onLogout={handleLogout} />;
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function loadClients() {
    setLoading(true);
    const { data, error } = await supabase.rpc("admin_get_clients");
    if (error) toast.error("Erro ao carregar clientes: " + error.message);
    else setClients(data || []);
    setLoading(false);
  }

  useEffect(() => { loadClients(); }, []);

  const filtered = clients.filter((c) =>
    (c.display_name?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (c.email?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (c.document || "").includes(search)
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg text-primary"><Users className="h-5 w-5" /></div>
          <h1 className="text-xl font-bold">Gestão de Clientes</h1>
        </div>
        <Button variant="ghost" size="sm" onClick={onLogout} className="text-muted-foreground">
          <LogOut className="h-4 w-4 mr-2" /> Sair
        </Button>
      </header>

      <main className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email ou CPF/CNPJ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <CreateClientModal onCreated={loadClients} />
        </div>

        <div className="rounded-xl border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>CPF/CNPJ</TableHead>
                <TableHead>WhatsApp</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-10">Carregando...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">Nenhum cliente encontrado.</TableCell></TableRow>
              ) : (
                filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="font-medium">{c.display_name || "Sem nome"}</div>
                      <div className="text-xs text-muted-foreground">{c.email}</div>
                    </TableCell>
                    <TableCell className="text-sm">{c.document || "—"}</TableCell>
                    <TableCell>
                      {c.whatsapp ? (
                        <a
                          href={`https://wa.me/${c.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-foreground hover:underline text-sm"
                        >
                          {c.whatsapp}
                        </a>
                      ) : "—"}
                    </TableCell>
                    <TableCell>
                      <ExpirationBadge date={c.expires_at} />
                    </TableCell>
                    <TableCell className="text-right">
                      <EditClientModal client={c} onUpdated={loadClients} />
                      <DeleteClientModal client={c} onDeleted={loadClients} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}

function ExpirationBadge({ date }: { date: string | null }) {
  if (!date) return <span className="text-xs text-muted-foreground">—</span>;
  const d = new Date(date);
  const diff = differenceInDays(d, new Date());
  if (diff < 0) {
    return <span className="inline-flex items-center gap-1 text-xs font-bold text-destructive bg-destructive/10 px-2 py-1 rounded-full"><AlertCircle className="h-3 w-3" /> Vencido</span>;
  }
  if (diff <= 5) {
    return <span className="inline-flex items-center gap-1 text-xs font-bold text-warning-foreground bg-warning/15 px-2 py-1 rounded-full"><AlertCircle className="h-3 w-3" /> Vence em {diff} dias</span>;
  }
  return <span className="text-xs text-muted-foreground">{format(d, "dd/MM/yyyy")}</span>;
}

function CreateClientModal({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [document, setDocument] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [expiresAt, setExpiresAt] = useState(format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: name } }
      });
      if (authError) throw authError;
      const userId = authData.user?.id;
      if (!userId) throw new Error("Usuário não foi criado corretamente.");
      await supabase.auth.signOut();
      const { error: rpcError } = await supabase.rpc("admin_upsert_subscription", {
        target_user_id: userId,
        p_document: document,
        p_whatsapp: whatsapp,
        p_start_date: new Date(startDate).toISOString(),
        p_expires_at: new Date(expiresAt).toISOString(),
      });
      if (rpcError) throw rpcError;
      toast.success("Cliente criado com sucesso!");
      setOpen(false);
      onCreated();
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar cliente");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2"><Plus className="h-4 w-4" /> Nova Conta</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Criar Novo Cliente</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><Label>Nome</Label><Input required value={name} onChange={e => setName(e.target.value)} /></div>
            <div className="space-y-1"><Label>CPF/CNPJ</Label><Input value={document} onChange={e => setDocument(e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><Label>E-mail (Login)</Label><Input type="email" required value={email} onChange={e => setEmail(e.target.value)} /></div>
            <div className="space-y-1"><Label>Senha Temporária</Label><Input required minLength={6} value={password} onChange={e => setPassword(e.target.value)} /></div>
          </div>
          <div className="space-y-1"><Label>WhatsApp</Label><Input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="55319..." /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><Label>Início da Assinatura</Label><Input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
            <div className="space-y-1"><Label>Data de Vencimento</Label><Input type="date" required value={expiresAt} onChange={e => setExpiresAt(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? "Salvando..." : "Criar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditClientModal({ client, onUpdated }: { client: any; onUpdated: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [document, setDocument] = useState(client.document || "");
  const [whatsapp, setWhatsapp] = useState(client.whatsapp || "");
  const [startDate, setStartDate] = useState(client.start_date ? format(new Date(client.start_date), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"));
  const [expiresAt, setExpiresAt] = useState(client.expires_at ? format(new Date(client.expires_at), "yyyy-MM-dd") : format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { error: rpcError } = await supabase.rpc("admin_upsert_subscription", {
        target_user_id: client.id,
        p_document: document,
        p_whatsapp: whatsapp,
        p_start_date: new Date(startDate).toISOString(),
        p_expires_at: new Date(expiresAt).toISOString(),
      });
      if (rpcError) throw rpcError;
      toast.success("Dados atualizados!");
      setOpen(false);
      onUpdated();
    } catch (err: any) {
      toast.error(err.message || "Erro ao atualizar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button></DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader><DialogTitle>Editar {client.display_name || client.email}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1"><Label>CPF/CNPJ</Label><Input value={document} onChange={e => setDocument(e.target.value)} /></div>
          <div className="space-y-1"><Label>WhatsApp</Label><Input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="55319..." /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><Label>Início</Label><Input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
            <div className="space-y-1"><Label>Vencimento</Label><Input type="date" required value={expiresAt} onChange={e => setExpiresAt(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteClientModal({ client, onDeleted }: { client: any; onDeleted: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      const { error } = await supabase.rpc("admin_delete_client", { target_user_id: client.id });
      if (error) throw error;
      toast.success("Cliente excluído.");
      setOpen(false);
      onDeleted();
    } catch (err: any) {
      toast.error(err.message || "Erro ao excluir");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader><DialogTitle>Excluir acesso?</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">
          Tem certeza que deseja excluir o acesso de <strong>{client.email}</strong>? Isso apagará a conta e todos os dados do cliente para sempre.
        </p>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancelar</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>{loading ? "Excluindo..." : "Sim, Excluir"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
