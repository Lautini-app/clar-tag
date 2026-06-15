import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

const TOKEN_PARAM_KEYS = ["access_token", "refresh_token"] as const;
const REMOVED_AUTH_ROUTES = new Set(["/login", "/verbinden"]);

let tokenSessionBootstrap: Promise<void> | null = null;

function readTokenParams(): { access_token: string; refresh_token: string } | null {
  if (typeof window === "undefined") return null;

  const searchParams = new URLSearchParams(window.location.search);
  const hashParams = window.location.hash.startsWith("#")
    ? new URLSearchParams(window.location.hash.slice(1))
    : new URLSearchParams();

  const access_token = searchParams.get("access_token") ?? hashParams.get("access_token") ?? "";
  const refresh_token = searchParams.get("refresh_token") ?? hashParams.get("refresh_token") ?? "";

  if (!access_token && !refresh_token) return null;
  if (!access_token || !refresh_token) {
    console.warn("[auth] Incomplete token parameters received.");
    removeTokenParamsFromUrl();
    return null;
  }

  return { access_token, refresh_token };
}

function removeTokenParamsFromUrl(): void {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  for (const key of TOKEN_PARAM_KEYS) {
    url.searchParams.delete(key);
  }

  if (url.hash.startsWith("#")) {
    const rawHash = url.hash.slice(1);
    const hashParams = new URLSearchParams(rawHash);
    const hashHasToken = TOKEN_PARAM_KEYS.some((key) => hashParams.has(key));
    if (!hashHasToken) {
      const nextPath = REMOVED_AUTH_ROUTES.has(url.pathname)
        ? "/"
        : `${url.pathname}${url.search}${url.hash}`;
      window.history.replaceState(window.history.state, "", nextPath);
      return;
    }

    for (const key of TOKEN_PARAM_KEYS) {
      hashParams.delete(key);
    }
    url.hash = hashParams.toString() ? `#${hashParams.toString()}` : "";
  }

  const nextPath = REMOVED_AUTH_ROUTES.has(url.pathname)
    ? "/"
    : `${url.pathname}${url.search}${url.hash}`;
  window.history.replaceState(window.history.state, "", nextPath);
}

async function bootstrapTokenSession(): Promise<void> {
  if (typeof window === "undefined") return;
  if (tokenSessionBootstrap) return tokenSessionBootstrap;

  tokenSessionBootstrap = (async () => {
    const tokens = readTokenParams();
    if (!tokens) return;

    const { error } = await supabase.auth.setSession(tokens);
    removeTokenParamsFromUrl();

    if (error) {
      console.warn("[auth] Token session could not be applied.", error);
      await supabase.auth.signOut();
    }
  })();

  return tokenSessionBootstrap;
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Listener FIRST, then read existing session.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evt, s) => {
      setSession(s);
      setUser(s?.user ?? null);
    });

    bootstrapTokenSession()
      .then(() => supabase.auth.getSession())
      .then(({ data }) => {
        if (!mounted) return;
        setSession(data.session);
        setUser(data.session?.user ?? null);
      })
      .catch((error) => {
        console.warn("[auth] Session bootstrap failed.", error);
        if (!mounted) return;
        setSession(null);
        setUser(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { session, user, loading };
}

export async function signOut() {
  await supabase.auth.signOut();
}
