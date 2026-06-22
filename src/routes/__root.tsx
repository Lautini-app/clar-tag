import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect } from "react";

import appCss from "../styles.css?url";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { initEmbeddedShellBridge } from "@/lib/embedded-shell";

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
        href: "https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap",
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

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    const teardown = initEmbeddedShellBridge(supabase);
    return teardown;
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AppShell>
        <Outlet />
      </AppShell>
    </QueryClientProvider>
  );
}
