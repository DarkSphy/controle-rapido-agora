import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Product, Variation, CatalogSettings, formatBRL } from "@/lib/store";
import { ShoppingCart, Plus, Minus, X, Store, MapPin, MessageCircle, Info, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/c/$userId")({
  loader: async ({ params }) => {
    try {
      const [
        setsRes,
        prodsRes,
        varsRes,
        bizRes,
        catsRes,
      ] = await Promise.allSettled([
        supabase.from("catalog_settings").select("*").eq("id", params.userId).maybeSingle(),
        (supabase.from as any)("catalog_products_public").select("*").eq("user_id", params.userId),
        (supabase.from as any)("catalog_variations_public").select("*").eq("user_id", params.userId),
        (supabase.from as any)("business_settings_public").select("logo_url, name, address").eq("user_id", params.userId).maybeSingle(),
        (supabase.from as any)("catalog_categories_public").select("*").eq("user_id", params.userId),
      ]);

      const sets = setsRes.status === "fulfilled" ? setsRes.value.data : null;
      const prods = prodsRes.status === "fulfilled" ? prodsRes.value.data : [];
      const vars = varsRes.status === "fulfilled" ? varsRes.value.data : [];
      const biz = bizRes.status === "fulfilled" ? bizRes.value.data : null;
      const cats = catsRes.status === "fulfilled" ? catsRes.value.data : [];

      const settings: CatalogSettings = sets ? ({
        id: sets.id,
        whatsappNumber: sets.whatsapp_number || undefined,
        companyName: sets.company_name || biz?.name || undefined,
        address: (sets as any).address || biz?.address || undefined,
        description: (sets as any).description || undefined,
        banners: ((sets as any).banners as any) || [],
        colors: (sets.colors as any) || { primary: "#38bdf8", accent: "#0284c7", background: "#f8fafc", card: "#ffffff" },
        fontFamily: sets.font_family || "Inter",
        bannerUrl: sets.banner_url ?? undefined,
        bannerText: sets.banner_text ?? undefined,
        bannerEnabled: sets.banner_enabled || false,
        categories: cats || []
      } as any) : ({
        id: params.userId,
        bannerEnabled: false,
        whatsappNumber: undefined,
        companyName: biz?.name || undefined,
        address: biz?.address || undefined,
        colors: { primary: "#38bdf8", accent: "#0284c7", background: "#f8fafc", card: "#ffffff" },
        fontFamily: "Inter",
        banners: [],
        categories: cats || []
      } as any);

      const products: Product[] = (prods || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        image: p.image,
        cost: Number(p.price),
        margin: 0,
        stock: 0,
        minStock: 0,
        inCatalog: p.in_catalog,
        usage: 0,
        categoryId: p.category_id,
        createdAt: 0,
        variations: (vars || []).filter((v: any) => v.product_id === p.id).map((v: any) => ({
          id: v.id,
          name: v.name,
          stock: 0,
          cost: Number(v.price),
          margin: 0,
        }))
      }));

      return { settings, products, logoUrl: biz?.logo_url || null };
    } catch (e: any) {
      console.error("Error loading public catalog:", e);
      return {
        settings: {
          id: params.userId,
          bannerEnabled: false,
          colors: { primary: "#38bdf8", accent: "#0284c7", background: "#f8fafc", card: "#ffffff" },
          fontFamily: "Inter",
          banners: [],
          categories: []
        } as any,
        products: [],
        logoUrl: null
      };
    }
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
  const { settings, products, logoUrl } = Route.useLoaderData();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [descExpanded, setDescExpanded] = useState(false);

  // Checkout Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [cep, setCep] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");

  const safeHex = (v: any, fallback: string) =>
    typeof v === "string" && /^#[0-9a-fA-F]{3,8}$/.test(v) ? v : fallback;
  const safeFont = (v: any, fallback: string) =>
    typeof v === "string" && /^[a-zA-Z0-9 _-]{1,40}$/.test(v) ? v : fallback;
  const themeStyles = `
    .catalog-theme {
      --primary: ${safeHex(settings.colors?.primary, "#38bdf8")};
      --color-primary: ${safeHex(settings.colors?.primary, "#38bdf8")};
      --brand: ${safeHex(settings.colors?.accent, "#0284c7")};
      --color-brand: ${safeHex(settings.colors?.accent, "#0284c7")};
      --background: ${safeHex(settings.colors?.background, "#f8fafc")};
      --color-background: ${safeHex(settings.colors?.background, "#f8fafc")};
      --card: ${safeHex(settings.colors?.card, "#ffffff")};
      --color-card: ${safeHex(settings.colors?.card, "#ffffff")};
      --font-sans: '${safeFont(settings.fontFamily, "Inter")}', sans-serif;
    }
    body { background-color: var(--background); }
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

  function openSupport() {
    if (!settings.whatsappNumber) return toast.error("Suporte indisponível no momento.");
    const msg = `Olá! Estou vendo o catálogo e gostaria de tirar uma dúvida.`;
    const url = `https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  }

  const topBanners = (settings.banners as any[] | undefined)?.filter((b: any) => b.position === "top") || [];
  const middleBanners = (settings.banners as any[] | undefined)?.filter((b: any) => b.position === "middle") || [];
  const bottomBanners = (settings.banners as any[] | undefined)?.filter((b: any) => b.position === "bottom") || [];
  const categories = (settings as any).categories || [];

  const filteredProducts = products.filter((p: Product) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory ? p.categoryId === selectedCategory : true;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="catalog-theme min-h-screen bg-background text-foreground font-sans pb-24 relative selection:bg-brand selection:text-white">
      <style dangerouslySetInnerHTML={{ __html: themeStyles }} />
      
      {/* HEADER / NAVIGATION */}
      <header className="px-5 py-4 border-b border-border/50 bg-card/80 backdrop-blur-lg shadow-sm sticky top-0 z-40 transition-all duration-300">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-10 w-10 md:h-12 md:w-12 rounded-xl object-contain bg-white shadow-sm" />
            ) : (
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-brand flex items-center justify-center text-white shadow-lg shadow-brand/30">
                <Store className="h-5 w-5 md:h-6 md:w-6" />
              </div>
            )}
            <div>
              <h1 className="font-extrabold text-xl leading-tight">{settings.companyName || "Catálogo Online"}</h1>
              {settings.address && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate max-w-[200px] md:max-w-sm">{settings.address}</span>
                </div>
              )}
              {settings.description && (
                <div className="mt-1 max-w-sm">
                  <p className={cn("text-xs text-muted-foreground", !descExpanded && "line-clamp-2")}>
                    {settings.description}
                  </p>
                  {settings.description.length > 80 && (
                    <button 
                      onClick={() => setDescExpanded(!descExpanded)}
                      className="text-[10px] text-brand font-bold mt-1 hover:underline"
                    >
                      {descExpanded ? "Ler menos" : "Ler mais"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button className="relative h-10 w-10 sm:h-11 sm:w-auto sm:px-5 rounded-full bg-primary text-white hover:bg-primary/90 transition-all shadow-md hover:shadow-lg sm:hover:-translate-y-0.5 border-none flex items-center justify-center p-0 shrink-0">
                <ShoppingCart className="h-5 w-5 sm:mr-2" />
                <span className="font-semibold hidden sm:inline">Ver Carrinho</span>
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-brand text-white text-[10px] sm:text-xs grid place-items-center font-bold border-2 border-card shadow-sm animate-in zoom-in">
                    {cart.reduce((s, i) => s + i.quantity, 0)}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md flex flex-col h-full bg-card catalog-theme p-0 border-l-0 shadow-2xl">
              <SheetHeader className="p-6 border-b border-border/50 bg-muted/20">
                <SheetTitle className="text-xl font-bold flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-brand" /> Seu Carrinho
                </SheetTitle>
              </SheetHeader>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-none">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground opacity-60">
                    <ShoppingCart className="h-16 w-16 mb-4" />
                    <p className="text-lg font-medium">Seu carrinho está vazio</p>
                    <p className="text-sm">Adicione produtos para continuar</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {cart.map(item => {
                      const price = item.variation ? (item.variation.cost * (1 + item.variation.margin/100)) : (item.product.cost * (1 + item.product.margin/100));
                      return (
                        <div key={item.id} className="flex gap-4 p-4 rounded-2xl border border-border/50 bg-background shadow-sm relative group transition-all hover:border-brand/30">
                          {item.product.image ? (
                            <img src={item.product.image} alt={item.product.name} className="w-20 h-20 rounded-xl object-cover" />
                          ) : (
                            <div className="w-20 h-20 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                              <Store className="h-6 w-6 opacity-20" />
                            </div>
                          )}
                          <div className="flex-1">
                            <h4 className="font-bold text-sm line-clamp-2">{item.product.name}</h4>
                            {item.variation && <p className="text-xs text-muted-foreground mt-0.5">{item.variation.name}</p>}
                            <div className="font-bold text-brand mt-1">{formatBRL(price)}</div>
                            <div className="flex items-center gap-3 mt-3">
                              <div className="flex items-center rounded-lg border border-border bg-muted/50 overflow-hidden">
                                <button className="px-2 py-1 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" onClick={() => updateQty(item.id, -1)}>
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="text-xs font-semibold px-2 min-w-[24px] text-center">{item.quantity}</span>
                                <button className="px-2 py-1 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" onClick={() => updateQty(item.id, 1)}>
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                          <button onClick={() => removeCart(item.id)} className="absolute top-2 right-2 p-1.5 rounded-full text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors opacity-0 group-hover:opacity-100">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 border-t border-border/50 bg-background shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-muted-foreground">Total do Pedido</span>
                    <span className="text-2xl font-extrabold text-foreground">{formatBRL(cartTotal)}</span>
                  </div>

                  <div className="space-y-4 mb-6">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Dados de Entrega</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1 col-span-2">
                        <Label className="text-xs">Nome Completo</Label>
                        <Input value={name} onChange={e => setName(e.target.value)} className="h-9 text-sm" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Telefone / WhatsApp</Label>
                        <Input value={phone} onChange={e => setPhone(e.target.value)} className="h-9 text-sm" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">CEP</Label>
                        <Input value={cep} onChange={e => setCep(e.target.value)} className="h-9 text-sm" />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <Label className="text-xs">Rua / Avenida</Label>
                        <Input value={street} onChange={e => setStreet(e.target.value)} className="h-9 text-sm" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Número</Label>
                        <Input value={number} onChange={e => setNumber(e.target.value)} className="h-9 text-sm" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Complemento</Label>
                        <Input value={complement} onChange={e => setComplement(e.target.value)} className="h-9 text-sm" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Bairro</Label>
                        <Input value={neighborhood} onChange={e => setNeighborhood(e.target.value)} className="h-9 text-sm" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Cidade</Label>
                        <Input value={city} onChange={e => setCity(e.target.value)} className="h-9 text-sm" />
                      </div>
                    </div>
                  </div>

                  <Button className="w-full h-12 text-base font-bold bg-[#25D366] hover:bg-[#128C7E] text-white shadow-lg shadow-[#25D366]/30" onClick={checkout}>
                    Enviar Pedido pelo WhatsApp
                  </Button>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* STICKY SEARCH BAR */}
      <div className="sticky top-[73px] md:top-[81px] z-30 bg-background/95 backdrop-blur-md px-4 py-3 border-b border-border/50 shadow-sm">
        <div className="max-w-6xl mx-auto relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="O que você procura?" 
            className="pl-11 h-12 bg-card border-border/60 shadow-inner rounded-full text-base font-medium w-full focus-visible:ring-primary"
          />
        </div>
      </div>

      {/* TOP BANNERS */}
      {topBanners.length > 0 && (
        <div className="w-full overflow-hidden mb-6 bg-muted/10 border-b border-border/30">
          <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none">
            {topBanners.map((b: any, i: number) => (
              <div key={b.id || i} className="min-w-full snap-center flex-shrink-0 relative flex justify-center items-center">
                <picture className="w-full flex justify-center">
                  {b.mobileUrl && <source media="(max-width: 767px)" srcSet={b.mobileUrl} />}
                  <img 
                    src={b.url} 
                    alt="Banner" 
                    className="w-full h-auto max-h-[350px] md:max-h-[450px] object-contain mx-auto" 
                  />
                </picture>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* CATEGORIES BAR */}
      {categories.length > 0 && (
        <div className="bg-background border-b border-border/50 sticky top-[145px] md:top-[153px] z-20">
          <div className="max-w-6xl mx-auto px-5 py-2 flex overflow-x-auto gap-2 scrollbar-none snap-x">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                "snap-start whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors border",
                selectedCategory === null 
                  ? "bg-primary text-white border-primary" 
                  : "bg-card text-muted-foreground border-border hover:bg-muted"
              )}
            >
              Todos
            </button>
            {categories.map((c: any) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={cn(
                  "snap-start whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors border",
                  selectedCategory === c.id 
                    ? "bg-primary text-white border-primary" 
                    : "bg-card text-muted-foreground border-border hover:bg-muted"
                )}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-5 py-8 space-y-10">
        {/* STORE INFO (if no top banner or to reinforce) */}
        {settings.description && (
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h2 className="text-2xl md:text-3xl font-extrabold">Bem-vindo à {settings.companyName}</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">{settings.description}</p>
          </div>
        )}

        {/* PRODUCTS GRID */}
        <div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Store className="h-5 w-5 text-brand" /> Todos os Produtos
            </h3>
          </div>
          
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-3xl border border-border/50">
              <Search className="h-12 w-12 text-muted-foreground opacity-20 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">Nenhum produto encontrado.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((p: any) => {
                const price = p.cost * (1 + p.margin/100);
              const hasVariations = p.variations && p.variations.length > 0;
              
              return (
                <div key={p.id} className="group bg-card rounded-3xl overflow-hidden border border-border/50 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col hover:-translate-y-1">
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground opacity-30">
                        <Store className="h-12 w-12" />
                      </div>
                    )}
                    {/* Add to cart overlay for no-variation products */}
                    {!hasVariations && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                        <Button 
                          onClick={() => addToCart(p)}
                          className="bg-brand text-white hover:bg-brand/90 hover:scale-105 transition-transform shadow-lg rounded-full px-6 h-12"
                        >
                          <ShoppingCart className="mr-2 h-5 w-5" /> Adicionar
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-lg leading-tight mb-1 group-hover:text-brand transition-colors line-clamp-2">{p.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">{p.description}</p>
                    
                    {hasVariations ? (
                      <div className="space-y-3 mt-auto">
                        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                          <Info className="h-3 w-3" /> Opções disponíveis:
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {p.variations.map((v: any) => {
                            const vPrice = v.cost * (1 + v.margin/100);
                            return (
                              <div key={v.id} className="flex items-center justify-between p-2.5 rounded-xl border border-border/50 bg-muted/20 hover:border-brand/30 transition-colors">
                                <span className="text-sm font-medium">{v.name}</span>
                                <div className="flex items-center gap-3">
                                  <span className="font-bold text-brand">{formatBRL(vPrice)}</span>
                                  <Button size="icon" className="h-8 w-8 rounded-full bg-foreground text-background hover:bg-brand hover:text-white transition-colors" onClick={() => addToCart(p, v)}>
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-auto flex items-end justify-between">
                        <div className="font-black text-2xl text-foreground">{formatBRL(price)}</div>
                        <Button className="md:hidden h-10 w-10 rounded-full p-0 bg-foreground text-background" onClick={() => addToCart(p)}>
                          <Plus className="h-5 w-5" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            </div>
          )}
        </div>

        {/* MIDDLE BANNERS */}
        {middleBanners.length > 0 && (
          <div className="w-full overflow-hidden rounded-3xl shadow-lg border border-border/50 my-12 bg-muted/10">
             <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none">
              {middleBanners.map((b: any, i: number) => (
                <div key={b.id || i} className="min-w-full snap-center flex-shrink-0 relative flex justify-center items-center">
                  <picture className="w-full flex justify-center">
                    {b.mobileUrl && <source media="(max-width: 767px)" srcSet={b.mobileUrl} />}
                    <img src={b.url} alt="Banner" className="w-full h-auto max-h-[350px] object-contain rounded-3xl" />
                  </picture>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* BOTTOM BANNERS */}
        {bottomBanners.length > 0 && (
          <div className="w-full overflow-hidden rounded-3xl shadow-lg border border-border/50 mt-12 bg-muted/10">
             <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none">
              {bottomBanners.map((b: any, i: number) => (
                <div key={b.id || i} className="min-w-full snap-center flex-shrink-0 relative flex justify-center items-center">
                  <picture className="w-full flex justify-center">
                    {b.mobileUrl && <source media="(max-width: 767px)" srcSet={b.mobileUrl} />}
                    <img src={b.url} alt="Banner" className="w-full h-auto max-h-[350px] object-contain rounded-3xl" />
                  </picture>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-card border-t border-border mt-12 py-12 px-5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <h3 className="font-bold text-lg mb-2">{settings.companyName}</h3>
            {settings.address && <p className="text-sm text-muted-foreground max-w-sm">{settings.address}</p>}
          </div>
          <div className="text-xs text-muted-foreground flex flex-col items-center md:items-end gap-1">
            <span>Catálogo gerado por ControleJá</span>
            <span>&copy; {new Date().getFullYear()} Todos os direitos reservados.</span>
          </div>
        </div>
      </footer>

      {/* FLOATING SUPPORT BUTTON */}
      <button 
        onClick={openSupport}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center h-14 w-14 rounded-full bg-[#25D366] text-white shadow-[0_10px_40px_rgba(37,211,102,0.3)] hover:shadow-[0_10px_50px_rgba(37,211,102,0.4)] hover:-translate-y-1 transition-all duration-300 group"
        aria-label="Falar com o suporte"
      >
        <MessageCircle className="h-7 w-7 group-hover:scale-110 transition-transform" />
      </button>

    </div>
  );
}
