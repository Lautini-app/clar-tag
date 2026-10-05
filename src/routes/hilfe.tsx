import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/hilfe")({
  component: Hilfe,
});

const ABSCHNITTE: { titel: string; text: string }[] = [
  {
    titel: "Willkommen",
    text: "clar · tag gibt deinem Tag eine Struktur: Routinen zur richtigen Zeit, ein Schritt nach dem anderen.",
  },
  {
    titel: "Heute",
    text: "Die Heute-Seite zeigt, was heute eingeplant ist und was als Nächstes kommt. Von dort startest du eine Routine oder überspringst sie.",
  },
  {
    titel: "Eine Routine anlegen",
    text: "Unter Routinen → «Neu» gibt es vier Wege. «Begleitet erstellen» führt dich in vier Fragen zu einem Vorschlag: wo es klemmt, wie viel Kraft da ist, wie viel Zeit du hast und was dazugehört. Den Vorschlag passt du im Editor an und speicherst ihn.",
  },
  {
    titel: "Meine Routinen und Bibliothek",
    text: "«Meine Routinen» zeigt deine eigenen Routinen und alle, die du eingeplant oder in den letzten 30 Tagen gemacht hast. Alle Vorlagen findest du in der Bibliothek. Eine Vorlage passt du an, indem du eine eigene Kopie daraus machst; eigene Routinen kannst du bearbeiten und löschen.",
  },
  {
    titel: "Einplanen",
    text: "Öffne eine Routine und plane sie ein — einmalig oder wiederkehrend. Im Reiter «Kalender» siehst du Termine und Wiederholungen und kannst sie dort auch wieder entfernen.",
  },
  {
    titel: "Eine Routine durchgehen",
    text: "Beim Durchgehen siehst du immer nur einen Schritt, auf Wunsch mit Timer. So musst du nicht die ganze Liste im Kopf behalten.",
  },
  {
    titel: "Entscheiden und Ruhe",
    text: "«Entscheiden» stellt dir drei Fragen und macht einen Vorschlag, wenn du festhängst. Unter «Ruhe» findest du kurze Übungen, um zur Ruhe zu kommen oder zwischen zwei Dingen zu wechseln.",
  },
  {
    titel: "Werkzeuge",
    text: "Der runde Knopf öffnet die Werkzeuge: Pomodoro, Body Doubling, Übergang, Fidget-Pause und Belohnungen.",
  },
  {
    titel: "Familie",
    text: "Familienmitglieder ohne eigenes Konto verbinden sich mit einer PIN. Was sie anlegen dürfen, legst du in der Familienverwaltung fest.",
  },
  {
    titel: "Kalender",
    text: "In den Einstellungen findest du die Adresse für das Kalender-Abo. Damit erscheinen deine eingeplanten Routinen in Apple Kalender oder Google Calendar.",
  },
];

function Hilfe() {
  return (
    <div className="px-5 pb-10 pt-6">
      <Link
        to="/einstellungen"
        className="-ml-2 mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Einstellungen
      </Link>
      <h1 className="mb-6 text-2xl font-semibold text-foreground">Hilfe &amp; Anleitung</h1>
      <div className="grid gap-3">
        {ABSCHNITTE.map((a) => (
          <section key={a.titel} className="rounded-[var(--radius-lg)] bg-card p-5">
            <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {a.titel}
            </h2>
            <p className="text-[15px] leading-relaxed text-foreground">{a.text}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
