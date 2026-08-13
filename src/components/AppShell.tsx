import { 
  Compass, Receipt, ShoppingBag, FileSpreadsheet, Sliders, MonitorSmartphone, Globe,
  PackageSearch, Layers3, FolderTree, UsersRound, Building2, Boxes,
  Wallet, Sparkles, History, RefreshCw, BarChart4, SlidersHorizontal, LogOut, Menu, Activity, FolderKanban, AreaChart, Bot, ChevronRight, Download, Bell
} from "lucide-react";
import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth";
import { useSubscription } from "@/hooks/useSubscription";
import { actions } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { InstallPWA } from "@/components/InstallPWA";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ThemeToggle";

const PUBLIC_ROUTES = ["/", "/auth", "/checkout", "/checkout/return", "/admin", "/esqueci-senha", "/reset-password"];

const navGroups = [
  {
    title: "OperaÃ§Ã£o",
    icon: Activity,
    badgeColor: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    items: [
      { to: "/dashboard", label: "Resumo", icon: Compass },
      { to: "/vendas", label: "Vendas", icon: Receipt },
      { to: "/compras", label: "Compras", icon: ShoppingBag },
      { to: "/orcamentos", label: "OrÃ§amentos", icon: FileSpreadsheet },
      { to: "/os", label: "Ordem de ServiÃ§o", icon: Sliders },
      { to: "/balcao", label: "BalcÃ£o", icon: MonitorSmartphone },
      { to: "/catalogo", label: "CatÃ¡logo", icon: Globe },
    ]
  },
  {
    title: "Cadastros",
    icon: FolderKanban,
    badgeColor: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    items: [
      { to: "/produtos", label: "Produtos", icon: PackageSearch },
      { to: "/servicos", label: "ServiÃ§os", icon: Layers3 },
      { to: "/categories", label: "Categorias", icon: FolderTree },
      { to: "/clientes", label: "Clientes", icon: UsersRound },
      { to: "/suppliers", label: "Fornecedores", icon: Building2 },
      { to: "/kits", label: "Kits", icon: Boxes },
    ]
  },
  {
    title: "GestÃ£o & MÃ©tricas",
    icon: AreaChart,
    badgeColor: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    items: [
      { to: "/financeiro", label: "Financeiro", icon: Wallet },
      { to: "/insights", label: "Insights", icon: Sparkles },
      { to: "/historico", label: "HistÃ³rico", icon: History },
      { to: "/reposicao", label: "ReposiÃ§Ã£o", icon: RefreshCw },
      { to: "/reports", label: "RelatÃ³rios", icon: BarChart4, adminOnly: true },
      { to: "/configuracoes", label: "ConfiguraÃ§Ãµes", icon: SlidersHorizontal },
    ]
  }
];

