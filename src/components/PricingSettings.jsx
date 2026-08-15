import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Settings, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export default function PricingSettings({
  open,
  onOpenChange,
  catalog,
  overrides,
  onChange,
  prefs,
  onPrefsChange,
}) {
  const [draft, setDraft] = useState(overrides || {});
  const [prefsDraft, setPrefsDraft] = useState(prefs || {});

  useEffect(() => {
    if (open) {
      setDraft({ ...(overrides || {}) });
      setPrefsDraft({ ...(prefs || {}) });
    }
  }, [open, overrides, prefs]);

  const models = catalog?.models || {};
  const groups = {};
  for (const [id, m] of Object.entries(models)) {
    (groups[m.provider] = groups[m.provider] || []).push([id, m]);
  }

  const setPrice = (id, val) => {
    setDraft((d) => {
      const next = { ...d };
      if (val === "" || val === null) {
        delete next[id];
      } else {
        const n = Number(val);
        if (!Number.isNaN(n) && n >= 0) next[id] = n;
      }
      return next;
    });
  };

  const setStageTier = (stage, tier) => {
    setPrefsDraft((p) => ({
      ...p,
      stageTiers: { ...(p.stageTiers || {}), [stage]: tier },
    }));
  };

  const setThreshold = (val) => {
    const n = Number(val);
    if (!Number.isNaN(n)) {
      setPrefsDraft((p) => ({
        ...p,
        nearDupThreshold: Math.max(0.3, Math.min(0.95, n)),
      }));
    }
  };

  const reset = () => {
    setDraft({});
    setPrefsDraft({
      stageTiers: { semantic: "cheap", optimize: "standard", validate: "standard" },
      nearDupThreshold: 0.55,
    });
  };

  const save = () => {
    onChange(draft);
    onPrefsChange && onPrefsChange(prefsDraft);
    toast.success("Settings saved");
    onOpenChange(false);
  };

  const TIERS = ["cheap", "standard", "premium"];
  const tierLabel = (t) =>
    ({
      cheap: "Cheap · Haiku 4.5",
      standard: "Standard · Sonnet 4.6",
      premium: "Premium · Sonnet 5",
    }[t] || t);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="pricing-settings-dialog"
        className="max-h-[85vh] max-w-2xl overflow-y-auto border-hairline bg-surface p-0 text-ink"
      >
        <DialogHeader className="border-b border-hairline p-6">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight text-ink">
            <Settings size={15} strokeWidth={1.75} className="text-cyan" />
            Custom pricing
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm text-muted2">
            Override the default per-model input price ($ per 1M tokens) with
            your own enterprise or discounted rates. Blank fields fall back to
            the public list price. Saved locally to this browser only.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 p-6">
          {/* Stage tier mapping */}
          <div data-testid="stage-tier-section">
            <div className="mono mb-2 text-[10px] uppercase tracking-[0.18em] text-muted2">
              Stage tiers
            </div>
            <p className="mb-3 text-[12.5px] text-muted2">
              Pick the model tier used by each TokenScope stage.
            </p>
            <div className="grid gap-2">
              {[
                { key: "semantic", label: "Deep semantic analysis" },
                { key: "optimize", label: "Optimization" },
                { key: "validate", label: "Behavior validation" },
              ].map((s) => (
                <div
                  key={s.key}
                  data-testid={`stage-tier-${s.key}`}
                  className="grid grid-cols-[1fr_220px] items-center gap-3 rounded-md border border-hairline bg-obsidian px-4 py-3"
                >
                  <div className="text-[13.5px] text-ink">{s.label}</div>
                  <div className="flex overflow-hidden rounded-md border border-hairline">
                    {TIERS.map((t) => {
                      const active =
                        (prefsDraft?.stageTiers?.[s.key] || "") === t;
                      return (
                        <button
                          key={t}
                          data-testid={`stage-tier-${s.key}-${t}`}
                          onClick={() => setStageTier(s.key, t)}
                          className={`mono flex-1 border-l border-hairline first:border-l-0 px-2 py-2 text-[10px] uppercase tracking-wider transition-colors ${
                            active
                              ? "bg-cyan/[0.08] text-cyan"
                              : "bg-surface text-muted2 hover:text-ink"
                          }`}
                          title={tierLabel(t)}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Local sensitivity slider */}
          <div data-testid="sensitivity-section">
            <div className="mono mb-2 text-[10px] uppercase tracking-[0.18em] text-muted2">
              Local sensitivity
            </div>
            <p className="mb-3 text-[12.5px] text-muted2">
              Near-duplicate detection threshold. Lower catches subtler
              paraphrases at the cost of more noise. Default 0.55.
            </p>
            <div className="rounded-md border border-hairline bg-obsidian px-4 py-3">
              <div className="mb-2 flex items-center justify-between text-[12px]">
                <span className="mono text-[10px] uppercase tracking-widest text-muted2">
                  Threshold
                </span>
                <span className="mono tabular-nums text-cyan">
                  {(prefsDraft?.nearDupThreshold ?? 0.55).toFixed(2)}
                </span>
              </div>
              <input
                data-testid="sensitivity-slider"
                type="range"
                min={0.3}
                max={0.95}
                step={0.01}
                value={prefsDraft?.nearDupThreshold ?? 0.55}
                onChange={(e) => setThreshold(e.target.value)}
                className="w-full accent-cyan"
              />
              <div className="mono mt-1 flex justify-between text-[9px] uppercase tracking-widest text-muted2">
                <span>0.30 · sensitive</span>
                <span>0.55 · default</span>
                <span>0.95 · strict</span>
              </div>
            </div>
          </div>

          {Object.entries(groups).map(([provider, list], gi) => (
            <div key={provider}>
              {gi === 0 && (
                <>
                  <div className="mono mb-2 text-[10px] uppercase tracking-[0.18em] text-muted2">
                    Price overrides
                  </div>
                  <p className="mb-3 text-[12.5px] text-muted2">
                    Blank fields fall back to the public list price.
                  </p>
                </>
              )}
              <div className="mono mb-2 text-[10px] uppercase tracking-[0.14em] text-muted2/80">
                · {provider}
              </div>
              <div className="grid gap-2">
                {list.map(([id, m]) => (
                  <div
                    key={id}
                    data-testid={`pricing-row-${id}`}
                    className="grid grid-cols-[1fr_140px] items-center gap-3 rounded-md border border-hairline bg-obsidian px-4 py-3"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-[13.5px] text-ink">
                        {m.display}
                      </div>
                      <div className="mono text-[10px] uppercase tracking-widest text-muted2">
                        list · ${m.input_per_1m}/1M
                      </div>
                    </div>
                    <div className="flex overflow-hidden rounded-md border border-hairline bg-surface focus-within:border-cyan/60">
                      <span className="mono flex items-center border-r border-hairline bg-surface-2 px-2 text-[10px] uppercase tracking-widest text-muted2">
                        $
                      </span>
                      <input
                        data-testid={`pricing-input-${id}`}
                        type="number"
                        min={0}
                        step={0.01}
                        placeholder={String(m.input_per_1m)}
                        value={draft[id] ?? ""}
                        onChange={(e) => setPrice(id, e.target.value)}
                        className="mono h-9 w-full bg-transparent px-2 text-[13px] tabular-nums text-ink outline-none"
                      />
                      <span className="mono flex items-center border-l border-hairline bg-surface-2 px-2 text-[10px] uppercase tracking-widest text-muted2">
                        /1M
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="flex-row items-center justify-between gap-3 border-t border-hairline p-4">
          <button
            data-testid="pricing-reset"
            onClick={reset}
            className="mono inline-flex h-8 items-center gap-1.5 rounded-md border border-hairline bg-obsidian px-3 text-[11px] uppercase tracking-wider text-muted2 transition-colors hover:text-ink"
          >
            <RotateCcw size={11} strokeWidth={1.75} /> Reset to list prices
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenChange(false)}
              className="mono inline-flex h-9 items-center rounded-md border border-hairline bg-obsidian px-3.5 text-[12px] uppercase tracking-wider text-muted2 transition-colors hover:text-ink"
            >
              Cancel
            </button>
            <button
              data-testid="pricing-save"
              onClick={save}
              className="mono inline-flex h-9 items-center rounded-md bg-cyan px-3.5 text-[12px] font-medium uppercase tracking-wider text-obsidian transition-colors hover:bg-cyan/90"
            >
              Save overrides
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
