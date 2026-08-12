import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";

export function Logo({ className, size = "md" }: { className?: string; showText?: boolean; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "h-9 w-auto", md: "h-12 w-auto", lg: "h-16 w-auto" };
  return (
    <div className={cn("flex items-center", className)}>
      <img src={logo} alt="ControleJá" className={cn(sizes[size], "object-contain shrink-0")} />
    </div>
  );
}
