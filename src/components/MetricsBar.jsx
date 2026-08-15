import { formatNumber } from "@/lib/tokenize";

const CELL_LABELS = [
  { key: "characters", label: "Characters" },
  { key: "words", label: "Words" },
  { key: "lines", label: "Lines" },
  { key: "estimated_tokens", label: "Est. tokens" },
];

export default function MetricsBar({ metrics }) {
  const m = metrics || { characters: 0, words: 0, lines: 0, estimated_tokens: 0 };
  return (
    <div
      data-testid="metrics-bar"
      className="grid grid-cols-2 divide-x divide-hairline overflow-hidden rounded-md border border-hairline bg-surface sm:grid-cols-4"
    >
      {CELL_LABELS.map((c, i) => (
        <div
          key={c.key}
          data-testid={`metric-${c.key}`}
          className={`flex flex-col gap-1 px-4 py-3 ${
            i >= 2 ? "border-t border-hairline sm:border-t-0" : ""
          }`}
        >
          <span className="mono text-[10px] uppercase tracking-widest text-muted2">
            {c.label}
          </span>
          <span className="mono text-lg font-medium text-ink tabular-nums">
            {formatNumber(m[c.key])}
          </span>
        </div>
      ))}
    </div>
  );
}
