import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        shouldCreateUser: true,
      },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  };

  return (
    <div className="flex min-h-screen flex-col px-6 pb-10 pt-16">
      <div className="mb-8">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">clar · zeit</div>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">Anmelden</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Wir schicken dir einen Link per E-Mail. Kein Passwort nötig.
        </p>
      </div>

      {sent ? (
        <div className="rounded-[var(--radius-md)] border border-border bg-card p-5">
          <p className="text-sm text-foreground">
            Link an <span className="font-medium">{email}</span> verschickt.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Öffne die E-Mail auf diesem Gerät und tippe den Link an, um dich anzumelden.
          </p>
          <button
            type="button"
            onClick={() => {
              setSent(false);
              setEmail("");
            }}
            className="mt-4 text-sm text-primary underline"
          >
            Andere E-Mail verwenden
          </button>
        </div>
      ) : (
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

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={loading || !email}
            className="mt-2 rounded-[var(--radius-md)] bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {loading ? "Einen Moment …" : "Link schicken"}
          </button>
        </form>
      )}

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
