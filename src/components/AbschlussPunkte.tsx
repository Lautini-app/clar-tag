/**
 * Die vier clar-Punkte rücken einmal an ihren Platz — der ruhige Moment
 * nach einer geschafften Routine (gleich wie in clar·heim).
 *
 * Reine Darstellung. Bei «Bewegung reduzieren» stehen die Punkte einfach da.
 */
export function AbschlussPunkte({ size = 72 }: { size?: number }) {
  const punkte = [
    { cx: 5, cy: 5, fill: "#2F9A68", dx: "-9px", dy: "-9px", delay: "0ms" },
    { cx: 15, cy: 5, fill: "#7A5CB0", dx: "9px", dy: "-9px", delay: "110ms" },
    { cx: 5, cy: 15, fill: "#D4941A", dx: "-9px", dy: "9px", delay: "220ms" },
    { cx: 15, cy: 15, fill: "#3D8BD4", dx: "9px", dy: "9px", delay: "330ms" },
  ];
  return (
    <>
      <style>{`
        @keyframes clar-punkt-ankommen {
          0% { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(0.5); }
          100% { opacity: 1; transform: translate(0, 0) scale(1); }
        }
        .clar-abschluss-punkte circle {
          transform-box: fill-box;
          transform-origin: center;
          animation: clar-punkt-ankommen 800ms cubic-bezier(0.2, 0.7, 0.2, 1) both;
        }
        @media (prefers-reduced-motion: reduce) {
          .clar-abschluss-punkte circle { animation: none; }
        }
      `}</style>
      <svg
        className="clar-abschluss-punkte mx-auto block overflow-visible"
        width={size}
        height={size}
        viewBox="-4 -4 28 28"
        aria-hidden="true"
        focusable="false"
      >
        {punkte.map((p) => (
          <circle
            key={p.fill}
            cx={p.cx}
            cy={p.cy}
            r="4"
            fill={p.fill}
            style={{ ["--dx" as string]: p.dx, ["--dy" as string]: p.dy, animationDelay: p.delay }}
          />
        ))}
      </svg>
    </>
  );
}
