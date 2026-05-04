import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function SearchBar({
  value,
  onChange,
  placeholder = "Buscar produto...",
  size = "md",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  size?: "md" | "lg";
}) {
  return (
    <div className="relative w-full">
      <Search
        className={`absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground ${size === "lg" ? "h-5 w-5" : "h-4 w-4"}`}
      />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={size === "lg" ? "pl-12 h-14 text-lg" : "pl-9"}
      />
    </div>
  );
}

export function searchProducts<T extends { name: string; usage: number; createdAt: number }>(
  items: T[],
  query: string,
): T[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return [...items].sort((a, b) => b.usage - a.usage || b.createdAt - a.createdAt);
  }
  return items
    .filter((p) => p.name.toLowerCase().includes(q))
    .sort((a, b) => {
      const an = a.name.toLowerCase();
      const bn = b.name.toLowerCase();
      const aStarts = an.startsWith(q) ? 0 : 1;
      const bStarts = bn.startsWith(q) ? 0 : 1;
      if (aStarts !== bStarts) return aStarts - bStarts;
      return b.usage - a.usage;
    });
}
