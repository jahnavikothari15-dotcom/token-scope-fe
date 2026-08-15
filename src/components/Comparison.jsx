import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Copy, RotateCcw, Columns2, GitCompareArrows } from "lucide-react";
import { diffWords } from "@/lib/diff";
import { formatNumber } from "@/lib/tokenize";

export default function Comparison({
  original,
  optimized,
  originalMetrics,
  optimizedMetrics,
  tokensSaved,
  reductionPercent,
  onAnalyzeAgain,
}) {
  const [view, setView] = useState("side"); // "side" | "diff"
  const diffOps = useMemo(() => diffWords(original, optimized), [original, optimized]);

  const copy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(optimized);
      } else {
        // Fallback for headless / older browsers
        const ta = document.createElement("textarea");
        ta.value = optimized;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      toast.success("Optimized prompt copied to clipboard");
    } catch {
      toast.error("Copy failed — select and copy manually");
    }
  };

  const savingsPositive = tokensSaved > 0;

  return (
    <div data-testid="comparison-panel" className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatBlock label="Original" value={formatNumber(originalMetrics?.estimated_tokens)} unit="tokens" />
        <StatBlock
          label="Optimized"
          value={formatNumber(optimizedMetrics?.estimated_tokens)}
          unit="tokens"
          accent={savingsPositive ? "lime" : undefined}
        />
        <StatBlock
          label="Tokens saved"
          value={formatNumber(tokensSaved)}
          accent={savingsPositive ? "lime" : undefined}
          testid="stat-tokens-saved"
        />
        <StatBlock
          label="Reduction"
          value={`${reductionPercent?.toFixed ? reductionPercent.toFixed(1) : reductionPercent}%`}
          accent={savingsPositive ? "lime" : undefined}
          testid="stat-reduction"
        />
      </div>

      <div className="rounded-lg border border-hairline bg-surface">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-hairline px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="mono text-[10px] uppercase tracking-widest text-muted2">
              Comparison
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex overflow-hidden rounded-md border border-hairline">
              <button
                data-testid="view-side"
                onClick={() => setView("side")}
                className={`mono inline-flex h-7 items-center gap-1.5 px-2.5 text-[11px] uppercase tracking-wider transition-colors ${
                  view === "side"
                    ? "bg-surface-2 text-ink"
                    : "bg-surface text-muted2 hover:text-ink"
                }`}
              >
                <Columns2 size={11} strokeWidth={1.75} /> Side-by-side
              </button>
              <button
                data-testid="view-diff"
                onClick={() => setView("diff")}
                className={`mono inline-flex h-7 items-center gap-1.5 border-l border-hairline px-2.5 text-[11px] uppercase tracking-wider transition-colors ${
                  view === "diff"
                    ? "bg-surface-2 text-ink"
                    : "bg-surface text-muted2 hover:text-ink"
                }`}
              >
                <GitCompareArrows size={11} strokeWidth={1.75} /> Diff
              </button>
            </div>
            <button
              data-testid="copy-optimized"
              onClick={copy}
              className="mono inline-flex h-7 items-center gap-1.5 rounded-md border border-hairline bg-surface-2 px-2.5 text-[11px] uppercase tracking-wider text-ink transition-colors hover:bg-edge"
            >
              <Copy size={11} strokeWidth={1.75} /> Copy optimized
            </button>
            <button
              data-testid="analyze-again"
              onClick={onAnalyzeAgain}
              className="mono inline-flex h-7 items-center gap-1.5 rounded-md border border-hairline bg-surface-2 px-2.5 text-[11px] uppercase tracking-wider text-muted2 transition-colors hover:text-ink"
            >
              <RotateCcw size={11} strokeWidth={1.75} /> Analyze again
            </button>
          </div>
        </div>

        {view === "side" ? (
          <div className="grid grid-cols-1 divide-y divide-hairline md:grid-cols-2 md:divide-x md:divide-y-0">
            <Pane label="Original" text={original} muted />
            <Pane label="Optimized" text={optimized} accent />
          </div>
        ) : (
          <div className="p-4">
            <pre
              data-testid="diff-view"
              className="mono max-h-[520px] overflow-auto whitespace-pre-wrap break-words rounded-md border border-hairline bg-obsidian p-4 text-[13px] leading-[1.7] text-ink scrollbar-thin"
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
    </div>
  );
}

function Pane({ label, text, accent, muted }) {
  return (
    <div className="p-4">
      <div className="mb-2 flex items-center gap-2">
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            accent ? "bg-lime" : "bg-muted2"
          }`}
        />
        <span className="mono text-[10px] uppercase tracking-widest text-muted2">
          {label}
        </span>
      </div>
      <pre
        className={`mono max-h-[520px] overflow-auto whitespace-pre-wrap break-words rounded-md border border-hairline bg-obsidian p-4 text-[13px] leading-[1.65] scrollbar-thin ${
          muted ? "text-muted2" : "text-ink"
        }`}
      >
        {text}
      </pre>
    </div>
  );
}

function StatBlock({ label, value, unit, accent, testid }) {
  const valueClass = accent === "lime" ? "text-lime" : "text-ink";
  return (
    <div
      data-testid={testid}
      className="rounded-md border border-hairline bg-surface px-4 py-3"
    >
      <div className="mono text-[10px] uppercase tracking-widest text-muted2">
        {label}
      </div>
      <div className={`mono text-xl font-medium tabular-nums ${valueClass}`}>
        {value}
        {unit && (
          <span className="ml-1 text-[11px] font-normal uppercase tracking-widest text-muted2">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
