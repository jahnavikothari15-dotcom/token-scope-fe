import { ArrowRight } from "lucide-react";

const PILLS = [
  "Local first · $0 AI",
  "Redundancy detection",
  "Targeted semantic AI",
  "Behavior preservation",
];

export default function Hero({ onScrollToAnalyzer }) {
  return (
    <section
      id="top"
      data-testid="hero-section"
      className="relative overflow-hidden border-b border-hairline"
    >
      <div className="pointer-events-none absolute inset-0 grid-noise opacity-40" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan/30 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-hairline bg-surface/70 px-3 py-1">
          <span className="relative inline-flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-lime/70 animate-pulse-dot" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-lime" />
          </span>
          <span className="mono text-[11px] uppercase tracking-[0.18em] text-muted2">
            Prompt observability · v0.1
          </span>
        </div>

        <h1
          data-testid="hero-title"
          className="max-w-4xl text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl"
        >
          Make every token count.
        </h1>
        <p
          data-testid="hero-subtitle"
          className="mt-5 max-w-2xl text-base text-muted2 sm:text-lg"
        >
          Optimize AI prompts for efficiency while preserving intent. Local
          analysis runs instantly with zero AI tokens spent — AI is opt-in.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <button
            data-testid="hero-cta-primary"
            onClick={onScrollToAnalyzer}
            className="group inline-flex h-10 items-center gap-2 rounded-md bg-cyan px-4 text-sm font-medium text-obsidian transition-colors hover:bg-cyan/90"
          >
            Analyze a Prompt
            <ArrowRight
              size={15}
              strokeWidth={1.75}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </button>
          <a
            data-testid="hero-cta-secondary"
            href="#how"
            className="inline-flex h-10 items-center rounded-md border border-hairline bg-surface px-4 text-sm text-ink transition-colors hover:bg-surface-2"
          >
            How it works
          </a>
        </div>

        <div className="mt-14 flex flex-wrap gap-x-8 gap-y-3">
          {PILLS.map((p) => (
            <div key={p} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan" />
              <span className="mono text-[12px] uppercase tracking-wider text-muted2">
                {p}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
