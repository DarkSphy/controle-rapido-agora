import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { 
  LayoutDashboard, Package, ArrowLeftRight, ShoppingBag, AlertTriangle, LogOut, 
  Truck, Tag, Box, BarChart3, DollarSign, Users, Lightbulb, ShoppingBasket, Briefcase
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

type NavItem = { to: string; label: string; icon: any; adminOnly?: boolean };
const nav: NavItem[] = [
  { to: "/dashboard", label: "Resumo", icon: LayoutDashboard },
  { to: "/vendas", label: "Vendas", icon: ShoppingBasket },
  { to: "/compras", label: "Compras", icon: Truck },
  { to: "/financeiro", label: "Financeiro", icon: DollarSign },
  { to: "/produtos", label: "Produtos", icon: Package },
  { to: "/servicos", label: "Serviços", icon: Briefcase },
  { to: "/categories", label: "Categorias", icon: Tag },
  { to: "/suppliers", label: "Fornecedores", icon: Truck },
  { to: "/clientes", label: "Clientes", icon: Users },
  { to: "/kits", label: "Kits", icon: Box },
  { to: "/reports", label: "Relatórios", icon: BarChart3, adminOnly: true },
  { to: "/insights", label: "Insights", icon: Lightbulb },
  { to: "/movimentacoes", label: "Histórico", icon: ArrowLeftRight },
  { to: "/reposicao", label: "Reposição", icon: AlertTriangle },
  { to: "/balcao", label: "Balcão", icon: ShoppingBag },
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

  // Gate: usuário logado mas SEM assinatura ativa → /checkout
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
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-sidebar">
        <div className="px-5 py-5">
          <Link to="/dashboard">
            <Logo />
          </Link>
        </div>
        <nav className="px-3 flex flex-col gap-1 flex-1">
          {nav.filter(n => !n.adminOnly || role === "admin").map((n) => {
            const active = loc.pathname === n.to;
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                  active
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                <Icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border">
          <div className="px-3 py-1 text-xs text-muted-foreground truncate">{user.email}</div>
          <div className="px-3 pb-2 text-[10px] text-brand-foreground uppercase font-bold">{role}</div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
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
        {nav.filter(n => !n.adminOnly || role === "admin").slice(0, 5).map((n) => {
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
