import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Package, Zap, Smartphone, ShoppingBag, AlertTriangle, ArrowRight, Check } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ControleJá — Controle de estoque simples para pequenos negócios" },
      { name: "description", content: "Cadastre produtos, registre entradas e saídas, e nunca mais perca uma venda. Simples, rápido, no celular ou no desktop." },
      { property: "og:title", content: "ControleJá — Seu estoque. Seu negócio. No controle." },
      { property: "og:description", content: "Controle de estoque sem complicação para lojistas e prestadores de serviço." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="px-5 md:px-10 py-4 flex items-center justify-between border-b border-border/60 bg-background/80 backdrop-blur sticky top-0 z-20">
        <Logo />
        <div className="flex items-center gap-2">
          {user ? (
            <Button asChild>
              <Link to="/dashboard">Acessar app <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" className="hidden sm:inline-flex">
                <Link to="/auth">Entrar</Link>
              </Button>
              <Button asChild>
                <Link to="/auth" search={{ mode: "register" }}>Começar grátis</Link>
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="px-5 md:px-10 py-16 md:py-24 max-w-6xl mx-auto w-full">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-brand-foreground text-xs font-medium mb-5">
              <Check className="h-3.5 w-3.5" /> Feito para pequenos negócios
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05]">
              Seu estoque.<br />
              Seu negócio.<br />
              <span className="text-brand">No controle.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-md">
              Controle de estoque sem complicação. Cadastre produtos, registre vendas e nunca mais perca o pedido por falta de informação.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="text-base h-12 px-6">
                <Link to="/auth" search={{ mode: "register" }}>
                  Começar agora — é grátis <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-base h-12 px-6">
                <Link to="/auth">Já tenho conta</Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-8 bg-gradient-to-tr from-brand/20 via-transparent to-primary/10 blur-3xl -z-10" />
            <div className="rounded-2xl border border-border bg-card shadow-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Logo size="sm" showText={false} />
                <span className="text-xs text-muted-foreground">Resumo do dia</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <DemoStat label="Entradas" value="42" tone="brand" />
                <DemoStat label="Saídas" value="28" tone="primary" />
                <DemoStat label="Crítico" value="3" tone="warn" />
                <DemoStat label="Em estoque" value="R$ 8.4k" tone="muted" />
              </div>
              <div className="rounded-xl bg-muted/60 p-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Camiseta básica — M</span>
                  <span className="text-destructive font-semibold">1 un</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Caneca personalizada</span>
                  <span className="text-success font-semibold">14 un</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-5 md:px-10 py-16 md:py-20 bg-muted/40 border-y border-border/60">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-3">Tudo que você precisa. Nada que você não precisa.</h2>
          <p className="text-muted-foreground text-center max-w-xl mx-auto mb-12">Sem fiscal, sem relatórios complexos, sem configurações infinitas.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Feature icon={Package} title="Cadastro simples" desc="Produtos com foto, custo, margem e estoque. Variações quando precisar." />
            <Feature icon={Zap} title="Movimente em 2 toques" desc="Entradas e saídas com botões grandes, sem fricção." />
            <Feature icon={ShoppingBag} title="Modo balcão" desc="Busque, veja preço e dê baixa rapidíssimo durante a venda." />
            <Feature icon={AlertTriangle} title="Lista de reposição" desc="Saiba na hora o que precisa repor — copie e mande no WhatsApp." />
            <Feature icon={Smartphone} title="Funciona no celular" desc="Seu estoque sempre no bolso, online no balcão ou fora dele." />
            <Feature icon={Check} title="Comece em 1 minuto" desc="Crie sua conta grátis e cadastre o primeiro produto agora." />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 md:px-10 py-20 max-w-4xl mx-auto text-center w-full">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Pronto para tirar seu estoque do papel?</h2>
        <p className="mt-4 text-muted-foreground">Crie sua conta grátis e comece a controlar agora mesmo.</p>
        <Button asChild size="lg" className="mt-8 h-12 px-6 text-base">
          <Link to="/auth" search={{ mode: "register" }}>
            Criar conta grátis <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </section>

      <footer className="px-5 md:px-10 py-8 border-t border-border/60 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} ControleJá — Feito para pequenos negócios.
      </footer>
    </div>
  );
}

function DemoStat({ label, value, tone }: { label: string; value: string; tone: "brand" | "primary" | "warn" | "muted" }) {
  const styles = {
    brand: "bg-brand/10 text-brand-foreground",
    primary: "bg-primary/10 text-primary",
    warn: "bg-warning/15 text-warning-foreground",
    muted: "bg-muted text-foreground",
  };
  return (
    <div className={`rounded-lg p-3 ${styles[tone]}`}>
      <div className="text-[10px] uppercase font-semibold tracking-wide opacity-70">{label}</div>
      <div className="text-xl font-bold tabular-nums">{value}</div>
    </div>
  );
}

function Feature({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="h-10 w-10 rounded-lg bg-brand/15 text-brand-foreground grid place-items-center mb-4">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}
