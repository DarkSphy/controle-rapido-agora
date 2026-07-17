import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import {
  Package, Zap, Smartphone, ShoppingBag, AlertTriangle, ArrowRight, Check,
  Plus, ArrowLeftRight, BarChart3, Store, ShoppingCart, Shirt, Wrench,
  ShieldCheck, Headphones, XCircle, Sparkles, MessageCircle, Star,
  Users, TrendingUp, Receipt, Tag, ChevronDown, Minus, FileText, Boxes, Play, LayoutDashboard
} from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { DemoDashboard } from "@/components/DemoDashboard";
import { DemoCatalog } from "@/components/DemoCatalog";

const PHONE = "5531973175882";
const MSG_HIRE = "Gostaria de contratar o controle já.";
const MSG_HELP = "Gostaria de tirar dúvidas sobre o produto.";

const WA_HIRE_URL = `https://wa.me/${PHONE}?text=${encodeURIComponent(MSG_HIRE)}`;
const WA_HELP_URL = `https://wa.me/${PHONE}?text=${encodeURIComponent(MSG_HELP)}`;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ControleJá — Gestão simples de estoque e vendas para sua loja" },
      { name: "description", content: "Controle estoque, vendas, compras e clientes em um só lugar. Simples, rápido, no celular ou no computador. Plano único a partir de R$39,90/mês." },
      { property: "og:title", content: "ControleJá — Seu estoque. Seu negócio. No controle." },
      { property: "og:description", content: "Sistema de gestão simples para pequenos negócios. Comece hoje mesmo." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="px-5 md:px-10 py-3 flex items-center justify-between border-b border-border/60 bg-background/85 backdrop-blur-md sticky top-0 z-30">
        <Logo />
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-foreground/80">
          <a href="#funcionalidades" className="hover:text-brand-foreground transition-colors">Funcionalidades</a>
          <a href="#para-quem" className="hover:text-brand-foreground transition-colors">Para quem é</a>
          <a href="#planos" className="hover:text-brand-foreground transition-colors">Planos</a>
          <a href="#duvidas" className="hover:text-brand-foreground transition-colors">Dúvidas</a>
          <a href={WA_HELP_URL} target="_blank" rel="noopener noreferrer" className="hover:text-brand-foreground transition-colors">Contato</a>
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <Button asChild>
              <Link to="/dashboard">Acessar app <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 ml-auto">
              <Button asChild variant="outline" className="border-brand/30 text-brand hover:bg-brand/10 w-full sm:w-auto text-xs sm:text-sm h-9 sm:h-10">
                <Link to="/auth">Entrar na conta</Link>
              </Button>
              <Button asChild className="shadow-md w-full sm:w-auto text-xs sm:text-sm h-9 sm:h-10">
                <a href={WA_HIRE_URL}>Assinar agora</a>
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="relative px-5 md:px-10 pt-16 md:pt-28 pb-20 md:pb-32 overflow-hidden bg-background">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-brand/20 via-background to-background opacity-70" />
        <div className="absolute top-20 right-0 w-[600px] h-[600px] -z-10 rounded-full bg-brand/10 blur-[100px] translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[400px] -z-10 rounded-full bg-primary/5 blur-[120px] -translate-x-1/4" />
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>

            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.02]">
              Gestão simples para <span className="text-brand">vender mais</span> e cuidar menos do estoque.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-md">
              O ControleJá organiza seu estoque, suas vendas, compras e clientes — sem complicação, sem mensalidade surpresa, sem treinamento longo.
            </p>
            <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2 text-sm font-medium max-w-md">
              {["Controle de estoque", "Registro de vendas", "Cadastro de clientes", "Compras e fornecedores"].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-brand/20 text-brand-foreground grid place-items-center shrink-0">
                    <Check className="h-3 w-3" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="text-base h-14 px-8 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_10px_40px_rgba(0,0,0,0.2)] hover:-translate-y-1 transition-all duration-300">
                <a href={WA_HIRE_URL}>
                  Quero contratar agora <ArrowRight className="h-5 w-5 ml-2" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-base h-14 px-8 rounded-full border-2 border-[#25D366]/30 text-[#1ebe5a] bg-white/50 backdrop-blur-sm hover:bg-[#25D366]/10 hover:border-[#25D366] hover:-translate-y-1 transition-all duration-300 shadow-sm">
                <a href={WA_HELP_URL} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-5 w-5 mr-2" /> Falar no WhatsApp
                </a>
              </Button>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">
              Sem fidelidade • Cancele quando quiser • Garantia de 7 dias
            </p>
          </div>

          {/* Hero mockup composition */}
          <div className="relative">
            <div className="absolute -inset-10 bg-gradient-to-tr from-brand/30 via-transparent to-primary/20 blur-3xl -z-10" />
            <DashboardMockup />
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="px-5 md:px-10 py-6 bg-primary text-primary-foreground">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex -space-x-2">
            {["bg-rose-300","bg-amber-300","bg-sky-300","bg-emerald-300","bg-violet-300","bg-orange-300","bg-teal-300"].map((c, i) => (
              <div key={i} className={`h-9 w-9 rounded-full border-2 border-primary ${c} grid place-items-center text-xs font-bold text-primary`}>
                {String.fromCharCode(65 + i)}
              </div>
            ))}
            <div className="h-9 w-9 rounded-full border-2 border-primary bg-brand grid place-items-center text-xs font-bold text-brand-foreground">+</div>
          </div>
          <p className="text-sm md:text-base font-semibold text-center md:text-right">
            Centenas de pequenos negócios já organizaram o estoque com o ControleJá
          </p>
        </div>
      </section>

      {/* Live Demo Section */}
      <section id="demo" className="px-5 md:px-10 py-20 bg-muted/30 border-y border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-bold uppercase tracking-widest mb-3">
              <Sparkles className="h-3 w-3" /> Exclusividade
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              Experimente na Prática.
              <span className="block text-muted-foreground mt-2">Sem precisar criar conta.</span>
            </h2>
            <p className="text-muted-foreground mt-5 text-lg">
              Clique nos botões abaixo e sinta como é usar o ControleJá. Separamos dois ambientes de simulação para você testar tudo agora mesmo.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Card Sistema */}
            <div className="bg-white/80 backdrop-blur-xl border border-white/20 hover:border-brand/30 rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-all duration-500 flex flex-col items-center text-center group relative overflow-hidden">
              <div className="h-20 w-20 bg-brand/10 text-brand rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                <LayoutDashboard className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Painel do Lojista</h3>
              <p className="text-muted-foreground mb-8 flex-1">
                Acesse o balcão de vendas, veja o dashboard financeiro, simule a gestão de produtos, clientes e compras. Tudo interativo.
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="lg" className="w-full h-14 text-lg rounded-full group-hover:bg-brand/90 transition-colors shadow-lg group-hover:shadow-brand/20">
                    <Play className="h-5 w-5 mr-2" /> Testar o Sistema
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[95vw] md:max-w-5xl h-[90vh] p-0 overflow-hidden bg-background border-border">
                  <DialogTitle className="sr-only">Simulação do Sistema</DialogTitle>
                  <DemoDashboard />
                </DialogContent>
              </Dialog>
            </div>

            {/* Card Catálogo */}
            <div className="bg-white/80 backdrop-blur-xl border border-white/20 hover:border-brand/30 rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-all duration-500 flex flex-col items-center text-center group relative overflow-hidden">
              <div className="h-20 w-20 bg-brand/10 text-brand rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-transform">
                <Store className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Catálogo Público</h3>
              <p className="text-muted-foreground mb-8 flex-1">
                Veja como os seus clientes enxergarão os seus produtos. Um link exclusivo, com design premium e integração direta com o seu WhatsApp.
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="lg" variant="outline" className="w-full h-14 text-lg rounded-full border-2 hover:bg-brand hover:text-white transition-colors shadow-sm">
                    <Store className="h-5 w-5 mr-2" /> Exemplo de Catálogo
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[95vw] md:max-w-5xl h-[90vh] p-0 overflow-hidden bg-background border-border">
                  <DialogTitle className="sr-only">Simulação de Catálogo</DialogTitle>
                  <DemoCatalog />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="funcionalidades" className="px-5 md:px-10 py-20 md:py-28">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-foreground">Funcionalidades</span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mt-3">
              Tudo o que sua loja precisa.<br />
              <span className="text-muted-foreground">Nada que ela não precisa.</span>
            </h2>
            <p className="text-muted-foreground mt-5">
              Sem fiscal, sem relatórios complexos, sem configurações infinitas. Cada tela foi pensada para você usar em 2 toques.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Feature icon={Package} title="Estoque sempre certo" desc="Cadastro com foto, custo, margem e estoque atual. Variações quando precisar." />
            <Feature icon={ShoppingBag} title="Vendas no balcão" desc="Busque, adicione e finalize a venda em segundos — no celular ou no computador." />
            <Feature icon={Receipt} title="Compras e fornecedores" desc="Registre entradas, controle pedidos e tenha histórico de cada fornecedor." />
            <Feature icon={Users} title="Clientes organizados" desc="Cadastro com WhatsApp, histórico de compras e contato direto." />
            <Feature icon={AlertTriangle} title="Alerta de reposição" desc="Veja na hora o que está acabando e mande o pedido pelo WhatsApp." />
            <Feature icon={TrendingUp} title="Dashboard claro" desc="Saiba quanto vendeu, o que mais sai e o valor parado em estoque." />
            <Feature icon={Tag} title="Categorias e kits" desc="Organize produtos por categoria e monte kits/combo para vender mais." />
            <Feature icon={FileText} title="Comprovante em PDF" desc="Gere notinha do pedido com tudo que o cliente comprou — pronto pra enviar." />
            <Feature icon={Smartphone} title="Funciona no celular" desc="Seu estoque no bolso. Use no balcão, no estoque ou em casa." />
          </div>
        </div>
      </section>

      {/* Comparison — simplicity wins */}
      <section className="px-5 md:px-10 py-20 md:py-28 bg-muted/40 border-y border-border/60">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-foreground">Por que ControleJá</span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mt-3">
              Simples por escolha.<br />Não por falta de recurso.
            </h2>
            <p className="text-muted-foreground mt-5">
              A maioria dos sistemas tenta resolver tudo — e acaba não sendo usado. Aqui é o contrário: cada tela tem só o essencial pra você não travar no meio da venda.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-border bg-card p-7">
              <div className="flex items-center gap-2 text-muted-foreground mb-5">
                <XCircle className="h-5 w-5" />
                <span className="font-bold">Outros sistemas</span>
              </div>
              <ul className="space-y-3 text-sm">
                {[
                  "Cadastro com 30 campos obrigatórios",
                  "Treinamento de 2 horas pra começar",
                  "Mensalidade que sobe sem aviso",
                  "Tela cheia de menu e relatório que ninguém usa",
                  "Suporte que demora dias pra responder",
                ].map((t) => (
                  <li key={t} className="flex gap-2 text-muted-foreground">
                    <Minus className="h-4 w-4 mt-0.5 shrink-0" /> {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border-2 border-brand bg-card p-7 shadow-xl">
              <div className="flex items-center gap-2 text-brand-foreground mb-5">
                <Check className="h-5 w-5" />
                <span className="font-bold">ControleJá</span>
              </div>
              <ul className="space-y-3 text-sm">
                {[
                  "Cadastro em 4 campos: nome, preço, estoque, foto",
                  "Você usa em 1 minuto, sem treinamento",
                  "R$39,90/mês fixo. Sem reajuste surpresa",
                  "Só o que importa pro dia a dia da sua loja",
                  "Suporte direto no WhatsApp, todos os dias",
                ].map((t) => (
                  <li key={t} className="flex gap-2">
                    <Check className="h-4 w-4 mt-0.5 shrink-0 text-brand-foreground" /> {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Veja na prática — sales mockup */}
      <section className="px-5 md:px-10 py-20 md:py-28">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-14 items-center">
          <div className="order-2 md:order-1 relative">
            <div className="absolute -inset-10 bg-gradient-to-br from-primary/20 via-transparent to-brand/30 blur-3xl -z-10" />
            <SalesMockup />
          </div>
          <div className="order-1 md:order-2">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-foreground">Veja na prática</span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mt-3">
              Da venda ao recibo<br />em <span className="text-brand">poucos segundos.</span>
            </h2>
            <p className="text-muted-foreground mt-5 text-lg">
              Adicione produtos, escolha o cliente, registre o pagamento — e o sistema já gera o PDF da venda pronto pra enviar no WhatsApp do cliente.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Busca instantânea por nome, código ou cliente",
                "Múltiplas formas de pagamento por venda",
                "Estoque baixa automaticamente",
                "Comprovante em PDF gerado na hora",
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <span className="h-6 w-6 rounded-full bg-brand text-brand-foreground grid place-items-center shrink-0 mt-0.5">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-foreground/90">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="px-5 md:px-10 py-20 md:py-24 bg-muted/40 border-y border-border/60">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-foreground">Como funciona</span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mt-3">3 passos para tirar do papel</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            <Step n={1} icon={Plus} title="Cadastre seus produtos" desc="Em poucos minutos, com foto, preço e estoque inicial." />
            <Step n={2} icon={ArrowLeftRight} title="Registre entradas e saídas" desc="Com poucos cliques, no celular ou no computador." />
            <Step n={3} icon={BarChart3} title="Tenha controle total" desc="Estoque atualizado, alertas em tempo real, vendas no histórico." />
          </div>
        </div>
      </section>

      {/* Para quem é */}
      <section id="para-quem" className="px-5 md:px-10 py-20 md:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-foreground">Pra quem é</span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mt-3">Feito para o seu negócio</h2>
            <p className="text-muted-foreground mt-4">
              Se você vende produto ou presta serviço, o ControleJá serve.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Niche icon={Zap} title="Materiais elétricos" />
            <Niche icon={ShoppingCart} title="Mini mercados" />
            <Niche icon={Shirt} title="Lojas de roupas" />
            <Niche icon={Wrench} title="Prestadores de serviço" />
            <Niche icon={Store} title="Pequenos comércios" />
            <Niche icon={Boxes} title="Distribuidoras" />
            <Niche icon={Package} title="Papelarias" />
            <Niche icon={ShoppingBag} title="Lojas online" />
            <Niche icon={Tag} title="Brechós" />
            <Niche icon={Receipt} title="Bazares" />
          </div>
        </div>
      </section>

      {/* Prova social */}
      <section className="px-5 md:px-10 py-20 md:py-24 bg-muted/40 border-y border-border/60">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-foreground">Quem usa, recomenda</span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mt-3">Histórias reais de quem<br />organizou o estoque</h2>
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
        </div>
      </section>

      {/* Trust strip 2 */}
      <section className="px-5 md:px-10 py-10">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          <Trust icon={XCircle} title="Sem fidelidade" />
          <Trust icon={ShieldCheck} title="Cancele quando quiser" />
          <Trust icon={Headphones} title="Suporte no WhatsApp" />
          <Trust icon={Sparkles} title="Simples de usar" />
        </div>
      </section>

      {/* Oferta */}
      <section id="planos" className="px-5 md:px-10 py-20 md:py-28 max-w-5xl mx-auto w-full">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-foreground">Plano único</span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mt-3">Sem taxas escondidas</h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-lg">
            Tudo incluso. Você sabe exatamente o que paga, do primeiro mês em diante.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5 items-stretch">
          {/* Primeiro mês */}
          <div className="relative rounded-[2rem] border-2 border-brand bg-white/90 backdrop-blur p-7 md:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-all duration-500 flex flex-col">
            <span className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-brand text-brand-foreground text-[10px] font-bold uppercase tracking-wider">
              Comece por aqui
            </span>
            <div className="text-xs uppercase tracking-widest font-bold text-brand-foreground">Primeiro mês</div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-5xl md:text-6xl font-extrabold text-primary">R$139,90</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Pagamento único — inclui ativação e 1º mês de uso</p>

            <ul className="mt-6 space-y-3 text-sm flex-1">
              <li className="flex gap-2"><Check className="h-4 w-4 text-brand-foreground mt-0.5 shrink-0" /> Ativação imediata da conta</li>
              <li className="flex gap-2"><Check className="h-4 w-4 text-brand-foreground mt-0.5 shrink-0" /> Suporte no cadastro dos seus produtos</li>
              <li className="flex gap-2"><Check className="h-4 w-4 text-brand-foreground mt-0.5 shrink-0" /> 7 dias de garantia — ou seu dinheiro de volta</li>
              <li className="flex gap-2"><Check className="h-4 w-4 text-brand-foreground mt-0.5 shrink-0" /> Atendimento prioritário no WhatsApp</li>
            </ul>

            <Button asChild size="lg" className="mt-7 h-14 rounded-full text-base font-bold w-full shadow-xl shadow-brand/20">
              <a href={WA_HIRE_URL}>
                Quero contratar agora <ArrowRight className="h-5 w-5 ml-2" />
              </a>
            </Button>
          </div>

          {/* Mensalidade */}
          <div className="relative rounded-[2rem] border border-white/40 bg-white/60 backdrop-blur p-7 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-all duration-500 flex flex-col">
            <div className="text-xs uppercase tracking-widest font-bold text-muted-foreground">A partir do 2º mês</div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-5xl md:text-6xl font-extrabold">R$39,90</span>
              <span className="text-muted-foreground text-lg">/mês</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Mensalidade fixa, sem reajuste surpresa</p>

            <ul className="mt-6 space-y-3 text-sm flex-1">
              <li className="flex gap-2"><Check className="h-4 w-4 text-brand-foreground mt-0.5 shrink-0" /> Estoque, vendas e relatórios ilimitados</li>
              <li className="flex gap-2"><Check className="h-4 w-4 text-brand-foreground mt-0.5 shrink-0" /> Acesso no celular e no computador</li>
              <li className="flex gap-2"><Check className="h-4 w-4 text-brand-foreground mt-0.5 shrink-0" /> Atualizações novas todo mês</li>
              <li className="flex gap-2"><Check className="h-4 w-4 text-brand-foreground mt-0.5 shrink-0" /> Cancele quando quiser, sem multa</li>
            </ul>

            <a
              href={WA_HELP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex items-center justify-center gap-2 h-14 rounded-full border-2 border-[#25D366]/30 text-[#1ebe5a] font-semibold hover:bg-[#25D366]/10 hover:border-[#25D366] transition-all duration-300"
            >
              <MessageCircle className="h-5 w-5" /> Tirar dúvidas no WhatsApp
            </a>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Sem fidelidade • Sem taxa de cancelamento • Garantia de 7 dias
        </p>
      </section>

      {/* FAQ */}
      <section id="duvidas" className="px-5 md:px-10 py-20 md:py-24 bg-muted/40 border-y border-border/60">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-foreground">Dúvidas</span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mt-3">Perguntas frequentes</h2>
          </div>
          <div className="space-y-3">
            <Faq q="Como funciona o pagamento?">
              Você paga R$139,90 no primeiro mês (ativação + 1º mês de uso). A partir do 2º mês, é só R$39,90/mês fixo. Cobrança no cartão de crédito.
            </Faq>
            <Faq q="Posso cancelar quando quiser?">
              Sim. Sem multa, sem fidelidade. É só pedir o cancelamento no WhatsApp e a próxima cobrança não acontece.
            </Faq>
            <Faq q="Tem garantia?">
              Sim. Você tem 7 dias para testar. Se não gostar, devolvemos 100% do valor pago.
            </Faq>
            <Faq q="Funciona no celular?">
              Funciona no celular, tablet e computador — basta abrir o navegador. Não precisa baixar nada.
            </Faq>
            <Faq q="Preciso instalar alguma coisa?">
              Não. O ControleJá roda direto no navegador. Crie sua conta e já comece a usar.
            </Faq>
            <Faq q="Quem cuida dos meus dados?">
              Seus dados ficam em servidores seguros, com backup automático. Só você acessa a sua conta.
            </Faq>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="px-5 md:px-10 py-20 md:py-24 bg-primary text-primary-foreground">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Pronto pra parar de perder vendas<br />por desorganização?
          </h2>
          <p className="mt-5 text-primary-foreground/80 text-lg max-w-xl mx-auto">
            Comece hoje. Em poucos minutos sua loja já está organizada.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="h-12 px-7 text-base font-bold bg-brand text-brand-foreground hover:bg-brand/90">
              <a href={WA_HIRE_URL}>
                Quero contratar agora <ArrowRight className="h-5 w-5" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-7 text-base bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              <a href={WA_HELP_URL} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" /> Falar com a gente
              </a>
            </Button>
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

/* ===== Mockups ===== */

function MockChrome({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/40">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
        <span className="ml-3 text-xs text-muted-foreground font-medium">{label}</span>
      </div>
      {children}
    </div>
  );
}

function DashboardMockup() {
  return (
    <div className="relative">
      <MockChrome label="controleja.app — Dashboard">
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">Resumo de hoje</div>
              <div className="font-bold">Olá, Mariana 👋</div>
            </div>
            <Logo size="sm" showText={false} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <DemoStat label="Vendas hoje" value="R$ 1.248" tone="brand" />
            <DemoStat label="Pedidos" value="12" tone="primary" />
            <DemoStat label="Estoque crítico" value="3" tone="warn" />
            <DemoStat label="Em estoque" value="R$ 8.4k" tone="muted" />
          </div>
          <div className="rounded-xl bg-muted/60 p-3 space-y-2">
            <div className="text-[11px] uppercase font-bold tracking-wide text-muted-foreground">Últimas movimentações</div>
            <MockRow name="Camiseta básica — M" sub="Venda • há 2 min" amount="-1" tone="out" />
            <MockRow name="Caneca personalizada" sub="Compra • há 1h" amount="+14" tone="in" />
            <MockRow name="Cabo HDMI 2m" sub="Venda • há 3h" amount="-2" tone="out" />
          </div>
        </div>
      </MockChrome>

      {/* Floating cards */}
      <div className="hidden md:block absolute -left-12 top-32 w-56 rounded-xl border border-border bg-card shadow-xl p-3 rotate-[-4deg]">
        <div className="text-[10px] font-bold uppercase tracking-wider text-brand-foreground">Reposição</div>
        <div className="mt-1.5 flex items-center justify-between text-sm">
          <span className="font-medium truncate">Pilha AA</span>
          <span className="text-destructive font-bold">2 un</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-sm">
          <span className="font-medium truncate">Fita isolante</span>
          <span className="text-destructive font-bold">1 un</span>
        </div>
      </div>
      <div className="hidden md:block absolute -right-8 -bottom-6 w-60 rounded-xl border border-border bg-card shadow-xl p-3 rotate-[3deg]">
        <div className="flex items-center gap-2 mb-2">
          <span className="h-7 w-7 rounded-full bg-brand/20 grid place-items-center">
            <Check className="h-3.5 w-3.5 text-brand-foreground" />
          </span>
          <div>
            <div className="text-xs font-bold">Venda registrada</div>
            <div className="text-[10px] text-muted-foreground">PDF gerado e enviado</div>
          </div>
        </div>
        <div className="text-2xl font-extrabold tabular-nums">R$ 89,90</div>
      </div>
    </div>
  );
}

function SalesMockup() {
  return (
    <MockChrome label="controleja.app — Nova venda">
      <div className="p-5 grid grid-cols-1 gap-4">
        <div className="rounded-lg border border-border px-3 py-2.5 flex items-center gap-2 text-sm bg-muted/30">
          <span className="text-muted-foreground">🔍</span>
          <span className="text-muted-foreground">Buscar produto…</span>
        </div>
        <div className="space-y-2">
          {[
            { n: "Camiseta básica — M", q: 2, p: "59,90" },
            { n: "Caneca personalizada", q: 1, p: "39,90" },
            { n: "Adesivo decorativo", q: 3, p: "9,90" },
          ].map((it) => (
            <div key={it.n} className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5">
              <div className="min-w-0">
                <div className="font-medium text-sm truncate">{it.n}</div>
                <div className="text-xs text-muted-foreground">Qtd. {it.q} × R$ {it.p}</div>
              </div>
              <div className="font-bold tabular-nums text-sm">R$ {(parseFloat(it.p.replace(",", ".")) * it.q).toFixed(2).replace(".", ",")}</div>
            </div>
          ))}
        </div>
        <div className="rounded-xl bg-primary text-primary-foreground p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider opacity-70">Total da venda</div>
            <div className="text-2xl font-extrabold tabular-nums">R$ 209,50</div>
          </div>
          <div className="px-3 py-2 rounded-lg bg-brand text-brand-foreground text-sm font-bold">
            Finalizar
          </div>
        </div>
      </div>
    </MockChrome>
  );
}

function MockRow({ name, sub, amount, tone }: { name: string; sub: string; amount: string; tone: "in" | "out" }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="min-w-0">
        <div className="font-medium truncate">{name}</div>
        <div className="text-[11px] text-muted-foreground">{sub}</div>
      </div>
      <div className={`font-bold tabular-nums ${tone === "out" ? "text-destructive" : "text-brand-foreground"}`}>{amount}</div>
    </div>
  );
}

function DemoStat({ label, value, tone }: { label: string; value: string; tone: "brand" | "primary" | "warn" | "muted" }) {
  const styles = {
    brand: "bg-brand/15 text-brand-foreground",
    primary: "bg-primary/10 text-primary",
    warn: "bg-warning/15 text-warning-foreground",
    muted: "bg-muted text-foreground",
  };
  return (
    <div className={`rounded-lg p-3 ${styles[tone]}`}>
      <div className="text-[10px] uppercase font-bold tracking-wide opacity-70">{label}</div>
      <div className="text-xl font-bold tabular-nums">{value}</div>
    </div>
  );
}

function Feature({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 hover:shadow-lg hover:border-brand/40 hover:-translate-y-0.5 transition-all">
      <div className="h-11 w-11 rounded-xl bg-brand/15 text-brand-foreground grid place-items-center mb-4">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-bold mb-1">{title}</h3>
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
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-brand grid place-items-center text-primary-foreground font-bold">
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

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left font-semibold hover:bg-muted/40 transition-colors"
      >
        {q}
        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-muted-foreground">{children}</div>
      )}
    </div>
  );
}
