import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/auth")({
  validateSearch: () => ({}),
  head: () => ({
    meta: [
      { title: "Entrar — ControleJá" },
      { name: "description", content: "Acesse sua conta ControleJá." },
    ],
  }),
  component: AuthPage,
});

const schema = z.object({
  email: z.string().trim().email("E-mail inválido").max(255),
  password: z.string().min(6, "Mínimo 6 caracteres").max(72),
});

function AuthPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/dashboard" });
  }, [user, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Bem-vindo de volta!");
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao autenticar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Left brand panel */}
      <div className="hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <Link to="/" className="flex items-center gap-2 text-primary-foreground hover:opacity-80">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <div>
          <Logo size="lg" showText={false} className="mb-6" />
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
            Seu estoque.<br />Seu negócio.<br /><span className="text-brand">No controle.</span>
          </h1>
          <p className="mt-4 text-primary-foreground/80 max-w-sm">
            Cadastre, movimente e venda — tudo com poucos cliques.
          </p>
        </div>
        <p className="text-xs text-primary-foreground/60">© {new Date().getFullYear()} ControleJá</p>
      </div>

      {/* Right form panel */}
      <div className="flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-sm">
          <div className="md:hidden mb-6">
            <Link to="/" className="text-sm text-muted-foreground inline-flex items-center gap-1 mb-4">
              <ArrowLeft className="h-4 w-4" /> Voltar
            </Link>
            <Logo />
          </div>

          <h2 className="text-2xl font-bold tracking-tight">
            Entrar na sua conta
          </h2>
          <p className="text-muted-foreground text-sm mt-1 mb-6">
            Bem-vindo de volta!
          </p>

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@exemplo.com" autoComplete="email" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Sua senha" autoComplete="current-password" />
            </div>
            <Button type="submit" className="w-full h-11 mt-2" disabled={loading}>
              {loading ? "Aguarde..." : "Entrar"}
            </Button>
          </form>

          <p className="text-sm text-center text-muted-foreground mt-8">
            Precisa de ajuda para acessar?{" "}
            <a href="https://wa.me/5531973175882?text=Preciso%20de%20ajuda%20para%20acessar%20minha%20conta" target="_blank" rel="noopener noreferrer" className="text-brand-foreground font-semibold hover:underline">
              Fale no WhatsApp
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
