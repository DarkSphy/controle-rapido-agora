import logo from "@/assets/logo-cropped.png";
import { cn } from "@/lib/utils";

export function Logo({ className, size = "md" }: { className?: string; showText?: boolean; size?: "sm" | "md" | "lg" }) {
  // Tamanhos originais ajustados para um logo que já é um retângulo perfeito
  const sizes = { sm: "h-12 w-auto", md: "h-16 w-auto", lg: "h-20 w-auto" };
  
  return (
    <div className={cn("flex items-center justify-center shrink-0 transition-all duration-300", className)}>
      <img 
        src={logo} 
        alt="ControleJá" 
        className={cn(sizes[size], "object-contain shrink-0 drop-shadow-sm")} 
      />
    </div>
  );
}
