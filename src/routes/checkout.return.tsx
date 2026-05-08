import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";

export const Route = createFileRoute("/checkout/return")({
  validateSearch: (s: Record<string, unknown>): { session_id?: string } => ({
    session_id: typeof s.session_id === "string" ? s.session_id : undefined,
  }),
  head: () => ({ meta: [{ title: "Pagamento concluído — ControleJá" }] }),
  component: ReturnPage,
});

function ReturnPage() {
  const { isActive, loading } = useSubscription();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isActive) {
      const t = setTimeout(() => navigate({ to: "/dashboard" }), 1500);
      return () => clearTimeout(t);
    }
  }, [loading, isActive, navigate]);

  return (
    <div className="min-h-screen grid place-items-center px-4">
      <div className="text-center max-w-md">
        <Logo className="mx-auto mb-6" />
        {loading || !isActive ? (
          <>
            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold">Confirmando pagamento...</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Isso costuma levar alguns segundos. Se demorar, recarregue a página.
            </p>
          </>
        ) : (
          <>
            <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold">Pagamento confirmado!</h1>
            <p className="text-muted-foreground mt-2">Sua conta está ativa. Redirecionando...</p>
            <Button asChild className="mt-6"><Link to="/dashboard">Ir para o painel</Link></Button>
          </>
        )}
      </div>
    </div>
  );
}
