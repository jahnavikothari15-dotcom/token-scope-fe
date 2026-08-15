import { useMemo, useState } from "react";
import { AlertTriangle, Eye, EyeOff, List, Layers } from "lucide-react";

/**
 * SuspiciousSectionsPanel — dual view of the paragraphs local analysis flagged.
 *
 * Modes:
 *   "list"    — original list of flagged excerpts (default)
 *   "inline"  — full prompt with flagged paragraphs highlighted in context
 *
 * Props:
 *   sections: [{ id, paragraph_index, reasons, text, word_count }]
 *   prompt:   full original prompt text (for inline view)
 */
export default function SuspiciousSectionsPanel({ sections, prompt }) {
  const [view, setView] = useState("list");

  const paragraphs = useMemo(() => {
    if (!prompt) return [];
    return prompt.split(/\n\s*\n/);
  }, [prompt]);

  const flaggedMap = useMemo(() => {
    const map = new Map();
    (sections || []).forEach((s) => {
      map.set(s.paragraph_index, s);
    });
    return map;
  }, [sections]);

  const hasSections = (sections || []).length > 0;

  return (
    <div
      data-testid="suspicious-sections"
      className={`rounded-lg border ${
        hasSections ? "border-hairline bg-surface" : "border-hairline bg-surface/60"
      } p-5`}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertTriangle
            size={14}
            strokeWidth={1.75}
            className={hasSections ? "text-orange-300" : "text-muted2"}
          />
          <span className="mono text-[10px] uppercase tracking-widest text-muted2">
            Flagged for deep review
          </span>
          <span
            data-testid="suspicious-sections-count"
            className={`mono rounded-md border px-2 py-0.5 text-[10px] uppercase tracking-widest tabular-nums ${
              hasSections
                ? "border-cyan/30 bg-cyan/[0.06] text-cyan"
                : "border-hairline text-muted2"
            }`}
          >
            {(sections || []).length}
          </span>
        </div>
        {hasSections && (
          <div className="flex overflow-hidden rounded-md border border-hairline">
            <button
              data-testid="sections-view-list"
              onClick={() => setView("list")}
              className={`mono inline-flex h-7 items-center gap-1.5 px-2.5 text-[11px] uppercase tracking-wider transition-colors ${
                view === "list"
                  ? "bg-surface-2 text-ink"
                  : "bg-obsidian text-muted2 hover:text-ink"
              }`}
            >
              <List size={11} strokeWidth={1.75} /> Flagged only
            </button>
            <button
              data-testid="sections-view-inline"
              onClick={() => setView("inline")}
              className={`mono inline-flex h-7 items-center gap-1.5 border-l border-hairline px-2.5 text-[11px] uppercase tracking-wider transition-colors ${
                view === "inline"
                  ? "bg-surface-2 text-ink"
                  : "bg-obsidian text-muted2 hover:text-ink"
              }`}
            >
              <Layers size={11} strokeWidth={1.75} /> In prompt
            </button>
          </div>
        )}
      </div>

      {!hasSections ? (
        <p className="text-[13px] text-muted2">
          Local analysis did not flag any paragraph for deep review. A semantic
          pass may still surface subtler issues.
        </p>
      ) : (
        <>
          <p className="mb-4 text-[13px] text-muted2">
            {view === "list"
              ? "These paragraphs will be the semantic pass's primary focus."
              : "Full prompt with flagged paragraphs highlighted in place."}
          </p>

          {view === "list" && (
            <ul className="space-y-3">
              {sections.map((s, i) => (
                <li
                  key={s.id || i}
                  data-testid={`suspicious-section-${i}`}
                  className="rounded-md border border-hairline bg-obsidian p-3"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="mono rounded border border-hairline bg-surface-2 px-1.5 py-0.5 text-[10px] uppercase tracking-widest text-muted2">
                      ¶{s.paragraph_index}
                    </span>
                    <span className="mono text-[10px] uppercase tracking-widest text-muted2">
                      {s.word_count} words
                    </span>
                    {(s.reasons || []).map((r, ri) => (
                      <span
                        key={ri}
                        className="mono rounded border border-orange-500/30 bg-orange-500/[0.06] px-1.5 py-0.5 text-[10px] uppercase tracking-widest text-orange-300"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                  <p className="mono mt-2 max-h-32 overflow-auto text-[12.5px] leading-relaxed text-ink scrollbar-thin">
                    {s.text}
                  </p>
                </li>
              ))}
            </ul>
          )}

          {view === "inline" && (
            <div
              data-testid="inline-highlight-view"
              className="mono max-h-[520px] space-y-1 overflow-auto rounded-md border border-hairline bg-obsidian p-4 text-[12.5px] leading-[1.7] scrollbar-thin"
            >
              {paragraphs.map((p, idx) => {
                const flag = flaggedMap.get(idx);
                if (flag) {
                  return (
                    <div
                      key={idx}
                      data-testid={`inline-para-flagged-${idx}`}
                      className="relative rounded border-l-2 border-orange-500 bg-orange-500/[0.05] px-3 py-2 text-ink"
                    >
                      <div className="mb-1 flex flex-wrap gap-1.5">
                        <span className="mono rounded border border-hairline bg-surface-2 px-1.5 py-0.5 text-[9px] uppercase tracking-widest text-muted2">
                          ¶{idx} · flagged
                        </span>
                        {(flag.reasons || []).map((r, ri) => (
                          <span
                            key={ri}
                            className="mono rounded border border-orange-500/30 bg-orange-500/[0.08] px-1.5 py-0.5 text-[9px] uppercase tracking-widest text-orange-300"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                      <div className="whitespace-pre-wrap break-words">{p}</div>
                    </div>
                  );
                }
                return (
                  <div
                    key={idx}
                    className="whitespace-pre-wrap break-words px-3 py-2 text-muted2"
                  >
                    {p}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
