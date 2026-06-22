import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { claimPin } from "@/lib/family.functions";
import { KEYS, lsSet } from "@/lib/storage";
import { signalShellReady } from "@/lib/embedded-shell";

export const Route = createFileRoute("/verbinden")({
  ssr: false,
  validateSearch: (search): { pin?: string } => ({
    pin: typeof search.pin === "string" ? search.pin : undefined,
  }),
  component: Verbinden,
});

function Verbinden() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const queryClient = useQueryClient();
  const claim = useServerFn(claimPin);
  const [pin, setPin] = useState(search.pin ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-submit when arriving with ?pin=
  useEffect(() => {
    if (search.pin && /^\d{6}$/.test(search.pin) && !loading) {
      void submit(search.pin);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submit(value: string) {
    if (loading) return;
    setError(null);
    if (!/^\d{6}$/.test(value)) {
      setError("Bitte 6 Ziffern eingeben.");
      return;
    }
    setLoading(true);
    try {
      // Ensure we have an auth session — sign in anonymously if needed.
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        const { error: anonErr } = await supabase.auth.signInAnonymously();
        if (anonErr) throw new Error(anonErr.message);
        // Wait a tick for the token to be attached.
        await new Promise((r) => setTimeout(r, 200));
      }

      const result = await claim({ data: { pin: value } });

      // This device represents this member — no admin switcher.
      lsSet(KEYS.activeMember, result.memberId);

      // Refresh family context.
      await queryClient.invalidateQueries({ queryKey: ["family-context"] });

      // Notify embedding shell that we're paired & ready.
      signalShellReady();

      navigate({ to: "/" });
    } catch (err: any) {
      setError(err?.message ?? "PIN konnte nicht eingelöst werden.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col px-6 pb-10 pt-12">
      <button
        type="button"
        onClick={() => navigate({ to: "/login" })}
        className="-ml-2 mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Zurück
      </button>

      <div className="mb-8">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">
          clar · tag
        </div>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">
          Mit PIN verbinden
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Gib den 6-stelligen PIN ein, den dir Admin gezeigt hat.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submit(pin);
        }}
        className="grid gap-4"
      >
        <input
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="••••••"
          className="rounded-[var(--radius-md)] border border-border bg-card px-4 py-4 text-center font-mono text-3xl tracking-[0.4em] outline-none focus:border-primary"
          autoFocus
        />

        {error && <p className="text-sm text-destructive">{error}</p>}

        <button
          type="submit"
          disabled={loading || pin.length !== 6}
          className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Verbinde …" : "Verbinden"}
        </button>
      </form>
    </div>
  );
}
