import { useRef } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";

/**
 * ImportReport — file input that restores a previously-saved JSON report
 * into the current session state (no AI calls required).
 *
 * Props:
 *   onImport(restored) — called with an object shaped as:
 *     {
 *       prompt: string,
 *       local: <local_payload>,
 *       semantic: <semantic response> | null,
 *       optimization: <optimize response> | null,
 *       validation: <validate response> | null,
 *       targetModelId: string | null,
 *     }
 */
export default function ImportReport({ onImport }) {
  const inputRef = useRef(null);

  const trigger = () => inputRef.current?.click();

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (data.product !== "TokenScope") {
        throw new Error("This file does not look like a TokenScope report.");
      }
      const restored = {
        prompt: data.original_prompt || "",
        local: data.local_analysis
          ? {
              metrics: data.local_analysis.metrics,
              findings: data.local_analysis.findings,
              suspicious_sections: data.local_analysis.suspicious_sections,
              engine: data.local_analysis.engine || "local-deterministic",
              estimated_cost_usd:
                data.local_analysis.estimated_cost_usd ?? 0.0,
              ai_used: false,
              model: data.local_analysis.model || data.target_model,
            }
          : null,
        semantic: data.semantic_analysis
          ? {
              semantic: data.semantic_analysis.result,
              engine_tier: data.semantic_analysis.engine_tier || "cheap",
              ai_used: true,
              cost_estimate: data.semantic_analysis.cost_estimate,
            }
          : null,
        optimization: data.optimization?.optimized_prompt
          ? {
              optimization: {
                optimized_prompt: data.optimization.optimized_prompt,
                optimization_level: data.optimization.mode,
                changes: data.optimization.changes,
                preserved_requirements: data.optimization.preserved_requirements,
                potential_behavior_changes:
                  data.optimization.potential_behavior_changes,
                confidence: data.optimization.confidence,
              },
              original_metrics: data.optimization.original_metrics,
              optimized_metrics: data.optimization.optimized_metrics,
              tokens_saved: data.optimization.tokens_saved,
              reduction_percent: data.optimization.reduction_percent,
              engine_tier: data.optimization.engine_tier || "standard",
              ai_used: true,
              cost_estimate: data.optimization.cost_estimate,
            }
          : null,
        validation: data.behavior_validation
          ? {
              requirements: data.behavior_validation.requirements,
              overall_assessment: data.behavior_validation.overall_assessment,
              potential_changes: data.behavior_validation.potential_changes,
              confidence: data.behavior_validation.confidence,
              engine_tier: data.behavior_validation.engine_tier || "standard",
              ai_used: true,
              cost_estimate: data.behavior_validation.cost_estimate,
            }
          : null,
        targetModelId: data.target_model?.id || null,
      };
      onImport(restored);
      toast.success("Report imported");
    } catch (err) {
      const msg = err?.message || "Invalid report file";
      toast.error(msg);
    } finally {
      // reset so the same file can be picked again
      e.target.value = "";
    }
  };

  return (
    <>
      <button
        data-testid="import-report"
        onClick={trigger}
        className="mono inline-flex h-8 items-center gap-1.5 rounded-md border border-hairline bg-surface px-3 text-[11px] uppercase tracking-wider text-muted2 transition-colors hover:text-ink"
      >
        <Upload size={11} strokeWidth={1.75} /> Import
      </button>
      <input
        ref={inputRef}
        data-testid="import-report-input"
        type="file"
        accept="application/json,.json"
        onChange={handleFile}
        className="hidden"
      />
    </>
  );
}
