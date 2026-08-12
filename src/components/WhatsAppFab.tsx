import { MessageCircle } from "lucide-react";

const WA_URL = "https://wa.me/5531973175882?text=" + encodeURIComponent("Gostaria de falar com o suporte humano.");

export function WhatsAppFab() {
  return (
    <a
      href={WA_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com o Suporte no WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 pr-6 pl-3 py-3 rounded-full bg-white text-slate-900 shadow-[0_10px_40px_rgba(37,211,102,0.3)] hover:shadow-[0_10px_50px_rgba(37,211,102,0.5)] border-2 border-[#25D366] hover:-translate-y-2 hover:scale-105 transition-all duration-300 group"
    >
      <div className="relative h-12 w-12 rounded-full bg-[#25D366] text-white flex items-center justify-center overflow-hidden shrink-0 group-hover:rotate-12 transition-transform">
         {/* Ping animation underneath icon */}
         <div className="absolute inset-0 rounded-full animate-ping bg-white/30" />
         <MessageCircle className="h-6 w-6 relative z-10" />
      </div>
      <div className="flex flex-col items-start">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#25D366] leading-tight group-hover:animate-pulse">
          Atendimento Humano
        </span>
        <span className="text-sm font-extrabold leading-none mt-0.5">
          Falar no WhatsApp
        </span>
      </div>
    </a>
  );
}
