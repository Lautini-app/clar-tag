import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useLayoutEffect, useState } from "react";

import appCss from "../styles.css?url";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { initEmbeddedShellBridge } from "@/lib/embedded-shell";
import { consumeClarHandoff, hasClarSsoPending, CLAR_SSO_PENDING_KEY } from "@/lib/clar-sso";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-sm text-center">
        <h1 className="text-6xl font-semibold text-primary">404</h1>
        <h2 className="mt-4 text-lg font-medium text-foreground">Seite nicht gefunden</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Diese Seite existiert nicht oder wurde verschoben.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-[var(--radius-md)] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Zur Startseite
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-sm text-center">
        <h1 className="text-lg font-semibold text-foreground">Das hat nicht geklappt</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Etwas ist schiefgelaufen. Versuche es nochmal.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-[var(--radius-md)] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Nochmal
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-[var(--radius-md)] border border-input bg-background px-4 py-2 text-sm font-medium text-foreground"
          >
            Zur Startseite
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#F5F2ED" },
      { title: "clar · tag" },
      { name: "description", content: "Tagesstruktur, Routinen und Zeitgefühl — für neurodivergenten Alltag." },
      { name: "author", content: "Lautini" },
      { property: "og:title", content: "clar · tag" },
      { property: "og:description", content: "Tagesstruktur, Routinen und Zeitgefühl — für neurodivergenten Alltag." },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "clar · tag" },
      { name: "twitter:description", content: "Tagesstruktur, Routinen und Zeitgefühl — für neurodivergenten Alltag." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/cb573543-47b3-412d-937e-bdb53925b58a/id-preview-725de2ad--63ec9385-b437-41f8-864a-a7215c6c24ec.lovable.app-1779270074283.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/cb573543-47b3-412d-937e-bdb53925b58a/id-preview-725de2ad--63ec9385-b437-41f8-864a-a7215c6c24ec.lovable.app-1779270074283.png" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
      },
      { rel: "manifest", href: "/manifest.webmanifest" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de-CH">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

type NavigatorWithStandalone = Navigator & {
  standalone?: boolean;
  userAgentData?: { mobile?: boolean };
};

function isDesktopBrowser(nav: NavigatorWithStandalone) {
  if (nav.userAgentData?.mobile === true) return false;
  if (nav.userAgentData?.mobile === false) return true;
  const ua = nav.userAgent || "";
  if (/Mobile|Android|iP(ad|hone|od)|IEMobile|BlackBerry|Opera Mini/i.test(ua)) return false;
  return /(Windows NT|Macintosh|Mac OS X|X11|Linux x86_64|CrOS)/i.test(ua);
}

function shouldShowDespiaHeader() {
  if (typeof window === "undefined") return false;
  try { if (window.self !== window.top) return false; } catch { return false; }
  const nav = window.navigator as NavigatorWithStandalone;
  if (nav.standalone === true) return true;
  const h = window.location.hostname.toLowerCase();
  if (h === "localhost" || h === "127.0.0.1" || h === "::1") return false;
  return !isDesktopBrowser(nav);
}

function DespiaHeader({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <a
      href="https://home.lautini.ch"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        paddingTop: "env(safe-area-inset-top)",
        height: "calc(44px + env(safe-area-inset-top))",
        background: "#2E5C3E",
        color: "white",
        display: "flex",
        alignItems: "flex-end",
        paddingLeft: "16px",
        paddingBottom: "10px",
        fontSize: "16px",
        textDecoration: "none",
        zIndex: 9999,
      }}
    >
      ← clar
    </a>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  const [showDespiaHeader, setShowDespiaHeader] = useState(false);

  const [ssoPendingAtMount] = useState(() =>
    typeof window !== "undefined" && hasClarSsoPending(),
  );
  const [ssoReady, setSsoReady] = useState(!ssoPendingAtMount);

  useEffect(() => {
    setShowDespiaHeader(shouldShowDespiaHeader());
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (showDespiaHeader) {
      root.style.setProperty("--despia-header-height", "calc(2.75rem + env(safe-area-inset-top))");
    } else {
      root.style.setProperty("--despia-header-height", "0px");
    }
    return () => { root.style.removeProperty("--despia-header-height"); };
  }, [showDespiaHeader]);

  useEffect(() => {
    const teardown = initEmbeddedShellBridge(supabase);
    return teardown;
  }, []);

  useEffect(() => {
    if (!ssoPendingAtMount) return;
    let settled = false;
    const settle = () => {
      if (settled) return;
      settled = true;
      try { sessionStorage.removeItem(CLAR_SSO_PENDING_KEY); } catch {}
      setSsoReady(true);
    };
    const timeoutId = setTimeout(() => {
      console.warn("[clar SSO] consumeClarHandoff timed out");
      settle();
    }, 2500);
    void (async () => {
      try {
        await consumeClarHandoff();
      } catch (e) {
        console.error("[clar SSO] consumeClarHandoff threw", e);
      }
      settle();
      clearTimeout(timeoutId);
    })();
    return () => clearTimeout(timeoutId);
  }, [ssoPendingAtMount]);

  if (!ssoReady) {
    return (
      <>
        <DespiaHeader visible={showDespiaHeader} />
        <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--background, #F5F2ED)" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 32, height: 32, margin: "0 auto 12px", border: "2px solid #ccc", borderTopColor: "#7A5BAE", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <p style={{ fontSize: 14, color: "#888" }}>Anmeldung wird übernommen …</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        </div>
      </>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <DespiaHeader visible={showDespiaHeader} />
      <AppShell>
        <Outlet />
      </AppShell>
    </QueryClientProvider>
  );
}
