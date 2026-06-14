import { useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { KEYS, lsGet, lsSet } from "@/lib/storage";
import { useAuth } from "@/hooks/use-auth";
import { useFamily } from "@/hooks/use-family";

const PUBLIC_ROUTES = new Set(["/login", "/onboarding", "/verbinden"]);

type NavigatorWithStandalone = Navigator & {
  standalone?: boolean;
  userAgentData?: {
    mobile?: boolean;
  };
};

const DESKTOP_UA_PATTERN = /\b(Windows NT|Macintosh|X11|CrOS|Linux x86_64|Linux i686)\b/i;
const DESKTOP_PLATFORM_PATTERN = /\b(Win32|Win64|MacIntel|MacPPC|Linux x86_64|Linux i686)\b/i;
const MOBILE_UA_PATTERN = /\b(Android|iPhone|iPad|iPod|Mobile|Tablet|Silk)\b/i;

function isLocalhostLocation(location: Location): boolean {
  return (
    location.hostname === "localhost" ||
    location.hostname === "127.0.0.1" ||
    location.hostname === "::1" ||
    location.hostname.endsWith(".localhost")
  );
}

function isDesktopBrowser(navigator: NavigatorWithStandalone): boolean {
  const userAgent = navigator.userAgent ?? "";
  const platform = navigator.platform ?? "";

  if (navigator.userAgentData?.mobile === true) return false;
  if (MOBILE_UA_PATTERN.test(userAgent)) return false;

  // iPadOS can present itself as macOS Safari while still exposing touch points.
  if (
    (userAgent.includes("Macintosh") || platform === "MacIntel") &&
    navigator.maxTouchPoints > 1
  ) {
    return false;
  }

  return DESKTOP_UA_PATTERN.test(userAgent) || DESKTOP_PLATFORM_PATTERN.test(platform);
}

export function shouldShowClarBackHeader(win: Window): boolean {
  const navigator = win.navigator as NavigatorWithStandalone;

  if (navigator.standalone === true) return true;

  return !isLocalhostLocation(win.location) && !isDesktopBrowser(navigator);
}

export function AppShell({ children }: { children: ReactNode }) {
  const loc = useLocation();
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const { stage, role } = useFamily();
  const [showBackHeader, setShowBackHeader] = useState(false);

  const isPublic = PUBLIC_ROUTES.has(loc.pathname);
  // Stufe 1 "Begleitet" → vereinfachte Ansicht, keine Bottom-Nav
  const simplified = stage === "begleitet";
  const showNav = !isPublic && !simplified;

  useEffect(() => {
    setShowBackHeader(shouldShowClarBackHeader(window));
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
      {showBackHeader && (
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
