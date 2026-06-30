// 10 Bibliotheks-Routinen — Sport-Session + 9 Vorschläge
// Schritte wortwörtlich aus den Konzept-Dateien
//   konzepte_import/routine_sport_session.md
//   konzepte_import/routinen_bibliothek_vorschlaege.md
//
// Diese Routinen werden zusätzlich zu den Built-ins in `workflows.ts` exportiert
// und in der Bibliothek angezeigt. Material-Listen und ADHS-Stolperfallen sind
// optionale Felder am `Workflow`-Typ und werden im Detail unterhalb der Schritte
// gerendert.

import type { Step, Workflow } from "@/lib/workflows";

const s = (emoji: string, text: string, opts: { hint?: string; duration?: number } = {}): Step => ({
  emoji,
  text,
  hint: opts.hint,
  duration: opts.duration ?? 0,
});

// ─────────────────────────────────────────────────────────────────────────────
// 1. Sport-Session (generisch, variantenfähig)
// ─────────────────────────────────────────────────────────────────────────────

const sportSession: Workflow = {
  id: "sport_session",
  name: "Sport-Session",
  icon: "🏋️",
  category: "gesundheit",
  defaultGrade: "mittel",
  steps: {
    grob: [
      s("🎒", "Tasche gepackt", { hint: "Vorabend" }),
      s("👕", "Trainingskleidung an", { hint: "Aufbruch" }),
      s("🏃", "Hingehen + Sport machen", { hint: "Termin", duration: 60 }),
      s("🚿", "Duschen / umziehen", { hint: "nach Sport", duration: 10 }),
      s("🍌", "Snack + Trinken auffüllen", { hint: "nach Sport" }),
    ],
    mittel: [
      s("🎒", "Sport-Tasche packen", { hint: "Vorabend · Material-Liste je Variante" }),
      s("👕", "Trainingskleidung bereitlegen", { hint: "Vorabend · saubere" }),
      s("💧", "Wasserflasche füllen + in Kühlschrank", { hint: "Vorabend · falls heiss" }),
      s("🍌", "Kleiner Snack falls letzte Mahlzeit > 2h zurück", {
        hint: "1-2h vorher · Banane, Riegel — nicht zu schwer",
      }),
      s("✅", "Wasserflasche + Tasche checken", { hint: "Vor dem Sport" }),
      s("🚪", "Aufbruch mit Pufferzeit", { hint: "kein Hetzen — verdirbt die Stimmung" }),
      s("💧", "Regelmässig trinken", { hint: "Während · alle 15-20 Min, nicht erst bei Durst" }),
      s("🎯", "Tempo halten", { hint: "Während · lieber 80% gut als 100% verbrannt" }),
      s("🚿", "Duschen + umziehen", { hint: "nach Sport · Wechselkleidung", duration: 10 }),
      s("🥪", "Snack mit Protein + Kohlenhydraten + Wasser auffüllen", { hint: "nach Sport" }),
    ],
    fein: [
      s("📅", "Sportzeit im Kalender bestätigt", { hint: "Vorabend" }),
      s("🧺", "Trainingskleidung sauber? Falls nicht: heute waschen", { hint: "Vorabend" }),
      s("👟", "Schuhe griffbereit", { hint: "Vorabend · oft das vergessene Teil" }),
      s("💧", "Wasserflasche füllen + Kühlschrank", { hint: "Vorabend" }),
      s("🎒", "Sport-Tasche packen", { hint: "Vorabend · komplette Material-Liste" }),
      s("⏰", "Wecker stellen falls morgens / Termin im Kalender bestätigen", { hint: "Vorabend" }),
      s("🍌", "Kleiner Snack falls Magen leer", {
        hint: "1-2h vorher · nicht hungrig, nicht voll",
      }),
      s("💧", "300-500ml Wasser trinken", { hint: "1-2h vorher · Vor-Hydrierung" }),
      s("🚻", "Toilette vor Aufbruch", { hint: "1-2h vorher" }),
      s("✅", "Tasche, Schuhe, Flasche — Türcheck", { hint: "1-2h vorher" }),
      s("🚪", "Mit Pufferzeit losgehen", { hint: "Aufbruch · 10-15 Min Reserve" }),
      s("👕", "Trainingskleidung an", { hint: "Aufbruch · oder mitnehmen je nach Sport" }),
      s("🤸", "Aufwärmen", { hint: "Während · 5-10 Min, nicht überspringen", duration: 10 }),
      s("💧", "Regelmässig trinken", { hint: "Während · alle 15-20 Min" }),
      s("🧘", "Bewusste Atemzüge zwischen Sets / Intervallen", { hint: "Während" }),
      s("🛑", "Bei Schmerz: pausieren, nicht durchziehen", {
        hint: "Während · ADHS-Hyperfokus-Falle",
      }),
      s("🧊", "Cool-Down 3-5 Min", {
        hint: "nach Sport · verhindert nächsttägliche Muskelkater",
        duration: 5,
      }),
      s("🚿", "Duschen + Wechselkleidung", { hint: "nach Sport", duration: 10 }),
      s("🥪", "Snack mit Protein + Kohlenhydraten", {
        hint: "nach Sport · Joghurt+Banane, Hummus+Brot, etc.",
      }),
      s("💧", "Wasserflasche zu Hause auffüllen für nächstes Mal", { hint: "nach Sport" }),
      s("🛋️", "30-60 Min Ruhe einplanen", {
        hint: "Recovery (optional) · Sofa, Buch, kein nächster Termin",
      }),
      s("📓", "Sport notiert — was, wie fühlte sich an", {
        hint: "Recovery (optional) · clar·log oder clar·tag",
      }),
    ],
  },
  variants: [
    {
      id: "studio",
      label: "Studio / Krafttraining",
      material: [
        "Trainingskleidung (Shirt, Hose, Socken)",
        "Sportschuhe",
        "Wechselshirt",
        "Handtuch (Studio + Dusche)",
        "Wasserflasche",
        "Snack für danach",
        "Mitgliedskarte / Studio-App",
        "Kopfhörer + Telefon",
        "Duschsachen (Shampoo, Duschgel)",
        "Wechselunterwäsche",
        "Deo",
      ],
    },
    {
      id: "outdoor",
      label: "Outdoor / Laufen / Radfahren",
      material: [
        "Sportkleidung wetterangepasst",
        "Sportschuhe",
        "Trinkflasche / Trinkrucksack",
        "Telefon (Tracking, Notfall)",
        "Schlüssel sicher verstaut",
        "Wettercheck vor Aufbruch",
        "Sonnencreme falls sonnig",
        "Kopfbedeckung bei Hitze/Kälte",
        "Reflektoren bei Dämmerung",
        "Energy-Riegel bei längeren Strecken (>60 Min)",
      ],
    },
    {
      id: "schwimmbad",
      label: "Schwimmbad",
      material: [
        "Badekleidung",
        "Handtuch (gross + klein)",
        "Badelatschen",
        "Schwimmbrille",
        "Badekappe falls Pflicht",
        "Wechselunterwäsche",
        "Duschsachen (im Bad oft eingeschränkt nutzbar)",
        "Föhn-Frage geklärt (haben oder mitnehmen)",
        "Kämmchen / Bürste",
        "Wasserflasche",
        "Snack",
        "Mitgliedskarte / Eintrittsgeld",
      ],
    },
    {
      id: "team",
      label: "Team-Sport / Verein",
      material: [
        "Trikot / Vereinsoutfit",
        "Sportschuhe (Hallen- oder Aussenschuhe je nach Sport)",
        "Schienbeinschoner falls nötig",
        "Wechselshirt",
        "Handtuch",
        "Wasserflasche (gross)",
        "Trinkflasche für Pausen",
        "Snack für danach",
        "Notfallausrüstung (Tape, kleine Verbandszeug — falls verantwortlich)",
        "Treffpunkt + Anfahrt geklärt",
        "Telefon-Nummern der Team-Kollegen",
      ],
    },
  ],
  adhsTips: [
    "„Ich gehe heute spontan” — und vergesse die Hälfte → Tasche IMMER abends packen, auch wenn morgens-Sport spontan klingt.",
    "„Vor dem Sport noch schnell X erledigen” → ADHS-Aufgaben-Verschachtelung führt zu verspätetem Aufbruch + schlechter Stimmung. Aufbruch fix einplanen, vorher nichts Neues anfangen.",
    "„Ich hatte vor 4 Stunden Mittagessen, das reicht doch” → Snack-Check zur Routine machen (Banane vor Sport ist nie verkehrt).",
    "Hyperfokus während des Trainings → Trinken-Erinnerung wichtig. Pausen-Schritt einbauen, nicht durchziehen.",
    "„Nach dem Sport mach ich noch schnell...” → Recovery-Schritt in die Routine, nicht direkt zum nächsten Termin. Mindestens 20 Min Übergang einplanen.",
  ].join("\n\n"),
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. Arzttermin
// ─────────────────────────────────────────────────────────────────────────────

const arzttermin: Workflow = {
  id: "arzttermin",
  name: "Arzttermin",
  icon: "🩺",
  category: "gesundheit",
  defaultGrade: "mittel",
  steps: {
    grob: [
      s("🪪", "Versichertenkarte einstecken"),
      s("💊", "Medikamentenliste griffbereit"),
      s("📝", "Fragen aufgeschrieben"),
      s("🚶", "Hingehen mit Pufferzeit"),
      s("📓", "Notizen nach Termin"),
    ],
    mittel: [
      s("🪪", "Versichertenkarte raussuchen, ins Portemonnaie", { hint: "Vorabend" }),
      s("💊", "Aktuelle Medikamentenliste griffbereit", {
        hint: "Vorabend · auch Selbstmedikation, Supplements",
      }),
      s("📝", "Symptom-Notizen — was, wann, wie stark, wie oft", { hint: "Vorabend" }),
      s("❓", "Fragen aufschreiben", {
        hint: "Vorabend · im ADHS-Wartezimmer-Stress vergisst man alles",
      }),
      s("📂", "Überweisung, Befunde, alte Berichte einsortieren", { hint: "Vorabend" }),
      s("⏱️", "15-30 Min Puffer vor Termin", { hint: "Aufbruch" }),
      s("📓", "Notizblock/Telefon bereit", { hint: "Im Wartezimmer" }),
      s("🎙️", "Mitschreiben oder Sprachmemo", { hint: "Im Termin · mit Erlaubnis" }),
      s("✍️", "Notizen vervollständigen — was wurde gesagt, was vereinbart", {
        hint: "Nach Termin",
      }),
      s("📅", "Folgetermin direkt eintragen + Erinnerung setzen", { hint: "Nach Termin" }),
    ],
    fein: [
      s("🪪", "Versichertenkarte raussuchen, ins Portemonnaie", { hint: "Vorabend" }),
      s("💊", "Aktuelle Medikamentenliste griffbereit", {
        hint: "Vorabend · auch Selbstmedikation, Supplements",
      }),
      s("📝", "Symptom-Notizen — was, wann, wie stark, wie oft", { hint: "Vorabend" }),
      s("❓", "Fragen aufschreiben", { hint: "Vorabend" }),
      s("📂", "Überweisung, Befunde, alte Berichte einsortieren", { hint: "Vorabend" }),
      s("⏱️", "15-30 Min Puffer vor Termin", { hint: "Aufbruch" }),
      s("📓", "Notizblock/Telefon bereit", { hint: "Im Wartezimmer" }),
      s("🎙️", "Mitschreiben oder Sprachmemo", { hint: "Im Termin" }),
      s("✍️", "Notizen vervollständigen", { hint: "Nach Termin" }),
      s("📅", "Folgetermin eintragen + Erinnerung setzen", { hint: "Nach Termin" }),
      s("📔", "Tagebuch der Beschwerden vorab führen", { hint: "Plus" }),
      s("📞", "Telefon der Praxis griffbereit", { hint: "Plus · falls Verspätung" }),
      s("👥", "Begleitperson überlegen bei wichtigem Termin", { hint: "Plus" }),
      s("👕", "Untersuchungs-Kleidung vorab überlegen", { hint: "Plus · Termin am Knie = kurze Hose" }),
      s("🍽️", "Essen/Trinken vor Blutabnahme abklären", { hint: "Plus" }),
      s("💊", "Apotheke gleich nebenan? Rezept einlösen", { hint: "Plus" }),
      s("📄", "Krankschreibung gebraucht? Direkt fragen", { hint: "Plus" }),
      s("📦", "Folgemedikation: Vorrat noch ausreichend?", { hint: "Plus" }),
      s("📔", "Termin in Symptom-Logbuch nachtragen", { hint: "Plus" }),
    ],
  },
  material: [
    "Versichertenkarte",
    "Medikamentenliste",
    "Notizblock/Stift",
    "Telefon",
    "Überweisung/Befunde",
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. Geburtstag gratulieren
// ─────────────────────────────────────────────────────────────────────────────

const geburtstag: Workflow = {
  id: "geburtstag_gratulieren",
  name: "Geburtstag gratulieren",
  icon: "🎂",
  category: "soziales",
  defaultGrade: "mittel",
  steps: {
    grob: [
      s("💬", "Gratulieren (Anruf / Nachricht / Karte)"),
      s("🎁", "Geschenk besorgt? Falls nötig"),
      s("💌", "Karte besorgt? Falls nötig"),
      s("📅", "Termin für Treffen, falls geplant"),
      s("✅", "Im Kalender abhaken"),
    ],
    mittel: [
      s("💡", "Geschenkidee überlegen", { hint: "2-3 Wochen vorher · bei wichtigen Personen" }),
      s("🎁", "Geschenk bestellen/besorgen", { hint: "2 Wochen vorher" }),
      s("💌", "Karte kaufen + schreiben", { hint: "1 Woche vorher" }),
      s("📮", "Karte verschicken", { hint: "2-3 Tage vorher · Post braucht Zeit" }),
      s("📦", "Geschenk eingepackt? Adresse parat?", { hint: "Vorabend" }),
      s("📱", "Erste Nachricht (WhatsApp/SMS) noch vor dem Tagesstart", {
        hint: "Tag selbst — morgens",
      }),
      s("📞", "Anruf wenn vereinbart", { hint: "Tag selbst · Uhrzeit checken — Arbeitstag?" }),
      s("💬", "Falls vergessen: kurze Nachricht noch besser als gar nichts", {
        hint: "Tag selbst — abends",
      }),
      s("👥", "Treffen oder Telefonat planen", { hint: "Sozialer Kontakt" }),
      s("📓", "„Was geschenkt?” notieren", { hint: "Im Kontakt-Buch · für nächstes Jahr" }),
    ],
    fein: [
      s("💡", "Geschenkidee überlegen", { hint: "2-3 Wochen vorher" }),
      s("🎁", "Geschenk bestellen/besorgen", { hint: "2 Wochen vorher" }),
      s("💌", "Karte kaufen + schreiben", { hint: "1 Woche vorher" }),
      s("📮", "Karte verschicken", { hint: "2-3 Tage vorher" }),
      s("📦", "Geschenk eingepackt? Adresse parat?", { hint: "Vorabend" }),
      s("📱", "Erste Nachricht morgens", { hint: "Tag selbst" }),
      s("📞", "Anruf wenn vereinbart", { hint: "Tag selbst" }),
      s("💬", "Abendnachricht falls vergessen", { hint: "Tag selbst" }),
      s("👥", "Treffen oder Telefonat planen", { hint: "Sozialer Kontakt" }),
      s("📓", "„Was geschenkt?” notieren", { hint: "Im Kontakt-Buch" }),
      s("🤔", "Beziehung zur Person reflektieren — passende Geschmacksrichtung?", { hint: "Plus" }),
      s("🥗", "Allergien/Diät bei Essen-Geschenken", { hint: "Plus" }),
      s("📦", "Verpackungs-Vorrat checken", { hint: "Plus" }),
      s("✉️", "Karten-Adresse aktuell?", { hint: "Plus" }),
      s("📷", "Gemeinsame Erinnerungen in der Karte erwähnen", { hint: "Plus" }),
      s("👨‍👩‍👧", "Bei Familie: gemeinsame Karte oder einzelne?", { hint: "Plus" }),
      s("🖼️", "Foto-Geschenk: rechtzeitig drucken/rahmen", { hint: "Plus" }),
      s("🚚", "Lieferzeit bei Online-Geschenken", { hint: "Plus" }),
      s("🤝", "Persönliche Übergabe planen", { hint: "Plus" }),
      s("🔁", "Vorjahres-Geschenk nicht wiederholen", { hint: "Plus" }),
    ],
  },
  material: ["Geschenk", "Karte", "Briefmarke", "Telefon", "Kontakt-Liste", "Kalender"],
  adhsTips:
    "Den Tag selbst vergisst man nicht durch fehlende Erinnerung, sondern weil man morgens denkt „mache ich später” und es ist abends 23 Uhr. Erste Reaktion sofort — nicht „mache ich später”.",
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. Sonntagabend — Woche vorbereiten
// ─────────────────────────────────────────────────────────────────────────────

const sonntagabend: Workflow = {
  id: "sonntagabend_woche",
  name: "Sonntagabend — Woche vorbereiten",
  icon: "🗓️",
  category: "vorbereitung",
  defaultGrade: "mittel",
  steps: {
    grob: [
      s("📅", "Kalender Woche durchschauen"),
      s("🧺", "Wäsche für die Woche"),
      s("🍞", "Frühstück Montag vorbereiten"),
      s("👕", "Bekleidung Montag rauslegen"),
      s("😴", "Früh ins Bett"),
    ],
    mittel: [
      s("📅", "Kalender Woche", {
        hint: "Was kommt, was fehlt, was muss vorbereitet werden",
      }),
      s("⏰", "Termine prüfen", {
        hint: "Wartezeiten zwischen Terminen? Pendelzeiten realistisch?",
      }),
      s("🍽️", "Essen: Wochenmenü grob planen", { hint: "mit clar·markt verknüpft" }),
      s("🛒", "Einkauf: Liste für Montagmorgen oder „aus dem Büro abholen”"),
      s("🧺", "Wäsche: Was muss bis wann gewaschen sein?"),
      s("👕", "Bekleidung: Montag-Outfit raus, ggf. bügeln"),
      s("🍞", "Frühstück Montag: Müsli auffüllen, Brot da?"),
      s("🎒", "Schultaschen / Arbeitstaschen: Sind sie gepackt für Montag?"),
      s("😴", "Schlafenszeit: Sonntag-Abend früh", { hint: "Montag startet schwer" }),
      s("⚖️", "Belastungs-Check", { hint: "Drei Belastungen in der Woche? Pufferzeit irgendwo?" }),
    ],
    fein: [
      s("📅", "Kalender Woche durchgehen"),
      s("⏰", "Termine prüfen"),
      s("🍽️", "Wochenmenü grob planen"),
      s("🛒", "Einkaufsliste"),
      s("🧺", "Wäsche planen"),
      s("👕", "Montag-Outfit raus"),
      s("🍞", "Frühstück Montag vorbereiten"),
      s("🎒", "Schultaschen / Arbeitstaschen gepackt"),
      s("😴", "Früh ins Bett"),
      s("⚖️", "Belastungs-Check"),
      s("🧦", "Wochenend-Wäsche fertig falten", { hint: "Plus" }),
      s("🥪", "Lunchbox-Plan Mo-Fr", { hint: "Plus" }),
      s("👶", "Kinder-Termine in den eigenen Kalender", { hint: "Plus" }),
      s("👨‍👩‍👧", "Familie-Briefing am Sonntagabend", {
        hint: "Plus · „Mo Schwimmunterricht, Mi Elternabend”",
      }),
      s("🗑️", "Müll rausstellen am richtigen Tag", { hint: "Plus" }),
      s("🔋", "Ladekabel/Telefon: alles voll?", { hint: "Plus" }),
      s("💵", "Bargeld vorhanden?", { hint: "Plus" }),
      s("🚊", "ÖV-Ticket / Auto getankt?", { hint: "Plus" }),
      s("🧠", "Mental Health Check", { hint: "Plus · wie war die letzte Woche, was änder ich?" }),
      s("✨", "Eine Sache richtig vorfreuen lassen", {
        hint: "Plus · ohne Vorfreude wird die Woche grau",
      }),
    ],
  },
  material: ["Kalender", "Wochenmenü", "Einkaufsliste", "Wäschestapel"],
  adhsTips:
    "Den Sonntagabend „nicht heute, dann morgen” verschieben → Montag im Tal. Termin im Kalender fixieren.",
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. Wochenendreise (2 Nächte)
// ─────────────────────────────────────────────────────────────────────────────

const wochenendreise: Workflow = {
  id: "wochenendreise",
  name: "Wochenendreise (2 Nächte)",
  icon: "🧳",
  category: "reisen",
  defaultGrade: "mittel",
  steps: {
    grob: [
      s("🌦️", "Wettercheck Zielort"),
      s("👕", "Kleidung für 3 Tage packen"),
      s("🧴", "Toiletten-Beutel"),
      s("🔌", "Telefon/Ladekabel"),
      s("📍", "Adresse + Buchung im Telefon"),
    ],
    mittel: [
      s("🌦️", "Wetter prüfen, Aktivitäten grob planen", { hint: "3 Tage vorher" }),
      s("📄", "Buchungs-Bestätigungen sammeln", { hint: "3 Tage vorher · im Telefon-Ordner" }),
      s("🧺", "Wäsche checken — alles sauber was mit soll?", { hint: "2 Tage vorher" }),
      s("👕", "Kleidung für 3 Tage zusammenstellen", {
        hint: "1 Tag vorher · 2 Outfits + Wechselsachen",
      }),
      s("🧴", "Toiletten-Beutel packen", {
        hint: "1 Tag vorher · Zahnbürste, Medikamente, Pflege",
      }),
      s("🔌", "Telefon, Ladekabel, Powerbank", { hint: "1 Tag vorher" }),
      s("🔑", "Schlüssel, Geld, Karten, Ausweis, Buchungs-Bestätigung", { hint: "Aufbruch" }),
      s("🌡️", "Heizung/Klimaanlage runter, Pflanzen gegossen", { hint: "Aufbruch" }),
      s("🗑️", "Müll raus, Kühlschrank gecheckt", { hint: "Aufbruch · verderbliche Sachen" }),
      s("🚪", "Türcheck — Fenster, Türen, Herd, Bügeleisen", { hint: "Aufbruch" }),
    ],
    fein: [
      s("🌦️", "Wetter prüfen", { hint: "3 Tage vorher" }),
      s("📄", "Buchungen sammeln", { hint: "3 Tage vorher" }),
      s("🧺", "Wäsche checken", { hint: "2 Tage vorher" }),
      s("👕", "Kleidung für 3 Tage", { hint: "1 Tag vorher" }),
      s("🧴", "Toiletten-Beutel", { hint: "1 Tag vorher" }),
      s("🔌", "Telefon, Ladekabel, Powerbank", { hint: "1 Tag vorher" }),
      s("🔑", "Schlüssel, Geld, Karten, Ausweis", { hint: "Aufbruch" }),
      s("🌡️", "Heizung runter, Pflanzen gegossen", { hint: "Aufbruch" }),
      s("🗑️", "Müll raus, Kühlschrank gecheckt", { hint: "Aufbruch" }),
      s("🚪", "Türcheck", { hint: "Aufbruch" }),
      s("🚗", "Auto-Check (Tank, Reifendruck, Wischwasser)", { hint: "Plus" }),
      s("💵", "Bargeld für Trinkgeld/Parkplatz", { hint: "Plus" }),
      s("🔌", "Reise-Adapter falls Ausland", { hint: "Plus" }),
      s("🛂", "Reisepass/ID gültig?", { hint: "Plus" }),
      s("💊", "Reise-Apotheke", { hint: "Plus · Aspirin, Pflaster, Allergiemittel" }),
      s("🥨", "Snacks für die Fahrt", { hint: "Plus" }),
      s("🎧", "Mediathek/Podcasts vorab geladen für Offline", { hint: "Plus" }),
      s("🍽️", "Reservierung Restaurant für 1. Abend", { hint: "Plus" }),
      s("🐕", "Wochenend-Notdienst-Telefon Heim/Tier sortiert", { hint: "Plus" }),
      s("👋", "Nachbarn informiert", { hint: "Plus" }),
      s("📬", "Briefkasten geleert/Stop für Post", { hint: "Plus" }),
      s("🔑", "Spät-Anreise: Schlüsselübergabe geklärt", { hint: "Plus" }),
      s("☕", "Frühstück am Reiseziel: gebucht?", { hint: "Plus" }),
      s("🚦", "Rückreise-Verkehr im Blick", { hint: "Plus" }),
      s("🏕️", "Tageskasse Camper falls relevant", { hint: "Plus" }),
    ],
  },
  material: [
    "Kleidung (Outfits + Reserve)",
    "Toiletten-Beutel",
    "Telefon/Ladegerät/Powerbank",
    "Buchungen",
    "Ausweis",
    "Geld",
    "Snacks für Fahrt",
  ],
  adhsTips:
    "Spontan einpacken am Morgen → halbe Stunde Verzögerung + Hektik + vergessenes Ladekabel.",
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. Heimkommen / Ankommen
// ─────────────────────────────────────────────────────────────────────────────

const heimkommen: Workflow = {
  id: "heimkommen",
  name: "Heimkommen / Ankommen",
  icon: "🏠",
  category: "uebergang",
  defaultGrade: "grob",
  steps: {
    grob: [
      s("👟", "Schuhe aus, an festen Platz"),
      s("🧥", "Jacke aufhängen"),
      s("🔑", "Schlüssel an festen Platz"),
      s("🎒", "Tasche auspacken", { hint: "Müll raus, was rein muss" }),
      s("🔋", "Telefon laden"),
    ],
    mittel: [
      s("👟", "Schuhe ausziehen, an festen Platz", { hint: "Tür rein · nicht Mitte Flur" }),
      s("🔑", "Schlüssel sofort an festen Platz", {
        hint: "Haken, Schale — nicht in Tasche lassen",
      }),
      s("🧥", "Jacke aufhängen", { hint: "nicht über Stuhl" }),
      s("🎒", "Tasche auspacken", {
        hint: "Müll raus, Schmutzwäsche in Korb, Wichtiges raus",
      }),
      s("📱", "Geldbörse / Telefon an festen Platz"),
      s("📬", "Post sortieren oder Stapel anlegen", { hint: "keine Briefe in der Jacke" }),
      s("🌧️", "Schuhe sauber?", { hint: "Falls regnasy: weg vom Eingang" }),
      s("🧼", "Hände waschen / Klamotten wechseln", { hint: "Lounge-Mode" }),
      s("💧", "Trinken — Glas Wasser"),
      s("🛋️", "5-Min-Reset", { hint: "kurz auf dem Sofa, bevor nächste Aktivität startet" }),
    ],
    fein: [
      s("👟", "Schuhe aus, an festen Platz"),
      s("🔑", "Schlüssel an festen Platz"),
      s("🧥", "Jacke aufhängen"),
      s("🎒", "Tasche auspacken"),
      s("📱", "Geldbörse / Telefon an festen Platz"),
      s("📬", "Post sortieren"),
      s("🧼", "Hände waschen / Klamotten wechseln"),
      s("💧", "Glas Wasser"),
      s("🛋️", "5-Min-Reset"),
      s("📬", "Briefkasten geleert?", { hint: "Plus" }),
      s("🗑️", "Müll auf dem Heimweg mitnehmen", { hint: "Plus" }),
      s("🚗", "Auto verschlossen?", { hint: "Plus" }),
      s("🧺", "Schmutzwäsche direkt in Wäschekorb", { hint: "Plus · nicht in Tasche lassen" }),
      s("💍", "Schmuck/Uhr ab und an festen Platz", { hint: "Plus" }),
      s("💄", "Make-up entfernen falls geplant", { hint: "Plus" }),
      s("🧴", "Augen-/Gesichtskur", { hint: "Plus" }),
      s("💻", "Schreibtisch-Sachen aus Tasche raus", { hint: "Plus" }),
      s("🍱", "Lunchbox aus der Tasche zur Spüle", { hint: "Plus" }),
      s("💧", "Trinkflasche zur Spüle", { hint: "Plus · nicht stehen lassen" }),
      s("📅", "Termin-Notizen aus dem Kopf in den Kalender", { hint: "Plus" }),
      s("🧘", "Atemzug-Pause vor nächstem To-do", { hint: "Plus" }),
      s("👨‍👩‍👧", "Familien-Check: was haben die anderen heute erlebt?", { hint: "Plus" }),
    ],
  },
  material: ["Festplatz für Schlüssel/Jacke/Schuhe/Tasche (etablieren!)"],
  adhsTips:
    "„Erst nur mal hinsetzen” → 3 Stunden später hängt die Tasche noch im Flur, der Schlüssel ist drin, der Lunchbox-Behälter schimmelt. 5 Minuten Routine spart 3 Stunden Suchen morgen.",
};

// ─────────────────────────────────────────────────────────────────────────────
// 7. Behörde / Amt
// ─────────────────────────────────────────────────────────────────────────────

const behoerde: Workflow = {
  id: "behoerde_amt",
  name: "Behörde / Amt",
  icon: "🏛️",
  category: "pflichten",
  defaultGrade: "mittel",
  steps: {
    grob: [
      s("📋", "Welche Dokumente brauche ich?"),
      s("📂", "Dokumente in Ordner sortieren"),
      s("🕐", "Adresse + Öffnungszeit prüfen"),
      s("🪪", "Identifikation einstecken"),
      s("🚶", "Hingehen mit Puffer"),
    ],
    mittel: [
      s("🌐", "Behörden-Website lesen", {
        hint: "3 Tage vorher · welche Formulare? Welche Dokumente?",
      }),
      s("🖨️", "Formulare ausdrucken / online ausfüllen", { hint: "3 Tage vorher" }),
      s("📂", "Alle Dokumente in eine Mappe / einen Ordner", { hint: "2 Tage vorher" }),
      s("📑", "Kopien anfertigen", { hint: "1 Tag vorher · Behörden lieben Kopien" }),
      s("🕐", "Öffnungszeiten + Wartezeit-Schätzung", { hint: "1 Tag vorher" }),
      s("🎒", "Mappe + Ausweis + Geldbörse zusammenstellen", { hint: "Vorabend" }),
      s("⏱️", "Mit Puffer", { hint: "Aufbruch · Parkplatz suchen, Schlange" }),
      s("🎫", "Wartenummer ziehen", { hint: "Vor Ort" }),
      s("✍️", "Mitschreiben — wer hat was gesagt", { hint: "Im Termin" }),
      s("📋", "Dokumente sortieren — was fehlt noch? Folgetermin?", { hint: "Nach Termin" }),
    ],
    fein: [
      s("🌐", "Behörden-Website lesen", { hint: "3 Tage vorher" }),
      s("🖨️", "Formulare ausdrucken / ausfüllen", { hint: "3 Tage vorher" }),
      s("📂", "Dokumente in Mappe", { hint: "2 Tage vorher" }),
      s("📑", "Kopien anfertigen", { hint: "1 Tag vorher" }),
      s("🕐", "Öffnungszeiten prüfen", { hint: "1 Tag vorher" }),
      s("🎒", "Mappe + Ausweis + Geldbörse", { hint: "Vorabend" }),
      s("⏱️", "Mit Puffer hingehen", { hint: "Aufbruch" }),
      s("🎫", "Wartenummer ziehen", { hint: "Vor Ort" }),
      s("✍️", "Mitschreiben", { hint: "Im Termin" }),
      s("📋", "Sortieren nach Termin", { hint: "Nach Termin" }),
      s("📅", "Online-Termin früh buchen", { hint: "Plus · oft Wochen Wartezeit" }),
      s("🗣️", "Bei Übersetzungen: vorab klären welche", { hint: "Plus" }),
      s("📝", "Vollmacht falls für andere Person", { hint: "Plus" }),
      s("💵", "Geld für Gebühren", { hint: "Plus · oft nur Bar" }),
      s("🧾", "Quittung verlangen", { hint: "Plus" }),
      s("🏷️", "Behördenstempel auf Kopie wenn nötig", { hint: "Plus" }),
      s("📸", "Foto-Anforderungen für Pass/ID prüfen", { hint: "Plus" }),
      s("👆", "Fingerabdrücke: rechtzeitig kommen", { hint: "Plus" }),
      s("📮", "Schweizer Eigenheit: c/o-Adresse korrekt?", { hint: "Plus" }),
      s("📑", "Original UND Kopie immer", { hint: "Plus" }),
      s("👥", "Begleitperson bei Sprachbarriere", { hint: "Plus" }),
      s("📖", "Eintragungs-Vermerk fürs Familienbüchlein", { hint: "Plus" }),
    ],
  },
  material: [
    "Ordner mit Dokumenten + Kopien",
    "Ausweis",
    "Bargeld",
    "Formulare",
    "Notizblock",
  ],
  adhsTips:
    "„Ich nehme alles mit was mit dem Thema zu tun hat” → Chaos vor Ort. Stattdessen: Vorab klären, gezielt mitnehmen.",
};

// ─────────────────────────────────────────────────────────────────────────────
// 8. Aus dem Haus gehen (Spontan-Aufbruch)
// ─────────────────────────────────────────────────────────────────────────────

const ausDemHaus: Workflow = {
  id: "aus_dem_haus",
  name: "Aus dem Haus gehen",
  icon: "🚪",
  category: "uebergang",
  defaultGrade: "grob",
  steps: {
    grob: [
      s("🔑", "Schlüssel, Telefon, Geldbörse"),
      s("🌦️", "Wetter-Check → Jacke"),
      s("👟", "Schuhe an"),
      s("🚪", "Tür zu"),
      s("🚊", "Auto/ÖV/Fuss klar?"),
    ],
    mittel: [
      s("🌦️", "Wetter checken", { hint: "Regen? Sonne? Kälte?" }),
      s("🔑", "Schlüssel — in der Hand", { hint: "nicht in der Tasche suchen" }),
      s("📱", "Telefon + Ladestatus", { hint: "genug für die Tour?" }),
      s("💳", "Geldbörse / Karten", { hint: "Kein Bargeld → Karte da?" }),
      s("👕", "Outfit-Check", { hint: "passend zum Anlass + Wetter" }),
      s("👟", "Schuhe wählen", { hint: "bequem genug für die Strecke?" }),
      s("🕶️", "Anlass-spezifisches", { hint: "Brille, Sonnenbrille, Mütze, Schirm" }),
      s("🎒", "Tasche", { hint: "leer oder gefüllt je nach Zweck" }),
      s("✅", "Tür-Check", { hint: "Herd, Bügeleisen, Fenster" }),
      s("🚪", "Tür zu — abschliessen", { hint: "auch tagsüber" }),
    ],
    fein: [
      s("🌦️", "Wetter checken"),
      s("🔑", "Schlüssel in der Hand"),
      s("📱", "Telefon + Ladestatus"),
      s("💳", "Geldbörse / Karten"),
      s("👕", "Outfit-Check"),
      s("👟", "Schuhe wählen"),
      s("🕶️", "Anlass-spezifisches"),
      s("🎒", "Tasche"),
      s("✅", "Tür-Check"),
      s("🚪", "Tür zu — abschliessen"),
      s("📝", "Notizzettel mit Ziel/Aufgabe", { hint: "Plus · ADHS vergisst die Aufgabe unterwegs" }),
      s("😷", "Maske/Hygiene wenn nötig", { hint: "Plus" }),
      s("💧", "Wasserflasche für längere Touren", { hint: "Plus" }),
      s("🎧", "Kopfhörer aufgeladen", { hint: "Plus" }),
      s("🎫", "ÖV-Ticket vorhanden?", { hint: "Plus" }),
      s("💵", "Bargeld für Notfälle", { hint: "Plus" }),
      s("🪴", "Pflanze noch giessen?", { hint: "Plus" }),
      s("🐈", "Tier versorgt?", { hint: "Plus" }),
      s("🔥", "Backofen sicher aus?", { hint: "Plus" }),
      s("🪟", "Fenster zu wegen Regen", { hint: "Plus" }),
      s("✉️", "Briefe mitnehmen für Post", { hint: "Plus" }),
      s("🗑️", "Müll mit raus", { hint: "Plus" }),
      s("🌡️", "Heizung runter falls länger weg", { hint: "Plus" }),
      s("❄️", "Klimaanlage aus", { hint: "Plus" }),
    ],
  },
  material: ["Schlüssel", "Telefon", "Geldbörse"],
  adhsTips:
    "Mit „brauche nur Schlüssel und Telefon” raus, draussen merken: kein Geld, falsche Schuhe, vergessene Aufgabe. Drei-Punkt-Check + Wetter + Anlass macht den Aufbruch in 2 Min sauber.",
};

// ─────────────────────────────────────────────────────────────────────────────
// 9. Saisonwechsel Kleidung
// ─────────────────────────────────────────────────────────────────────────────

const saisonwechsel: Workflow = {
  id: "saisonwechsel_kleidung",
  name: "Saisonwechsel Kleidung",
  icon: "🍂",
  category: "saisonal",
  defaultGrade: "mittel",
  steps: {
    grob: [
      s("👔", "Schrank durchgehen"),
      s("📦", "Sommer/Winter-Kiste aus dem Keller"),
      s("🔁", "Tauschen"),
      s("🗂️", "Sortieren: Was raus? Was bleibt?"),
      s("📦", "Verstauen"),
    ],
    mittel: [
      s("🧺", "Wäschestapel komplett gewaschen?", { hint: "Vorbereitung" }),
      s("📦", "Sommer- oder Winter-Kiste aus dem Keller / vom Dachboden holen"),
      s("🛏️", "Schrank leeren — alles auf den Boden / aufs Bett"),
      s("🗂️", "Sortieren in 4 Stapel", {
        hint: "Behalten · Weg (Spende) · Reparieren · Weg (Müll)",
      }),
      s("👔", "Behalten-Stapel zurück in den Schrank", { hint: "sortiert nach Kategorie" }),
      s("👕", "Aktuelle Saison hervorgeholt und einsortiert"),
      s("📦", "Andere Saison in die Kiste", { hint: "gewaschen!" }),
      s("🏷️", "Kiste beschriften mit Inhalt + Saison"),
      s("🏠", "Kiste zurück in den Keller / Schrank-oberer-Teil"),
      s("🚗", "Spenden-Stapel zum Auto", { hint: "sofort, sonst verstaubt er ein Jahr" }),
    ],
    fein: [
      s("🧺", "Wäschestapel komplett gewaschen?"),
      s("📦", "Saison-Kiste holen"),
      s("🛏️", "Schrank leeren"),
      s("🗂️", "4 Stapel sortieren"),
      s("👔", "Behalten zurück"),
      s("👕", "Aktuelle Saison einsortieren"),
      s("📦", "Andere Saison einpacken"),
      s("🏷️", "Kiste beschriften"),
      s("🏠", "Kiste zurückstellen"),
      s("🚗", "Spenden ins Auto"),
      s("👟", "Schuhe gleich mit (Winter/Sommer)", { hint: "Plus" }),
      s("🧥", "Jacken-Check: Schmutz, Reissverschluss", { hint: "Plus" }),
      s("🌿", "Mottenkugel/Lavendel in Wollsachen", { hint: "Plus" }),
      s("👶", "Kinder-Sachen separat: noch passend nächstes Jahr?", { hint: "Plus" }),
      s("🎗️", "Spende: an wen?", { hint: "Plus · Brockenhaus, Kleidersammlung" }),
      s("🪡", "Reparieren: Termin mit Schneiderin notieren", { hint: "Plus" }),
      s("🧽", "Schrank-Innenseite mit feuchtem Tuch abwischen", { hint: "Plus" }),
      s("📥", "Schubladen vorne nach hinten sortieren", { hint: "Plus · oft Vergessenes" }),
      s("🏃", "Sport-Klamotten extra", { hint: "Plus · haben oft eigene Saison" }),
      s("🎩", "Festtags-Outfits separat behalten", { hint: "Plus" }),
      s("🕶️", "Brille/Sonnenbrille je nach Jahreszeit", { hint: "Plus" }),
      s("💍", "Schmuck nach Outfits sortieren", { hint: "Plus" }),
      s("🧥", "Mantel-Taschen leeren", { hint: "Plus" }),
      s("🧣", "Schal/Mütze/Handschuh-Box", { hint: "Plus" }),
    ],
  },
  material: [
    "Kisten (beschriftbar)",
    "Wäschestapel-Korb",
    "Spendentüten",
    "Lavendel/Mottenkugel",
    "Müllsack",
  ],
  adhsTips:
    "Halbfertig — Schrank ausgeräumt, dann unterbrochen, dann liegt alles 3 Wochen. Termin am Wochenende fix einplanen mit 2-3h Block. Spenden-Stapel sofort wegfahren.",
};

// ─────────────────────────────────────────────────────────────────────────────
// 10. Wandern / Bergtour
// ─────────────────────────────────────────────────────────────────────────────

const wandern: Workflow = {
  id: "wandern_bergtour",
  name: "Wandern / Bergtour",
  icon: "🥾",
  category: "hobby_outdoor",
  defaultGrade: "mittel",
  steps: {
    grob: [
      s("🌦️", "Wettercheck Tour + Region"),
      s("🎒", "Rucksack packen (Material-Liste)"),
      s("👕", "Schuhe + Kleidung wetterangepasst"),
      s("🗺️", "Anfahrt + Tour-Plan"),
      s("🥨", "Snacks + Wasser"),
    ],
    mittel: [
      s("🌦️", "Wetter checken + Tour-Plan finalisieren", {
        hint: "2 Tage vorher · SAC-Tour-Portal, Schweizmobil",
      }),
      s("📊", "Schwierigkeit, Zeit, Höhenmeter — realistisch?", { hint: "2 Tage vorher" }),
      s("🎒", "Rucksack packen", { hint: "1 Tag vorher · siehe Material" }),
      s("👟", "Wanderschuhe geprüft, geschnürt", { hint: "1 Tag vorher" }),
      s("👕", "Wetterangepasste Kleidung bereitgelegt", { hint: "1 Tag vorher · Zwiebelprinzip" }),
      s("🥨", "Snacks + Wasser auffüllen", { hint: "Vorabend" }),
      s("🚗", "Anfahrt + Parking / ÖV geklärt", { hint: "Vorabend" }),
      s("🗺️", "Tour-Plan im Telefon + offline-Karte", { hint: "Aufbruch" }),
      s("💧", "Trinken alle 30 Min, Snack jede Stunde", { hint: "Unterwegs" }),
      s("🧺", "Schuhe richten, Rucksack ausräumen, Wäsche", { hint: "Nach Tour" }),
    ],
    fein: [
      s("🌦️", "Wetter + Tour-Plan finalisieren", { hint: "2 Tage vorher" }),
      s("📊", "Schwierigkeit realistisch?", { hint: "2 Tage vorher" }),
      s("🎒", "Rucksack packen", { hint: "1 Tag vorher" }),
      s("👟", "Wanderschuhe geprüft", { hint: "1 Tag vorher" }),
      s("👕", "Kleidung bereitgelegt", { hint: "1 Tag vorher · Zwiebelprinzip" }),
      s("🥨", "Snacks + Wasser", { hint: "Vorabend" }),
      s("🚗", "Anfahrt geklärt", { hint: "Vorabend" }),
      s("🗺️", "Tour-Plan im Telefon", { hint: "Aufbruch" }),
      s("💧", "Trinken + Snack-Rhythmus", { hint: "Unterwegs" }),
      s("🧺", "Nach Tour aufräumen"),
      s("⛰️", "SAC-Tourenwetter spezifisch checken", { hint: "Plus" }),
      s("❄️", "Lawinenwarnung", { hint: "Plus · im Winter" }),
      s("📖", "Tour-Beschreibung gelesen — heikle Stellen?", { hint: "Plus" }),
      s("🚌", "Bahn-/Bus-Verbindung Rückweg geklärt", { hint: "Plus" }),
      s("🛖", "Hütte reserviert", { hint: "Plus · falls Zwei-Tages" }),
      s("📞", "Notfall-Kontakt informiert über Route", { hint: "Plus" }),
      s("🩹", "Erste-Hilfe-Set", { hint: "Plus" }),
      s("🔦", "Stirnlampe", { hint: "Plus · auch bei Tagestour — Verspätung möglich" }),
      s("☀️", "Sonnencreme + UV-Brille", { hint: "Plus" }),
      s("🗺️", "Karte (Papier-Backup)", { hint: "Plus" }),
      s("🧭", "Kompass / Höhenmesser", { hint: "Plus" }),
      s("📯", "Notfallpfeife", { hint: "Plus" }),
      s("🔋", "Powerbank", { hint: "Plus" }),
      s("🎫", "Tickets / Bergbahn-Karten vorab gebucht", { hint: "Plus" }),
      s("💧", "Trinkblase oder 2 Flaschen", { hint: "Plus" }),
      s("🥜", "Riegel + Nüsse + frisches Obst", { hint: "Plus" }),
      s("👕", "Reservekleidung im Auto", { hint: "Plus" }),
      s("🦟", "Lavendel-Spray (Zecken) im Sommer", { hint: "Plus" }),
    ],
  },
  material: [
    "Rucksack 20-30L (Tagestour) oder 40-50L (Mehrtage)",
    "Wanderschuhe (eingelaufen!)",
    "Wetterangepasste Kleidung (Zwiebelprinzip: Funktions-Shirt + Fleece + Regenjacke)",
    "Wechselshirt",
    "Mütze + Buff",
    "Sonnencreme + Sonnenbrille",
    "Wasser (1.5-2L Tagestour)",
    "Snacks (Riegel, Nüsse, Obst, evtl. Sandwich)",
    "Karte / GPS / Telefon",
    "Erste-Hilfe-Set",
    "Stirnlampe",
    "Notfallpfeife (Schweiz!)",
    "Powerbank",
    "Bargeld (Berghütten oft kein Karte)",
    "Wanderstöcke optional",
  ],
  adhsTips:
    "Tour-Ehrgeiz überschätzt → Erschöpfung, schlechte Erfahrung, längere Pause vom Wandern. Lieber kürzere Tour gut, als lange Tour halb.",
};

// ─────────────────────────────────────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────────────────────────────────────

export const bibliothekRoutinen: Workflow[] = [
  sportSession,
  arzttermin,
  geburtstag,
  sonntagabend,
  wochenendreise,
  heimkommen,
  behoerde,
  ausDemHaus,
  saisonwechsel,
  wandern,
];
