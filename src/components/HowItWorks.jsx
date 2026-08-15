const STEPS = [
  {
    num: "01",
    title: "Paste",
    body: "Paste any AI prompt — system prompts, agent instructions, guardrails, all of it.",
  },
  {
    num: "02",
    title: "Analyze",
    body: "TokenScope measures size, redundancy, complexity and clarity using Claude Sonnet 5.",
  },
  {
    num: "03",
    title: "Optimize",
    body: "Generate a leaner version while preserving safety, tools, schemas and required examples.",
  },
  {
    num: "04",
    title: "Validate",
    body: "Compare original vs optimized and surface any potential behavior changes.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how"
      data-testid="how-it-works"
      className="border-b border-hairline"
    >
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
        <div className="max-w-2xl">
          <span className="mono text-[10px] uppercase tracking-widest text-muted2">
            How it works
          </span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Four steps. Zero prompt guessing.
          </h2>
          <p className="mt-3 text-base text-muted2">
            Analyze, optimize and validate — with the AI doing only the semantic
            work and normal code doing the counting.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <div
              key={s.num}
              data-testid={`how-step-${i + 1}`}
              className="group relative rounded-lg border border-hairline bg-surface p-6 transition-colors hover:border-edge"
            >
              <div className="mono text-[11px] uppercase tracking-widest text-cyan">
                {s.num}
              </div>
              <h3 className="mt-3 text-xl font-semibold tracking-tight text-ink">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted2">
                {s.body}
              </p>
              <div className="mono absolute bottom-4 right-5 text-[11px] uppercase tracking-widest text-muted2/60">
                step {i + 1}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
