import { formatNumber } from "@/lib/tokenize";

function scoreColor(score) {
  if (score >= 80) return "text-lime";
  if (score >= 60) return "text-cyan";
  if (score >= 40) return "text-yellow-300";
  return "text-red-400";
}

function scoreStroke(score) {
  if (score >= 80) return "#A3FF12";
  if (score >= 60) return "#00E5FF";
  if (score >= 40) return "#EAB308";
  return "#F87171";
}

export default function EfficiencyScore({ analysis, metrics }) {
  const score = Math.max(0, Math.min(100, Number(analysis?.efficiency_score) || 0));
  const reduction = Math.max(
    0,
    Math.min(90, Number(analysis?.estimated_reduction_percent) || 0)
  );
  const C = 2 * Math.PI * 46; // circumference
  const dash = (score / 100) * C;

  return (
    <div
      data-testid="efficiency-score-card"
      className="grid grid-cols-1 gap-6 rounded-lg border border-hairline bg-surface p-6 sm:grid-cols-[auto_1fr]"
    >
      <div className="flex items-center justify-center">
        <div className="relative">
          <svg width="132" height="132" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="46"
              stroke="#1E2532"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="60"
              cy="60"
              r="46"
              stroke={scoreStroke(score)}
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${C}`}
              transform="rotate(-90 60 60)"
              style={{ transition: "stroke-dasharray 500ms ease-out" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              data-testid="efficiency-score-value"
              className={`mono text-[34px] font-semibold tabular-nums ${scoreColor(score)}`}
            >
              {score}
            </span>
            <span className="mono text-[10px] uppercase tracking-widest text-muted2">
              / 100
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center">
        <span className="mono text-[10px] uppercase tracking-widest text-muted2">
          Prompt efficiency
        </span>
        <h3 className="mt-1 text-xl font-semibold tracking-tight text-ink">
          {analysis?.summary?.split(".")[0] || "Analysis complete"}
        </h3>
        {analysis?.summary && (
          <p className="mt-2 text-sm text-muted2">{analysis.summary}</p>
        )}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <MiniStat label="Est. tokens" value={formatNumber(metrics?.estimated_tokens)} />
          <MiniStat
            label="Est. reducible"
            value={`~${reduction}%`}
            accent={reduction > 0 ? "lime" : "muted"}
          />
          <MiniStat
            label="Issues found"
            value={formatNumber((analysis?.issues || []).length)}
          />
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, accent }) {
  const valueClass =
    accent === "lime"
      ? "text-lime"
      : accent === "muted"
      ? "text-muted2"
      : "text-ink";
  return (
    <div className="rounded-md border border-hairline bg-obsidian px-3 py-2.5">
      <div className="mono text-[10px] uppercase tracking-widest text-muted2">
        {label}
      </div>
      <div className={`mono text-lg font-medium tabular-nums ${valueClass}`}>
        {value}
      </div>
    </div>
  );
}
