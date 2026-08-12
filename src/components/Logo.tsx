import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";

export function Logo({ className, size = "md" }: { className?: string; showText?: boolean; size?: "sm" | "md" | "lg" }) {
  // Tamanhos maiores para destacar melhor a logo/mascote
  const containerSizes = { 
    sm: "h-14 px-3 py-2", 
    md: "h-20 px-4 py-2.5", 
    lg: "h-24 px-5 py-3" 
  };
  
  return (
    <div 
      className={cn(
        "flex items-center justify-center shrink-0 rounded-[1.25rem] bg-white shadow-sm border border-slate-200/60 dark:border-white/10 transition-all duration-300", 
        containerSizes[size], 
        className
      )}
    >
      <img 
        src={logo} 
        alt="ControleJá" 
        className="h-full w-auto object-contain shrink-0" 
      />
    </div>
  );
}
