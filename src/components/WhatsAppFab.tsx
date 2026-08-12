import mascotDoubt from "@/assets/mascot-doubt.png.asset.json";

const WA_URL = "https://wa.me/5531973175882?text=" + encodeURIComponent("Gostaria de falar com o suporte humano.");

export function WhatsAppFab() {
  return (
    <a
      href={WA_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com o Suporte no WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 pr-5 pl-3 py-2.5 rounded-full bg-foreground text-background shadow-[0_10px_40px_rgba(0,0,0,0.15)] hover:shadow-[0_10px_50px_rgba(0,0,0,0.25)] hover:-translate-y-2 hover:scale-105 transition-all duration-300 group"
    >
      <div className="relative h-12 w-12 rounded-full bg-brand/10 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-transform">
         {/* Ping animation underneath icon */}
         <div className="absolute inset-0 rounded-full animate-ping bg-brand/20" />
         
         <img
          src={mascotDoubt.url}
          alt=""
          aria-hidden
          draggable={false}
          className="h-11 w-11 object-contain select-none relative z-10"
        />
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
