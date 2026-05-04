import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({
    mode: s.mode === "register" ? "register" : "login",
  }),
  head: () => ({
    meta: [
      { title: "Entrar — ControleJá" },
      { name: "description", content: "Acesse sua conta ControleJá ou crie uma nova grátis." },
    ],
  }),
  component: AuthPage,
});

const schema = z.object({
  email: z.string().trim().email("E-mail inválido").max(255),
  password: z.string().min(6, "Mínimo 6 caracteres").max(72),
  name: z.string().trim().min(1, "Informe seu nome").max(100).optional(),
});

function AuthPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [mode, setMode] = useState<"login" | "register">(search.mode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/dashboard" });
  }, [user, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password, name: mode === "register" ? name : undefined });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setLoading(true);
    try {
      if (mode === "register") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { display_name: name },
          },
        });
        if (error) throw error;
        toast.success("Conta criada! Bem-vindo 🎉");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bem-vindo de volta!");
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao autenticar");
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/dashboard" });
    if (result.error) {
      toast.error("Erro com Google: " + (result.error as any)?.message);
      setLoading(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard" });
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
            {mode === "login" ? "Entrar na sua conta" : "Criar sua conta"}
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {mode === "login" ? "Bem-vindo de volta!" : "É grátis e leva menos de 1 minuto."}
          </p>

          <Button
            type="button"
            variant="outline"
            className="w-full mt-6 h-11"
            onClick={google}
            disabled={loading}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
            </svg>
            Continuar com Google
          </Button>

          <div className="flex items-center gap-3 my-6">
            <div className="h-px bg-border flex-1" />
            <span className="text-xs text-muted-foreground">ou com e-mail</span>
            <div className="h-px bg-border flex-1" />
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === "register" && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@exemplo.com" autoComplete="email" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" autoComplete={mode === "register" ? "new-password" : "current-password"} />
            </div>
            <Button type="submit" className="w-full h-11 mt-2" disabled={loading}>
              {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
            </Button>
          </form>

          <p className="text-sm text-center text-muted-foreground mt-6">
            {mode === "login" ? (
              <>
                Não tem conta?{" "}
                <button onClick={() => setMode("register")} className="text-brand-foreground font-semibold hover:underline">
                  Crie agora
                </button>
              </>
            ) : (
              <>
                Já tem conta?{" "}
                <button onClick={() => setMode("login")} className="text-brand-foreground font-semibold hover:underline">
                  Entre aqui
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
