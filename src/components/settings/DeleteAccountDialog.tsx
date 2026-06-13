import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useNavigate } from "@tanstack/react-router";
import { deleteMyAccount } from "@/lib/account.functions";
import { supabase } from "@/integrations/supabase/client";

const CONFIRM_WORD = "LÖSCHEN";

export function DeleteAccountDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const runDelete = useServerFn(deleteMyAccount);

  if (!open) return null;

  const canConfirm = text === CONFIRM_WORD && !busy;

  async function handleConfirm() {
    setBusy(true);
    setError(null);
    try {
      await runDelete();
      await supabase.auth.signOut();
      navigate({ to: "/login" });
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Löschen fehlgeschlagen");
      setBusy(false);
    }
  }

  function handleClose() {
    if (busy) return;
    setText("");
    setError(null);
    onClose();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-[var(--radius-lg)] bg-card p-5 shadow-xl"
      >
        <h2 className="text-lg font-semibold text-foreground">
          Alle meine Daten löschen?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Das entfernt unwiderruflich dein Konto, alle Workflows, deine
          Familienmitglieder und alle damit verbundenen Daten. Diese Aktion
          kann nicht rückgängig gemacht werden.
        </p>
        <p className="mt-3 text-sm text-foreground">
          Tippe <span className="font-mono font-semibold">{CONFIRM_WORD}</span>{" "}
          zur Bestätigung:
        </p>
        <input
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={busy}
          className="mt-2 w-full rounded-[var(--radius-md)] border border-border bg-background px-3 py-2 text-sm font-mono outline-none focus:border-destructive"
          placeholder={CONFIRM_WORD}
        />
        {error && (
          <p className="mt-2 text-xs text-destructive">{error}</p>
        )}
        <div className="mt-5 flex gap-2">
          <button
            onClick={handleClose}
            disabled={busy}
            className="flex-1 rounded-[var(--radius-md)] border border-border bg-background px-3 py-2 text-sm text-foreground disabled:opacity-50"
          >
            Abbrechen
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="flex-1 rounded-[var(--radius-md)] bg-destructive px-3 py-2 text-sm font-medium text-destructive-foreground disabled:opacity-50"
          >
            {busy ? "Lösche…" : "Endgültig löschen"}
          </button>
        </div>
      </div>
    </div>
  );
}
