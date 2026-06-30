# clar·task — Konzept-Skizze

> **Status:** Konzept, frühestens Q4 2026
> **Voraussetzung:** clar·markt, clar·heim, clar·tag, clar·log sind stabil, rechtlich abgesichert und kostendeckend

---

## Idee in einem Satz

clar·task ist die zusammenführende Schicht des clar-Ökosystems — der eine Ort, an dem man morgens aufs Handy schaut und weiss, was heute wirklich dran ist.

## Was es löst

Das ADHS-typische "Ich habe zehn Apps offen und verliere den Überblick"-Problem. Wer clar·markt, clar·heim, clar·tag und clar·log nutzt, hat heute vier verschiedene Einstiegspunkte am Morgen. Das überfordert genau jene Zielgruppe, für die clar gebaut ist.

clar·task hat **kein eigenes primäres Datenmodell**. Es ist eine aggregierende Sicht plus ein Speicher für all das, was in keine der anderen Apps gehört.

## Eingaben

### Aus anderen clar-Apps (read-only Aggregation)

| Quelle | Was kommt rein |
|---|---|
| clar·heim | anstehende Workflows (Backofen reinigen, Kühlschrank…) |
| clar·markt | offene Einkaufslisten, fällige Spontaneinkäufe |
| clar·tag | Routinen, die heute noch nicht gestartet sind |
| clar·log | "Heute Tagebuch ausfüllen", Medikamenten-Erinnerung |

### Eigene clar·task-Items

Alles andere — alles was nicht Routine, nicht Haushalt, nicht Einkauf, nicht Medikamenten-Doku ist:
- Anrufe (Arzt, Versicherung, Behörden)
- Termine (nicht im Kalender stehende Erinnerungen wie "heute Geburtstagskarte für Oma kaufen")
- Behördliche Pflichten (Steuererklärung, Versicherungen)
- Einmalige Aufgaben (Auto zum Service, Reisepass verlängern)
- Lose Erinnerungen ohne klares Datum

## Kern-Design-Prinzipien

### Drei Buckets statt Datum

Datum ist für viele Neurodivergente ein Stolperstein. Ein Kalender-Datum erzeugt sofort Druck und Versagensgefühl bei Verschiebung.

Stattdessen drei Buckets:
- **Heute** — alles was heute passieren soll
- **Diese Woche** — diese Woche, aber egal welcher Tag
- **Irgendwann** — kommt schon

Drag-and-Drop zwischen Buckets. Kein Datums-Pflichtfeld.

### Snooze statt Verschiebung

Statt "neues Datum eingeben" — schnelle Knöpfe:
- "Morgen früh"
- "Heute Abend"
- "Nächste Woche"
- "Wenn ich zu Hause bin"

### Kontext statt Kategorien

Keine Tags, keine Kategorien — das ist ADHS-Killer. Stattdessen automatischer Kontext:
- "Beim Einkauf" (Items mit Markt-Tag)
- "Wenn ich Zeit habe" (Backlog)
- "Wartet auf jemanden" (Anrufe etc.)

## Schlüsselfeatures

### Zusammenführungs-Logik

Morgens auf "Heute" öffnen → man sieht:
- 3 Aufgaben aus clar·heim
- 1 Einkauf aus clar·markt
- 2 Routinen aus clar·tag
- "Tagebuch ausfüllen" aus clar·log
- 4 eigene clar·task-Items

Alles in einer durchscrollbaren Liste, gruppiert nach Quelle. Mit einem Tap landet man in der jeweiligen App, um die Aufgabe zu starten.

### Wenn-Dann-Trigger (V2)

- "Wenn Morgenroutine erledigt, zeige diese Aufgabe"
- "Wenn ich beim Einkauf bin (Standort), zeige Einkauf-Aufgaben"
- "Jeden Sonntagabend: Wochenrückblick"

### Body-Doubling-Integration

Bei jeder Aufgabe ein Button "Gemeinsam erledigen" — startet eine Body-Doubling-Session aus clar·tag mit dieser Aufgabe als Fokus.

### Familien-Sichtbarkeit

Wie überall im clar-Ökosystem: optionales Familien-Sharing. "Wer hat heute was übernommen?"

## Was clar·task bewusst NICHT ist

- **Kein Todoist** — zu viel Struktur, zu viele Optionen, zu viel Konfiguration
- **Kein Kanban** — visuelles Rauschen, Bedarf an Spaltennamen, Drag-and-Drop-Choreografie
- **Keine Projekte/Unterprojekte** — Hierarchien sind ADHS-Killer
- **Keine Tags, Labels, Prioritäten** — kognitive Last ohne klaren Mehrwert
- **Kein eigenes Notizbuch** — Notizen gehören in eine Notizen-App

## Technisch (vorläufig)

- Eigenes Supabase-Schema `clar_task`
- Read-Only-Queries auf andere Schemas via Database Views (mit RLS)
- Aggregations-View `task_today` und `task_this_week`
- Push-Notifications via Resend oder Web Push
- iOS Live Activities für "Aktuelle Aufgabe"

## Risiken

- **Verzettelung:** Das Ökosystem wächst weiter und die Komplexität steigt. Jede neue App vervielfacht die Wartungsarbeit.
- **Definitionsproblem:** Die Grenze zwischen clar·tag (Routinen) und clar·task (Aufgaben) muss klar sein, sonst doppelte Funktionalität.
- **Aggregations-Performance:** Wenn vier Apps gleichzeitig abgefragt werden, muss das schnell sein, sonst öffnet niemand die App.

## Preis-Idee

clar·task ist die natürliche "Klammer-App" — sie wird vermutlich vor allem im Bundle Sinn machen. Daher:
- Einzeln: CHF 3.90/Monat
- Im Bundle automatisch enthalten (was den Bundle-Wert erhöht)

## Erst dann beginnen wenn

- [ ] clar·markt, clar·heim, clar·tag, clar·log sind im App Store live
- [ ] Mindestens 100 zahlende Familien
- [ ] DSGVO-Audit abgeschlossen
- [ ] Erstes positives Cashflow-Quartal
- [ ] Kapazität für 4-6 Wochen Entwicklung verfügbar
