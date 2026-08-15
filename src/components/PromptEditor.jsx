import { useEffect, useMemo, useState } from "react";
import { computeMetrics } from "@/lib/tokenize";
import MetricsBar from "@/components/MetricsBar";
import { Sparkles, Trash2, FileCode2 } from "lucide-react";

const MAX_CHARS = 60000;

export default function PromptEditor({
  value,
  onChange,
  onAnalyze,
  onLoadExample,
  analyzing,
}) {
  const [focused, setFocused] = useState(false);
  const metrics = useMemo(() => computeMetrics(value), [value]);

  useEffect(() => {
    // no-op: metrics recompute on each keystroke via useMemo
  }, [value]);

  const overLimit = value.length > MAX_CHARS;
  const nearLimit = value.length > MAX_CHARS * 0.85 && !overLimit;

  return (
    <div
      data-testid="prompt-editor"
      className={`rounded-lg border bg-surface transition-colors ${
        focused ? "border-cyan/50" : "border-hairline"
      }`}
    >
      <div className="flex items-center justify-between border-b border-hairline px-4 py-2.5">
        <div className="flex items-center gap-2">
          <FileCode2 size={14} strokeWidth={1.75} className="text-muted2" />
          <span className="mono text-[11px] uppercase tracking-widest text-muted2">
            prompt.txt
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            data-testid="editor-load-example"
            onClick={onLoadExample}
            className="mono inline-flex h-7 items-center rounded-md border border-hairline bg-surface-2 px-2.5 text-[11px] uppercase tracking-wider text-muted2 transition-colors hover:text-ink"
          >
            Load example
          </button>
          <button
            data-testid="editor-clear"
            onClick={() => onChange("")}
            disabled={value.length === 0}
            className="mono inline-flex h-7 items-center gap-1 rounded-md border border-hairline bg-surface-2 px-2.5 text-[11px] uppercase tracking-wider text-muted2 transition-colors hover:text-ink disabled:opacity-40"
          >
            <Trash2 size={11} strokeWidth={1.75} /> Clear
          </button>
        </div>
      </div>

      <textarea
        data-testid="prompt-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Paste your AI prompt here..."
        spellCheck={false}
        className="mono block h-[320px] w-full resize-y bg-obsidian px-4 py-4 text-[13.5px] leading-[1.65] text-ink outline-none placeholder:text-muted2/70"
      />

      <div className="flex flex-col gap-3 border-t border-hairline p-4">
        <MetricsBar metrics={metrics} />

        {(nearLimit || overLimit) && (
          <div
            data-testid="editor-warning"
            className={`mono rounded-md border px-3 py-2 text-[12px] ${
              overLimit
                ? "border-red-500/30 bg-red-500/5 text-red-300"
                : "border-yellow-500/30 bg-yellow-500/5 text-yellow-300"
            }`}
          >
            {overLimit
              ? `Prompt exceeds the ${MAX_CHARS.toLocaleString()} character analysis limit.`
              : `Approaching the ${MAX_CHARS.toLocaleString()} character limit — analysis may be slow.`}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[12px] text-muted2">
            Prompts are sent to Claude for semantic analysis. Nothing is stored.
          </p>
          <button
            data-testid="editor-analyze"
            onClick={onAnalyze}
            disabled={value.trim().length === 0 || overLimit || analyzing}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-cyan px-4 text-sm font-medium text-obsidian transition-colors hover:bg-cyan/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Sparkles size={14} strokeWidth={1.75} />
            {analyzing ? "Analyzing..." : "Analyze Prompt"}
          </button>
        </div>
      </div>
    </div>
  );
}
