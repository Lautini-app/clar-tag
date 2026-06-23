import { supabase } from "@/integrations/supabase/client";

export const CLAR_SSO_PENDING_KEY = "clar_sso_pending";

const inIframe = typeof window !== "undefined" && (() => { try { return window.self !== window.top; } catch { return true; } })();

export function hasClarSsoPending(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : "";
    if (hash) {
      const hp = new URLSearchParams(hash);
      const hasShortForm = hp.get("at") && hp.get("rt");
      const hasLongForm =
        hp.get("type") === "clar_sso" && hp.get("access_token") && hp.get("refresh_token");
      if (hasShortForm || hasLongForm) return true;
    }
    if (sessionStorage.getItem(CLAR_SSO_PENDING_KEY) === "1") return true;
    return false;
  } catch {
    return false;
  }
}

export async function requestParentSession(): Promise<boolean> {
  if (!inIframe) return false;
  try {
    const tokens = await new Promise<{ access_token: string; refresh_token: string } | null>((resolve) => {
      const timeout = setTimeout(() => {
        window.removeEventListener("message", handler);
        resolve(null);
      }, 1500);
      function handler(e: MessageEvent) {
        if (!e.data || e.data.type !== "clar_session") return;
        window.removeEventListener("message", handler);
        clearTimeout(timeout);
        if (e.data.access_token && e.data.refresh_token) {
          resolve({ access_token: e.data.access_token, refresh_token: e.data.refresh_token });
        } else {
          resolve(null);
        }
      }
      window.addEventListener("message", handler);
      window.parent.postMessage({ type: "clar_request_session" }, "*");
    });
    if (!tokens) return false;
    const { error } = await supabase.auth.setSession(tokens);
    if (error) {
      console.error("[clar SSO] parent session setSession failed:", error);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[clar SSO] requestParentSession failed:", e);
    return false;
  }
}

export async function consumeClarHandoff(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : "";
    if (!hash) return false;

    let at: string | null = null;
    let rt: string | null = null;
    try {
      const params = new URLSearchParams(hash);
      at = params.get("at");
      rt = params.get("rt");
      if ((!at || !rt) && params.get("type") === "clar_sso") {
        at = params.get("access_token");
        rt = params.get("refresh_token");
      }
    } catch (e) {
      console.error("[clar SSO] could not parse hash", e);
      return false;
    }
    if (!at || !rt) return false;

    try {
      const cleanUrl = window.location.pathname + window.location.search;
      window.history.replaceState({}, "", cleanUrl);
    } catch (e) {
      console.error("[clar SSO] history.replaceState failed", e);
    }

    try {
      const { error } = await supabase.auth.setSession({
        access_token: at,
        refresh_token: rt,
      });
      if (error) {
        console.error("[clar SSO] setSession failed:", error);
        return false;
      }
      return true;
    } catch (e) {
      console.error("[clar SSO] setSession threw", e);
      return false;
    }
  } catch (e) {
    console.error("[clar SSO] consumeClarHandoff threw", e);
    return false;
  }
}
