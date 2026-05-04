import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";

export function Logo({ className, showText = true, size = "md" }: { className?: string; showText?: boolean; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "h-7 w-7", md: "h-9 w-9", lg: "h-12 w-12" };
  const text = { sm: "text-base", md: "text-lg", lg: "text-2xl" };
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <img src={logo} alt="ControleJá" className={cn(sizes[size], "object-contain")} />
      {showText && (
        <span className={cn("font-bold tracking-tight", text[size])}>
          <span className="text-primary">Controle</span>
          <span className="text-brand">Já</span>
        </span>
      )}
    </div>
  );
}
