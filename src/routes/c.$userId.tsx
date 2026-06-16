import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Product, Variation, CatalogSettings, formatBRL } from "@/lib/store";
import { ShoppingCart, Plus, Minus, X, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/c/$userId")({
  loader: async ({ params }) => {
    const [
      { data: sets },
      { data: prods },
      { data: vars },
    ] = await Promise.all([
      supabase.from("catalog_settings").select("*").eq("id", params.userId).maybeSingle(),
      supabase.from("products").select("*").eq("user_id", params.userId).eq("in_catalog", true),
      supabase.from("variations").select("*").eq("user_id", params.userId)
    ]);
    
    const settings: CatalogSettings = sets ? {
      id: sets.id,
      whatsappNumber: sets.whatsapp_number,
      companyName: sets.company_name,
      colors: sets.colors || { primary: "#38bdf8", accent: "#0284c7", background: "#f8fafc", card: "#ffffff" },
      fontFamily: sets.font_family || "Inter",
      bannerUrl: sets.banner_url,
      bannerText: sets.banner_text,
      bannerEnabled: sets.banner_enabled || false,
    } : {
      id: params.userId,
      bannerEnabled: false,
      colors: { primary: "#38bdf8", accent: "#0284c7", background: "#f8fafc", card: "#ffffff" },
      fontFamily: "Inter"
    };

    const products: Product[] = (prods || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      image: p.image,
      cost: Number(p.cost),
      margin: Number(p.margin),
      stock: p.stock,
      minStock: p.min_stock,
      inCatalog: p.in_catalog,
      usage: p.usage,
      createdAt: new Date(p.created_at).getTime(),
      variations: (vars || []).filter((v: any) => v.product_id === p.id).map((v: any) => ({
        id: v.id,
        name: v.name,
        stock: v.stock,
        cost: Number(v.cost),
        margin: Number(v.margin),
      }))
    }));

    return { settings, products };
  },
  component: CatalogPage
});

type CartItem = {
  id: string;
  product: Product;
  variation?: Variation;
  quantity: number;
};

