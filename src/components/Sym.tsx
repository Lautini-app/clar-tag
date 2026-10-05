import { SYMBOL_FORMEN } from "@/components/icons/TagSymbole";
import { symbolFuer } from "@/lib/symbole";

/**
 * Zeigt das clar·tag-Symbol zu einem Emoji. Die Grösse folgt der Schriftgrösse
 * (1em), die Farbe der Textfarbe — bestehende Klassen wie text-xl gelten weiter.
 * Unbekannte, selbst gewählte Emoji werden unverändert angezeigt.
 */
export function Sym({ e, className = "" }: { e?: string | null; className?: string }) {
  if (!e) return null;
  const name = symbolFuer(e);
  if (name === null) return null;
  if (name === undefined) return <>{e}</>;
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`inline-block shrink-0 align-[-0.15em] ${className}`}
    >
      {SYMBOL_FORMEN[name]}
    </svg>
  );
}
