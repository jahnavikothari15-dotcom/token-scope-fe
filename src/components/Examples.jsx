import { EXAMPLE_PROMPTS } from "@/lib/examples";
import { FileText, ArrowUpRight } from "lucide-react";

export default function Examples({ onLoad }) {
  return (
    <section
      id="examples"
      data-testid="examples-section"
      className="border-b border-hairline"
    >
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <span className="mono text-[10px] uppercase tracking-widest text-muted2">
              Examples
            </span>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Try a deliberately verbose prompt.
            </h2>
            <p className="mt-3 text-base text-muted2">
              Each example contains real prompt smells — repeated instructions,
              overlapping examples, redundant tone rules. Load one and hit
              Analyze.
            </p>
          </div>
          <span className="mono rounded-md border border-hairline bg-surface px-2.5 py-1 text-[10px] uppercase tracking-widest text-muted2">
            {EXAMPLE_PROMPTS.length} examples · no credits used until you click Analyze
          </span>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {EXAMPLE_PROMPTS.map((ex) => (
            <button
              key={ex.id}
              data-testid={`example-${ex.id}`}
              onClick={() => onLoad(ex)}
              className="group rounded-lg border border-hairline bg-surface p-6 text-left transition-colors hover:border-edge hover:bg-surface-2"
            >
              <div className="flex items-center gap-2 text-muted2">
                <FileText size={14} strokeWidth={1.75} />
                <span className="mono text-[10px] uppercase tracking-widest">
                  {ex.id}.prompt
                </span>
              </div>
              <div className="mt-3 flex items-start justify-between gap-3">
                <h3 className="text-xl font-semibold tracking-tight text-ink">
                  {ex.title}
                </h3>
                <ArrowUpRight
                  size={16}
                  strokeWidth={1.75}
                  className="text-muted2 transition-colors group-hover:text-cyan"
                />
              </div>
              <p className="mt-2 text-sm text-muted2">{ex.blurb}</p>
              <div className="mono mt-4 rounded-md border border-hairline bg-obsidian p-3 text-[12px] leading-relaxed text-muted2 line-clamp-4">
                {ex.text.split("\n").slice(0, 4).join("\n")}
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
