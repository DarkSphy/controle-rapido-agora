import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useStore, actions } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Upload, Save, Building2 } from "lucide-react";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — ControleJá" },
      { name: "description", content: "Configurações do seu negócio e sistema." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const businessSettings = useStore((s) => s.businessSettings);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (businessSettings) {
      setName(businessSettings.name || "");
      setPhone(businessSettings.phone || "");
      setEmail(businessSettings.email || "");
      setAddress(businessSettings.address || "");
      setLogoUrl(businessSettings.logoUrl || "");
    }
  }, [businessSettings]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    await actions.updateBusinessSettings({
      name,
      phone,
      email,
      address,
      logoUrl,
    });
    setIsSaving(false);
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setIsUploading(true);
    const url = await actions.uploadLogo(file);
    setIsUploading(false);
    
    if (url) {
      setLogoUrl(url);
      // Auto save after upload
      await actions.updateBusinessSettings({ logoUrl: url });
    }
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-10 max-w-4xl mx-auto">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground text-sm mt-1">Personalize os dados da sua empresa para orçamentos e recibos.</p>
        </div>
      </header>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border bg-muted/20 flex items-center gap-3">
          <div className="bg-brand/10 p-2 rounded-lg text-brand">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Dados da Empresa</h2>
            <p className="text-sm text-muted-foreground">Estas informações aparecerão no cabeçalho dos PDFs.</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-6">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Empresa</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Minha Loja de Informática"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone / WhatsApp</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contato@empresa.com.br"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Endereço Completo</Label>
                <Textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Rua, Número, Bairro - Cidade / UF"
                  className="min-h-[80px]"
                />
              </div>
            </div>

            <div className="w-full md:w-64 space-y-4">
              <Label>Logo da Empresa</Label>
              <div className="border-2 border-dashed border-border rounded-xl p-4 flex flex-col items-center justify-center text-center aspect-square relative overflow-hidden group">
                {logoUrl ? (
                  <>
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Label htmlFor="logo-upload" className="cursor-pointer bg-white text-black px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                        <Upload className="h-4 w-4" /> Trocar
                      </Label>
                    </div>
                  </>
                ) : (
                  <div className="text-muted-foreground flex flex-col items-center gap-2">
                    <Building2 className="h-10 w-10 opacity-20" />
                    <span className="text-sm">Nenhuma logo adicionada</span>
                    <Label htmlFor="logo-upload" className="mt-2 cursor-pointer bg-brand text-brand-foreground px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 hover:bg-brand/90 transition-colors">
                      <Upload className="h-3 w-3" /> Fazer Upload
                    </Label>
                  </div>
                )}
                <input 
                  id="logo-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleLogoUpload}
                  disabled={isUploading}
                />
              </div>
              {isUploading && <p className="text-xs text-center text-muted-foreground animate-pulse">Enviando imagem...</p>}
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <Button type="submit" disabled={isSaving} className="w-full md:w-auto">
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
