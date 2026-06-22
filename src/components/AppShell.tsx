import { useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { ToolboxFab } from "./ToolboxFab";
import { useAuth } from "@/hooks/use-auth";
import { useFamily } from "@/hooks/use-family";

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

  return (
    <div
      className={`mx-auto min-h-screen w-full max-w-[390px] bg-background ${
        simplified ? "clartag-simplified" : ""
      }`}
      data-stage={stage ?? "admin"}
    >
      <main className={showNav ? "pb-24" : ""}>{children}</main>
      {showNav && <BottomNav />}
      {showNav && <ToolboxFab />}
    </div>
  );
}
