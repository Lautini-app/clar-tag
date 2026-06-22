import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (authError) throw authError;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Anmeldung fehlgeschlagen.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col px-6 pb-10 pt-16">
      <div className="mb-8">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">clar · tag</div>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">Anmelden</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Melde dich mit deinem Konto an.
        </p>
      </div>

      <form onSubmit={submit} className="grid gap-4">
        <label className="grid gap-1.5">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            E-Mail
          </span>
          <input
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-[var(--radius-md)] border border-border bg-card px-4 py-3 text-base outline-none focus:border-primary"
          />
        </label>

        <label className="grid gap-1.5">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Passwort
          </span>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-[var(--radius-md)] border border-border bg-card px-4 py-3 text-base outline-none focus:border-primary"
          />
        </label>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <button
          type="submit"
          disabled={loading || !email || !password}
          className="mt-2 rounded-[var(--radius-md)] bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {loading ? "Wird angemeldet …" : "Anmelden"}
        </button>
      </form>

      <div className="mt-8 border-t border-border pt-6 text-center">
        <Link
          to="/verbinden"
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          Mit PIN verbinden
        </Link>
        <p className="mt-1 text-xs text-muted-foreground">
          Für Familienmitglieder ohne eigenes Konto
        </p>
      </div>
    </div>
  );
}
