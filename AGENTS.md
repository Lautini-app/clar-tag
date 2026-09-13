# clar·tag — Tagesstruktur

**Stack:** TanStack Start + React 19 + Vite 7 + Tailwind 4 · Supabase Schema
`clar_tag` · Domain clar.tag.lautini.ch

**Fallstrick:** Der iCal-Feed lief einmal auf 500, weil eine vinxi-Route vom
vite-Build ignoriert wurde. Lösung war eine echte TanStack-Server-Route unter
`src/routes/api/calendar/$token.ts`.

## Das clar-Universum

clar ist eine Familie von Web-Apps für Familien mit ADHS, gebaut und betrieben
von einer Einzelperson (Rainer Böhm, Heilpädagoge, Schweiz).

| App | Zweck | Domain |
|---|---|---|
| clar (Hülle/iOS) | Kacheln, Paywall, Konto, Abos | app.lautini.ch |
| clar·log | Medikamenten- und Beobachtungstagebuch | clar.log.lautini.ch |
| clar·heim | Familien-Haushalt, Aufgaben | clar.heim.lautini.ch |
| clar·markt | Einkauf und Vorrat | clar.markt.lautini.ch |
| clar·tag | Tagesstruktur | clar.tag.lautini.ch |
| Landing | Produktseite de/fr/en | clar-adhs.ch |
| Blog | 25 Seiten | blog.lautini.ch |

**Hosting:** Vercel, git-verbunden — Push auf `main` deployt.
Die iOS-App ist eine Despia-Hülle um app.lautini.ch: **ein Web-Deploy verändert
die App sofort, ohne neuen Build im App Store.**

**Datenbank:** ein gemeinsames Supabase-Projekt, getrennt nach Schema
(`clar_log`, `clar_heim`, `clar_markt`, `clar_tag`), gemeinsames `public` für
kontoweite Dinge (`email_consent`, `audit_log`). Jeder Browser-Client setzt
`db: { schema: "…" }`.

**Abos:** RevenueCat, Produkt-IDs `ch.lautini.clar2.{1app|2apps|all}.{monthly|yearly}`.
Die Edge Function `revenuecat-webhook` leitet die Berechtigung per Textvergleich
aus der Produkt-ID ab (`.all.` / `.2apps.` / `.1app.`) — neue IDs müssen diesem
Muster folgen.

## Feste Vorgaben

- **Deutsch**, auch in Commit-Nachrichten und in der Oberfläche.
- **Schweiz-only** (revDSG). Abos sind nur in CHE verfügbar. Keine Ausweitung
  ohne ausdrückliche Rückfrage.
- **Gesundheitsdaten von Kindern.** Datensparsamkeit geht vor Bequemlichkeit.
  E-Mail-Erinnerungen wurden bewusst nicht gebaut, weil dafür Adressen von
  Angehörigen gespeichert werden müssten.
- **Nichts nach aussen senden** (App Store, E-Mail, Veröffentlichungen) ohne
  ausdrückliche Freigabe.
- **Keine Schlüssel im Klartext** — weder in Dateien noch in Remote-URLs.
- Der Autor ist Heilpädagoge, kein Informatiker: erkläre ohne Fachjargon,
  dafür konkret und an Beispielen.

## Regel, die teuer gelernt wurde

Jede Ansicht für **Nicht-Eingeloggte** (Arzt-Dossier, Beobachter-Formular,
Kalenderfeed) MUSS über eine Server-Function mit Service-Key laufen — niemals
direkt per supabase-js aus dem Browser. RLS gibt anonymen Besuchern nichts
zurück, und zwar **ohne Fehler**: die Seite bleibt einfach leer.