export function AppShell() {
  const loc = useLocation();
  const navigate = useNavigate();
  const { user, role, loading } = useAuth();
  const { isActive, loading: subLoading } = useSubscription();
  const isPublic = PUBLIC_ROUTES.includes(loc.pathname) || loc.pathname.startsWith("/c/");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number | null>(null);

  useEffect(() => {
    const currentGroupIndex = navGroups.findIndex(g => 
      g.items.some(i => loc.pathname.startsWith(i.to))
    );
    if (currentGroupIndex !== -1) {
      setSelectedGroupIndex(currentGroupIndex);
    }
  }, [loc.pathname]);

  const activeGroup = navGroups[selectedGroupIndex ?? 0];

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [loc.pathname]);

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
      {/* REVOLUTIONARY SIDEBAR */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-sidebar overflow-y-auto scrollbar-none transition-colors duration-300">
        <div className="px-6 py-6 border-b border-border/60">
          <Link to="/dashboard" className="flex items-center gap-2">
            <Logo size="sm" />
          </Link>
        </div>
        
        <div className="px-3.5 py-6 flex-1 space-y-6">
          <div className="space-y-2">
            {/* SECTION HEADER BADGE & LINE DIVIDER */}
            <div className="flex items-center gap-3 px-3 pb-3 mb-1 border-b border-border/40">
              <activeGroup.icon className={cn("h-4 w-4", activeGroup.badgeColor.split(' ')[0])} />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                {activeGroup.title}
              </span>
            </div>
            
            <nav className="space-y-0.5">
              {activeGroup.items.filter(n => !n.adminOnly || role === "admin").map((n) => {
                const active = loc.pathname === n.to;
                const Icon = n.icon;
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                      active
                        ? "bg-brand text-white font-semibold shadow-md shadow-brand/20 dark:shadow-none"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                    )}
                  >
                    <Icon strokeWidth={active ? 2 : 1.5} className={cn("h-4 w-4 shrink-0 transition-transform group-hover:scale-105", active ? "text-white" : "text-muted-foreground")} />
                    <span className="flex-1 truncate">{n.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* ASSISTANT CHAT TRIGGER */}
        <div className="px-4 mt-auto mb-4">
          <div className="rounded-xl bg-brand/5 border border-brand/10 p-4 space-y-3 shadow-sm text-center">
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-brand opacity-80">Precisa de ajuda?</div>
            <button className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-brand hover:text-brand/80 transition-colors">
              Falar com o Suporte <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* NOTION PROFILE CARD */}
        <div className="p-4 border-t border-border/60">
          <div className="rounded-xl bg-card border border-border p-3 space-y-3 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-brand/15 text-brand flex items-center justify-center font-extrabold text-xs shrink-0 border border-brand/20">
                {user.email?.[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-foreground truncate">{user.email?.split('@')[0]}</div>
                <div className="text-[10px] text-muted-foreground truncate uppercase tracking-wider font-semibold">{role}</div>
              </div>
            </div>
            <div className="pt-2 border-t border-border/50 space-y-1.5">
              <InstallPWA />
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-[11px] font-bold rounded-lg text-destructive hover:bg-destructive/10 transition-colors border border-destructive/20"
              >
                <LogOut className="h-3.5 w-3.5" /> Encerra Sessão
              </button>
            </div>
          </div>
        </div>
      </aside>

        <header className="md:hidden flex items-center justify-between px-4 h-16 border-b border-border bg-card">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <button className="text-muted-foreground hover:text-foreground p-2">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 flex flex-col w-72 border-r-0 bg-sidebar">
              <SheetTitle className="sr-only">Menu de NavegaÃƒÂ§ÃƒÂ£o</SheetTitle>
              {/* Copiar estrutura do sidebar desktop aqui caso precise depois, mas vou usar navGroups em baixo */}
            </SheetContent>
          </Sheet>
          <Link to="/dashboard" className="absolute left-1/2 -translate-x-1/2">
          <Logo size="sm" />
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <InstallPWA />
          <button onClick={logout} className="text-muted-foreground hover:text-foreground p-2">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col min-w-0 bg-[#f8f9fc] dark:bg-background">
        {/* DESKTOP TOP BAR */}
        <header className="hidden md:flex items-center justify-between px-8 h-[72px] border-b border-border/40 bg-white/50 dark:bg-card/50 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-3">
             <div className="flex items-center bg-muted/40 p-1 rounded-lg border border-border/50 shadow-inner">
               {navGroups.map((group, idx) => {
                 const isGrpActive = selectedGroupIndex === idx || (selectedGroupIndex === null && idx === 0);
                 return (
                   <button
                     key={idx}
                     onClick={() => setSelectedGroupIndex(idx)}
                     className={cn(
                       "flex items-center gap-2 px-4 py-1.5 text-sm font-bold rounded-md transition-all duration-200",
                       isGrpActive 
                         ? "bg-background shadow-sm text-foreground ring-1 ring-border/50" 
                         : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                     )}
                   >
                     <group.icon className={cn("h-4 w-4", isGrpActive ? group.badgeColor.split(' ')[0] : "opacity-70")} />
                     {group.title}
                   </button>
                 );
               })}
             </div>
          </div>
          <div className="flex items-center gap-5">
            <button className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-brand transition-colors bg-white dark:bg-card border border-border px-4 py-1.5 rounded-full shadow-sm">
              <Download className="h-4 w-4" /> Exportar
            </button>
            <div className="relative">
              <Bell className="h-5 w-5 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white dark:border-background flex items-center justify-center">
                <span className="sr-only">NotificaÃƒÂ§ÃƒÂµes</span>
              </div>
            </div>
            <ThemeToggle />
            <div className="h-6 w-px bg-border mx-2" />
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Sistema Online</span>
            </div>
          </div>
        </header>

        <main className="flex-1 min-w-0 pb-20 md:pb-8">
          <Outlet />
        </main>
      </div>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-card border-t border-border flex justify-around h-16">
        {navGroups.flatMap(g => g.items).filter(n => !n.adminOnly || role === "admin").slice(0, 4).map((n) => {
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
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <button className="flex flex-col items-center justify-center gap-1 flex-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
              <Menu className="h-5 w-5" />
              Menu
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 flex flex-col w-64 border-r-0 bg-sidebar">
            <SheetTitle className="sr-only">Menu de NavegaÃƒÂ§ÃƒÂ£o</SheetTitle>
            <div className="px-6 py-6 border-b border-border/60">
              <Link to="/dashboard">
                <Logo size="sm" />
              </Link>
            </div>
            
            {/* MOBILE TOP NAV HYBRID */}
            <div className="px-3.5 py-4 border-b border-border/40">
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/80 mb-3 px-1">
                MÃ³dulo
              </div>
              <div className="flex flex-col gap-1">
                {navGroups.map((group, idx) => {
                  const isGrpActive = selectedGroupIndex === idx || (selectedGroupIndex === null && idx === 0);
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedGroupIndex(idx)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 text-left",
                        isGrpActive 
                          ? "bg-brand/10 text-brand shadow-sm" 
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                      )}
                    >
                      <group.icon className={cn("h-4 w-4", isGrpActive ? "text-brand" : "opacity-70")} />
                      {group.title}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="px-3.5 py-4 flex-1 space-y-2 overflow-y-auto scrollbar-none">
              <div className="flex items-center gap-3 px-3 pb-2 mb-1 border-b border-border/40">
                <activeGroup.icon className={cn("h-4 w-4", activeGroup.badgeColor.split(' ')[0])} />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                  {activeGroup.title}
                </span>
              </div>
              
              <nav className="space-y-0.5">
                {activeGroup.items.filter(n => !n.adminOnly || role === "admin").map((n) => {
                  const active = loc.pathname === n.to;
                  const Icon = n.icon;
                  return (
                    <Link
                      key={n.to}
                      to={n.to}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                        active
                          ? "bg-brand text-white font-semibold shadow-md shadow-brand/20 dark:shadow-none"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                      )}
                    >
                      <Icon strokeWidth={active ? 2 : 1.5} className={cn("h-4 w-4 shrink-0 transition-transform group-hover:scale-105", active ? "text-white" : "text-muted-foreground")} />
                      <span className="flex-1 truncate">{n.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="p-3.5 mt-auto border-t border-border/60 bg-muted/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-lg bg-brand/15 text-brand flex items-center justify-center font-extrabold text-xs border border-brand/20">
                  {user?.email?.[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-foreground truncate">{user?.email?.split('@')[0]}</div>
                  <div className="text-[10px] text-muted-foreground truncate uppercase tracking-wider font-semibold">{role}</div>
                </div>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-[11px] font-bold rounded-lg text-destructive hover:bg-destructive/10 transition-colors border border-destructive/20"
              >
                <LogOut className="h-3.5 w-3.5" /> Encerra Sessão
              </button>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  );
}
