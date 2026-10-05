// clar·tag — Symbole für Schritte, Routinen und Werkzeuge.
// Aus 65 SVG-Dateien erzeugt (24x24, stroke-width 1.7, currentColor).
// Farbe und Grösse kommen von aussen (siehe src/components/Sym.tsx).
// Nummern: 01–52 tägliche Nutzung, 53–65 Routinen-Bibliothek.

import type { ReactNode } from "react";

export type SymbolName =
  | "medikament"
  | "zahnbuerste"
  | "dusche"
  | "pflege"
  | "toilette"
  | "kleidung"
  | "waeschekorb"
  | "jacke"
  | "wasser"
  | "snack"
  | "essen"
  | "fruehstueck"
  | "kaffee"
  | "einkaufswagen"
  | "bett"
  | "uhr"
  | "licht"
  | "morgen"
  | "abend"
  | "wecker"
  | "schlafen"
  | "rucksack"
  | "liste"
  | "buch"
  | "erledigt"
  | "stift"
  | "kalender"
  | "computer"
  | "ziel"
  | "handy"
  | "wetter"
  | "schluessel"
  | "tuer"
  | "auto"
  | "laden"
  | "natur"
  | "haus"
  | "kopfhoerer"
  | "geld"
  | "kiste"
  | "aufraeumen"
  | "sofa"
  | "gehen"
  | "atmen"
  | "bewegungspause"
  | "sport"
  | "dehnen"
  | "belohnung"
  | "familie"
  | "kopf"
  | "person"
  | "geschenk"
  | "dokument"
  | "post"
  | "schuhe"
  | "ausweis"
  | "karte"
  | "muell"
  | "heizung"
  | "nachricht"
  | "erste_hilfe"
  | "brille"
  | "oev"
  | "fenster"
  | "foto";

