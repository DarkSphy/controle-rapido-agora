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
    // Set up listener FIRST — never await inside the callback (deadlock risk)
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setLoading(false);
      if (s?.user) {
        // Defer Supabase calls outside the callback
        setTimeout(async () => {
          const { data } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", s.user.id)
            .maybeSingle();
          setRole((data as any)?.role ?? "operator");
        }, 0);
      } else {
        setRole(null);
      }
    });

    // THEN check existing session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
      if (data.session?.user) {
        setTimeout(async () => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", data.session!.user.id)
            .maybeSingle();
          setRole((profile as any)?.role ?? "operator");
        }, 0);
      }
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
