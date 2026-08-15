import { CheckCircle2, Cpu, DollarSign, Zap } from "lucide-react";

function formatUsd(v) {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  if (v === 0) return "$0.0000";
  if (v < 0.01) return `$${v.toFixed(6)}`;
  if (v < 1) return `$${v.toFixed(4)}`;
  return `$${v.toFixed(2)}`;
}

/**
 * AnalysisCost — cost transparency card.
 *
 * Props:
 *   local     -> { ai_used: false, estimated_cost_usd: 0 } | null
 *   semantic  -> { ai_used: true, engine_tier, cost_estimate: {cost_usd,tokens,model_id} } | null
 *   optimize  -> optimize response | null
 *   validate  -> validate response | null
 *   tiers     -> { cheap: { display_name }, standard: {..}, premium: {..} }
 */
export default function AnalysisCost({ local, semantic, optimize, validate, tiers }) {
  const rows = [
    {
      key: "local",
      label: "Local analysis",
      state: local ? "done" : "idle",
      detail: "Deterministic — no LLM",
      cost: local ? "$0.0000" : "—",
      accent: "lime",
    },
    {
      key: "semantic",
      label: "Deep semantic analysis",
      state: semantic ? "done" : "idle",
      detail: semantic
        ? `${tiers?.[semantic.engine_tier]?.display_name || semantic.engine_tier} · targeted sections`
        : "Optional — cheap tier by default",
      cost: semantic ? formatUsd(semantic.cost_estimate?.cost_usd) : "—",
      accent: semantic ? "cyan" : "muted",
      sub: semantic?.cost_estimate?.tokens
        ? `${semantic.cost_estimate.tokens.toLocaleString()} tok · $${semantic.cost_estimate.price_per_1m}/1M`
        : null,
    },
    {
      key: "optimize",
      label: "Optimization",
      state: optimize ? "done" : "idle",
      detail: optimize
        ? `${tiers?.[optimize.engine_tier]?.display_name || optimize.engine_tier}`
        : "Optional — standard tier by default",
      cost: optimize ? formatUsd(optimize.cost_estimate?.cost_usd) : "—",
      accent: optimize ? "cyan" : "muted",
      sub: optimize?.cost_estimate?.tokens
        ? `${optimize.cost_estimate.tokens.toLocaleString()} tok · $${optimize.cost_estimate.price_per_1m}/1M`
        : null,
    },
    {
      key: "validate",
      label: "Behavior validation",
      state: validate ? "done" : "idle",
      detail: validate
        ? `${tiers?.[validate.engine_tier]?.display_name || validate.engine_tier}`
        : "Runs after optimization",
      cost: validate ? formatUsd(validate.cost_estimate?.cost_usd) : "—",
      accent: validate ? "cyan" : "muted",
      sub: validate?.cost_estimate?.tokens
        ? `${validate.cost_estimate.tokens.toLocaleString()} tok · $${validate.cost_estimate.price_per_1m}/1M`
        : null,
    },
  ];

  const totalAI = rows
    .filter((r) => r.key !== "local")
    .map((r) => {
      const val =
        r.key === "semantic"
          ? semantic?.cost_estimate?.cost_usd
          : r.key === "optimize"
          ? optimize?.cost_estimate?.cost_usd
          : validate?.cost_estimate?.cost_usd;
      return Number(val || 0);
    })
    .reduce((a, b) => a + b, 0);

  return (
    <div
      data-testid="analysis-cost"
      className="rounded-lg border border-hairline bg-surface p-6"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="mono mb-1 inline-flex items-center gap-1.5 rounded-full border border-hairline bg-obsidian px-2 py-1 text-[10px] uppercase tracking-widest text-muted2">
            <DollarSign size={11} strokeWidth={1.75} /> Cost transparency
          </div>
          <h3 className="text-lg font-semibold tracking-tight text-ink">
            Analysis cost
          </h3>
          <p className="mt-1 max-w-xl text-[13px] text-muted2">
            Local counts and redundancy detection are free. Only the optional
            semantic, optimization and validation stages call an AI provider.
          </p>
        </div>
        {totalAI > 0 && (
          <div
            data-testid="analysis-cost-total"
            className="rounded-md border border-cyan/30 bg-cyan/[0.04] px-3 py-2 text-right"
          >
            <div className="mono text-[10px] uppercase tracking-widest text-muted2">
              AI total (est.)
            </div>
            <div className="mono text-lg font-medium tabular-nums text-cyan">
              {formatUsd(totalAI)}
            </div>
          </div>
        )}
      </div>

      <ul className="divide-y divide-hairline overflow-hidden rounded-md border border-hairline">
        {rows.map((r) => (
          <li
            key={r.key}
            data-testid={`cost-row-${r.key}`}
            className="flex items-center justify-between gap-4 bg-obsidian px-4 py-3"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span
                className={`flex h-7 w-7 flex-none items-center justify-center rounded-md border ${
                  r.state === "done"
                    ? r.accent === "lime"
                      ? "border-lime/40 bg-lime/10 text-lime"
                      : "border-cyan/40 bg-cyan/10 text-cyan"
                    : "border-hairline bg-surface text-muted2"
                }`}
              >
                {r.state === "done" ? (
                  <CheckCircle2 size={13} strokeWidth={1.75} />
                ) : (
                  <Cpu size={13} strokeWidth={1.75} />
                )}
              </span>
              <div className="min-w-0">
                <div className="text-[13.5px] font-medium text-ink truncate">
                  {r.label}
                </div>
                <div className="mono text-[11px] uppercase tracking-widest text-muted2 truncate">
                  {r.detail}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div
                className={`mono text-[13px] font-medium tabular-nums ${
                  r.state === "done"
                    ? r.accent === "lime"
                      ? "text-lime"
                      : "text-cyan"
                    : "text-muted2"
                }`}
              >
                {r.cost}
              </div>
              {r.sub && (
                <div className="mono text-[10px] uppercase tracking-widest text-muted2">
                  {r.sub}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>

      <p className="mono mt-4 flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted2">
        <Zap size={11} strokeWidth={1.75} className="text-lime" />
        Estimates based on public list prices · your provider bill may differ
      </p>
    </div>
  );
}
