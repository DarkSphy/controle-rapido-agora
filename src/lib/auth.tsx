import { createContext, useContext, useEffect, useState, useMemo, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthCtx = {
  user: User | null;
  session: Session | null;
  role: "admin" | "operator" | null;
  loading: boolean;
};

const Ctx = createContext<AuthCtx>({ user: null, session: null, role: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<"admin" | "operator" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, s) => {
      setSession(s);
      if (s?.user) {
        const { data } = await supabase.from("profiles").select("role").eq("id", s.user.id).single();
        setRole(data?.role ?? "operator");
      } else {
        setRole(null);
      }
      setLoading(false);
    });
    
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      if (data.session?.user) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.session.user.id).single();
        setRole(profile?.role ?? "operator");
      }
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const value = useMemo(() => ({
    user: session?.user ?? null,
    session,
    role,
    loading
  }), [session, role, loading]);

  return (
    <Ctx.Provider value={value}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
