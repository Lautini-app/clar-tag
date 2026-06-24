import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Calendar, Copy, Plus, RefreshCw } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { STAGE_META, memberStage, type FamilyMember } from "@/lib/storage";
import { useAuth, signOut } from "@/hooks/use-auth";
import { useFamily } from "@/hooks/use-family";
import { MemberDialog } from "@/components/family/MemberDialog";
import { DeleteAccountDialog } from "@/components/settings/DeleteAccountDialog";
import { EmailConsentModal } from "@/components/EmailConsentModal";
import { getEmailConsent, type ConsentLevel } from "@/lib/email-consent";
import { getOrCreateCalendarToken, resetCalendarToken } from "@/lib/calendar-token.functions";

export const Route = createFileRoute("/einstellungen")({
  component: Einstellungen,
});

const MAX_MEMBERS = 4;

function Einstellungen() {
  const { settings, update, loaded } = useSettings();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { members, upsertMember, removeMember, family } = useFamily();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<FamilyMember | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }
  function openEdit(m: FamilyMember) {
    setEditing(m);
    setDialogOpen(true);
  }

  if (!loaded) return null;

  const handleLogout = async () => {
    await signOut();
    navigate({ to: "/login" });
  };

  return (
    <div className="px-5 pb-10 pt-10">
      <header className="mb-6">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">
          Einstellungen
        </div>
        <h1 className="mt-1 text-2xl font-semibold text-foreground">Anpassen</h1>
      </header>

      <Group title="Name">
        <input
          value={settings.name}
          onChange={(e) => update({ name: e.target.value })}
          className="w-full rounded-[var(--radius-md)] border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
        />
      </Group>

      <Group title="Countdown-Stil">
        <div className="grid grid-cols-3 gap-2">
          {(["bar", "blocks", "ring"] as const).map((s) => (
            <button
              key={s}
              onClick={() => update({ countdownStyle: s })}
              className={`flex flex-col items-center gap-2 rounded-[var(--radius-md)] border px-3 py-3 text-sm transition ${
                settings.countdownStyle === s
                  ? "border-primary bg-primary-soft text-primary-deep"
                  : "border-border bg-card text-foreground"
              }`}
            >
              <StylePreview style={s} />
              <span>{s === "bar" ? "Balken" : s === "blocks" ? "Blöcke" : "Ring"}</span>
            </button>
          ))}
        </div>
      </Group>

      <Group title="Auditive Signale">
        <Toggle
          checked={settings.audioOn}
          onChange={(v) => update({ audioOn: v })}
          label="Töne aktiv"
        />
      </Group>

      <Group title="Familienmodus">
        <Toggle
          checked={settings.mode === "family"}
          onChange={(v) => update({ mode: v ? "family" : "solo" })}
          label="Mehrere Personen in dieser App"
        />
      </Group>

      {settings.mode === "family" && (
        <Group title={`Familienmitglieder (${members.length}/${MAX_MEMBERS})`}>
          {members.length > 0 && (
            <ul className="mb-2 grid gap-1">
              {members.map((m) => {
                const stage = memberStage(m);
                return (
                  <li key={m.id}>
                    <button
                      onClick={() => openEdit(m)}
                      className="flex w-full items-center gap-3 rounded-[var(--radius-md)] border border-border bg-card px-3 py-2 text-left"
                    >
                      <span className="text-xl">{m.emoji}</span>
                      <span className="flex-1">
                        <span className="block text-sm text-foreground">{m.name}</span>
                        <span className="block text-[11px] uppercase tracking-wide text-muted-foreground">
                          {STAGE_META[stage].label}
                        </span>
                      </span>
                      <span className="text-xs text-muted-foreground">Bearbeiten</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          <button
            onClick={openCreate}
            disabled={members.length >= MAX_MEMBERS}
            className="inline-flex w-full items-center justify-center gap-1 rounded-[var(--radius-md)] bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Mitglied hinzufügen
          </button>
        </Group>
      )}

      <MemberDialog
        open={dialogOpen}
        member={editing}
        familyExists={!!family}
        onClose={() => setDialogOpen(false)}
        onSave={async (m) => {
          await upsertMember(m);
          return undefined;
        }}
        onDelete={removeMember}
      />


      <CalendarSubscription />

      <Group title="App installieren">
        <p className="text-sm text-muted-foreground">
          Im Browser: Teilen → Zum Home-Bildschirm.
        </p>
      </Group>

      <button
        onClick={() => navigate({ to: "/statistiken" })}
        className="mt-2 w-full rounded-[var(--radius-md)] border border-border bg-card px-3 py-3 text-left text-sm text-muted-foreground"
      >
        Verlauf ansehen
      </button>

      <div className="mt-8 rounded-[var(--radius-lg)] bg-card p-4">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">Angemeldet als</div>
        <div className="mt-1 text-sm text-foreground">{user?.email ?? "—"}</div>
        <button
          onClick={handleLogout}
          className="mt-3 w-full rounded-[var(--radius-md)] border border-border bg-background px-3 py-2 text-sm text-foreground"
        >
          Abmelden
        </button>
      </div>

      <EmailConsentSection userId={user?.id ?? null} />

      <div className="mt-6 rounded-[var(--radius-lg)] border border-destructive/30 bg-card p-4">
        <div className="text-xs uppercase tracking-wide text-destructive">Gefahrenzone</div>
        <p className="mt-1 text-xs text-muted-foreground">
          Löscht dein Konto und alle Daten unwiderruflich (DSGVO-Recht auf Vergessenwerden).
        </p>
        <button
          onClick={() => setDeleteOpen(true)}
          className="mt-3 w-full rounded-[var(--radius-md)] border border-destructive bg-background px-3 py-2 text-sm font-medium text-destructive"
        >
          Alle meine Daten löschen
        </button>
      </div>

      <DeleteAccountDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} />

      <p className="mt-8 text-center text-xs text-muted-foreground">
        clar · tag — Teil der clar App-Familie von Lautini
      </p>
    </div>
  );
}

function EmailConsentSection({ userId }: { userId: string | null }) {
  const [level, setLevel] = useState<ConsentLevel | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    (async () => {
      const row = await getEmailConsent(userId);
      if (!active) return;
      setLevel(row?.consent_level ?? null);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [userId]);

  if (!userId) return null;

  const labels: Record<ConsentLevel, string> = {
    always: "Ja, dauerhaft",
    subscription_only: "Ja, nur während Abo",
    never: "Nein, keine Marketing-E-Mails",
  };

  return (
    <div className="mt-6 rounded-[var(--radius-lg)] bg-card p-4">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        E-Mail-Einstellungen
      </div>
      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
        Marketing-E-Mails von clar by Lautini. Transaktionsmails (Login,
        Rechnung, Account-Sicherheit) erhältst du immer.
      </p>
      <div className="mt-3 rounded-[var(--radius-md)] border border-border bg-background p-3">
        <p className="text-xs text-muted-foreground">Aktuelle Auswahl</p>
        <p className="mt-1 text-sm font-medium text-foreground">
          {loading ? "Lade…" : level ? labels[level] : "Keine Auswahl"}
        </p>
      </div>
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="mt-3 w-full rounded-[var(--radius-md)] border border-border bg-background px-3 py-2 text-sm font-medium text-foreground"
      >
        Ändern
      </button>

      {editing && (
        <EmailConsentModal
          userId={userId}
          allowClose
          onClose={() => setEditing(false)}
          onDone={(newLevel) => {
            setLevel(newLevel);
            setEditing(false);
          }}
        />
      )}
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between rounded-[var(--radius-md)] border border-border bg-card px-4 py-3 text-sm"
    >
      <span className="text-foreground">{label}</span>
      <span
        className={`relative h-6 w-10 rounded-full transition ${
          checked ? "bg-primary" : "bg-secondary"
        }`}
      >
        <span
          className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all"
          style={{ left: checked ? "1.125rem" : "0.125rem" }}
        />
      </span>
    </button>
  );
}

function StylePreview({ style }: { style: "bar" | "blocks" | "ring" }) {
  const color = "var(--color-primary)";
  if (style === "bar") {
    return (
      <div className="h-2 w-14 overflow-hidden rounded-full bg-secondary">
        <div className="h-full w-2/3 rounded-full" style={{ backgroundColor: color }} />
      </div>
    );
  }
  if (style === "blocks") {
    return (
      <div className="flex gap-0.5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-2 w-2 rounded-sm"
            style={{ backgroundColor: i < 5 ? color : "var(--color-secondary)" }}
          />
        ))}
      </div>
    );
  }
  return (
    <svg width={28} height={28} className="-rotate-90">
      <circle cx={14} cy={14} r={11} fill="none" stroke="var(--color-secondary)" strokeWidth={3} />
      <circle
        cx={14}
        cy={14}
        r={11}
        fill="none"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray={2 * Math.PI * 11}
        strokeDashoffset={2 * Math.PI * 11 * 0.35}
      />
    </svg>
  );
}

function CalendarSubscription() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [resetting, setResetting] = useState(false);

  const getToken = useServerFn(getOrCreateCalendarToken);
  const doReset = useServerFn(resetCalendarToken);

  const loadToken = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getToken({});
      setToken(res.token);
    } catch (e) {
      console.error("getOrCreateCalendarToken failed", e);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  const calUrl = token
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/api/calendar/${token}`
    : null;

  async function copyUrl() {
    if (!calUrl) return;
    try {
      await navigator.clipboard.writeText(calUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }

  async function handleReset() {
    setResetting(true);
    try {
      const res = await doReset({});
      setToken(res.token);
    } catch (e) {
      console.error("resetCalendarToken failed", e);
    } finally {
      setResetting(false);
    }
  }

  return (
    <Group title="Kalender-Abo">
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Abonniere deine geplanten Routinen in Apple Kalender, Google Calendar oder Outlook.
          </p>
        </div>

        {!token ? (
          <button
            onClick={loadToken}
            disabled={loading}
            className="w-full rounded-[var(--radius-md)] border border-border bg-card px-3 py-2.5 text-sm font-medium text-foreground disabled:opacity-50"
          >
            {loading ? "Wird erstellt …" : "Kalender-Link erstellen"}
          </button>
        ) : (
          <>
            <div className="flex gap-2">
              <input
                readOnly
                value={calUrl ?? ""}
                className="flex-1 min-w-0 rounded-[var(--radius-md)] border border-border bg-card px-3 py-2 text-xs text-foreground font-mono"
                onFocus={(e) => e.target.select()}
              />
              <button
                onClick={copyUrl}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-border bg-card px-3 py-2 text-xs font-medium text-foreground"
              >
                <Copy className="h-3.5 w-3.5" />
                {copied ? "Kopiert!" : "Kopieren"}
              </button>
            </div>

            <details className="text-xs text-muted-foreground">
              <summary className="cursor-pointer font-medium">Anleitung</summary>
              <ol className="mt-2 ml-4 list-decimal space-y-1">
                <li><strong>Apple Kalender:</strong> Kalender → Ablage → Neues Kalenderabonnement → URL einfügen</li>
                <li><strong>iPhone:</strong> Einstellungen → Kalender → Accounts → Kalenderabo hinzufügen → URL einfügen</li>
                <li><strong>Google Calendar:</strong> Einstellungen → Kalender hinzufügen → Per URL → URL einfügen</li>
              </ol>
            </details>

            <button
              onClick={handleReset}
              disabled={resetting}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <RefreshCw className={`h-3 w-3 ${resetting ? "animate-spin" : ""}`} />
              {resetting ? "Wird erneuert …" : "Link erneuern (alter Link wird ungültig)"}
            </button>
          </>
        )}
      </div>
    </Group>
  );
}
