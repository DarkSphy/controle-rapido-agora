import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { 
  LayoutDashboard, Package, ArrowLeftRight, ShoppingBag, AlertTriangle, LogOut, 
  Truck, Tag, Box, BarChart3, DollarSign, Users, Lightbulb, ShoppingBasket, Briefcase, Wrench, FileText, Settings
} from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth";
import { useSubscription } from "@/hooks/useSubscription";
import { actions } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PUBLIC_ROUTES = ["/", "/auth", "/checkout", "/checkout/return", "/admin"];

const navGroups = [
  {
    title: "Operação",
    items: [
      { to: "/dashboard", label: "Resumo", icon: LayoutDashboard },
      { to: "/vendas", label: "Vendas", icon: ShoppingBasket },
      { to: "/compras", label: "Compras", icon: Truck },
      { to: "/orcamentos", label: "Orçamentos", icon: FileText },
      { to: "/os", label: "Ordem de Serviço", icon: Wrench },
      { to: "/balcao", label: "Balcão", icon: ShoppingBag },
    ]
  },
  {
    title: "Cadastros",
    items: [
      { to: "/produtos", label: "Produtos", icon: Package },
      { to: "/servicos", label: "Serviços", icon: Briefcase },
      { to: "/categories", label: "Categorias", icon: Tag },
      { to: "/clientes", label: "Clientes", icon: Users },
      { to: "/suppliers", label: "Fornecedores", icon: Truck },
      { to: "/kits", label: "Kits", icon: Box },
    ]
  },
  {
    title: "Gestão",
    items: [
      { to: "/financeiro", label: "Financeiro", icon: DollarSign },
      { to: "/insights", label: "Insights", icon: Lightbulb },
      { to: "/historico", label: "Histórico", icon: ArrowLeftRight },
      { to: "/reposicao", label: "Reposição", icon: AlertTriangle },
      { to: "/reports", label: "Relatórios", icon: BarChart3, adminOnly: true },
      { to: "/configuracoes", label: "Configurações", icon: Settings },
    ]
  }
];

export function AppShell() {
  const loc = useLocation();
  const navigate = useNavigate();
  const { user, role, loading } = useAuth();
  const { isActive, loading: subLoading } = useSubscription();
  const isPublic = PUBLIC_ROUTES.includes(loc.pathname);

  useEffect(() => {
    if (user) actions.loadAll();
    else actions.reset();
  }, [user]);

  useEffect(() => {
    if (!loading && !user && !isPublic) navigate({ to: "/auth" });
  }, [loading, user, isPublic, navigate]);

  useEffect(() => {
    if (!loading && !subLoading && user && !isActive && !isPublic) {
      navigate({ to: "/checkout" });
    }
  }, [loading, subLoading, user, isActive, isPublic, navigate]);

  if (isPublic) return <Outlet />;

  if (loading || !user) {
    return (
      <div className="min-h-screen grid place-items-center text-muted-foreground text-sm">
        Carregando...
      </div>
    );
  }

  async function logout() {
    await supabase.auth.signOut();
    toast.success("Sessão encerrada");
    navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-sidebar overflow-y-auto scrollbar-none">
        <div className="px-6 py-8">
          <Link to="/dashboard">
            <Logo size="sm" />
          </Link>
        </div>
        
        <div className="px-3 flex-1 space-y-6">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              <h3 className="px-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">
                {group.title}
              </h3>
              <nav className="space-y-1">
                {group.items.filter(n => !n.adminOnly || role === "admin").map((n) => {
                  const active = loc.pathname === n.to;
                  const Icon = n.icon;
                  return (
                    <Link
                      key={n.to}
                      to={n.to}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 group",
                        active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-bold shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                      )}
                    >
                      <Icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", active ? "text-brand" : "text-muted-foreground/60")} />
                      {n.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        <div className="p-4 mt-auto">
          <div className="rounded-2xl bg-muted/30 p-4 border border-border/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-9 w-9 rounded-full bg-brand/20 flex items-center justify-center text-brand font-bold text-xs">
                {user.email?.[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold truncate">{user.email?.split('@')[0]}</div>
                <div className="text-[10px] text-muted-foreground truncate uppercase tracking-wider">{role}</div>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-[11px] font-bold uppercase tracking-widest rounded-lg text-destructive hover:bg-destructive/10 transition-colors border border-destructive/10"
            >
              <LogOut className="h-3 w-3" /> Sair
            </button>
          </div>
        </div>
      </aside>

      <header className="md:hidden flex items-center justify-between px-4 h-14 border-b border-border bg-card">
        <Link to="/dashboard">
          <Logo size="sm" />
        </Link>
        <button onClick={logout} className="text-muted-foreground hover:text-foreground p-2">
          <LogOut className="h-4 w-4" />
        </button>
      </header>

      <main className="flex-1 min-w-0 pb-20 md:pb-8">
        <Outlet />
      </main>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-card border-t border-border flex justify-around h-16">
        {navGroups.flatMap(g => g.items).filter(n => !n.adminOnly || role === "admin").slice(0, 5).map((n) => {
          const active = loc.pathname === n.to;
          const Icon = n.icon;
          return (
            <Link
              key={n.to}
              to={n.to}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 text-[11px]",
                active ? "text-brand" : "text-muted-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              {n.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
