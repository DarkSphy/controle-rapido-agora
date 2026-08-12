import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useStore, Product, Kit, CatalogSettings, actions, formatBRL } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Copy, ExternalLink, Plus, Trash2, Image as ImageIcon, Monitor, Smartphone, Upload, Info } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { CatalogBanner } from "@/lib/store";

export const Route = createFileRoute("/catalogo")({
  head: () => ({
    meta: [
      { title: "Catálogo Online — ControleJá" },
      { name: "description", content: "Gerencie sua vitrine online, kits e receba pedidos no WhatsApp." },
    ],
  }),
  component: CatalogoPage,
});

function CatalogoPage() {
  const { user } = useAuth();
  const products = useStore((s) => s.products);
  const settings = useStore((s) => s.settings);
  const kits = useStore((s) => s.kits);

  const [whatsapp, setWhatsapp] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [font, setFont] = useState("Inter");
  const [primary, setPrimary] = useState("#2C3E50");
  const [accent, setAccent] = useState("#7FB69D");
  const [banners, setBanners] = useState<CatalogBanner[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  useEffect(() => {
    if (settings) {
      setWhatsapp(settings.whatsappNumber || "");
      setCompanyName(settings.companyName || "");
      setAddress(settings.address || "");
      setDescription(settings.description || "");
      setFont(settings.fontFamily || "Inter");
      setPrimary(settings.colors?.primary || "#2C3E50");
      setAccent(settings.colors?.accent || "#7FB69D");
      setBanners(settings.banners || []);
    }
  }, [settings]);

  async function saveSettings() {
    if (!user) return;
    setSaving(true);
    try {
      const cleanBanners = (banners || []).map(b => ({
        id: b.id || Math.random().toString(36).slice(2, 10),
        url: b.url || "",
        mobileUrl: b.mobileUrl || null,
        position: b.position || "top"
      }));

      const payload = {
        id: user.id,
        whatsapp_number: whatsapp || null,
        company_name: companyName || null,
        address: address || null,
        description: description || null,
        font_family: font || "Inter",
        colors: { 
          primary: primary || "#2C3E50", 
          accent: accent || "#7FB69D", 
          background: "#F9FBF9", 
          card: "#FFFFFF" 
        },
        banners: cleanBanners,
      };
      
      const { error } = await supabase.from("catalog_settings").upsert(payload);
      if (error) {
        toast.error("Erro ao salvar configurações: " + error.message);
      } else {
        toast.success("Configurações salvas com sucesso!");
        actions.loadAll();
      }
    } catch (err: any) {
      toast.error("Erro ao salvar: " + (err?.message || "HTTPError"));
    }
    setSaving(false);
  }

  function addNewBannerSlot() {
    setBanners(prev => [
      ...prev,
      { id: Math.random().toString(36).slice(2, 10), url: "", position: "top" }
    ]);
    toast.success("Novo banner criado! Adicione as imagens para Celular e Computador.");
  }

  async function handleDesktopBannerUpload(id: string, e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    toast.loading("Enviando imagem de Computador...", { id: "desktop-banner-upload" });
    const url = await actions.uploadImage(f, "catalog_images", "banner-desktop");
    if (url) {
      setBanners(prev => prev.map(b => b.id === id ? { ...b, url } : b));
      toast.success("Imagem para Computador adicionada!", { id: "desktop-banner-upload" });
    } else {
      toast.error("Erro ao enviar imagem.", { id: "desktop-banner-upload" });
    }
  }

  async function handleMobileBannerUpload(id: string, e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    toast.loading("Enviando imagem de Celular...", { id: "mobile-banner-upload" });
    const url = await actions.uploadImage(f, "catalog_images", "banner-mobile");
    if (url) {
      setBanners(prev => prev.map(b => b.id === id ? { ...b, mobileUrl: url } : b));
      toast.success("Imagem para Celular adicionada!", { id: "mobile-banner-upload" });
    } else {
      toast.error("Erro ao enviar imagem.", { id: "mobile-banner-upload" });
    }
  }

  function removeBanner(id: string) {
    setBanners(prev => prev.filter(b => b.id !== id));
  }

  function removeDesktopBanner(id: string) {
    setBanners(prev => prev.map(b => b.id === id ? { ...b, url: "" } : b));
  }

  function removeMobileBanner(id: string) {
    setBanners(prev => prev.map(b => b.id === id ? { ...b, mobileUrl: undefined } : b));
  }

  function updateBannerPosition(id: string, pos: "top" | "middle" | "bottom") {
    setBanners(prev => prev.map(b => b.id === id ? { ...b, position: pos } : b));
  }

  async function addAllProducts(inCatalog: boolean) {
    setSaving(true);
    toast.loading(inCatalog ? "Adicionando todos..." : "Removendo todos...", { id: "bulk-catalog" });
    try {
      const updates = products.map(p => actions.updateProduct(p.id, { inCatalog }));
      await Promise.all(updates);
      toast.success(inCatalog ? "Todos os produtos foram adicionados ao catálogo!" : "Todos os produtos foram removidos do catálogo!", { id: "bulk-catalog" });
    } catch (e: any) {
      toast.error("Erro ao atualizar: " + e.message, { id: "bulk-catalog" });
    }
    setSaving(false);
  }

  function copyLink() {
    if (!user) return;
    const url = `${window.location.origin}/c/${user.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado para a área de transferência!");
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-10 max-w-5xl mx-auto">
      <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Catálogo Online</h1>
          <p className="text-muted-foreground text-sm mt-1">Sua vitrine pública integrada com pedidos no WhatsApp</p>
        </div>
        {user && (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={copyLink}>
              <Copy className="h-4 w-4 mr-2" /> Copiar Link
            </Button>
            <Button asChild>
              <a href={`/c/${user.id}`} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" /> Visualizar
              </a>
            </Button>
          </div>
        )}
      </header>

      <Tabs defaultValue="geral" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="geral">Configurações</TabsTrigger>
          <TabsTrigger value="banners">Banners</TabsTrigger>
          <TabsTrigger value="produtos">Produtos</TabsTrigger>
          <TabsTrigger value="kits">Kits</TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4 rounded-xl border border-border bg-card p-5">
              <h2 className="font-semibold text-lg">Informações Principais</h2>
              <div className="space-y-2">
                <Label>Nome do Negócio</Label>
                <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Ex: Minha Loja" />
              </div>
              <div className="space-y-2">
                <Label>Endereço Físico</Label>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Ex: Rua das Flores, 123" />
              </div>
              <div className="space-y-2">
                <Label>Descrição da Loja</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Breve descrição da sua loja..." />
              </div>
              <div className="space-y-2">
                <Label>WhatsApp (Suporte / Pedidos)</Label>
                <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="Ex: 5511999999999" />
                <p className="text-xs text-muted-foreground">Inclua o código do país (55) e DDD. Apenas números.</p>
              </div>
            </div>

            <div className="space-y-4 rounded-xl border border-border bg-card p-5">
              <h2 className="font-semibold text-lg">Personalização Visual</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cor Principal</Label>
                  <div className="flex gap-2">
                    <Input type="color" value={primary} onChange={(e) => setPrimary(e.target.value)} className="w-12 p-1 h-9" />
                    <Input value={primary} onChange={(e) => setPrimary(e.target.value)} className="flex-1" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Cor de Destaque</Label>
                  <div className="flex gap-2">
                    <Input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} className="w-12 p-1 h-9" />
                    <Input value={accent} onChange={(e) => setAccent(e.target.value)} className="flex-1" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Fonte do Catálogo</Label>
                <select 
                  className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={font} 
                  onChange={(e) => setFont(e.target.value)}
                >
                  <option value="Inter">Inter (Padrão)</option>
                  <option value="Outfit">Outfit (Moderna)</option>
                  <option value="Playfair Display">Playfair Display (Elegante)</option>
                  <option value="Fredoka">Fredoka (Descontraída)</option>
                  <option value="Roboto">Roboto (Clássica)</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={saveSettings} disabled={saving} size="lg">
              {saving ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="banners" className="space-y-6">
          {/* BANNER SIZE TUTORIAL GUIDE */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 space-y-3">
            <div className="flex items-center gap-2 text-primary font-bold text-base">
              <Info className="h-5 w-5 shrink-0" />
              <span>Guia de Tamanhos Recomendados para Banners sem Cortar</span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              Para garantir que seus banners apareçam perfeitamente em qualquer dispositivo sem cortes indesejados, disponibilizamos o upload separado para Computador e Celular:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="bg-card border border-border/80 rounded-xl p-3.5 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Monitor className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wide text-foreground">Computador (Desktop)</h4>
                  <p className="text-sm font-semibold text-primary mt-0.5">1200 x 400 pixels <span className="text-xs font-normal text-muted-foreground">(Proporção 3:1)</span></p>
                  <p className="text-xs text-muted-foreground mt-1">Formato horizontal amplo ideal para telas grandes de PC e notebook.</p>
                </div>
              </div>

              <div className="bg-card border border-border/80 rounded-xl p-3.5 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wide text-foreground">Celular (Smartphone)</h4>
                  <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">800 x 800 pixels <span className="text-xs font-normal text-muted-foreground">(Proporção 1:1)</span> ou <span className="font-semibold">600 x 800</span></p>
                  <p className="text-xs text-muted-foreground mt-1">Formato vertical/quadrado otimizado para a tela em pé dos smartphones.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-semibold text-base">Banners do Catálogo</h2>
                <p className="text-xs text-muted-foreground">Gerencie imagens separadas para Celular e Computador para cada banner.</p>
              </div>
              <Button onClick={addNewBannerSlot} size="sm" className="bg-primary text-white hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-1.5" /> Adicionar Novo Banner
              </Button>
            </div>
            
            <div className="p-6 space-y-6">
              {banners.length === 0 ? (
                <div className="py-12 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center bg-muted/10 p-6 space-y-3">
                  <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
                  <div>
                    <h3 className="font-bold text-sm text-foreground">Nenhum banner cadastrado</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Clique no botão abaixo para criar um slot de banner com envio separado para Computador e Celular.</p>
                  </div>
                  <Button onClick={addNewBannerSlot} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" /> Adicionar Primeiro Banner
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {banners.map((b, index) => (
                    <div key={b.id} className="p-5 border rounded-2xl bg-card shadow-sm space-y-4 relative group">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
                        <div className="flex items-center gap-3">
                          <span className="h-6 px-2.5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                            Banner #{index + 1}
                          </span>
                          <div className="flex items-center gap-2">
                            <Label className="text-xs text-muted-foreground font-medium">Posição:</Label>
                            <select 
                              value={b.position}
                              onChange={(e) => updateBannerPosition(b.id, e.target.value as any)}
                              className="h-8 rounded-lg border border-input bg-background px-2.5 text-xs font-semibold shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                              <option value="top">Topo da Página (Destaque Principal)</option>
                              <option value="middle">Meio da Página</option>
                              <option value="bottom">Fim da Página</option>
                            </select>
                          </div>
                        </div>

                        <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 text-xs h-8" onClick={() => removeBanner(b.id)}>
                          <Trash2 className="h-3.5 w-3.5 mr-1" /> Excluir Este Banner
                        </Button>
                      </div>

                      {/* SIDE BY SIDE DESKTOP & MOBILE UPLOAD SLOTS */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* 🖥️ DESKTOP UPLOAD SLOT */}
                        <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs">
                              <Monitor className="h-4 w-4" />
                              <span>IMAGEM PARA COMPUTADOR (DESKTOP)</span>
                            </div>
                            <span className="text-[10px] font-semibold text-muted-foreground">1200 x 400 px</span>
                          </div>

                          {b.url ? (
                            <div className="space-y-2">
                              <div className="relative h-28 rounded-lg overflow-hidden border border-border bg-background flex items-center justify-center">
                                <img src={b.url} alt="Desktop" className="w-full h-full object-contain p-1" />
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <label className="cursor-pointer text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                                  <Upload className="h-3.5 w-3.5" /> Trocar Imagem Desktop
                                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleDesktopBannerUpload(b.id, e)} />
                                </label>
                                <button onClick={() => removeDesktopBanner(b.id)} className="text-xs text-destructive hover:underline">
                                  Remover
                                </button>
                              </div>
                            </div>
                          ) : (
                            <label className="h-28 rounded-lg border-2 border-dashed border-blue-500/30 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-500/10 transition text-center p-3">
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleDesktopBannerUpload(b.id, e)} />
                              <Upload className="h-6 w-6 text-blue-500 mb-1.5" />
                              <span className="text-xs font-bold text-foreground">Upload Imagem Computador</span>
                              <span className="text-[11px] text-muted-foreground">Clique para selecionar (1200 x 400)</span>
                            </label>
                          )}
                        </div>

                        {/* 📱 MOBILE UPLOAD SLOT */}
                        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                              <Smartphone className="h-4 w-4" />
                              <span>IMAGEM PARA CELULAR (MOBILE)</span>
                            </div>
                            <span className="text-[10px] font-semibold text-muted-foreground">800 x 800 px</span>
                          </div>

                          {b.mobileUrl ? (
                            <div className="space-y-2">
                              <div className="relative h-28 rounded-lg overflow-hidden border border-border bg-background flex items-center justify-center">
                                <img src={b.mobileUrl} alt="Mobile" className="w-full h-full object-contain p-1" />
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <label className="cursor-pointer text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
                                  <Upload className="h-3.5 w-3.5" /> Trocar Imagem Celular
                                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleMobileBannerUpload(b.id, e)} />
                                </label>
                                <button onClick={() => removeMobileBanner(b.id)} className="text-xs text-destructive hover:underline">
                                  Remover
                                </button>
                              </div>
                            </div>
                          ) : (
                            <label className="h-28 rounded-lg border-2 border-dashed border-emerald-500/30 flex flex-col items-center justify-center cursor-pointer hover:bg-emerald-500/10 transition text-center p-3">
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleMobileBannerUpload(b.id, e)} />
                              <Upload className="h-6 w-6 text-emerald-500 mb-1.5" />
                              <span className="text-xs font-bold text-foreground">Upload Imagem Celular</span>
                              <span className="text-[11px] text-muted-foreground">Clique para selecionar (800 x 800)</span>
                            </label>
                          )}
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={saveSettings} disabled={saving} size="lg">
              {saving ? "Salvando..." : "Salvar Banners"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="produtos">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-semibold">Visibilidade dos Produtos</h2>
                <p className="text-sm text-muted-foreground">Selecione quais produtos da sua base aparecerão no catálogo online.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => addAllProducts(true)} disabled={saving}>
                  Adicionar Todos
                </Button>
                <Button variant="outline" size="sm" onClick={() => addAllProducts(false)} disabled={saving}>
                  Remover Todos
                </Button>
              </div>
            </div>
            <div className="divide-y divide-border max-h-[60vh] overflow-y-auto">
              {products.length === 0 && (
                <div className="p-8 text-center text-muted-foreground text-sm">Nenhum produto cadastrado no estoque.</div>
              )}
              {products.map(p => (
                <div key={p.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    {p.image ? (
                      <img src={p.image} className="w-12 h-12 rounded-md object-cover border border-border" />
                    ) : (
                      <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground">Sem foto</div>
                    )}
                    <div>
                      <h3 className="font-medium">{p.name}</h3>
                      <p className="text-sm text-muted-foreground">{formatBRL(p.cost * (1 + p.margin/100))} — Estoque: {p.stock}</p>
                    </div>
                  </div>
                  <Switch 
                    checked={p.inCatalog} 
                    onCheckedChange={(c) => actions.updateProduct(p.id, { inCatalog: c })} 
                  />
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="kits">
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <h2 className="font-semibold text-lg mb-2">Gerenciamento de Kits</h2>
            <p className="text-muted-foreground mb-6">Em breve! Estamos terminando de empacotar essa funcionalidade.</p>
            {/* O gerenciamento de kits será adicionado em um passo subsequente para não sobrecarregar este arquivo. */}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
