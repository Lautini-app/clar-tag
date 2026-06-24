import { useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { ToolboxFab } from "./ToolboxFab";
import { useAuth } from "@/hooks/use-auth";
import { useFamily } from "@/hooks/use-family";
import { getEmailConsent } from "@/lib/email-consent";
import { EmailConsentModal } from "@/components/EmailConsentModal";

const PUBLIC_ROUTES = new Set(["/login", "/verbinden"]);

export function AppShell({ children }: { children: ReactNode }) {
  const loc = useLocation();
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const { stage } = useFamily();

  const isPublic = PUBLIC_ROUTES.has(loc.pathname);
  // Stufe 1 "Begleitet" → vereinfachte Ansicht, keine Bottom-Nav
  const simplified = stage === "begleitet";
  const showNav = !isPublic && !simplified;

  useEffect(() => {
    if (loading) return;

    if (!session && !isPublic) {
      navigate({ to: "/login" });
      return;
    }

    if (session && loc.pathname === "/login") {
      navigate({ to: "/" });
      return;
    }

  }, [loc.pathname, navigate, session, loading, isPublic]);

  const userId = session?.user?.id ?? null;
  const needsConsentCheck = !!userId && !isPublic;

  return (
    <div
      className={`mx-auto min-h-screen w-full max-w-[390px] bg-background ${
        simplified ? "clartag-simplified" : ""
      }`}
      data-stage={stage ?? "admin"}
    >
      {needsConsentCheck ? (
        <ConsentGate userId={userId!}>
          <main className={showNav ? "pb-24" : ""}>{children}</main>
          {showNav && <BottomNav />}
          {showNav && <ToolboxFab />}
        </ConsentGate>
      ) : (
        <>
          <main className={showNav ? "pb-24" : ""}>{children}</main>
          {showNav && <BottomNav />}
          {showNav && <ToolboxFab />}
        </>
      )}
    </div>
  );
}

function ConsentGate({ userId, children }: { userId: string; children: ReactNode }) {
  const [checked, setChecked] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const row = await getEmailConsent(userId);
      if (!active) return;
      setHasConsent(!!row);
      setChecked(true);
    })();
    return () => { active = false; };
  }, [userId]);

  if (!checked) return null;

  if (!hasConsent) {
    return (
      <EmailConsentModal
        userId={userId}
        onDone={() => setHasConsent(true)}
      />
    );
  }

  return <>{children}</>;
}
