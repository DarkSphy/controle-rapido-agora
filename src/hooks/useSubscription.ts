import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment } from "@/lib/stripe";
import { useAuth } from "@/lib/auth";

export type SubscriptionRow = {
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
  grandfathered: boolean;
  environment: string;
};

export function useSubscription() {
  const { user, loading: authLoading } = useAuth();
  const [sub, setSub] = useState<SubscriptionRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setSub(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    const env = getStripeEnvironment();

    async function fetchSub() {
      // Check grandfathered first (any env), then env-specific paid
      const { data } = await (supabase as any)
        .from("subscriptions")
        .select("status, current_period_end, cancel_at_period_end, grandfathered, environment")
        .eq("user_id", user!.id)
        .or(`grandfathered.eq.true,environment.eq.${env}`)
        .order("grandfathered", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!cancelled) {
        setSub((data as SubscriptionRow) ?? null);
        setLoading(false);
      }
    }
    fetchSub();

    const channel = supabase
      .channel(`subs-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "subscriptions", filter: `user_id=eq.${user.id}` }, fetchSub)
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [user, authLoading]);

  const isActive = !!sub && (
    sub.grandfathered ||
    (["active", "trialing", "past_due"].includes(sub.status) &&
      (!sub.current_period_end || new Date(sub.current_period_end) > new Date())) ||
    (sub.status === "canceled" && sub.current_period_end && new Date(sub.current_period_end) > new Date())
  );

  return { subscription: sub, isActive, loading: authLoading || loading };
}
