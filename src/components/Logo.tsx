import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";

export function Logo({ className, showText = true, size = "md" }: { className?: string; showText?: boolean; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "h-12 w-12", md: "h-16 w-16", lg: "h-24 w-24" };
  const text = { sm: "text-lg", md: "text-2xl", lg: "text-4xl" };
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <img src={logo} alt="ControleJá" className={cn(sizes[size], "object-contain scale-[1.35]")} />
      {showText && (
        <span className={cn("font-bold tracking-tight ml-1", text[size])}>
          <span className="text-primary">Controle</span>
          <span className="text-brand">Já</span>
        </span>
      )}
    </div>
  );
}