function CatalogPage() {
  const { settings, products } = Route.useLoaderData();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Checkout Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [cep, setCep] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");

  const themeStyles = `
    .catalog-theme {
      --color-primary: ${settings.colors?.primary};
      --color-brand: ${settings.colors?.accent};
      --color-background: ${settings.colors?.background};
      --color-card: ${settings.colors?.card};
      --font-sans: '${settings.fontFamily}', sans-serif;
    }
    body { background-color: var(--color-background); }
  `;

  function addToCart(product: Product, variation?: Variation) {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id && i.variation?.id === variation?.id);
      if (existing) {
        return prev.map(i => i.id === existing.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { id: Math.random().toString(), product, variation, quantity: 1 }];
    });
    toast.success("Adicionado ao carrinho");
  }

  function removeCart(id: string) {
    setCart(prev => prev.filter(i => i.id !== id));
  }

  function updateQty(id: string, delta: number) {
    setCart(prev => prev.map(i => {
      if (i.id === id) {
        const n = Math.max(1, i.quantity + delta);
        return { ...i, quantity: n };
      }
      return i;
    }));
  }

  const cartTotal = cart.reduce((sum, item) => {
    const price = item.variation ? (item.variation.cost * (1 + item.variation.margin/100)) : (item.product.cost * (1 + item.product.margin/100));
    return sum + (price * item.quantity);
  }, 0);

  function checkout() {
    if (!settings.whatsappNumber) return toast.error("WhatsApp não configurado pelo lojista.");
    if (!name || !phone || !street || !number || !neighborhood || !city) {
      return toast.error("Por favor, preencha todos os campos obrigatórios do endereço.");
    }
    
    let msg = `*Novo Pedido - ${settings.companyName || 'Catálogo'}*\n\n`;
    msg += `*Cliente:* ${name} (${phone})\n`;
    msg += `*Endereço:* ${street}, ${number} ${complement ? '- ' + complement : ''}\n`;
    msg += `${neighborhood}, ${city}\nCEP: ${cep}\n\n`;
    msg += `*Itens do Pedido:*\n`;
    
    cart.forEach(item => {
      const price = item.variation ? (item.variation.cost * (1 + item.variation.margin/100)) : (item.product.cost * (1 + item.product.margin/100));
      const subtotal = price * item.quantity;
      msg += `- ${item.quantity}x ${item.product.name}${item.variation ? ' (' + item.variation.name + ')' : ''} - ${formatBRL(subtotal)}\n`;
    });
    
    msg += `\n*Total:* ${formatBRL(cartTotal)}\n`;
    
    const url = `https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  }

  return (
    <div className="catalog-theme min-h-screen bg-background text-foreground font-sans pb-24">
      <style dangerouslySetInnerHTML={{ __html: themeStyles }} />
      
      {settings.bannerEnabled && (
        <div className="w-full bg-primary text-primary-foreground text-center py-2 px-4 text-sm font-medium relative overflow-hidden flex items-center justify-center">
          {settings.bannerUrl && (
            <div className="absolute inset-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: `url(${settings.bannerUrl})` }} />
          )}
          <span className="relative z-10">{settings.bannerText}</span>
        </div>
      )}

      <header className="px-5 py-4 border-b border-border bg-card shadow-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="h-6 w-6 text-brand" />
            <h1 className="font-bold text-xl">{settings.companyName || "Catálogo Online"}</h1>
          </div>
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="relative h-10 px-4 rounded-full border-brand text-brand hover:bg-brand hover:text-brand-foreground transition-all shadow-sm">
                <ShoppingCart className="h-4 w-4 mr-2" />
                <span className="font-semibold">Carrinho</span>
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs grid place-items-center font-bold">
                    {cart.reduce((s, i) => s + i.quantity, 0)}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md flex flex-col h-full bg-card catalog-theme p-0">
              <SheetHeader className="p-5 border-b border-border">
                <SheetTitle>Seu Carrinho</SheetTitle>
              </SheetHeader>
              
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {cart.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    Seu carrinho está vazio.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map(item => {
                      const price = item.variation ? (item.variation.cost * (1 + item.variation.margin/100)) : (item.product.cost * (1 + item.product.margin/100));
                      return (
                        <div key={item.id} className="flex gap-3 pb-4 border-b border-border last:border-0">
                          {item.product.image ? (
                            <img src={item.product.image} className="w-16 h-16 rounded-md object-cover border border-border" />
                          ) : (
                            <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center text-[10px] text-muted-foreground">Sem foto</div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{item.product.name}</h4>
                            {item.variation && <p className="text-xs text-muted-foreground">{item.variation.name}</p>}
                            <div className="font-bold text-primary mt-1">{formatBRL(price)}</div>
                            <div className="flex items-center gap-3 mt-2">
                              <div className="flex items-center border border-border rounded-md">
                                <button onClick={() => updateQty(item.id, -1)} className="px-2 py-1 text-muted-foreground hover:bg-muted"><Minus className="h-3 w-3" /></button>
                                <span className="text-xs font-medium px-2 min-w-6 text-center">{item.quantity}</span>
                                <button onClick={() => updateQty(item.id, 1)} className="px-2 py-1 text-muted-foreground hover:bg-muted"><Plus className="h-3 w-3" /></button>
                              </div>
                              <button onClick={() => removeCart(item.id)} className="text-xs text-destructive hover:underline">Remover</button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {cart.length > 0 && (
                  <div className="pt-4 space-y-4">
                    <h3 className="font-bold text-lg border-b border-border pb-2">Dados de Entrega</h3>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1"><Label className="text-xs">Nome *</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
                        <div className="space-y-1"><Label className="text-xs">Celular *</Label><Input value={phone} onChange={e => setPhone(e.target.value)} /></div>
                      </div>
                      <div className="grid grid-cols-[1fr_2fr] gap-3">
                        <div className="space-y-1"><Label className="text-xs">CEP</Label><Input value={cep} onChange={e => setCep(e.target.value)} /></div>
                        <div className="space-y-1"><Label className="text-xs">Rua *</Label><Input value={street} onChange={e => setStreet(e.target.value)} /></div>
                      </div>
                      <div className="grid grid-cols-[80px_1fr] gap-3">
                        <div className="space-y-1"><Label className="text-xs">Nº *</Label><Input value={number} onChange={e => setNumber(e.target.value)} /></div>
                        <div className="space-y-1"><Label className="text-xs">Complemento</Label><Input value={complement} onChange={e => setComplement(e.target.value)} /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1"><Label className="text-xs">Bairro *</Label><Input value={neighborhood} onChange={e => setNeighborhood(e.target.value)} /></div>
                        <div className="space-y-1"><Label className="text-xs">Cidade *</Label><Input value={city} onChange={e => setCity(e.target.value)} /></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-5 border-t border-border bg-card/80 backdrop-blur">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-muted-foreground font-medium">Total:</span>
                    <span className="text-2xl font-black text-primary">{formatBRL(cartTotal)}</span>
                  </div>
                  <Button onClick={checkout} className="w-full h-12 text-lg font-semibold bg-brand text-brand-foreground hover:bg-brand/90 shadow-lg">
                    Finalizar no WhatsApp
                  </Button>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 py-10">
        {products.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Store className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <h2 className="text-xl font-medium">Nenhum produto disponível</h2>
            <p className="mt-2">O lojista ainda não adicionou produtos ao catálogo.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(p => {
              const price = priceFromCostMargin(p.cost, p.margin);
              const hasVars = p.variations.length > 0;
              return (
                <div key={p.id} className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col group">
                  <div className="aspect-square bg-muted relative overflow-hidden">
                    {p.image ? (
                      <img src={p.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">Sem imagem</div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-lg mb-1 line-clamp-1">{p.name}</h3>
                    {p.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">{p.description}</p>
                    )}
                    
                    {!hasVars ? (
                      <div className="mt-auto pt-4 flex items-center justify-between">
                        <span className="font-black text-primary text-xl">{formatBRL(price)}</span>
                        <Button size="sm" className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90" onClick={() => addToCart(p)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="mt-auto pt-4 space-y-3">
                        <span className="font-black text-primary text-xl block">A partir de {formatBRL(Math.min(...p.variations.map(v => v.cost * (1+v.margin/100))))}</span>
                        <div className="grid grid-cols-2 gap-2">
                          {p.variations.map(v => {
                            const vPrice = v.cost * (1 + v.margin/100);
                            return (
                              <Button key={v.id} variant="outline" size="sm" className="flex flex-col h-auto py-1.5 px-2 border-border text-xs" onClick={() => addToCart(p, v)}>
                                <span className="font-medium truncate w-full">{v.name}</span>
                                <span className="text-brand font-bold">{formatBRL(vPrice)}</span>
                              </Button>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
