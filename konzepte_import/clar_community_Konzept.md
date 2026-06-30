# clar·community — Konzept-Skizze

> **Status:** Konzept, frühestens 2027
> **Voraussetzung:** Etabliertes Nutzerbild, anwaltliche Begleitung, Moderations-Konzept

---

## Idee in einem Satz

clar·community ist der Ort, an dem clar-Nutzer ihre Routinen, Workflows und Rezepte miteinander teilen können — kuratiert, sicher, in einer ADHS-freundlichen Form.

## Was es löst

Eines der grössten Probleme bei ADHS-Apps: die initiale Hürde, eigene Routinen zu erstellen. Eltern, die clar·tag installieren, wollen *nicht* bei Null anfangen. Sie wollen sehen, wie andere ADHS-Familien morgens überleben. Sie wollen Rezepte, die im Alltag funktionieren — nicht aus dem Foodblog, sondern von einer Mutter, die drei Kinder durch den Schulmorgen bringt.

clar·community schafft diese geteilte Wissensbasis.

## Was geteilt werden kann

| Aus App | Was |
|---|---|
| clar·tag | Routinen, ADHS-Toolbox-Configs, Entscheidungshilfen |
| clar·heim | Workflows, Aufgabenketten |
| clar·markt | Rezepte, Einkaufslisten-Vorlagen, Markt-Konfigurationen |
| App-übergreifend | "Mein Familien-System" (Komplettpaket) |

## Drei Modell-Optionen

### Modell A: Privates Sharing (einfach, sicher)

Du teilst eine Routine oder ein Rezept per Link mit einer konkreten Person, die clar nutzt. Sie öffnet den Link, importiert die Routine in ihre eigene App. Fertig.

**Pro:** Keine öffentliche Plattform, kein Moderationsbedarf, keine Datenschutzkomplikationen. Praktisch null Risiko.

**Contra:** Wenig viral. Wenig Community-Gefühl. Kein "Entdecken".

**Aufwand:** Klein. 2-3 Wochen Entwicklung.

### Modell B: Kuratiert (mittel)

Nutzer reichen Routinen/Workflows/Rezepte beim Lautini-Team ein. Das Team prüft (auf Sicherheit, Sinnhaftigkeit, Datenschutz Dritter) und veröffentlicht. Andere Nutzer können importieren. Wie ein App-Store-Modell: Library wächst kuratiert, qualitativ.

**Pro:** Qualitätskontrolle, klare Verantwortung, planbares Wachstum, schöne Bibliothek entsteht. Kann mit eigenen "Lautini Picks" gestartet werden.

**Contra:** Du wirst als Kurator für Inhalte verantwortlich. Du brauchst eine Mod-Pipeline, eine Editor-Ansicht, ein Versionierungs-System. Skaliert nicht über deine Person hinaus, solange du Solo bist.

**Aufwand:** Mittel. 6-8 Wochen Entwicklung plus laufender Betrieb.

### Modell C: Vollständige Community (komplex)

Offener Marketplace. Nutzer veröffentlichen direkt. Up-/Downvotes, Kommentare, Profile, Folgen, Feed, Suche, Filter.

**Pro:** Maximale Reichweite, virales Potenzial, Community-Gefühl.

**Contra:** Hate Speech, Trolling, Spam, Konfliktmoderation, Meldewege, gesetzliche Pflichten (DSA in EU), Datenschutz Dritter (was wenn jemand eine Routine mit Kindernamen veröffentlicht?), psychologische Risiken (Vergleichsdruck, Trigger). Braucht ein Team von mindestens 3-5 Personen für Moderation und Tech.

**Aufwand:** Sehr hoch. Mehrere Monate Entwicklung. Laufende Personalkosten.

## Empfehlung

**Modell B ist realistisch.** Es ist der einzige Weg, der für eine Solo-Gründer-Situation tragbar ist, der mit dem Wertesystem von clar (Sicherheit, Reduktion, Qualität) zusammenpasst, und der trotzdem das Community-Versprechen einlöst.

Modell A ist nur ein Vorstufe-Schritt. Modell C ist verantwortungslos, solange das Lautini-Team nicht ein Team ist.

