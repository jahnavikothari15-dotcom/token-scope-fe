const STAGES = [
  "Measuring prompt",
  "Finding redundancy",
  "Evaluating instructions",
  "Calculating efficiency",
];

export default function AnalyzingLoader({ label = "Analyzing prompt", stages = STAGES }) {
  return (
    <div
      data-testid="analyzing-loader"
      className="rounded-lg border border-hairline bg-surface p-6"
    >
      <div className="mb-4 flex items-center gap-2">
        <span className="relative inline-flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-cyan/50 animate-pulse-dot" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan" />
        </span>
        <span className="mono text-[11px] uppercase tracking-widest text-muted2">
          {label}
        </span>
      </div>
      <ul className="space-y-2.5">
        {stages.map((s, i) => (
          <li
            key={s}
            className="mono flex items-center gap-2.5 text-[13px] text-ink"
            style={{ animation: `fade-up 220ms ease-out both`, animationDelay: `${i * 180}ms` }}
          >
            <span
              className="inline-block h-1.5 w-1.5 rounded-full bg-cyan animate-pulse-dot"
              style={{ animationDelay: `${i * 140}ms` }}
            />
            {s}
            <span className="mono text-[10px] uppercase tracking-widest text-muted2">
              ...
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
