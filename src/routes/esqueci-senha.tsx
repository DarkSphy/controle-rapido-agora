import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, MailCheck } from "lucide-react";

export const Route = createFileRoute("/esqueci-senha")({
  head: () => ({
    meta: [
      { title: "Recuperar senha — ControleJá" },
      { name: "description", content: "Receba um link por e-mail para redefinir a senha da sua conta ControleJá." },
      { property: "og:title", content: "Recuperar senha — ControleJá" },
      { property: "og:description", content: "Receba um link por e-mail para redefinir a senha da sua conta ControleJá." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ForgotPasswordPage,
});

const schema = z.object({ email: z.string().trim().email("E-mail inválido").max(255) });

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ email });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
      toast.success("Link enviado! Confira seu e-mail.");
    } catch (err: any) {
      toast.error(err?.message ?? "Não foi possível enviar o e-mail");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-10 bg-background">
      <div className="w-full max-w-sm">
        <Link to="/auth" className="text-sm text-muted-foreground inline-flex items-center gap-1 mb-6">
          <ArrowLeft className="h-4 w-4" /> Voltar para o login
        </Link>
        <Logo />

        {sent ? (
          <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-center">
            <MailCheck className="h-8 w-8 mx-auto text-brand mb-3" />
            <h1 className="text-xl font-bold">Verifique seu e-mail</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Enviamos um link de redefinição para <strong>{email}</strong>. O link expira em pouco tempo — nenhum
              dado da sua conta é alterado até você criar a nova senha.
            </p>
            <p className="text-xs text-muted-foreground mt-3">
              Não achou o e-mail? Verifique a caixa de spam ou promoções.
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold tracking-tight mt-8">Esqueceu sua senha?</h1>
            <p className="text-muted-foreground text-sm mt-1 mb-6">
              Informe seu e-mail e enviaremos um link para criar uma nova senha. Funciona para qualquer conta, inclusive
              as que foram criadas com o Google. Seus produtos, vendas e clientes permanecem intactos.
            </p>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@exemplo.com"
                  autoComplete="email"
                />
              </div>
              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? "Enviando..." : "Enviar link de recuperação"}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
