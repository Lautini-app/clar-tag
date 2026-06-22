// Embedded-Shell-Contract for clar.tag
//
// The web app can run inside a native shell (iOS/Android WebView, or a
// hosting iframe). The shell owns the user session; this app receives it
// over a bidirectional message channel.
//
// Detection (any of):
//   - URL query: `?clar_embedded=1`
//   - `window.ReactNativeWebView` exists (React Native WKWebView/Android)
//   - `window.clarShell` exists (web shell injects this hook)
//
// Messages (envelope: { type: string; payload?: unknown }):
//
//   Shell → App (inbound):
//     clar:session   payload: { access_token: string; refresh_token: string }
//     clar:signout   payload: none
//
//   App → Shell (outbound):
//     clar:ready          App booted, listener attached
//     clar:needs-session  No session present, shell should provide one
//     clar:signed-in      payload: { userId: string }
//     clar:signed-out     payload: none

import type { SupabaseClient } from "@supabase/supabase-js";
type AnySupabaseClient = SupabaseClient<any, any, any, any, any>;

type ClarMessageType =
  | "clar:session"
  | "clar:signout"
  | "clar:ready"
  | "clar:needs-session"
  | "clar:signed-in"
  | "clar:signed-out";

interface ClarMessage<T = unknown> {
  type: ClarMessageType;
  payload?: T;
}

interface SessionPayload {
  access_token: string;
  refresh_token: string;
}

interface ClarShell {
  postMessage: (msg: string) => void;
}

declare global {
  interface Window {
    ReactNativeWebView?: ClarShell;
    clarShell?: ClarShell;
  }
}

/** True when the app is running inside a clar shell (native or web). */
export function isEmbeddedShell(): boolean {
  if (typeof window === "undefined") return false;
  if (window.ReactNativeWebView) return true;
  if (window.clarShell) return true;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("clar_embedded") === "1") return true;
  } catch {
    // ignore
  }
  return false;
}

function postToShell<T>(msg: ClarMessage<T>): void {
  if (typeof window === "undefined") return;
  const payload = JSON.stringify(msg);
  try {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(payload);
      return;
    }
    if (window.clarShell) {
      window.clarShell.postMessage(payload);
      return;
    }
    // Web iframe fallback: post to parent
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(payload, "*");
    }
  } catch (err) {
    console.warn("[clar:shell] postToShell failed", err);
  }
}

export function signalShellReady(): void {
  postToShell({ type: "clar:ready" });
}

export function signalNeedsSession(): void {
  postToShell({ type: "clar:needs-session" });
}

export function signalSignedIn(userId: string): void {
  postToShell({ type: "clar:signed-in", payload: { userId } });
}

export function signalSignedOut(): void {
  postToShell({ type: "clar:signed-out" });
}

function parseInbound(data: unknown): ClarMessage | null {
  try {
    const raw = typeof data === "string" ? JSON.parse(data) : data;
    if (!raw || typeof raw !== "object") return null;
    const msg = raw as { type?: unknown; payload?: unknown };
    if (typeof msg.type !== "string" || !msg.type.startsWith("clar:")) return null;
    return msg as ClarMessage;
  } catch {
    return null;
  }
}

/**
 * Install the bridge:
 *  - Listens on `window` for inbound shell messages.
 *  - Hooks supabase.auth.onAuthStateChange to emit signed-in / signed-out.
 *  - Sends `clar:ready` on install; sends `clar:needs-session` if no session.
 *
 * Returns a teardown function.
 */
export function initEmbeddedShellBridge(supabase: AnySupabaseClient): () => void {
  if (typeof window === "undefined") return () => {};
  if (!isEmbeddedShell()) return () => {};

  const onMessage = async (evt: MessageEvent) => {
    const msg = parseInbound(evt.data);
    if (!msg) return;

    if (msg.type === "clar:session") {
      const p = msg.payload as SessionPayload | undefined;
      if (!p?.access_token || !p?.refresh_token) {
        console.warn("[clar:shell] clar:session missing tokens");
        return;
      }
      const { error } = await supabase.auth.setSession({
        access_token: p.access_token,
        refresh_token: p.refresh_token,
      });
      if (error) console.warn("[clar:shell] setSession failed", error);
      return;
    }

    if (msg.type === "clar:signout") {
      await supabase.auth.signOut();
      return;
    }
  };

  window.addEventListener("message", onMessage);

  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN" && session?.user) {
      signalSignedIn(session.user.id);
    } else if (event === "SIGNED_OUT") {
      signalSignedOut();
    }
  });

  // Boot handshake.
  signalShellReady();
  supabase.auth.getSession().then(({ data }) => {
    if (!data.session) signalNeedsSession();
    else signalSignedIn(data.session.user.id);
  });

  return () => {
    window.removeEventListener("message", onMessage);
    subscription.unsubscribe();
  };
}
