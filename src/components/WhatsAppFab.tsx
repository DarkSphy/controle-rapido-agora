import { MessageCircle } from "lucide-react";

const WA_URL = "https://wa.me/5531973175882?text=" + encodeURIComponent("Gostaria de tirar dúvidas sobre o produto.");

export function WhatsAppFab() {
  return (
    <a
      href={WA_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com o Suporte no WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 pr-5 pl-3 py-2.5 rounded-full bg-foreground text-background shadow-[0_10px_40px_rgba(0,0,0,0.15)] hover:shadow-[0_10px_50px_rgba(0,0,0,0.25)] hover:-translate-y-1 transition-all duration-300 group"
    >
      <div className="bg-[#25D366] h-10 w-10 rounded-full flex items-center justify-center text-white shadow-inner group-hover:scale-110 transition-transform">
        <MessageCircle className="h-5 w-5" />
      </div>
      <div className="flex flex-col items-start">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 leading-tight">
          Precisa de Ajuda?
        </span>
        <span className="text-sm font-extrabold leading-none mt-0.5">
          Falar com o Suporte
        </span>
      </div>
    </a>
  );
}
