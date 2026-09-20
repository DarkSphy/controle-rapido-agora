import { MessageCircle } from "lucide-react";

const WA_URL = "https://wa.me/5531973175882?text=" + encodeURIComponent("Gostaria de falar com o suporte humano.");

export function WhatsAppFab() {
  return (
    <a
      href={WA_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com o Suporte no WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 pr-5 pl-3 py-2.5 rounded-full bg-foreground text-background shadow-lg hover:-translate-y-1 transition-all duration-300 group"
    >
       <div className="relative h-12 w-12 rounded-full bg-brand flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
          <MessageCircle className="h-6 w-6 text-brand-foreground" aria-hidden="true" />
      </div>
      <div className="flex flex-col items-start">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 leading-tight group-hover:animate-pulse">
          Atendimento Humano
        </span>
        <span className="text-sm font-extrabold leading-none mt-0.5">
          Falar no WhatsApp
        </span>
      </div>
    </a>
  );
}
