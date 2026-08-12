import React, { useState, useEffect, useRef } from 'react';
import { cn } from "@/lib/utils";
import { ArrowRight, Package, TrendingUp, Users, ShoppingCart, Activity } from 'lucide-react';

/* 1. Logo Ticker */
export function LogoTicker() {
  const logos = ["TechStore", "Moda Viva", "Global Parts", "Empório", "AutoShop", "Boutique", "Móveis & Cia", "TechStore", "Moda Viva", "Global Parts", "Empório", "AutoShop"];
  return (
    <div className="w-full bg-slate-50 border-y border-slate-200 py-6 overflow-hidden">
      <p className="text-center text-sm font-bold text-slate-500 mb-6 uppercase tracking-wider">Confiado por mais de 500 lojistas em todo o Brasil</p>
      <div className="relative w-full overflow-hidden flex">
        <div className="flex w-max animate-marquee space-x-16 px-8">
          {logos.map((logo, i) => (
            <div key={i} className="text-2xl font-black text-slate-300/70 hover:text-slate-800 transition-colors duration-300 cursor-default whitespace-nowrap">
              {logo}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* 2. Animated Counters */
function useIntersectionObserver(ref: React.RefObject<Element>, options: IntersectionObserverInit = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsIntersecting(true);
        observer.disconnect();
      }
    }, options);
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, options]);
  return isIntersecting;
}

export function AnimatedCounters() {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(ref, { threshold: 0.1 });

  return (
    <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-8 py-16 max-w-[1000px] mx-auto px-6">
      <Counter end={2000000} duration={2000} suffix="+" label="Vendas registradas" isVisible={isVisible} formatter={(n) => (n / 1000000).toFixed(1) + "M"} />
      <Counter end={100} duration={2000} suffix="%" label="Controle de estoque" isVisible={isVisible} />
      <Counter end={0} duration={1000} suffix="" label="Planilhas complexas" isVisible={isVisible} />
    </div>
  );
}

function Counter({ end, duration, suffix, label, isVisible, formatter }: any) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    let startTimestamp: number;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeProgress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [isVisible, end, duration]);

  const displayValue = formatter ? formatter(count) : count;

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter mb-2">
        {displayValue}{suffix}
      </div>
      <div className="text-sm md:text-base font-bold text-brand uppercase tracking-widest">{label}</div>
    </div>
  );
}

