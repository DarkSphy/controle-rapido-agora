import { cn } from "@/lib/utils";

const sizes = {
  sm: { box: "h-10 w-10", text: "text-xl", sub: "text-[9px]" },
  md: { box: "h-12 w-12", text: "text-2xl", sub: "text-[10px]" },
  lg: { box: "h-16 w-16", text: "text-4xl", sub: "text-[11px]" },
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
          "relative shrink-0 overflow-hidden transition-transform duration-300 hover:scale-105",
        )}
      >
        <img
          src="/simbi-mark.svg"
          alt="Simbi"
          className="h-full w-full object-contain"
          draggable={false}
        />
      </div>

      {showText && (
        <div className="min-w-0 leading-none">
          <div className={cn(s.text, "font-extrabold tracking-tight text-foreground")}>
            Simbi
          </div>
          <div
            className={cn(
              s.sub,
              "mt-1 font-semibold uppercase tracking-[0.18em] text-muted-foreground",
            )}
          >
            Gestão simples
          </div>
        </div>
      )}
    </div>
  );
}
