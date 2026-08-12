import mascot from "@/assets/controleja-mascot.png.asset.json";
import { cn } from "@/lib/utils";

const sizes = {
  sm: { box: "h-11 w-11", text: "text-xl", sub: "text-[9px]" },
  md: { box: "h-14 w-14", text: "text-2xl", sub: "text-[10px]" },
  lg: { box: "h-20 w-20", text: "text-4xl", sub: "text-[11px]" },
};

export function Logo({
  className,
  showText = true,
  size = "md",
}: {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const s = sizes[size];

  return (
    <div className={cn("flex items-center gap-3 shrink-0 select-none", className)}>
      <div
        className={cn(
          s.box,
          "relative shrink-0 rounded-[26%] overflow-hidden ring-1 ring-border/60 shadow-md transition-transform duration-300 hover:scale-105",
        )}
      >
        <img
          src={mascot.url}
          alt="ControleJá"
          className="h-full w-full object-cover"
          draggable={false}
        />
      </div>

      {showText && (
        <div className="min-w-0 leading-none">
          <div className={cn(s.text, "font-extrabold tracking-tight text-foreground")}>
            Controle<span className="text-brand">Já</span>
          </div>
          <div
            className={cn(
              s.sub,
              "mt-1 font-semibold uppercase tracking-[0.18em] text-muted-foreground",
            )}
          >
            Estoque simples
          </div>
        </div>
      )}
    </div>
  );
}
