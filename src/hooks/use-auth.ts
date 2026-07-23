import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

function hasSupabaseEnv() {
  const hasValue = (value: unknown) =>
    typeof value === "string" &&
    value.trim() !== "" &&
    value !== "undefined" &&
    value !== "null";

  return hasValue(import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL) &&
    hasValue(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.SUPABASE_PUBLISHABLE_KEY);
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasSupabaseEnv()) {
      setLoading(false);
      return;
    }

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return { session, user, loading };
}
