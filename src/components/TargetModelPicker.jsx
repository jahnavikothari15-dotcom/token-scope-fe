import { useState, useRef, useEffect } from "react";
import { Cpu, Check, ChevronDown } from "lucide-react";

/**
 * TargetModelPicker — dropdown that selects the model whose tokenizer + input
 * price should be used for the local counts and cost estimates.
 *
 * Props:
 *   value        -> selected model id
 *   onChange     -> (id) => void
 *   catalog      -> { default_model, models: { [id]: { display, provider, input_per_1m, exact_tokenizer } } }
 */
export default function TargetModelPicker({ value, onChange, catalog }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const models = catalog?.models || {};
  const current = models[value] || models[catalog?.default_model];
  const groups = groupByProvider(models);

  return (
    <div ref={ref} className="relative">
      <button
        data-testid="target-model-picker"
        onClick={() => setOpen((v) => !v)}
        className="group inline-flex h-9 items-center gap-2 rounded-md border border-hairline bg-surface px-3 text-[12.5px] text-ink transition-colors hover:bg-surface-2"
      >
        <Cpu size={13} strokeWidth={1.75} className="text-cyan" />
        <span className="mono text-[10px] uppercase tracking-widest text-muted2">
          Target
        </span>
        <span className="text-ink">{current?.display || value || "Select"}</span>
        {current && (
          <span className="mono text-[10px] uppercase tracking-widest text-muted2">
            · ${current.input_per_1m}/1M
          </span>
        )}
        <ChevronDown size={13} strokeWidth={1.75} className="text-muted2" />
      </button>

      {open && (
        <div
          data-testid="target-model-menu"
          className="absolute right-0 z-30 mt-2 w-[320px] rounded-md border border-hairline bg-obsidian shadow-2xl"
        >
          {Object.entries(groups).map(([provider, list]) => (
            <div key={provider} className="border-b border-hairline last:border-b-0">
              <div className="mono px-3 pt-2.5 pb-1 text-[9px] uppercase tracking-[0.18em] text-muted2">
                {provider}
              </div>
              <ul className="pb-2">
                {list.map(([id, m]) => {
                  const active = id === value;
                  return (
                    <li key={id}>
                      <button
                        data-testid={`model-option-${id}`}
                        onClick={() => {
                          onChange(id);
                          setOpen(false);
                        }}
                        className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition-colors hover:bg-surface ${
                          active ? "bg-surface" : ""
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="text-[13px] text-ink">
                            {m.display}
                            {!m.exact_tokenizer && (
                              <span className="mono ml-1.5 rounded border border-hairline bg-obsidian px-1 text-[9px] uppercase tracking-widest text-muted2">
                                approx
                              </span>
                            )}
                          </div>
                          <div className="mono text-[10px] uppercase tracking-widest text-muted2">
                            ${m.input_per_1m}/1M input tokens
                          </div>
                        </div>
                        {active && (
                          <Check
                            size={13}
                            strokeWidth={2}
                            className="text-cyan"
                          />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          <div className="mono border-t border-hairline p-3 text-[10px] uppercase tracking-widest text-muted2">
            Prices are approximate list prices · configurable in Savings
          </div>
        </div>
      )}
    </div>
  );
}

function groupByProvider(models) {
  const g = {};
  for (const [id, m] of Object.entries(models)) {
    (g[m.provider] = g[m.provider] || []).push([id, m]);
  }
  return g;
}