/* 3. Before After Slider */
export function BeforeAfterSlider() {
  const [sliderPos, setSliderPos] = useState(50);

  return (
    <div className="w-full max-w-[1000px] mx-auto py-24 px-5">
      <div className="text-center mb-12">
        <span className="text-brand font-extrabold tracking-widest text-sm uppercase">Chega de Caos</span>
        <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mt-3 leading-tight">Organização em um arrastar de dedos.</h2>
        <p className="text-slate-600 font-medium mt-4 max-w-2xl mx-auto">Compare como é gerenciar sua loja hoje vs com o ControleJá.</p>
      </div>

      <div className="relative w-full aspect-[4/3] md:aspect-[16/9] bg-slate-200 rounded-3xl overflow-hidden shadow-2xl select-none group">
        {/* Antes (Caos) */}
        <div className="absolute inset-0 bg-[#e2e8f0] flex flex-col items-center justify-center p-8">
          <div className="text-center opacity-40 transform -rotate-12 scale-125">
             <div className="text-8xl font-black mb-4">CAOS</div>
             <div className="font-mono text-xl whitespace-pre">planilha_final_v3_VERDADEIRA.xlsx</div>
             <div className="font-mono text-xl whitespace-pre mt-2">Caderno de Fiapo</div>
             <div className="font-mono text-xl whitespace-pre mt-2">Post-its Perdidos</div>
          </div>
        </div>
        
        {/* Depois (ControleJá) */}
        <div 
          className="absolute inset-0 bg-white overflow-hidden border-r-4 border-brand"
          style={{ width: \`\${sliderPos}%\` }}
        >
           <div className="absolute inset-0 w-full min-w-[800px] h-full flex flex-col">
             <div className="h-14 bg-slate-50 border-b border-slate-100 flex items-center px-6 gap-4">
                <div className="h-4 w-4 bg-red-400 rounded-full" />
                <div className="h-4 w-4 bg-amber-400 rounded-full" />
                <div className="h-4 w-4 bg-emerald-400 rounded-full" />
                <div className="ml-4 h-6 w-48 bg-white rounded-md border border-slate-200" />
             </div>
             <div className="p-8 grid grid-cols-4 gap-6 h-full bg-[#f8f9fc]">
               <div className="col-span-1 space-y-4">
                 <div className="h-10 bg-brand rounded-lg w-full" />
                 <div className="h-10 bg-slate-200 rounded-lg w-full" />
                 <div className="h-10 bg-slate-200 rounded-lg w-full" />
               </div>
               <div className="col-span-3 space-y-6">
                 <div className="grid grid-cols-3 gap-6">
                   <div className="h-24 bg-white rounded-xl shadow-sm border border-slate-100" />
                   <div className="h-24 bg-white rounded-xl shadow-sm border border-slate-100" />
                   <div className="h-24 bg-white rounded-xl shadow-sm border border-slate-100" />
                 </div>
                 <div className="h-48 bg-white rounded-xl shadow-sm border border-slate-100 w-full" />
               </div>
             </div>
           </div>
        </div>

        {/* Control */}
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={sliderPos} 
          onChange={(e) => setSliderPos(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
        />
        
        {/* Custom thumb */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10 pointer-events-none flex items-center justify-center transition-all duration-75"
          style={{ left: \`\${sliderPos}%\`, transform: 'translateX(-50%)' }}
        >
          <div className="h-10 w-10 bg-brand text-white rounded-full shadow-lg flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
            <ArrowRight className="h-5 w-5" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* 4. Bento Grid */
export function BentoGrid() {
  return (
    <div className="max-w-[1200px] mx-auto py-24 px-5">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-brand font-extrabold tracking-widest text-xs uppercase">Bento Box</span>
        <h2 className="text-3xl md:text-[2.5rem] font-extrabold tracking-tight mt-3 text-slate-900 leading-tight">
          Tudo conectado.<br/>De um jeito lindo.
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">
        
        {/* Item 1 - Insights */}
        <div className="md:col-span-2 rounded-3xl bg-slate-900 overflow-hidden relative group p-8 flex flex-col justify-end isolate">
          <div className="absolute inset-0 bg-gradient-to-tr from-brand/20 to-transparent -z-10 opacity-50 group-hover:opacity-100 transition-opacity" />
          <div className="absolute top-8 right-8 text-brand bg-brand/10 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-500">
             <TrendingUp className="h-8 w-8" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Insights Inteligentes</h3>
          <p className="text-slate-400 font-medium max-w-md">Gráficos que se mexem junto com suas vendas. Descubra os produtos mais lucrativos em tempo real.</p>
        </div>

        {/* Item 2 - PDV */}
        <div className="rounded-3xl bg-brand overflow-hidden relative group p-8 flex flex-col justify-end isolate">
          <div className="absolute -top-12 -right-12 text-white/10 group-hover:rotate-12 transition-transform duration-500">
             <ShoppingCart className="h-48 w-48" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">PDV Jato</h3>
          <p className="text-white/80 font-medium">Balcão super rápido para não deixar fila.</p>
        </div>

        {/* Item 3 - Estoque */}
        <div className="rounded-3xl bg-white border-2 border-slate-100 overflow-hidden relative group p-8 flex flex-col justify-end isolate shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-xl transition-shadow">
          <div className="absolute top-8 right-8 text-rose-500 bg-rose-500/10 px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wider group-hover:animate-pulse">
             Alerta
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Aviso de Estoque</h3>
          <p className="text-slate-500 font-medium">Saiba quando repor antes de faltar.</p>
        </div>

        {/* Item 4 - Clientes */}
        <div className="md:col-span-2 rounded-3xl bg-emerald-500 overflow-hidden relative group p-8 flex flex-col justify-end isolate">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
          <div className="absolute top-8 right-8 flex -space-x-4 group-hover:scale-110 transition-transform duration-500">
             <div className="h-12 w-12 rounded-full bg-emerald-700 border-2 border-emerald-500" />
             <div className="h-12 w-12 rounded-full bg-emerald-800 border-2 border-emerald-500" />
             <div className="h-12 w-12 rounded-full bg-emerald-900 border-2 border-emerald-500 flex items-center justify-center text-white font-bold text-xs">+1k</div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Gestão de Clientes</h3>
          <p className="text-emerald-100 font-medium max-w-md">Histórico completo de quem compra com você. Fale no WhatsApp com 1 clique.</p>
        </div>

      </div>
    </div>
  );
}

/* 5. Glowing Pricing Wrapper */
export function GlowingCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative group rounded-3xl">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-brand via-purple-500 to-emerald-500 rounded-3xl blur opacity-60 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-spin-slow" />
      <div className="relative bg-white rounded-3xl h-full">
        {children}
      </div>
    </div>
  );
}
