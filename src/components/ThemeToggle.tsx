import { useEffect, useState } from "react";
import { Sun, Moon, BookOpen } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ThemeMode = "light" | "dark" | "sepia";

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("app_theme") as ThemeMode;
      if (saved === "dark" || saved === "sepia" || saved === "light") return saved;
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
    }
    return "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "sepia");
    if (theme !== "light") {
      root.classList.add(theme);
    }
    localStorage.setItem("app_theme", theme);
  }, [theme]);

  const icons = {
    light: <Sun className="h-4 w-4 text-amber-500 transition-transform duration-300 group-hover:rotate-45" />,
    dark: <Moon className="h-4 w-4 text-sky-400 transition-transform duration-300 group-hover:-rotate-12" />,
    sepia: <BookOpen className="h-4 w-4 text-amber-700 dark:text-amber-400 transition-transform duration-300 group-hover:scale-110" />
  };

  const labels = {
    light: "Claro",
    dark: "Escuro",
    sepia: "Leitura"
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={cn(
            "h-9 px-3 rounded-full border-border/80 bg-card hover:bg-muted font-medium text-xs flex items-center gap-2 shadow-sm transition-all duration-300 group",
            className
          )}
        >
          {icons[theme]}
          <span className="capitalize hidden sm:inline">{labels[theme]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36 rounded-2xl p-1.5 shadow-xl border-border bg-card">
        <DropdownMenuItem 
          onClick={() => setTheme("light")}
          className={cn("flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl cursor-pointer transition-colors", theme === "light" && "bg-muted text-primary font-bold")}
        >
          <Sun className="h-4 w-4 text-amber-500" />
          <span>Modo Claro</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")}
          className={cn("flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl cursor-pointer transition-colors", theme === "dark" && "bg-muted text-primary font-bold")}
        >
          <Moon className="h-4 w-4 text-sky-400" />
          <span>Modo Escuro</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("sepia")}
          className={cn("flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl cursor-pointer transition-colors", theme === "sepia" && "bg-muted text-primary font-bold")}
        >
          <BookOpen className="h-4 w-4 text-amber-700" />
          <span>Modo Leitura</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
