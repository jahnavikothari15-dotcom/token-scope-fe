import { Zap } from "lucide-react";

const MODES = [
  {
    id: "conservative",
    title: "Conservative",
    desc: "Minimal changes. Prioritizes preservation of the original wording and behavior.",
  },
  {
    id: "balanced",
    title: "Balanced",
    desc: "Removes redundancy and unnecessary wording while preserving structure and intent.",
  },
  {
    id: "aggressive",
    title: "Aggressive",
    desc: "Rebuilds the prompt for maximum efficiency while preserving essential requirements.",
  },
];

export default function OptimizerPanel({
  mode,
  onModeChange,
  onOptimize,
  optimizing,
  disabled,
}) {
  return (
    <div
      data-testid="optimizer-panel"
      className="rounded-lg border border-hairline bg-surface p-6"
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-ink">
            Optimize your prompt
          </h3>
          <p className="mt-1 text-sm text-muted2">
            Choose how aggressively TokenScope should rewrite the prompt.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {MODES.map((m) => {
          const active = mode === m.id;
          return (
            <button
              key={m.id}
              data-testid={`mode-${m.id}`}
              onClick={() => onModeChange(m.id)}
              className={`rounded-md border px-4 py-3.5 text-left transition-colors ${
                active
                  ? "border-cyan/60 bg-cyan/[0.06]"
                  : "border-hairline bg-obsidian hover:bg-surface-2"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[14px] font-medium ${
                    active ? "text-ink" : "text-ink"
                  }`}
                >
                  {m.title}
                </span>
                <span
                  className={`h-2 w-2 rounded-full ${
                    active ? "bg-cyan" : "bg-hairline"
                  }`}
                />
              </div>
              <p className="mt-2 text-[12.5px] leading-relaxed text-muted2">
                {m.desc}
              </p>
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-hairline pt-5">
        <p className="mono text-[11px] uppercase tracking-widest text-muted2">
          Mode · {mode}
        </p>
        <button
          data-testid="optimize-button"
          onClick={onOptimize}
          disabled={disabled || optimizing}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-lime px-4 text-sm font-medium text-obsidian transition-colors hover:bg-lime/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Zap size={14} strokeWidth={2} />
          {optimizing ? "Optimizing..." : "Optimize Prompt"}
        </button>
      </div>
    </div>
  );
}
