type Props = {
  pct: number;
  color: string;
  size?: number;
  children: React.ReactNode;
  onClick?: () => void;
  label?: string;
};

export function RingViz({ pct, color, size = 160, children, onClick, label }: Props) {
  const r = size * 0.42;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct);
  const vb = size;
  const cx = vb / 2;
  const sw = size >= 120 ? 8 : 4;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="relative grid place-items-center"
      style={{ width: size, height: size }}
    >
      <svg className="absolute inset-0" viewBox={`0 0 ${vb} ${vb}`}>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="var(--color-secondary)" strokeWidth={sw} />
        <circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${cx} ${cx})`}
          style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }}
        />
      </svg>
      <div className="relative flex flex-col items-center">{children}</div>
    </button>
  );
}
