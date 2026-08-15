import { useMemo, useState } from "react";
import { ArrowRight, ArrowUpRight, X, GitCompareArrows } from "lucide-react";
import { formatNumber } from "@/lib/tokenize";
import { diffWords } from "@/lib/diff";

function Delta({ value, invert = false }) {
  // invert=true means "lower is better" (tokens, issues). Otherwise higher is better (score).
  if (value === 0) {
    return (
      <span className="mono text-[11px] uppercase tracking-widest text-muted2">
        · no change
      </span>
    );
  }
  const positive = invert ? value < 0 : value > 0;
  const cls = positive ? "text-lime" : "text-red-400";
  const sign = value > 0 ? "+" : "";
  return (
    <span className={`mono text-[11px] uppercase tracking-widest ${cls}`}>
      · {sign}
      {typeof value === "number" && !Number.isInteger(value)
        ? value.toFixed(1)
        : value}
    </span>
  );
}

function Row({ label, prev, curr, unit, invert = false }) {
  const delta = (curr ?? 0) - (prev ?? 0);
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-hairline bg-obsidian px-4 py-3">
      <div className="mono text-[10px] uppercase tracking-widest text-muted2">
        {label}
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="mono text-[10px] uppercase tracking-widest text-muted2">
            prev
          </div>
          <div className="mono text-sm font-medium tabular-nums text-muted2">
            {formatNumber(prev)}
            {unit ? (
              <span className="ml-1 text-[10px] uppercase text-muted2">
                {unit}
              </span>
            ) : null}
          </div>
        </div>
        <ArrowRight size={13} strokeWidth={1.75} className="text-muted2" />
        <div className="text-right">
          <div className="mono text-[10px] uppercase tracking-widest text-muted2">
            current
          </div>
          <div className="mono text-sm font-medium tabular-nums text-ink">
            {formatNumber(curr)}
            {unit ? (
              <span className="ml-1 text-[10px] uppercase text-muted2">
                {unit}
              </span>
            ) : null}
          </div>
        </div>
        <div className="min-w-[70px] text-right">
          <Delta value={delta} invert={invert} />
        </div>
      </div>
    </div>
  );
}

export default function ComparisonAB({ previous, current, onClear }) {
  const [expanded, setExpanded] = useState(false);
  const diffOps = useMemo(
    () => (expanded ? diffWords(previous.prompt, current.prompt) : []),
    [expanded, previous.prompt, current.prompt]
  );

  const p = previous;
  const c = current;

  return (
    <div
      data-testid="ab-comparison"
      className="rounded-lg border border-cyan/25 bg-cyan/[0.03] p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md border border-cyan/40 bg-obsidian text-cyan">
            <GitCompareArrows size={12} strokeWidth={1.75} />
          </span>
          <div>
            <div className="mono text-[10px] uppercase tracking-widest text-cyan">
              A/B compare
            </div>
            <div className="text-[13.5px] font-medium text-ink">
              Compared against your last analyzed prompt
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            data-testid="ab-toggle-full"
            onClick={() => setExpanded((v) => !v)}
            className="mono inline-flex h-7 items-center gap-1.5 rounded-md border border-hairline bg-obsidian px-2.5 text-[11px] uppercase tracking-wider text-muted2 transition-colors hover:text-ink"
          >
            <ArrowUpRight size={11} strokeWidth={1.75} />
            {expanded ? "Hide diff" : "View full diff"}
          </button>
          <button
            data-testid="ab-clear"
            onClick={onClear}
            className="mono inline-flex h-7 items-center gap-1.5 rounded-md border border-hairline bg-obsidian px-2.5 text-[11px] uppercase tracking-wider text-muted2 transition-colors hover:text-red-400"
          >
            <X size={11} strokeWidth={1.75} /> Clear
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <Row
          label="Efficiency score"
          prev={p.score}
          curr={c.score}
          unit="/100"
          invert={false}
        />
        <Row
          label="Estimated tokens"
          prev={p.tokens}
          curr={c.tokens}
          unit="tok"
          invert={true}
        />
        <Row
          label="Issues detected"
          prev={p.issues}
          curr={c.issues}
          invert={true}
        />
      </div>

      {expanded && (
        <div className="mt-4">
          <div className="mono mb-2 text-[10px] uppercase tracking-widest text-muted2">
            Prompt A (previous) → Prompt B (current)
          </div>
          <pre
            data-testid="ab-diff-view"
            className="mono max-h-[420px] overflow-auto whitespace-pre-wrap break-words rounded-md border border-hairline bg-obsidian p-4 text-[12.5px] leading-[1.7] text-ink scrollbar-thin"
          >
            {diffOps.map((op, i) => {
              if (op.type === "equal")
                return (
                  <span key={i} className="text-muted2">
                    {op.value}
                  </span>
                );
              if (op.type === "removed")
                return (
                  <span
                    key={i}
                    className="rounded bg-red-500/15 text-red-300 line-through decoration-red-400/60"
                  >
                    {op.value}
                  </span>
                );
              return (
                <span key={i} className="rounded bg-lime/15 text-lime">
                  {op.value}
                </span>
              );
            })}
          </pre>
        </div>
      )}
    </div>
  );
}