## Skizze für Modell B

### Nutzer-Reise (Einreichen)

1. In der App: Bei jeder eigenen Routine/Workflow/Rezept ein Button "Mit der clar-Community teilen"
2. Vorbereitungs-Maske: Anonymisierung prüfen (keine Familiennamen, keine Adressen, keine Klarnamen von Beobachtern)
3. Beschreibung hinzufügen ("Warum funktioniert das für uns?")
4. Einreichung → geht in Lautini-Inbox
5. Status-Update per E-Mail ("Wir prüfen…", "Veröffentlicht", "Anpassungen nötig")

### Nutzer-Reise (Entdecken)

1. In der App: Tab "Community" oder "Bibliothek"
2. Kategorien: Morgen, Abend, Wochenende, Schule, Arbeit, Kindergarten
3. Karten mit kurzer Beschreibung, "Verwendet von X Familien"
4. Tap → Vorschau → Importieren

### Datenschutz

- Einreichungen werden **anonymisiert** veröffentlicht (kein Klarname, kein Profilbild, kein Standort)
- Nutzer können wählen: "Anonym" oder "Mit Vorname"
- Lautini behält Veto-Recht und Lösch-Recht
- Klare AGB für Community-Beiträge (Lizenz an Lautini, Lizenz an andere Nutzer)

### Moderations-Pipeline

- Inbox-Queue (Supabase-Tabelle `community_submissions`)
- Admin-Dashboard zum Sichten
- Drei Aktionen: Veröffentlichen / Anpassungen anfordern / Ablehnen
- Veröffentlichungs-Frequenz: 1-2x pro Woche realistisch für Solo-Betrieb

## Was clar·community NICHT sein darf

- **Kein Selbsthilfe-Forum.** ADHS-Selbsthilfe braucht professionelle Moderation. Das überlassen wir spezialisierten Plattformen.
- **Kein medizinischer Austausch.** Keine Diskussionen über Medikamente, Dosierungen, Diagnosen.
- **Kein Wertungssystem.** Keine Sterne, keine Likes, keine "Best of"-Listen. Das setzt Druck. Stattdessen "X Familien nutzen das" als sanfter Sozialbeweis.
- **Kein Profil-Ranking.** Keine "Top-Contributor"-Badges. Wir wollen keine ADHS-Influencer.
- **Keine Kommentare unter Beiträgen.** Vermeidet Konflikt-Eskalation. Wer Feedback geben will, schreibt direkt an Lautini.

## Rechtliche Dimension

Bei Veröffentlichung von Nutzerinhalten:
- Lizenzfrage (Nutzer überträgt Lautini Veröffentlichungsrecht)
- Haftung für Inhalte (wer haftet wenn ein Rezept gesundheitsschädlich ist?)
- DSA in EU (Digital Services Act) — Meldewege, Transparenzberichte
- Datenschutz Dritter (Bilder, Namen)
- Urheberrecht (Rezepte können geschützte Werke sein)

Vor Start: Mindestens 4-6 Stunden anwaltliche Begleitung nur für Community-Layer.

## Erst dann beginnen wenn

- [ ] clar·markt, clar·heim, clar·tag, clar·log + clar·task laufen stabil
- [ ] Mindestens 500 zahlende Familien
- [ ] Erste Community wächst organisch im persönlichen Umfeld
- [ ] Anwältliche Begleitung gesichert
- [ ] Klare Vorstellung wie viele Stunden pro Woche du Moderation leisten kannst

## Risiken-Zusammenfassung

| Risiko | Eintrittswahrscheinlichkeit | Schweregrad |
|---|---|---|
| Trolling/Hate Speech | Mittel | Hoch |
| Mod-Burnout (Solo) | Hoch | Hoch |
| Schädliche Routinen (z.B. zu strikt) | Mittel | Mittel |
| Datenschutz-Verstösse durch Nutzer | Mittel | Hoch |
| Haftung für Inhalte | Niedrig | Sehr hoch |
| Community-Stillstand (keine Beiträge) | Niedrig | Mittel |
