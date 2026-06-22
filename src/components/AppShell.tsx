import { useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { KEYS, lsGet, lsSet } from "@/lib/storage";
import { useAuth } from "@/hooks/use-auth";
import { useFamily } from "@/hooks/use-family";

const PUBLIC_ROUTES = new Set(["/login", "/onboarding", "/verbinden"]);

export function AppShell({ children }: { children: ReactNode }) {
  const loc = useLocation();
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const { stage, role } = useFamily();

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

    if (session && !isPublic) {
      // Members (linked via PIN) skip onboarding — admin already set them up.
      if (role === "member") {
        const done = lsGet<boolean>(KEYS.onboarding, false);
        if (!done) lsSet(KEYS.onboarding, true);
        return;
      }
      const done = lsGet<boolean>(KEYS.onboarding, false);
      if (!done) navigate({ to: "/onboarding" });
    }
  }, [loc.pathname, navigate, session, loading, isPublic, role]);

  return (
    <div
      className={`mx-auto min-h-screen w-full max-w-[390px] bg-background ${
        simplified ? "clarzeit-simplified" : ""
      }`}
      data-stage={stage ?? "admin"}
    >
      <main className={showNav ? "pb-24" : ""}>{children}</main>
      {showNav && <BottomNav />}
    </div>
  );
}
