import { CheckCircle2, AlertTriangle, AlertOctagon, Info } from "lucide-react";

const SEVERITY = {
  critical: {
    dot: "bg-red-500",
    ring: "border-red-500/30 bg-red-500/5",
    label: "text-red-300",
    icon: AlertOctagon,
  },
  high: {
    dot: "bg-orange-500",
    ring: "border-orange-500/30 bg-orange-500/5",
    label: "text-orange-300",
    icon: AlertTriangle,
  },
  medium: {
    dot: "bg-yellow-400",
    ring: "border-yellow-500/30 bg-yellow-500/5",
    label: "text-yellow-200",
    icon: AlertTriangle,
  },
  low: {
    dot: "bg-lime",
    ring: "border-lime/30 bg-lime/5",
    label: "text-lime",
    icon: Info,
  },
};

export default function IssuesList({ analysis }) {
  const issues = analysis?.issues || [];
  const strengths = analysis?.strengths || [];

  return (
    <div
      data-testid="issues-panel"
      className="rounded-lg border border-hairline bg-surface p-6"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold tracking-tight text-ink">
          Issues detected
        </h3>
        <span
          data-testid="issues-count"
          className="mono rounded-md border border-hairline bg-obsidian px-2 py-1 text-[11px] uppercase tracking-widest text-muted2"
        >
          {issues.length} finding{issues.length === 1 ? "" : "s"}
        </span>
      </div>

      {issues.length === 0 ? (
        <div className="mono rounded-md border border-hairline bg-obsidian px-4 py-6 text-center text-[12px] uppercase tracking-widest text-muted2">
          No issues detected.
        </div>
      ) : (
        <ul className="space-y-3">
          {issues.map((it, i) => {
            const cfg = SEVERITY[it.severity] || SEVERITY.medium;
            const Icon = cfg.icon;
            return (
              <li
                key={i}
                data-testid={`issue-item-${i}`}
                className={`rounded-md border ${cfg.ring} p-4`}
              >
                <div className="flex items-start gap-3">
                  <span className={`mt-1 inline-block h-2 w-2 flex-none rounded-full ${cfg.dot}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Icon size={14} strokeWidth={1.75} className={cfg.label} />
                      <span className={`mono text-[11px] uppercase tracking-widest ${cfg.label}`}>
                        {(it.severity || "medium")} · {(it.type || "issue").replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="mt-1.5 text-[14px] text-ink">{it.description}</p>
                    {it.suggestion && (
                      <p className="mt-1.5 text-[13px] text-muted2">
                        <span className="mono text-[10px] uppercase tracking-widest text-muted2">
                          suggestion ·{" "}
                        </span>
                        {it.suggestion}
                      </p>
                    )}
                    {it.location && (
                      <p className="mono mt-2 truncate rounded border border-hairline bg-obsidian px-2 py-1 text-[11px] text-muted2">
                        {it.location}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {strengths.length > 0 && (
        <div className="mt-5 border-t border-hairline pt-4">
          <h4 className="mono mb-2 text-[10px] uppercase tracking-widest text-muted2">
            Strengths
          </h4>
          <ul data-testid="strengths-list" className="space-y-1.5">
            {strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] text-ink">
                <CheckCircle2
                  size={14}
                  strokeWidth={1.75}
                  className="mt-0.5 flex-none text-lime"
                />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
