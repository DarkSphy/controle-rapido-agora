import { useState } from "react";
import { ShoppingCart, Plus, Minus, X, Store, MapPin, MessageCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";
import { formatBRL } from "@/lib/store";

const mockProducts = [
  { id: "1", name: "Camiseta Básica Premium", description: "Algodão peruano, caimento perfeito.", price: 69.90, img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=400" },
  { id: "2", name: "Caneca Mágica Minimalista", description: "Muda de cor com líquido quente.", price: 45.00, img: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=400" },
  { id: "3", name: "Cabo USB-C Turbo", description: "Carregamento ultrarrápido, 2 metros.", price: 39.90, img: "https://images.unsplash.com/photo-1615526675159-e248c3021d3f?auto=format&fit=crop&q=80&w=400" },
  { id: "4", name: "Caderno Inteligente", description: "Folhas reposicionáveis, capa dura.", price: 99.90, img: "https://images.unsplash.com/photo-1531346878377-a541e4a113fb?auto=format&fit=crop&q=80&w=400" },
];

export function DemoCatalog() {
  const [cart, setCart] = useState<{product: typeof mockProducts[0], qty: number}[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);

  const cartTotal = cart.reduce((acc, item) => acc + (item.product.price * item.qty), 0);

  const addToCart = (product: typeof mockProducts[0]) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { product, qty: 1 }];
    });
    toast.success("Adicionado ao carrinho (Simulação)");
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.product.id === id) {
        return { ...i, qty: Math.max(1, i.qty + delta) };
      }
      return i;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.product.id !== id));
  };

  const finishSimulatedCheckout = () => {
    if (cart.length === 0) return toast.error("Seu carrinho está vazio.");
    toast.success("Redirecionando para o WhatsApp... (Simulação)", {
      description: "Na vida real, seu cliente enviaria um pedido lindo e formatado para o seu WhatsApp agora."
    });
    setSheetOpen(false);
  };

  const openSimulatedSupport = () => {
    toast.success("Abrindo WhatsApp... (Simulação)", {
      description: "Seu cliente abriria o WhatsApp para tirar dúvidas direto com você."
    });
  };

  return (
    <div className="h-[80vh] w-full bg-background rounded-xl overflow-hidden border border-border shadow-2xl relative flex flex-col font-sans selection:bg-brand selection:text-white" style={{ '--color-primary': '#38bdf8', '--color-brand': '#0284c7', '--color-background': '#f8fafc', '--color-card': '#ffffff' } as any}>
      {/* HEADER */}
      <header className="px-5 py-3 border-b border-border/50 bg-card/80 backdrop-blur-lg shadow-sm sticky top-0 z-40 transition-all">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand flex items-center justify-center text-white shadow-lg shadow-brand/30 shrink-0">
              <Store className="h-5 w-5" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-extrabold text-lg leading-tight">Boutique Demo</h1>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <MapPin className="h-3 w-3" />
                <span className="truncate">Rua da Simulação, 100</span>
              </div>
            </div>
          </div>
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button className="relative h-10 px-4 rounded-full bg-foreground text-background hover:bg-foreground/90 transition-all shadow-md">
                <ShoppingCart className="h-4 w-4 sm:mr-2" />
                <span className="font-semibold hidden sm:inline text-sm">Ver Carrinho</span>
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-brand text-white text-[10px] grid place-items-center font-bold border-2 border-card shadow-sm animate-in zoom-in">
                    {cart.reduce((s, i) => s + i.qty, 0)}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md flex flex-col h-full bg-card p-0 border-l-0 shadow-2xl">
              <SheetHeader className="p-5 border-b border-border/50 bg-muted/20">
                <SheetTitle className="text-lg font-bold flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-brand" /> Seu Carrinho
                </SheetTitle>
              </SheetHeader>
              
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground opacity-60">
                    <ShoppingCart className="h-12 w-12 mb-3" />
                    <p className="font-medium">Carrinho vazio</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map(item => (
                      <div key={item.product.id} className="flex gap-3 p-3 rounded-xl border border-border/50 bg-background shadow-sm relative group">
                        <img src={item.product.img} alt={item.product.name} className="w-16 h-16 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm truncate">{item.product.name}</h4>
                          <div className="font-bold text-brand mt-1">{formatBRL(item.product.price)}</div>
                          <div className="flex items-center rounded-lg border border-border bg-muted/50 mt-2 w-fit">
                            <button className="px-2 py-0.5 hover:bg-muted text-muted-foreground" onClick={() => updateQty(item.product.id, -1)}>
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="text-xs font-semibold px-2 min-w-[24px] text-center">{item.qty}</span>
                            <button className="px-2 py-0.5 hover:bg-muted text-muted-foreground" onClick={() => updateQty(item.product.id, 1)}>
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        <button onClick={() => removeFromCart(item.product.id)} className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-destructive">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-5 border-t border-border/50 bg-background shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-muted-foreground text-sm font-medium">Total</span>
                    <span className="text-2xl font-black text-foreground">{formatBRL(cartTotal)}</span>
                  </div>
                  <Button className="w-full h-12 text-base font-bold bg-[#25D366] hover:bg-[#128C7E] text-white" onClick={finishSimulatedCheckout}>
                    Enviar Pedido WhatsApp
                  </Button>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* SCROLLABLE MAIN */}
      <main className="flex-1 overflow-y-auto bg-muted/10 pb-20">
        {/* BANNER */}
        <div className="w-full overflow-hidden bg-brand">
          <div className="relative max-h-[250px] w-full">
            <img src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=1200" alt="Banner" className="w-full h-full object-cover aspect-[3/1] opacity-60 mix-blend-overlay" />
            <div className="absolute inset-0 flex items-center justify-center">
              <h2 className="text-white text-2xl md:text-4xl font-black drop-shadow-lg text-center px-4">
                Coleção de Inverno
              </h2>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-5 py-8 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-extrabold text-foreground">Destaques da Loja</h2>
            <p className="text-muted-foreground text-sm">Produtos selecionados para você</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {mockProducts.map(p => (
              <div key={p.id} className="group bg-card rounded-2xl overflow-hidden border border-border/50 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col hover:-translate-y-1">
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <img src={p.img} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                    <Button onClick={() => addToCart(p)} className="bg-brand text-white hover:bg-brand/90 hover:scale-105 transition-transform shadow-lg rounded-full h-10 px-5 text-sm">
                      <ShoppingCart className="mr-2 h-4 w-4" /> Adicionar
                    </Button>
                  </div>
                </div>
                
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-base leading-tight mb-1 group-hover:text-brand transition-colors line-clamp-1">{p.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 flex-1 mb-3">{p.description}</p>
                  
                  <div className="mt-auto flex items-end justify-between">
                    <div className="font-black text-xl text-foreground">{formatBRL(p.price)}</div>
                    <Button className="md:hidden h-8 w-8 rounded-full p-0 bg-foreground text-background" onClick={() => addToCart(p)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* FLOATING SUPPORT BUTTON */}
      <button 
        onClick={openSimulatedSupport}
        className="absolute bottom-6 right-6 z-50 flex items-center gap-2 pr-4 pl-3 py-2.5 rounded-full bg-foreground text-background shadow-xl hover:-translate-y-1 transition-all duration-300 group"
      >
        <div className="bg-[#25D366] h-8 w-8 rounded-full flex items-center justify-center text-white">
          <MessageCircle className="h-4 w-4" />
        </div>
        <div className="flex flex-col items-start hidden sm:flex">
          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/80 leading-none">Precisa de Ajuda?</span>
          <span className="text-xs font-extrabold leading-none mt-0.5">Suporte</span>
        </div>
      </button>
    </div>
  );
}
