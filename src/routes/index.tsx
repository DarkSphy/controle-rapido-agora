import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import {
  Package, Zap, Smartphone, ShoppingBag, AlertTriangle, ArrowRight, Check,
  Plus, ArrowLeftRight, BarChart3, Store, ShoppingCart, Shirt, Wrench, Boxes,
  ShieldCheck, Headphones, XCircle, Sparkles, MessageCircle, Star,
} from "lucide-react";

const WA_URL =
  "https://wa.me/5531973175882?text=" +
  encodeURIComponent("Olá, vim pela página do ControleJá e gostaria de saber mais.");

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
      <section className="relative px-5 md:px-10 py-14 md:py-24 max-w-6xl mx-auto w-full">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand/15 text-brand-foreground text-xs font-semibold mb-5">
              <Sparkles className="h-3.5 w-3.5" /> Ideal para pequenos negócios
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
                  Começar agora <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-base h-12 px-6 border-[#25D366] text-[#1ebe5a] hover:bg-[#25D366]/10 hover:text-[#1ebe5a]">
                <a href={WA_URL} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4" /> Falar no WhatsApp
                </a>
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-brand" /> Sem contrato</span>
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-brand" /> Cancele quando quiser</span>
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-brand" /> Suporte rápido</span>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-8 bg-gradient-to-tr from-brand/30 via-transparent to-primary/20 blur-3xl -z-10" />
            <div className="rounded-2xl border border-border bg-card shadow-2xl p-6 space-y-4">
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
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-3">
            Tudo que você precisa. Nada que você não precisa.
          </h2>
          <p className="text-muted-foreground text-center max-w-xl mx-auto mb-12">
            Sem fiscal, sem relatórios complexos, sem configurações infinitas.
          </p>
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

      {/* Como funciona */}
      <section className="px-5 md:px-10 py-16 md:py-24 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-foreground">Como funciona</span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-2">3 passos para tirar do papel</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          <Step n={1} icon={Plus} title="Cadastre seus produtos" desc="Em poucos minutos, com foto, preço e estoque inicial." />
          <Step n={2} icon={ArrowLeftRight} title="Registre entradas e saídas" desc="Com poucos cliques, no celular ou no computador." />
          <Step n={3} icon={BarChart3} title="Tenha controle total" desc="Estoque atualizado automaticamente, alertas em tempo real." />
        </div>
      </section>

      {/* Para quem é */}
      <section className="px-5 md:px-10 py-16 md:py-20 bg-muted/40 border-y border-border/60">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-3">Feito para o seu negócio</h2>
          <p className="text-muted-foreground text-center max-w-xl mx-auto mb-12">
            Se você vende produtos ou presta serviço, o ControleJá serve.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Niche icon={Zap} title="Materiais elétricos" />
            <Niche icon={ShoppingCart} title="Mini mercados" />
            <Niche icon={Shirt} title="Lojas de roupas" />
            <Niche icon={Wrench} title="Prestadores de serviço" />
            <Niche icon={Store} title="Pequenos comércios" />
          </div>
        </div>
      </section>

      {/* Prova social */}
      <section className="px-5 md:px-10 py-16 md:py-24 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-foreground">Quem usa, recomenda</span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-2">Histórias reais de quem organizou o estoque</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          <Testimonial
            name="Mariana S."
            biz="Loja de roupas — Belo Horizonte"
            quote="Antes eu perdia venda por não saber o que tinha. Hoje confiro no celular em 2 segundos."
          />
          <Testimonial
            name="Carlos R."
            biz="Materiais elétricos — Contagem"
            quote="Em uma semana o estoque estava 100% no controle. Simples, sem firula."
          />
          <Testimonial
            name="Juliana M."
            biz="Mini mercado — Sabará"
            quote="Atendimento rápido e sistema fácil. Meus funcionários aprenderam no mesmo dia."
          />
        </div>
      </section>

      {/* Trust strip */}
      <section className="px-5 md:px-10 py-10 bg-muted/40 border-y border-border/60">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          <Trust icon={XCircle} title="Sem contrato" />
          <Trust icon={ShieldCheck} title="Cancele quando quiser" />
          <Trust icon={Headphones} title="Suporte rápido" />
          <Trust icon={Sparkles} title="Simples de usar" />
        </div>
      </section>

      {/* Oferta */}
      <section className="px-5 md:px-10 py-16 md:py-24 max-w-3xl mx-auto w-full">
        <div className="relative rounded-3xl border-2 border-brand bg-card p-8 md:p-10 shadow-2xl overflow-hidden">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-brand text-brand-foreground text-xs font-bold uppercase tracking-wider">
            Oferta de lançamento
          </span>
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                Oferta de Ativação Imediata
              </h2>
              <div className="mt-8 flex flex-col items-center gap-3">
                <div className="text-sm text-brand-foreground uppercase tracking-widest font-bold">Primeiro mês</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl md:text-6xl font-extrabold text-primary">R$97</span>
                </div>
                <p className="text-sm font-semibold text-muted-foreground max-w-[200px] leading-relaxed">
                  Com ativação imediata + suporte prioritário
                </p>
              </div>
              <div className="my-8 h-px bg-border" />
              <div className="flex flex-col items-center gap-1">
                <div className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Depois</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl md:text-4xl font-bold">R$39,90</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
              </div>
              <Button asChild size="lg" className="mt-8 h-14 px-8 text-lg font-bold w-full sm:w-auto shadow-[var(--shadow-glow)]">
                <Link to="/auth" search={{ mode: "register" }}>
                  Garantir ativação agora <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            <div className="mt-4">
              <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="text-sm text-[#1ebe5a] font-semibold inline-flex items-center gap-1.5 hover:underline">
                <MessageCircle className="h-4 w-4" /> Tirar dúvidas no WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="px-5 md:px-10 py-8 border-t border-border/60 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} ControleJá — Feito para pequenos negócios.
      </footer>

      <WhatsAppFab />
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
    <div className="rounded-xl border border-border bg-card p-5 hover:shadow-lg hover:border-brand/40 transition-all">
      <div className="h-11 w-11 rounded-xl bg-brand/15 text-brand-foreground grid place-items-center mb-4">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

function Step({ n, icon: Icon, title, desc }: { n: number; icon: any; title: string; desc: string }) {
  return (
    <div className="relative rounded-2xl border border-border bg-card p-6 hover:shadow-xl hover:-translate-y-1 transition-all">
      <div className="absolute -top-4 left-6 h-9 w-9 rounded-full bg-primary text-primary-foreground grid place-items-center text-sm font-bold shadow-lg">
        {n}
      </div>
      <div className="h-12 w-12 rounded-xl bg-brand/15 text-brand-foreground grid place-items-center mt-2 mb-4">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="font-bold text-lg mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

function Niche({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 text-center hover:border-brand transition-colors">
      <div className="h-10 w-10 mx-auto rounded-lg bg-brand/15 text-brand-foreground grid place-items-center mb-3">
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-sm font-semibold">{title}</div>
    </div>
  );
}

function Testimonial({ name, biz, quote }: { name: string; biz: string; quote: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 hover:shadow-lg transition-shadow">
      <div className="flex gap-0.5 mb-3 text-brand">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} className="h-4 w-4 fill-current" />
        ))}
      </div>
      <p className="text-sm leading-relaxed mb-5">"{quote}"</p>
      <div className="flex items-center gap-3 pt-4 border-t border-border">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-brand grid place-items-center text-white font-bold">
          {name.charAt(0)}
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-sm truncate">{name}</div>
          <div className="text-xs text-muted-foreground truncate">{biz}</div>
        </div>
      </div>
    </div>
  );
}

function Trust({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <div className="flex items-center gap-3 justify-center md:justify-start">
      <div className="h-9 w-9 rounded-full bg-brand/15 text-brand-foreground grid place-items-center shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <span className="text-sm font-semibold">{title}</span>
    </div>
  );
}
