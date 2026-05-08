import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { createSignupCheckout } from "@/lib/payments.functions";
import { useAuth } from "@/lib/auth";
import { useSubscription } from "@/hooks/useSubscription";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { Logo } from "@/components/Logo";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Finalizar assinatura — ControleJá" }] }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { user, loading } = useAuth();
  const { isActive, loading: subLoading } = useSubscription();
  const navigate = useNavigate();
  const [stripePromise] = useState(() => getStripe());

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { mode: "register" } });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!subLoading && isActive) navigate({ to: "/dashboard" });
  }, [subLoading, isActive, navigate]);

  const options = useMemo(() => {
    if (!user) return null;
    return {
      fetchClientSecret: async () => {
        const secret = await createSignupCheckout({
          data: {
            email: user.email!,
            userId: user.id,
            returnUrl: `${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
            environment: getStripeEnvironment(),
          },
        });
        if (!secret) throw new Error("Falha ao criar sessão de pagamento");
        return secret;
      },
    };
  }, [user]);

  if (loading || subLoading || !user || !options) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PaymentTestModeBanner />
      <header className="border-b border-border px-5 py-4 flex items-center justify-between">
        <Logo />
        <span className="text-sm text-muted-foreground">{user.email}</span>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Ative sua conta ControleJá</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Primeiro mês <strong>R$ 139,90</strong> (R$ 39,90 + R$ 100,00 ativação) · Depois <strong>R$ 39,90/mês</strong>
          </p>
          <p className="text-xs text-muted-foreground mt-1">7 dias de garantia: reembolso integral se solicitar em até 7 dias.</p>
        </div>
        <div id="checkout" className="rounded-lg overflow-hidden border border-border bg-card">
          <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      </main>
    </div>
  );
}
