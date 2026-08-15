import { useState } from "react";
import {
  Cpu,
  Copy,
  Repeat,
  AlignLeft,
  Layers,
  Sigma,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { formatNumber } from "@/lib/tokenize";

/**
 * LocalResultsPanel — shows deterministic findings with a clear "no AI used" pill.
 * Props:
 *   local: { metrics, findings, suspicious_sections, ai_used }
 */
export default function LocalResultsPanel({ local }) {
  const m = local?.metrics || {};
  const f = local?.findings || {};

  return (
    <div data-testid="local-results" className="space-y-6">
      <NoAIPill />

      {/* Prompt Size / Structure metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <BigStat label="Estimated tokens" value={formatNumber(m.estimated_tokens)} sub="Local estimate" testid="stat-est-tokens" />
        <BigStat label="Words" value={formatNumber(m.words)} testid="stat-words" />
        <BigStat label="Characters" value={formatNumber(m.characters)} testid="stat-chars" />
        <BigStat
          label="Structural complexity"
          value={(m.structural_complexity || "low").toUpperCase()}
          sub={`${m.paragraphs || 0} paragraphs · ${m.sentences || 0} sentences`}
          accent={m.structural_complexity === "high" ? "red" : m.structural_complexity === "medium" ? "yellow" : "lime"}
          testid="stat-complexity"
        />
      </div>

      {/* Redundancy summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MiniStat
          icon={Repeat}
          label="Potential repeated content"
          value={(f.exact_duplicate_sentences?.length || 0) + (f.near_duplicate_sentences?.length || 0)}
          detail="exact + near-duplicate"
          testid="stat-repeated"
        />
        <MiniStat
          icon={Layers}
          label="Duplicate sections"
          value={f.duplicate_paragraphs?.length || 0}
          detail="paragraph-level"
          testid="stat-duplicate-sections"
        />
        <MiniStat
          icon={AlignLeft}
          label="Repeated phrases"
          value={f.repeated_phrases?.length || 0}
          detail="3-5 word n-grams"
          testid="stat-repeated-phrases"
        />
        <MiniStat
          icon={Sigma}
          label="Instruction density"
          value={`${Math.round((m.instruction_density || 0) * 100)}%`}
          detail={`avg ${m.avg_sentence_length || 0} words / sentence`}
          testid="stat-instr-density"
        />
      </div>

      {/* Findings groups */}
      <div className="grid gap-4 lg:grid-cols-2">
        <FindingsGroup
          testid="finding-exact-dups"
          icon={Repeat}
          title="Exact duplicate sentences"
          count={f.exact_duplicate_sentences?.length || 0}
          hint="Same sentence appears multiple times."
          items={(f.exact_duplicate_sentences || []).map((d, i) => (
            <ItemRow
              key={i}
              badge={`×${d.count}`}
              text={d.text}
            />
          ))}
        />
        <FindingsGroup
          testid="finding-near-dups"
          icon={AlertTriangle}
          title="Near-duplicate sentences"
          count={f.near_duplicate_sentences?.length || 0}
          hint="Potentially related — semantic analysis can confirm."
          items={(f.near_duplicate_sentences || []).map((d, i) => (
            <div
              key={i}
              className="mono rounded border border-hairline bg-obsidian p-3 text-[12.5px] leading-relaxed text-muted2"
            >
              <span className="mono mr-2 text-[10px] uppercase tracking-widest text-cyan">
                sim {Math.round(d.similarity * 100)}%
              </span>
              <div className="mt-1 text-ink">A. {d.a}</div>
              <div className="mt-1 text-ink">B. {d.b}</div>
            </div>
          ))}
        />
        <FindingsGroup
          testid="finding-repeated-phrases"
          icon={Copy}
          title="Repeated phrases"
          count={f.repeated_phrases?.length || 0}
          hint="Word sequences appearing 3+ times."
          items={(f.repeated_phrases || []).map((p, i) => (
            <ItemRow key={i} badge={`×${p.count}`} text={`"${p.phrase}"`} />
          ))}
        />
        <FindingsGroup
          testid="finding-long-sections"
          icon={AlignLeft}
          title="Unusually long sections"
          count={f.unusually_long_sections?.length || 0}
          hint="Paragraphs > 120 words. Not automatically bad — may be necessary context."
          items={(f.unusually_long_sections || []).map((p, i) => (
            <ItemRow
              key={i}
              badge={`${p.words}w`}
              text={p.preview}
            />
          ))}
        />
      </div>

      {(f.repeated_keywords || []).length > 0 && (
        <div className="rounded-lg border border-hairline bg-surface p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="mono text-[10px] uppercase tracking-widest text-muted2">
                Repeated keywords
              </div>
              <div className="text-sm text-muted2">
                Top non-stopword tokens by frequency.
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {f.repeated_keywords.map((k, i) => (
              <span
                key={i}
                data-testid={`keyword-${k.word}`}
                className="mono inline-flex items-center gap-1.5 rounded-md border border-hairline bg-obsidian px-2.5 py-1 text-[12px] text-ink"
              >
                {k.word}
                <span className="text-cyan tabular-nums">×{k.count}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function NoAIPill() {
  return (
    <div
      data-testid="no-ai-pill"
      className="inline-flex items-center gap-2 rounded-full border border-lime/40 bg-lime/[0.06] px-3 py-1"
    >
      <span className="relative inline-flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full rounded-full bg-lime/70 animate-pulse-dot" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-lime" />
      </span>
      <span className="mono text-[11px] uppercase tracking-[0.16em] text-lime">
        Local analysis complete · AI analysis not used
      </span>
    </div>
  );
}

function BigStat({ label, value, sub, accent, testid }) {
  const cls =
    accent === "red"
      ? "text-red-400"
      : accent === "yellow"
      ? "text-yellow-300"
      : accent === "lime"
      ? "text-lime"
      : "text-ink";
  return (
    <div
      data-testid={testid}
      className="rounded-lg border border-hairline bg-surface px-5 py-4"
    >
      <div className="mono text-[10px] uppercase tracking-widest text-muted2">
        {label}
      </div>
      <div className={`mono mt-1 text-2xl font-medium tabular-nums ${cls}`}>
        {value}
      </div>
      {sub && (
        <div className="mono mt-1 text-[10px] uppercase tracking-widest text-muted2">
          {sub}
        </div>
      )}
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, detail, testid }) {
  return (
    <div
      data-testid={testid}
      className="rounded-md border border-hairline bg-surface px-4 py-3"
    >
      <div className="flex items-center gap-2 text-muted2">
        <Icon size={13} strokeWidth={1.75} />
        <span className="mono text-[10px] uppercase tracking-widest">
          {label}
        </span>
      </div>
      <div className="mono mt-1 text-xl font-medium tabular-nums text-ink">
        {value}
      </div>
      {detail && (
        <div className="mono text-[10px] uppercase tracking-widest text-muted2">
          {detail}
        </div>
      )}
    </div>
  );
}

function FindingsGroup({ icon: Icon, title, hint, count, items, testid }) {
  const [open, setOpen] = useState(count > 0 && count <= 5);
  const empty = count === 0;
  return (
    <div
      data-testid={testid}
      className={`rounded-lg border ${empty ? "border-hairline bg-surface/60" : "border-hairline bg-surface"}`}
    >
      <button
        onClick={() => !empty && setOpen((v) => !v)}
        disabled={empty}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <div className="flex items-center gap-2.5 text-ink">
          <Icon size={14} strokeWidth={1.75} className={empty ? "text-muted2" : "text-cyan"} />
          <span className="text-[14px] font-medium">{title}</span>
          <span
            className={`mono rounded-md border px-1.5 py-0.5 text-[10px] uppercase tracking-widest tabular-nums ${
              empty
                ? "border-hairline text-muted2"
                : "border-cyan/30 bg-cyan/[0.06] text-cyan"
            }`}
          >
            {count}
          </span>
        </div>
        {!empty &&
          (open ? (
            <ChevronDown size={14} className="text-muted2" />
          ) : (
            <ChevronRight size={14} className="text-muted2" />
          ))}
      </button>
      {!empty && (
        <div className="border-t border-hairline p-4">
          <div className="mono mb-3 text-[10px] uppercase tracking-widest text-muted2">
            {hint}
          </div>
          {open && (
            <div className="space-y-2 max-h-[320px] overflow-auto scrollbar-thin">
              {items}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ItemRow({ badge, text }) {
  return (
    <div className="flex items-start gap-3 rounded border border-hairline bg-obsidian p-3">
      {badge && (
        <span className="mono flex-none rounded-md border border-cyan/30 bg-cyan/[0.06] px-2 py-0.5 text-[10px] uppercase tracking-widest text-cyan tabular-nums">
          {badge}
        </span>
      )}
      <span className="mono text-[12.5px] leading-relaxed text-ink break-words">
        {text}
      </span>
    </div>
  );
}
