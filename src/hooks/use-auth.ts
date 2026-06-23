import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { requestParentSession } from "@/lib/clar-sso";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_evt, s) => {
      setSession(s);
      setUser(s?.user ?? null);
    });

    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) {
        setSession(data.session);
        setUser(data.session.user);
        setLoading(false);
        return;
      }
      const ok = await requestParentSession();
      if (ok) {
        const refreshed = await supabase.auth.getSession();
        setSession(refreshed.data.session);
        setUser(refreshed.data.session?.user ?? null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { session, user, loading };
}

export async function signOut() {
  await supabase.auth.signOut();
}
