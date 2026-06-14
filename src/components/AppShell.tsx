import { useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
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
  const [isDespia, setIsDespia] = useState(false);

  const isPublic = PUBLIC_ROUTES.has(loc.pathname);
  // Stufe 1 "Begleitet" → vereinfachte Ansicht, keine Bottom-Nav
  const simplified = stage === "begleitet";
  const showNav = !isPublic && !simplified;

  useEffect(() => {
    setIsDespia(navigator.userAgent.toLowerCase().includes("despia"));
  }, []);

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
      {isDespia && (
        <header
          className="bg-[#2E5C3E] text-white"
          style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
          <a
            href="https://home.lautini.ch"
            className="flex h-[44px] items-center px-4 text-sm font-semibold text-white"
          >
            ← clar
          </a>
        </header>
      )}
      <main className={showNav ? "pb-24" : ""}>{children}</main>
      {showNav && <BottomNav />}
    </div>
  );
}
