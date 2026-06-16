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
import { Copy, ExternalLink, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth";

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
  const [font, setFont] = useState("Inter");
  const [primary, setPrimary] = useState("#2C3E50");
  const [accent, setAccent] = useState("#7FB69D");
  const [bannerUrl, setBannerUrl] = useState("");
  const [bannerText, setBannerText] = useState("");
  const [bannerEnabled, setBannerEnabled] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setWhatsapp(settings.whatsappNumber || "");
      setCompanyName(settings.companyName || "");
      setFont(settings.fontFamily || "Inter");
      setPrimary(settings.colors?.primary || "#2C3E50");
      setAccent(settings.colors?.accent || "#7FB69D");
      setBannerUrl(settings.bannerUrl || "");
      setBannerText(settings.bannerText || "");
      setBannerEnabled(settings.bannerEnabled || false);
    }
  }, [settings]);

  async function saveSettings() {
    if (!user) return;
    setSaving(true);
    const payload = {
      id: user.id,
      whatsapp_number: whatsapp,
      company_name: companyName,
      font_family: font,
      colors: { primary, accent, background: "#F9FBF9", card: "#FFFFFF" },
      banner_url: bannerUrl,
      banner_text: bannerText,
      banner_enabled: bannerEnabled,
    };
    
    const { error } = await supabase.from("catalog_settings").upsert(payload);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Configurações do catálogo salvas!");
      actions.loadAll(); // Reload settings
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
                <Label>WhatsApp para Receber Pedidos</Label>
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

            <div className="space-y-4 rounded-xl border border-border bg-card p-5 md:col-span-2">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg">Banner Promocional</h2>
                <Switch checked={bannerEnabled} onCheckedChange={setBannerEnabled} />
              </div>
              {bannerEnabled && (
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label>Texto do Banner</Label>
                    <Input value={bannerText} onChange={(e) => setBannerText(e.target.value)} placeholder="Ex: Frete Grátis nas compras acima de R$ 200" />
                  </div>
                  <div className="space-y-2">
                    <Label>URL da Imagem de Fundo (opcional)</Label>
                    <Input value={bannerUrl} onChange={(e) => setBannerUrl(e.target.value)} placeholder="Ex: https://img.com/banner.jpg" />
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={saveSettings} disabled={saving} size="lg">
              {saving ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="produtos">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
              <h2 className="font-semibold">Visibilidade dos Produtos</h2>
              <p className="text-sm text-muted-foreground">Selecione quais produtos da sua base aparecerão no catálogo online.</p>
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
