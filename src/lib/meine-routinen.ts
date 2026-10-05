/**
 * «Meine Routinen» zeigt nur, was die Person wirklich benutzt:
 * ihre eigenen Routinen und mitgelieferte, die eingeplant sind oder kürzlich
 * gemacht wurden. Alles andere bleibt in der Bibliothek.
 * Reine Funktionen — kein Netzwerk, keine Datenbank.
 */
import type { Category, Workflow } from "./workflows";

export type MeineZeile = {
  id: string;
  name: string;
  icon: string;
  /** true = selbst angelegt, false = mitgelieferte Routine in Gebrauch. */
  isUser: boolean;
};

export type MeineRubrik = { cat: Category; items: MeineZeile[] };

type MitSchluessel = { workflow_key: string | null };
type Eigene = { id: string; name: string; icon: string | null; category: Category };

export const RUBRIKEN: Category[] = [
  "morgen",
  "abend",
  "vorbereitung",
  "lernen",
  "gesundheit",
  "soziales",
  "reisen",
  "uebergang",
  "pflichten",
  "saisonal",
  "hobby_outdoor",
  "eigene",
];

/**
 * Schlüssel aller mitgelieferten Routinen, die in einer der Quellen vorkommen
 * (Wiederholungen, geplante Termine, erledigte Durchgänge). Fehlt eine Quelle
 * oder lädt sie noch, zählt sie einfach nicht mit.
 */
export function benutzteSchluessel(
  ...quellen: Array<ReadonlyArray<MitSchluessel> | null | undefined>
): Set<string> {
  const schluessel = new Set<string>();
  for (const quelle of quellen) {
    if (!Array.isArray(quelle)) continue;
    for (const zeile of quelle) {
      if (zeile && typeof zeile.workflow_key === "string" && zeile.workflow_key) {
        schluessel.add(zeile.workflow_key);
      }
    }
  }
  return schluessel;
}

/**
 * Baut die Liste: je Rubrik zuerst die benutzten mitgelieferten Routinen,
 * dann die eigenen. Leere Rubriken fallen weg.
 */
export function meineListe(
  mitgeliefert: ReadonlyArray<Workflow>,
  eigene: ReadonlyArray<Eigene>,
  benutzt: ReadonlySet<string>,
): MeineRubrik[] {
  const jeRubrik = new Map<Category, MeineZeile[]>();
  const dazu = (cat: Category, zeile: MeineZeile) => {
    const liste = jeRubrik.get(cat) ?? [];
    liste.push(zeile);
    jeRubrik.set(cat, liste);
  };
  for (const w of mitgeliefert) {
    if (benutzt.has(w.id))
      dazu(w.category, { id: w.id, name: w.name, icon: w.icon, isUser: false });
  }
  for (const w of eigene) {
    const cat = RUBRIKEN.includes(w.category) ? w.category : "eigene";
    dazu(cat, { id: w.id, name: w.name, icon: w.icon || "✏️", isUser: true });
  }
  return RUBRIKEN.filter((cat) => (jeRubrik.get(cat)?.length ?? 0) > 0).map((cat) => ({
    cat,
    items: jeRubrik.get(cat) ?? [],
  }));
}

/** Mitgelieferte Routinen nach Rubrik, ohne leere Rubriken — für die Bibliothek. */
export function grundRoutinen(mitgeliefert: ReadonlyArray<Workflow>): MeineRubrik[] {
  return RUBRIKEN.map((cat) => ({
    cat,
    items: mitgeliefert
      .filter((w) => w.category === cat)
      .map((w) => ({ id: w.id, name: w.name, icon: w.icon, isUser: false })),
  })).filter((r) => r.items.length > 0);
}
