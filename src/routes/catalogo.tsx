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
    const payload = {
      id: user.id,
      whatsapp_number: whatsapp,
      company_name: companyName,
      address,
      description,
      font_family: font,
      colors: { primary, accent, background: "#F9FBF9", card: "#FFFFFF" },
      banners: banners,
    };
    
    // Check if session is valid by just doing upsert (supabase client handles auto-refresh usually)
    const { error } = await supabase.from("catalog_settings").upsert(payload);
    if (error) {
      toast.error("Erro ao salvar: " + error.message);
    } else {
      toast.success("Configurações do catálogo salvas!");
      actions.loadAll(); // Reload settings
    }
    setSaving(false);
  }

  async function handleBannerUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploadingBanner(true);
    const url = await actions.uploadImage(f, "catalog_images", "banner");
    if (url) {
      setBanners(prev => [...prev, { id: Math.random().toString(), url, position: "top" }]);
    }
    setUploadingBanner(false);
  }

  async function handleMobileBannerUpload(id: string, e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    toast.loading("Enviando versão mobile...", { id: "mobile-banner-upload" });
    const url = await actions.uploadImage(f, "catalog_images", "banner-mobile");
    if (url) {
      setBanners(prev => prev.map(b => b.id === id ? { ...b, mobileUrl: url } : b));
      toast.success("Versão mobile adicionada!", { id: "mobile-banner-upload" });
    } else {
      toast.error("Erro ao enviar imagem mobile.", { id: "mobile-banner-upload" });
    }
  }

  function removeBanner(id: string) {
    setBanners(prev => prev.filter(b => b.id !== id));
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
            <div className="p-4 border-b border-border bg-muted/30">
              <h2 className="font-semibold">Banners Rotativos</h2>
              <p className="text-sm text-muted-foreground">Adicione banners e configure versões dedicadas para celular e computador.</p>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <label className="flex-shrink-0 h-36 w-full md:w-64 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition relative overflow-hidden group">
                  <input type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} disabled={uploadingBanner} />
                  {uploadingBanner ? (
                    <div className="flex flex-col items-center gap-2">
                      <span className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
                      <span className="text-xs text-muted-foreground font-medium">Enviando...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground p-4 text-center">
                      <ImageIcon className="h-8 w-8 opacity-50 group-hover:scale-110 transition text-primary" />
                      <span className="text-xs font-bold text-foreground">Adicionar Novo Banner</span>
                      <span className="text-[11px] text-muted-foreground">Clique para escolher a imagem principal (Computador)</span>
                    </div>
                  )}
                </label>
                
                <div className="flex-1 space-y-4">
                  {banners.length === 0 && (
                    <div className="h-36 flex items-center justify-center border rounded-xl border-dashed bg-muted/20 text-muted-foreground text-sm">
                      Nenhum banner configurado. Adicione o primeiro no botão ao lado.
                    </div>
                  )}
                  {banners.map((b) => (
                    <div key={b.id} className="flex flex-col gap-4 p-4 border rounded-xl bg-card shadow-sm">
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-3 border-b border-border/50">
                        <div className="flex-1 space-y-1">
                          <Label className="text-xs text-muted-foreground font-semibold">Posição na Página</Label>
                          <select 
                            value={b.position}
                            onChange={(e) => updateBannerPosition(b.id, e.target.value as any)}
                            className="flex h-9 w-full md:w-64 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                          >
                            <option value="top">Topo da Página (Destaque Principal)</option>
                            <option value="middle">Meio da Página</option>
                            <option value="bottom">Fim da Página</option>
                          </select>
                        </div>
                        <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 self-end md:self-auto" onClick={() => removeBanner(b.id)}>
                          <Trash2 className="h-4 w-4 mr-1" /> Excluir Banner
                        </Button>
                      </div>

                      {/* DUAL IMAGE UPLOAD (DESKTOP & MOBILE) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* DESKTOP VERSION */}
                        <div className="space-y-2 bg-muted/20 p-3 rounded-lg border border-border/40">
                          <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                            <span className="flex items-center gap-1.5"><Monitor className="h-3.5 w-3.5 text-blue-500" /> Imagem Computador (1200x400)</span>
                          </div>
                          <div className="relative h-24 rounded-lg overflow-hidden border bg-background flex items-center justify-center">
                            <img src={b.url} alt="Banner Computador" className="w-full h-full object-contain" />
                          </div>
                        </div>

                        {/* MOBILE VERSION */}
                        <div className="space-y-2 bg-muted/20 p-3 rounded-lg border border-border/40">
                          <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                            <span className="flex items-center gap-1.5"><Smartphone className="h-3.5 w-3.5 text-emerald-500" /> Imagem Celular (800x800)</span>
                            {b.mobileUrl && (
                              <button onClick={() => removeMobileBanner(b.id)} className="text-[11px] text-destructive hover:underline">
                                Usar mesma do PC
                              </button>
                            )}
                          </div>
                          <div className="relative h-24 rounded-lg overflow-hidden border bg-background flex items-center justify-center">
                            {b.mobileUrl ? (
                              <img src={b.mobileUrl} alt="Banner Celular" className="w-full h-full object-contain" />
                            ) : (
                              <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-muted/40 transition">
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  className="hidden" 
                                  onChange={(e) => handleMobileBannerUpload(b.id, e)} 
                                />
                                <Upload className="h-4 w-4 text-emerald-500 mb-1" />
                                <span className="text-xs text-muted-foreground font-medium text-center">Enviar para Celular</span>
                              </label>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
