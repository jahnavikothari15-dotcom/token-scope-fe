import { CheckCircle2, AlertTriangle, XCircle, HelpCircle } from "lucide-react";

const STATUS = {
  preserved: {
    icon: CheckCircle2,
    label: "Preserved",
    cls: "text-lime",
    dot: "bg-lime",
  },
  partial: {
    icon: AlertTriangle,
    label: "Partial",
    cls: "text-yellow-300",
    dot: "bg-yellow-400",
  },
  changed: {
    icon: AlertTriangle,
    label: "Changed",
    cls: "text-orange-300",
    dot: "bg-orange-500",
  },
  missing: {
    icon: XCircle,
    label: "Missing",
    cls: "text-red-400",
    dot: "bg-red-500",
  },
};

function confidenceLabel(c) {
  const n = Number(c) || 0;
  if (n >= 80) return { label: "High confidence", cls: "text-lime" };
  if (n >= 60) return { label: "Moderate confidence", cls: "text-cyan" };
  if (n >= 40) return { label: "Low confidence", cls: "text-yellow-300" };
  return { label: "Very low confidence", cls: "text-red-400" };
}

export default function BehaviorCheck({ validation, validating }) {
  if (validating) {
    return (
      <div
        data-testid="behavior-validating"
        className="rounded-lg border border-hairline bg-surface p-6"
      >
        <div className="mb-3 flex items-center gap-2">
          <span className="relative inline-flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-cyan/50 animate-pulse-dot" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan" />
          </span>
          <span className="mono text-[11px] uppercase tracking-widest text-muted2">
            Running behavior preservation check
          </span>
        </div>
        <p className="text-sm text-muted2">
          Extracting requirements from the original and comparing them against
          the optimized prompt...
        </p>
      </div>
    );
  }

  if (!validation) return null;

  const conf = confidenceLabel(validation.confidence);
  const reqs = validation.requirements || [];
  const changes = validation.potential_changes || [];

  return (
    <div
      data-testid="behavior-check"
      className="rounded-lg border border-hairline bg-surface p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-ink">
            Behavior preservation
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-muted2">
            {validation.overall_assessment ||
              "AI-based comparison. Never a guarantee — verify critical prompts before shipping."}
          </p>
        </div>
        <div
          data-testid="behavior-confidence"
          className="rounded-md border border-hairline bg-obsidian px-3 py-2"
        >
          <div className="mono text-[10px] uppercase tracking-widest text-muted2">
            Confidence
          </div>
          <div className={`mono text-lg font-medium tabular-nums ${conf.cls}`}>
            {validation.confidence ?? 0}%
          </div>
          <div className={`mono text-[10px] uppercase tracking-widest ${conf.cls}`}>
            {conf.label}
          </div>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-md border border-hairline">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-2">
            <tr>
              <th className="mono px-4 py-2 text-[10px] uppercase tracking-widest text-muted2">
                Requirement
              </th>
              <th className="mono px-4 py-2 text-[10px] uppercase tracking-widest text-muted2">
                Status
              </th>
              <th className="mono px-4 py-2 text-[10px] uppercase tracking-widest text-muted2">
                Notes
              </th>
            </tr>
          </thead>
          <tbody>
            {reqs.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-sm text-muted2">
                  <HelpCircle size={14} className="mr-2 inline" />
                  No explicit requirements were extracted.
                </td>
              </tr>
            ) : (
              reqs.map((r, i) => {
                const s = STATUS[r.status] || STATUS.partial;
                const Icon = s.icon;
                return (
                  <tr
                    key={i}
                    data-testid={`requirement-row-${i}`}
                    className="border-t border-hairline"
                  >
                    <td className="px-4 py-3 text-[13.5px] text-ink">
                      {r.requirement}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={`mono inline-flex items-center gap-1.5 text-[12px] uppercase tracking-widest ${s.cls}`}
                      >
                        <Icon size={13} strokeWidth={1.75} />
                        {s.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-muted2">
                      {r.explanation}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {changes.length > 0 && (
        <div className="mt-5">
          <h4 className="mono mb-2 text-[10px] uppercase tracking-widest text-muted2">
            Potential behavior changes
          </h4>
          <ul className="space-y-2">
            {changes.map((c, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-md border border-orange-500/25 bg-orange-500/5 p-3"
              >
                <AlertTriangle
                  size={14}
                  strokeWidth={1.75}
                  className="mt-0.5 flex-none text-orange-300"
                />
                <p className="text-[13px] text-ink">
                  <span className="mono mr-2 text-[10px] uppercase tracking-widest text-orange-300">
                    {c.severity || "medium"}
                  </span>
                  {c.description || c}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