export const SYMBOL_FORMEN: Record<SymbolName, ReactNode> = {
  // 01 Medikament
  medikament: (
    <>
      <path d="M5 13 13 5a4.24 4.24 0 0 1 6 6l-8 8a4.24 4.24 0 0 1-6-6Z M9 9l6 6" />
    </>
  ),
  // 02 Zahnbürste
  zahnbuerste: (
    <>
      <path d="M8 11V5h8v6H8Zm0 0v8a2 2 0 0 0 4 0v-8 M10 5V3 M13 5V3 M16 5V3 M8 8h8" />
    </>
  ),
  // 03 Dusche / Bad
  dusche: (
    <>
      <path d="M5 21V7a4 4 0 0 1 8 0 M10 9h6l1 3H9l1-3Z M10 16v1 M14 16v1 M18 16v1 M12 20v1 M16 20v1" />
    </>
  ),
  // 04 Pflege
  pflege: (
    <>
      <rect x="7" y="8" width="10" height="13" rx="2" />
      <path d="M10 8V4h4v4 M10 4h7v2" />
    </>
  ),
  // 05 Toilette
  toilette: (
    <>
      <rect x="4" y="3" width="6" height="9" rx="1" />
      <path d="M4 12h16v2a6 6 0 0 1-6 6h-2v1H7l1-5 M4 15h15 M7 6h0.01" />
    </>
  ),
  // 06 Kleidung
  kleidung: (
    <>
      <path d="m8 4-5 3 3 5 2-1v10h8V11l2 1 3-5-5-3a4 4 0 0 1-8 0Z" />
    </>
  ),
  // 07 Wäschekorb
  waeschekorb: (
    <>
      <path d="M3 9h18l-2 12H5L3 9Z M7 9l3-6 M17 9l-3-6 M8 13l.5 4 M12 13v4 M16 13l-.5 4" />
    </>
  ),
  // 08 Jacke
  jacke: (
    <>
      <path d="m8 4-3 2-2 12 4 1 1-8v10h8V11l1 8 4-1-2-12-3-2-4 3-4-3Z M8 4V3h8v1 M12 7v14 M9 15h1 M14 15h1" />
    </>
  ),
  // 09 Wasserglas
  wasser: (
    <>
      <path d="M6 3h12l-2 18H8L6 3Z M7 10c3-2 7 2 10 0" />
    </>
  ),
  // 10 Znüni / Snack
  snack: (
    <>
      <rect x="3" y="7" width="18" height="14" rx="3" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2 M3 12h18 M10 12v9" />
    </>
  ),
  // 11 Essen
  essen: (
    <>
      <circle cx="12" cy="12" r="5" />
      <path d="M3 3v6a1 1 0 0 0 2 0V3 M4 3v18 M21 21V3c-3 3-3 8 0 9" />
    </>
  ),
  // 12 Frühstück
  fruehstueck: (
    <>
      <path d="M6 10C1 9 3 3 8 3h8c5 0 7 6 2 7v11H6V10Z M10 8h4" />
    </>
  ),
  // 13 Kaffeetasse
  kaffee: (
    <>
      <path d="M4 8h13v7a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8Z M17 9h2a3 3 0 0 1 0 6h-2 M7 3v2 M12 3v2" />
    </>
  ),
  // 14 Einkaufswagen
  einkaufswagen: (
    <>
      <path d="M3 3h2l3 13h10l3-9H6 M8 12h11" />
      <circle cx="9" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
    </>
  ),
  // 15 Bett
  bett: (
    <>
      <path d="M3 21V7 M21 21V11a2 2 0 0 0-2-2h-7v7 M3 16h18 M3 19h18" />
      <rect x="4" y="10" width="6" height="6" rx="1" />
    </>
  ),
  // 16 Uhr / Pufferzeit
  uhr: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 6v6l4 2" />
    </>
  ),
  // 17 Licht
  licht: (
    <>
      <path d="M8 15a6 6 0 1 1 8 0l-1 2H9l-1-2Z M9 20h6 M11 17v-5l-2-2 M13 17v-5l2-2" />
    </>
  ),
  // 18 Morgen
  morgen: (
    <>
      <path d="M3 17h18 M7 17a5 5 0 0 1 10 0 M12 3v4 M3 10l3 2 M21 10l-3 2 M6 5l2 3 M18 5l-2 3 M5 21h14" />
    </>
  ),
  // 19 Abend
  abend: (
    <>
      <path d="M20 15A9 9 0 0 1 9 3a9 9 0 1 0 11 12Z" />
    </>
  ),
  // 20 Wecker
  wecker: (
    <>
      <circle cx="12" cy="13" r="7" />
      <path d="M12 9v4l3 2 M4 6l3-3 M17 3l3 3 M7 19l-2 2 M17 19l2 2" />
    </>
  ),
  // 21 Schlafen
  schlafen: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M6.5 10c1 2 3 2 4 0 M13.5 10c1 2 3 2 4 0 M10 16h4" />
    </>
  ),
  // 22 Rucksack / Tasche
  rucksack: (
    <>
      <rect x="5" y="6" width="14" height="15" rx="4" />
      <path d="M9 6V5a3 3 0 0 1 6 0v1 M5 12H3v6h2 M19 12h2v6h-2" />
      <rect x="8" y="13" width="8" height="5" rx="1" />
      <path d="M9 10h6" />
    </>
  ),
  // 23 Liste / Notiz
  liste: (
    <>
      <rect x="5" y="5" width="14" height="16" rx="2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="M9 12h6 M9 16h6" />
    </>
  ),
  // 24 Buch
  buch: (
    <>
      <path d="M12 6c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1Z M12 6v15" />
    </>
  ),
  // 25 Erledigt
  erledigt: (
    <>
      <path d="m4 12 5 5L20 6" />
    </>
  ),
  // 26 Stift
  stift: (
    <>
      <path d="m4 15 12-12 5 5L9 20l-6 1 1-6Z M13 6l5 5 M4 15l5 5" />
    </>
  ),
  // 27 Kalender
  kalender: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M7 3v4 M17 3v4 M3 10h18 M7 14h2 M15 14h2 M7 17h2" />
    </>
  ),
  // 28 Computer
  computer: (
    <>
      <rect x="5" y="3" width="14" height="12" rx="1" />
      <path d="M5 15 3 20h18l-2-5 M10 18h4" />
    </>
  ),
  // 29 Ziel
  ziel: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  // 30 Handy
  handy: (
    <>
      <rect x="6" y="3" width="12" height="18" rx="2" />
      <path d="M10 6h4 M11 18h2" />
    </>
  ),
  // 31 Wetter
  wetter: (
    <>
      <path d="M5 10a4 4 0 1 1 7-3 M4 5l-1-1 M8 3V2.9 M14 5l1-1 M3 10H2.9 M7 18a4 4 0 0 1 0-8h1a5 5 0 0 1 9-1 4.5 4.5 0 1 1 .5 9H7Z M10 21h5" />
    </>
  ),
  // 32 Schlüssel
  schluessel: (
    <>
      <circle cx="8" cy="8" r="5" />
      <path d="m12 12 9 9 M17 17l3-3 M14 14l2-2" />
    </>
  ),
  // 33 Tür
  tuer: (
    <>
      <path d="M4 21V4h14v17 M7 21V3l10 2v16H7Z M13 12h.01 M3 21h18" />
    </>
  ),
  // 34 Auto
  auto: (
    <>
      <path d="m5 10 2-6h10l2 6 M3 16v-4l2-2h14l2 2v4H3Z M4 16v4h3v-4 M17 16v4h3v-4 M6 13h2 M16 13h2" />
    </>
  ),
  // 35 Laden
  laden: (
    <>
      <path d="M8 3v5 M16 3v5 M6 8h12v3a6 6 0 0 1-12 0V8Z M12 17v4" />
    </>
  ),
  // 36 Natur
  natur: (
    <>
      <path d="m12 3-6 7h3l-5 7h16l-5-7h3l-6-7Z M12 17v4" />
    </>
  ),
  // 37 Haus
  haus: (
    <>
      <path d="m3 11 9-8 9 8 M5 9v12h14V9 M10 21v-8h4v8" />
    </>
  ),
  // 38 Kopfhörer / Ton
  kopfhoerer: (
    <>
      <path d="M4 14v-3a8 8 0 0 1 16 0v3" />
      <rect x="3" y="12" width="5" height="9" rx="2" />
      <rect x="16" y="12" width="5" height="9" rx="2" />
    </>
  ),
  // 39 Geld
  geld: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="12" cy="12" r="3" />
      <path d="M6 9h.01 M18 15h.01" />
    </>
  ),
  // 40 Kiste
  kiste: (
    <>
      <path d="m3 7 9-4 9 4v10l-9 4-9-4V7Z M3 7l9 4 9-4 M12 11v10 M8 5l9 4v4" />
    </>
  ),
  // 41 Aufräumen
  aufraeumen: (
    <>
      <path d="m15 3-5 10 M7 12l7 3-1 6H3l4-9Z M7 16l-2 5 M10 17l-1 4" />
    </>
  ),
  // 42 Sofa / Ruhe
  sofa: (
    <>
      <path d="M6 12V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v6 M6 16h12 M5 19v2 M19 19v2" />
      <path d="M3 12h3v4h12v-4h3v7H3v-7Z" />
    </>
  ),
  // 43 Gehen
  gehen: (
    <>
      <circle cx="13" cy="4.5" r="1.7" />
      <path d="M10 21l2-7 4 7 M12 14l-1-5 3-1 3 5h3 M11 9l-4 5H4 M14 8l-2 6" />
    </>
  ),
  // 44 Atmen / Ruhe
  atmen: (
    <>
      <path d="M3 9h12a3 3 0 1 0-3-3 M3 13h15a3 3 0 1 1-3 3 M3 17h5" />
    </>
  ),
  // 45 Bewegungspause
  bewegungspause: (
    <>
      <circle cx="12" cy="4.5" r="1.7" />
      <path d="M12 8v6 M5 6l3 4 4-2 4 2 3-4 M12 14l-4 7 M12 14l4 7" />
    </>
  ),
  // 46 Sport / Laufen
  sport: (
    <>
      <circle cx="15" cy="4.5" r="1.7" />
      <path d="m4 10 4-3 5 2-3 6 5 1 2 5 M13 9l3 4h5 M10 15l-4 5H3" />
    </>
  ),
  // 47 Dehnen
  dehnen: (
    <>
      <circle cx="11" cy="5" r="1.7" />
      <path d="m5 10 6-2 5 4 5-1 M11 8l2 7 M13 15l-6 6 M13 15l5 6 M5 10l-2-4" />
    </>
  ),
  // 48 Stern / Belohnung
  belohnung: (
    <>
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
    </>
  ),
  // 49 Familie / Gruppe
  familie: (
    <>
      <circle cx="9" cy="7" r="3" />
      <path d="M3 21v-3a6 6 0 0 1 12 0v3 M16 4a3 3 0 0 1 0 6 M18 13a5 5 0 0 1 3 5v3" />
    </>
  ),
  // 50 Kopf / Frage
  kopf: (
    <>
      <path d="M8 21v-4H5v-5H3l2-4a8 8 0 1 1 14 7v6 M11 8a2 2 0 0 1 4 0c0 2-2 1-2 3 M13 14h.01" />
    </>
  ),
  // 51 Person
  person: (
    <>
      <circle cx="12" cy="7" r="4" />
      <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
    </>
  ),
  // 52 Geschenk
  geschenk: (
    <>
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M5 12v9h14v-9 M12 8v13 M12 8C3 8 6 0 10 4l2 4Zm0 0c9 0 6-8 2-4l-2 4Z" />
    </>
  ),
  // 53 Dokument / Mappe
  dokument: (
    <>
      <path d="M5 3h9l5 5v13H5V3Z M14 3v5h5 M9 12h6 M9 16h6" />
    </>
  ),
  // 54 Post / Brief
  post: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 6 8 7 8-7" />
    </>
  ),
  // 55 Schuhe
  schuhe: (
    <>
      <path d="M3 8h5l3 5 8 2a3 3 0 0 1 2 3v3H3V8Z M3 17h18 M11 13l-2 2 M14 14l-2 2" />
    </>
  ),
  // 56 Ticket / Ausweis
  ausweis: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="8" cy="10" r="1.8" />
      <path d="M5 16a3 3 0 0 1 6 0 M14 10h4 M14 14h4" />
    </>
  ),
  // 57 Karte / Ort
  karte: (
    <>
      <path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z M9 3v15 M15 6v15" />
    </>
  ),
  // 58 Müll
  muell: (
    <>
      <path d="M3 6h18 M9 6V3h6v3 M5 6l1 15h12l1-15 M10 10v7 M14 10v7" />
    </>
  ),
  // 59 Heizung / Herd
  heizung: (
    <>
      <path d="M9.5 13.3V5.5a2.5 2.5 0 0 1 5 0v7.8a4 4 0 1 1-5 0Z M12 8v9" />
      <circle cx="12" cy="17" r="1.3" />
    </>
  ),
  // 60 Nachricht
  nachricht: (
    <>
      <path d="M21 14a4 4 0 0 1-4 4H9l-6 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v7Z M7 8h10 M7 12h7" />
    </>
  ),
  // 61 Arzt / Erste Hilfe
  erste_hilfe: (
    <>
      <rect x="3" y="7" width="18" height="14" rx="2" />
      <path d="M8 7V3h8v4 M12 11v6 M9 14h6" />
    </>
  ),
  // 62 Brille
  brille: (
    <>
      <circle cx="7" cy="14" r="4" />
      <circle cx="17" cy="14" r="4" />
      <path d="M11 13h2 M3 14V7l2-2 M21 14V7l-2-2" />
    </>
  ),
  // 63 Zug / Bus
  oev: (
    <>
      <rect x="5" y="3" width="14" height="16" rx="3" />
      <path d="M5 12h14 M12 3v9 M8 19l-2 2 M16 19l2 2 M8 15h1 M15 15h1" />
    </>
  ),
  // 64 Fenster
  fenster: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="1" />
      <path d="M12 3v18 M4 12h16 M9 15v2 M15 15v2" />
    </>
  ),
  // 65 Foto
  foto: (
    <>
      <path d="M3 8h4l2-4h6l2 4h4v13H3V8Z" />
      <circle cx="12" cy="14" r="4" />
    </>
  ),
};
