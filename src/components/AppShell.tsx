import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, Package, ArrowLeftRight, ShoppingBag, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Resumo", icon: LayoutDashboard },
  { to: "/produtos", label: "Produtos", icon: Package },
  { to: "/movimentacoes", label: "Movimentações", icon: ArrowLeftRight },
  { to: "/reposicao", label: "Reposição", icon: AlertTriangle },
  { to: "/balcao", label: "Balcão", icon: ShoppingBag },
] as const;

export function AppShell() {
  const loc = useLocation();
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-border bg-sidebar">
        <div className="px-6 py-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground grid place-items-center font-bold">C</div>
            <div>
              <div className="font-semibold leading-none">ControleJá</div>
              <div className="text-xs text-muted-foreground mt-1">Estoque simples</div>
            </div>
          </Link>
        </div>
        <nav className="px-3 flex flex-col gap-1">
          {nav.map((n) => {
            const active = loc.pathname === n.to;
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
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
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden flex items-center justify-between px-4 h-14 border-b border-border bg-card">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground grid place-items-center font-bold text-sm">C</div>
          <span className="font-semibold">ControleJá</span>
        </Link>
      </header>

      <main className="flex-1 min-w-0 pb-20 md:pb-8">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-card border-t border-border flex justify-around h-16">
        {nav.map((n) => {
          const active = loc.pathname === n.to;
          const Icon = n.icon;
          return (
            <Link
              key={n.to}
              to={n.to}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 text-[11px]",
                active ? "text-primary" : "text-muted-foreground",
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
