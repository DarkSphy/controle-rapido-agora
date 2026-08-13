import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import {
  Package, Zap, Smartphone, ShoppingBag, AlertTriangle, ArrowRight, Check,
  Plus, ArrowLeftRight, BarChart3, Store, ShoppingCart, Shirt, Wrench,
  ShieldCheck, Headphones, XCircle, Sparkles, MessageCircle, Star,
  Users, TrendingUp, Receipt, Tag, ChevronDown, Minus, FileText, Boxes, Play, LayoutDashboard,
  Truck, Layers3, Wallet, Compass
} from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { DemoDashboard } from "@/components/DemoDashboard";
import { DemoCatalog } from "@/components/DemoCatalog";
import { cn } from "@/lib/utils";
import { LogoTicker, AnimatedCounters, BeforeAfterSlider, BentoGrid, GlowingCard } from "@/components/landing/LandingEffects";

const PHONE = "5531973175882";
const MSG_HIRE = "Gostaria de contratar o controle já.";
const MSG_HELP = "Gostaria de tirar dúvidas sobre o produto.";

const WA_HIRE_URL = `https://wa.me/${PHONE}?text=${encodeURIComponent(MSG_HIRE)}`;
const WA_HELP_URL = `https://wa.me/${PHONE}?text=${encodeURIComponent(MSG_HELP)}`;

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#f8f9fc]">
      
      {/* 1. Header */}
      <header className="px-5 md:px-10 py-4 flex items-center justify-between border-b border-border/40 bg-white sticky top-0 z-30 shadow-sm">
        <Logo size="sm" />
        
        <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <a href="#funcionalidades" className="hover:text-brand transition-colors">Funcionalidades</a>
          <a href="#como-funciona" className="hover:text-brand transition-colors">Como funciona</a>
          <a href="#precos" className="hover:text-brand transition-colors">Preços</a>
          <a href="#depoimentos" className="hover:text-brand transition-colors">Depoimentos</a>
          <a href="#duvidas" className="hover:text-brand transition-colors">Dúvidas</a>
        </nav>
        
        <div className="flex items-center gap-3">
          {user ? (
            <Button asChild className="bg-brand text-white font-bold rounded-lg px-6">
              <Link to="/dashboard">Painel <ArrowRight className="h-4 w-4 ml-2" /></Link>
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              <Button asChild variant="outline" className="border-brand/30 text-brand font-bold hover:bg-brand/5 rounded-lg px-5">
                <Link to="/auth">Entrar na conta</Link>
              </Button>
              <Button asChild className="bg-brand text-white font-bold shadow-md hover:bg-brand/90 rounded-lg px-5">
                <a href={WA_HIRE_URL}>Assinar agora <ArrowRight className="h-4 w-4 ml-2" /></a>
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* 2. Hero */}
      <section className="relative px-5 md:px-10 pt-16 pb-16 overflow-hidden bg-white">
        <div className="max-w-[1200px] mx-auto grid md:grid-cols-2 gap-10 items-center">
          
          <div className="pr-10 relative">
            {/* Efeito Glow atrás do Título */}
            <div className="absolute -top-20 -left-10 w-96 h-96 bg-gradient-to-r from-brand via-purple-400 to-emerald-400 rounded-full blur-[80px] opacity-40 animate-spin-slow pointer-events-none -z-10" />
            
            <h1 className="relative z-10 text-4xl md:text-[3.5rem] font-extrabold tracking-tight leading-[1.1] text-slate-900">
              Gestão simples para <span className="text-brand">vender mais</span> e cuidar menos do estoque.
            </h1>
            <p className="mt-6 text-lg text-slate-600 max-w-lg leading-relaxed">
              O ControleJá organiza seu estoque, suas vendas, compras e clientes — sem complicação, sem mensalidade surpresa, sem treinamento longo.
            </p>
            
            <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-3 text-sm font-bold text-brand">
              {[
                { icon: Package, text: "Controle de estoque" }, 
                { icon: ShoppingCart, text: "Registro de vendas" }, 
                { icon: Users, text: "Cadastro de clientes" }, 
                { icon: Truck, text: "Compras e fornecedores" }
              ].map((item) => (
                <li key={item.text} className="flex items-center gap-2 bg-brand/5 px-3 py-2 rounded-lg border border-brand/10">
                  <item.icon className="h-4 w-4 text-brand" />
                  {item.text}
                </li>
              ))}
            </ul>
            
            <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center">
              <Button asChild size="lg" className="text-base h-14 px-8 rounded-xl bg-brand text-white font-bold shadow-lg shadow-brand/30 hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto">
                <a href={WA_HIRE_URL}>
                  Quero contratar agora <ArrowRight className="h-5 w-5 ml-2" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-base h-14 px-8 rounded-xl border-2 border-[#25D366]/40 text-[#1ebe5a] bg-white font-bold hover:bg-[#25D366]/10 hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto">
                <a href={WA_HELP_URL} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-5 w-5 mr-2" /> Falar no WhatsApp
                </a>
              </Button>
            </div>
            
            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
              <div className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-brand" /> Sem fidelidade</div>
              <div className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-brand" /> Cancele quando quiser</div>
              <div className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-brand" /> Garantia de 7 dias</div>
            </div>
          </div>

          <div className="relative flex justify-end items-center group [perspective:1000px]">
            <div className="transition-transform duration-700 ease-out group-hover:[transform:rotateX(5deg)_rotateY(-15deg)]">
              <DashboardMockup />
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Strip & Counters */}
      <LogoTicker />
      <AnimatedCounters />


      {/* 4. Funcionalidades */}
      <section id="funcionalidades" className="bg-white relative">
        <BentoGrid />
      </section>

      <BeforeAfterSlider />

      {/* 5. VS Comparison */}
      <section className="px-5 md:px-10 py-12 bg-[#f8f9fc]">
        <div className="max-w-[1000px] mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-brand font-extrabold tracking-widest text-xs uppercase">Por que ControleJá</span>
            <h2 className="text-3xl md:text-[2.5rem] font-extrabold tracking-tight mt-3 text-slate-900 leading-tight">
              Simples por escolha. Não por falta de recurso.
            </h2>
          </div>

          <div className="relative grid md:grid-cols-2 gap-0 rounded-[2rem] shadow-[0_15px_50px_rgba(0,0,0,0.05)] border border-slate-100">
            
            {/* VS Badge */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-16 w-16 bg-white rounded-full shadow-lg border border-slate-100 flex items-center justify-center z-20 font-extrabold text-2xl text-slate-800">
              VS
            </div>

            <div className="bg-[#f1f5f9] p-10 md:p-14 rounded-t-[2rem] md:rounded-t-none md:rounded-l-[2rem]">
              <h3 className="font-extrabold text-xl mb-8 text-center text-slate-700">Outros sistemas</h3>
              <ul className="space-y-5 text-sm font-medium text-slate-600">
                {[
                  "Cadastro com 30 campos obrigatórios",
                  "Treinamento de 2 horas pra começar",
                  "Mensalidade que sobe sem aviso",
                  "Tela cheia de menu e relatório que ninguém usa",
                  "Suporte que demora dias pra responder",
                ].map((t) => (
                  <li key={t} className="flex gap-3 items-center">
                    <XCircle className="h-5 w-5 text-slate-400 shrink-0" /> {t}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#eef5ff] p-10 md:p-14 relative rounded-b-[2rem] md:rounded-b-none md:rounded-r-[2rem]">
              <h3 className="font-extrabold text-xl mb-8 text-center text-brand">ControleJá</h3>
              <ul className="space-y-5 text-sm font-bold text-slate-800">
                {[
                  "Cadastro em 4 campos: nome, preço, estoque, foto",
                  "Você usa em 1 minuto, sem treinamento",
                  "R$39,90/mês fixo. Sem reajuste surpresa",
                  "Só o que importa pro dia a dia da sua loja",
                  "Suporte direto no WhatsApp, todos os dias",
                ].map((t) => (
                  <li key={t} className="flex gap-3 items-center">
                    <Check className="h-5 w-5 text-brand shrink-0" /> {t}
                  </li>
                ))}
              </ul>

            </div>
          </div>
        </div>
      </section>

      {/* 6. Testimonials & Pricing Merged */}
      <section id="precos" className="px-5 md:px-10 py-12 bg-white">
        <div className="max-w-[1200px] mx-auto grid lg:grid-cols-2 gap-16 items-start">
          
          {/* Left: Testimonials */}
          <div>
            <span className="text-brand font-extrabold tracking-widest text-xs uppercase">O que dizem nossos clientes</span>
            <h2 className="text-3xl font-extrabold tracking-tight mt-3 mb-10 text-slate-900 leading-tight">
              Centenas de donos de loja dormindo mais tranquilos.
            </h2>
            
            <div className="space-y-6">
              <TestimonialCard 
                quote="O ControleJá mudou a forma como eu gerencio minha loja. Simples, rápido e funciona de verdade!"
                name="Juliana Santos"
                biz="Loja de Roupas"
              />
              <TestimonialCard 
                quote="Antes eu perdia muito tempo com planilha. Hoje tenho tudo na palma da mão e consigo vender muito mais."
                name="Carlos Oliveira"
                biz="Eletrônicos"
              />
            </div>
          </div>

          {/* Right: Pricing & Guarantee */}
          <div className="space-y-6">
            <GlowingCard>
              <div className="bg-[#f8f9fc] rounded-[2rem] p-10 border border-slate-100 shadow-sm relative overflow-hidden">
                <span className="text-slate-500 font-extrabold tracking-widest text-xs uppercase">Preço justo, sem surpresas</span>
                
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-brand font-bold text-xl">R$</span>
                  <span className="text-[4rem] font-extrabold text-slate-900 leading-none">39,90</span>
                  <span className="text-slate-500 font-bold">/mês</span>
                </div>
                
                <ul className="mt-8 space-y-4 text-sm font-semibold text-slate-700">
                  <li className="flex gap-3 items-center"><Check className="h-5 w-5 text-brand shrink-0" /> Acesso completo a todas as funcionalidades</li>
                  <li className="flex gap-3 items-center"><Check className="h-5 w-5 text-brand shrink-0" /> Sem fidelidade - cancele quando quiser</li>
                  <li className="flex gap-3 items-center"><Check className="h-5 w-5 text-brand shrink-0" /> Garantia de 7 dias ou seu dinheiro de volta</li>
                </ul>
                
                <Button asChild size="lg" className="w-full mt-10 h-14 rounded-xl text-lg font-bold bg-brand text-white shadow-lg hover:-translate-y-1 transition-transform">
                  <a href={WA_HIRE_URL}>Quero contratar agora <ArrowRight className="h-5 w-5 ml-2" /></a>
                </Button>
              </div>
            </GlowingCard>

            <div className="bg-[#eef5ff] rounded-2xl p-6 border border-brand/10 flex items-center justify-center gap-5">
              <ShieldCheck className="w-12 h-12 text-brand" />
              <div>
                <div className="font-extrabold text-lg text-slate-900 uppercase">Garantia de 7 dias</div>
                <div className="text-sm font-semibold text-slate-600">ou seu dinheiro de volta</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="px-5 md:px-10 py-16 bg-[#001f3f] text-white">
        <div className="max-w-[1200px] mx-auto grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <Logo size="sm" className="mb-4 [&_.text-foreground]:text-white [&_.text-muted-foreground]:text-white/50" />
            <p className="text-white/60 text-sm max-w-sm font-medium">
              Gestão simples de estoque e vendas para sua loja. Feito para pequenos negócios crescerem.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4 uppercase tracking-wider text-xs">Navegação</h4>
            <ul className="space-y-2 text-sm text-white/60 font-medium">
              <li><a href="#funcionalidades" className="hover:text-white">Funcionalidades</a></li>
              <li><a href="#como-funciona" className="hover:text-white">Como funciona</a></li>
              <li><a href="#precos" className="hover:text-white">Preços</a></li>
              <li><a href="#duvidas" className="hover:text-white">Dúvidas</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4 uppercase tracking-wider text-xs">Suporte</h4>
            <ul className="space-y-2 text-sm text-white/60 font-medium">
              <li><a href={WA_HELP_URL} className="hover:text-white">Falar no WhatsApp</a></li>
              <li><a href="#" className="hover:text-white">Central de ajuda</a></li>
              <li><a href="#" className="hover:text-white">Tutoriais</a></li>
              <li><a href="#" className="hover:text-white">Contato</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-[1200px] mx-auto mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/40 font-medium">
          <div>© {new Date().getFullYear()} ControleJá. Todos os direitos reservados.</div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-white">Termos de uso</a>
            <a href="#" className="hover:text-white">Política de privacidade</a>
          </div>
        </div>
      </footer>

      <WhatsAppFab />
    </div>
  );
}

/* ===== Components ===== */

function Feature({ icon: Icon, title, desc, tone = "brand" }: { icon: any; title: string; desc: string, tone?: "brand"|"warn"|"success"|"orange"|"red" }) {
  const tones = {
    brand: "bg-blue-100 text-blue-600",
    warn: "bg-yellow-100 text-yellow-600",
    success: "bg-green-100 text-green-600",
    orange: "bg-orange-100 text-orange-600",
    red: "bg-red-100 text-red-600",
  };
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all">
      <div className={cn("h-12 w-12 rounded-xl grid place-items-center mb-4", tones[tone])}>
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 font-medium leading-relaxed">{desc}</p>
    </div>
  );
}

function TestimonialCard({ quote, name, biz }: { quote: string; name: string; biz: string }) {
  return (
    <div className="bg-[#f8f9fc] rounded-2xl p-6 border border-slate-100">
      <div className="flex gap-1 mb-4 text-amber-400">
        {[0, 1, 2, 3, 4].map((i) => <Star key={i} className="h-4 w-4 fill-current" />)}
      </div>
      <p className="text-slate-700 font-medium text-sm leading-relaxed mb-6">"{quote}"</p>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-slate-200 grid place-items-center text-slate-500 font-bold overflow-hidden">
          <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${name}`} alt={name} className="w-full h-full object-cover" />
        </div>
        <div>
          <div className="font-bold text-slate-900 text-sm">{name}</div>
          <div className="text-xs text-slate-500 font-medium">{biz}</div>
        </div>
      </div>
    </div>
  );
}

function MockChrome({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-2xl overflow-hidden w-full max-w-[500px]">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50">
        <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
        <span className="ml-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">{label}</span>
      </div>
      {children}
    </div>
  );
}

function DashboardMockup() {
  return (
    <MockChrome label="controleja.app — Dashboard">
      <div className="flex h-[550px] w-full max-w-[950px] bg-slate-50 text-left relative overflow-hidden">
        {/* Fake Sidebar */}
        <div className="w-48 bg-white border-r border-slate-100 flex flex-col p-4 shrink-0 hidden md:flex">
          <div className="flex items-center gap-2 mb-8">
            <div className="h-6 w-6 rounded bg-brand flex items-center justify-center">
              <Package className="h-3 w-3 text-white" />
            </div>
            <div className="font-extrabold text-sm text-slate-800 tracking-tight">ControleJá</div>
          </div>
          <div className="space-y-1">
            <div className="h-8 rounded-lg bg-brand/10 border border-brand/20 flex items-center px-3 gap-2">
              <Compass className="h-3.5 w-3.5 text-brand" />
              <div className="h-2 w-16 bg-brand/40 rounded-full" />
            </div>
            {[Receipt, ShoppingCart, Users, Layers3, Wallet].map((Icon, i) => (
              <div key={i} className="h-8 rounded-lg hover:bg-slate-50 flex items-center px-3 gap-2">
                <Icon className="h-3.5 w-3.5 text-slate-400" />
                <div className="h-2 w-16 bg-slate-200 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Fake Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Fake Header */}
          <div className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-6 shrink-0">
            <div className="h-3 w-32 bg-slate-100 rounded-full" />
            <div className="flex items-center gap-3">
              <div className="h-7 w-24 bg-brand rounded-full" />
              <div className="h-7 w-7 rounded-full bg-slate-100" />
            </div>
          </div>
          
          {/* Dashboard Body */}
          <div className="p-6 space-y-6 flex-1 overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-extrabold text-slate-800 text-xl">Olá, Mariana 👋</div>
                <div className="text-xs text-slate-500 font-medium mt-1">Resumo das suas operações hoje</div>
              </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-16 w-16 text-green-500" />
                </div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Vendas hoje</div>
                <div className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight">R$ 3.248,50</div>
                <div className="text-xs text-green-500 font-bold mt-2 flex items-center gap-1"><ArrowRight className="h-3 w-3 -rotate-45" /> +15% que ontem</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                  <Package className="h-16 w-16 text-blue-500" />
                </div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Pedidos na fila</div>
                <div className="text-xl md:text-2xl font-extrabold text-slate-800">24</div>
                <div className="text-[10px] md:text-xs text-slate-400 font-bold mt-2 flex items-center gap-1">8 aguardando envio</div>
              </div>
              <div className="bg-red-50 rounded-xl p-4 border border-red-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                  <AlertTriangle className="h-16 w-16 text-red-500" />
                </div>
                <div className="text-[10px] text-red-600 font-bold uppercase tracking-wider mb-2">Estoque Crítico</div>
                <div className="text-xl md:text-2xl font-extrabold text-red-700">5 itens</div>
                <div className="text-[10px] md:text-xs text-red-500 font-bold mt-2 flex items-center gap-1">Precisam de reposição</div>
              </div>
            </div>

            {/* Charts & Tables Area */}
            <div className="grid grid-cols-3 gap-4 flex-1">
              {/* Fake Chart */}
              <div className="col-span-2 bg-white rounded-xl border border-slate-100 p-4 shadow-sm flex flex-col">
                <div className="text-xs font-bold text-slate-800 mb-4">Receita da Semana</div>
                <div className="flex-1 flex items-end justify-between gap-2 px-2">
                  {[40, 70, 45, 90, 65, 80, 100].map((height, i) => (
                    <div key={i} className="w-full bg-brand/10 hover:bg-brand/30 rounded-t-sm transition-colors relative group" style={{ height: `${height}%` }}>
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        R$ {(height * 120).toFixed(0)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Fake Recent Activity */}
              <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm flex flex-col">
                <div className="text-xs font-bold text-slate-800 mb-4">Últimas Ações</div>
                <div className="space-y-4 flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <div className="font-bold text-slate-700 text-xs">Camiseta básica — M</div>
                      <div className="text-[10px] text-slate-400 font-medium">Venda • há 2 min</div>
                    </div>
                    <div className="font-bold text-red-500 text-xs">-1</div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <div className="font-bold text-slate-700 text-xs">Caneca personalizada</div>
                      <div className="text-[10px] text-slate-400 font-medium">Compra • há 1h</div>
                    </div>
                    <div className="font-bold text-green-500 text-xs">+14</div>
                  </div>
                  <div className="flex items-center justify-between text-sm opacity-50">
                    <div>
                      <div className="font-bold text-slate-700 text-xs">Moleton Canguru</div>
                      <div className="text-[10px] text-slate-400 font-medium">Venda • há 3h</div>
                    </div>
                    <div className="font-bold text-red-500 text-xs">-2</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MockChrome>
  );
}

function SalesMockup() {
  return (
    <MockChrome label="controleja.app — Nova venda">
      <div className="p-5 grid grid-cols-1 gap-4 bg-white">
        <div className="rounded-lg border border-slate-200 px-3 py-2.5 flex items-center gap-2 text-sm bg-slate-50">
          <span className="text-slate-400">Buscar produto…</span>
        </div>
        <div className="space-y-2">
          {[
            { n: "Camiseta básica — M", q: 2, p: "59,90" },
            { n: "Caneca personalizada", q: 1, p: "39,90" },
            { n: "Cabo HDMI 2m", q: 1, p: "19,90" },
          ].map((it) => (
            <div key={it.n} className="flex items-center justify-between rounded-lg border border-slate-100 bg-white shadow-sm px-3 py-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded bg-slate-100"></div>
                <div>
                  <div className="font-bold text-slate-700 text-xs">{it.n}</div>
                  <div className="text-[10px] text-slate-400 font-medium">Qtd. {it.q} × R$ {it.p}</div>
                </div>
              </div>
              <div className="font-bold tabular-nums text-xs text-slate-700">R$ {(parseFloat(it.p.replace(",", ".")) * it.q).toFixed(2).replace(".", ",")}</div>
            </div>
          ))}
        </div>
        <div className="rounded-xl bg-green-500 text-white p-4 flex items-center justify-between mt-2 shadow-lg shadow-green-500/20">
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider opacity-90">Total da venda</div>
            <div className="text-xl font-extrabold tabular-nums">R$ 179,60</div>
          </div>
          <div className="px-4 py-2 rounded-lg bg-white text-green-600 text-sm font-bold">
            Finalizar
          </div>
        </div>
      </div>
    </MockChrome>
  );
}
