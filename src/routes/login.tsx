import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      (window.location.hash.includes("type=recovery") ||
        window.location.search.includes("type=recovery"))
    ) {
      setIsPasswordRecovery(true);
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsPasswordRecovery(true);
        setError(null);
        setNotice(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    setLoading(true);
    setError(null);
    setNotice(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    setLoading(false);
    if (error) {
      setError("E-Mail oder Passwort ist nicht korrekt.");
      return;
    }

    navigate({ to: "/" });
  };

  const updatePassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }

    setNotice("Dein Passwort wurde aktualisiert. Du bist jetzt angemeldet.");
    navigate({ to: "/" });
  };

  const requestPasswordReset = async (e: FormEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (resetLoading) return;
    const normalizedEmail = email.trim().toLowerCase();
    setError(null);
    setNotice(null);

    if (!normalizedEmail) {
      setError("Bitte gib zuerst deine E-Mail-Adresse ein.");
      return;
    }

    setResetLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(
      normalizedEmail,
      typeof window === "undefined" ? undefined : { redirectTo: `${window.location.origin}/login` },
    );
    setResetLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setNotice(
      "Wenn ein Konto existiert, senden wir dir eine E-Mail zum Zurücksetzen des Passworts.",
    );
  };

  return (
    <div className="flex min-h-screen flex-col px-6 pb-10 pt-16">
      <div className="mb-8">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">clar · zeit</div>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">Anmelden</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isPasswordRecovery
            ? "Lege ein neues Passwort für dein Konto fest."
            : "Melde dich mit deiner E-Mail-Adresse und deinem Passwort an."}
        </p>
      </div>

      {isPasswordRecovery ? (
        <form onSubmit={updatePassword} className="grid gap-4">
          <label className="grid gap-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Neues Passwort
            </span>
            <span className="relative">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-[var(--radius-md)] border border-border bg-card px-4 py-3 pr-12 text-base outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center text-muted-foreground"
                aria-label={showPassword ? "Passwort ausblenden" : "Passwort anzeigen"}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </span>
          </label>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {notice && <p className="text-sm text-muted-foreground">{notice}</p>}

          <button
            type="submit"
            disabled={loading || newPassword.length < 6}
            className="mt-2 rounded-[var(--radius-md)] bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {loading ? "Einen Moment …" : "Passwort speichern"}
          </button>
        </form>
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

          <label className="grid gap-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Passwort
            </span>
            <span className="relative">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-[var(--radius-md)] border border-border bg-card px-4 py-3 pr-12 text-base outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center text-muted-foreground"
                aria-label={showPassword ? "Passwort ausblenden" : "Passwort anzeigen"}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </span>
          </label>

          <div className="-mt-1 text-right">
            <a
              href="#passwort-vergessen"
              onClick={requestPasswordReset}
              className="text-sm text-primary underline-offset-4 hover:underline"
              aria-disabled={resetLoading}
            >
              {resetLoading ? "Wird gesendet …" : "Passwort vergessen?"}
            </a>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {notice && <p className="text-sm text-muted-foreground">{notice}</p>}

          <button
            type="submit"
            disabled={loading || !email.trim() || !password}
            className="mt-2 rounded-[var(--radius-md)] bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {loading ? "Einen Moment …" : "Anmelden"}
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
