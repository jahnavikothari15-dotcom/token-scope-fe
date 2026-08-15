import { FileJson, FileText } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";

function buildReportObject({
  targetModel,
  prompt,
  local,
  semantic,
  optimization,
  validation,
  overrides,
  prefs,
}) {
  return {
    product: "TokenScope",
    version: 2,
    generated_at: new Date().toISOString(),
    target_model: targetModel || null,
    pricing_overrides: overrides || null,
    preferences: prefs || null,
    original_prompt: prompt || "",
    local_analysis: local
      ? {
          metrics: local.metrics,
          findings: local.findings,
          suspicious_sections: local.suspicious_sections,
          engine: local.engine,
          estimated_cost_usd: local.estimated_cost_usd,
          model: local.model,
        }
      : null,
    semantic_analysis: semantic
      ? {
          engine_tier: semantic.engine_tier,
          cost_estimate: semantic.cost_estimate,
          result: semantic.semantic,
        }
      : null,
    optimization: optimization
      ? {
          engine_tier: optimization.engine_tier,
          mode: optimization.optimization?.optimization_level,
          cost_estimate: optimization.cost_estimate,
          optimized_prompt: optimization.optimization?.optimized_prompt,
          original_metrics: optimization.original_metrics,
          optimized_metrics: optimization.optimized_metrics,
          tokens_saved: optimization.tokens_saved,
          reduction_percent: optimization.reduction_percent,
          preserved_requirements:
            optimization.optimization?.preserved_requirements,
          potential_behavior_changes:
            optimization.optimization?.potential_behavior_changes,
          changes: optimization.optimization?.changes,
          confidence: optimization.optimization?.confidence,
        }
      : null,
    behavior_validation: validation
      ? {
          engine_tier: validation.engine_tier,
          cost_estimate: validation.cost_estimate,
          requirements: validation.requirements,
          overall_assessment: validation.overall_assessment,
          potential_changes: validation.potential_changes,
          confidence: validation.confidence,
        }
      : null,
  };
}

function tsStamp() {
  return new Date()
    .toISOString()
    .replace(/[:.]/g, "-")
    .replace("T", "_")
    .slice(0, 19);
}

function triggerDownload(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function downloadJson(report) {
  const blob = new Blob([JSON.stringify(report, null, 2)], {
    type: "application/json",
  });
  triggerDownload(blob, `tokenscope-report-${tsStamp()}.json`);
}

function downloadPdf(report) {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const marginX = 40;
  let y = 50;
  const pageH = doc.internal.pageSize.getHeight();
  const pageW = doc.internal.pageSize.getWidth();
  const contentW = pageW - marginX * 2;

  const line = (h = 14) => {
    y += h;
    if (y > pageH - 40) {
      doc.addPage();
      y = 50;
    }
  };
  const wrapText = (text, size = 10, style = "normal", color = [23, 27, 36]) => {
    doc.setFont("courier", style);
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(String(text ?? ""), contentW);
    for (const ln of lines) {
      if (y > pageH - 40) {
        doc.addPage();
        y = 50;
      }
      doc.text(ln, marginX, y);
      y += size + 2;
    }
  };
  const heading = (t) => {
    line(16);
    doc.setFillColor(230, 246, 249);
    doc.rect(marginX, y - 12, contentW, 18, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(0, 100, 120);
    doc.text(t, marginX + 6, y + 1);
    line(10);
    doc.setTextColor(23, 27, 36);
  };

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(0, 120, 140);
  doc.text("TokenScope report", marginX, y);
  y += 22;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(120, 130, 140);
  doc.text(`generated ${report.generated_at}`, marginX, y);
  y += 4;

  // Target model
  heading("Target model");
  const tm = report.target_model || {};
  wrapText(
    `${tm.display || tm.id || "—"}  ·  ${tm.provider || "?"}  ·  encoding=${tm.encoding || "?"}  ·  $${tm.input_per_1m ?? "?"}/1M input`,
    10
  );

  // Local metrics
  heading("Local analysis");
  const m = report.local_analysis?.metrics || {};
  const findings = report.local_analysis?.findings || {};
  const metricsText = [
    `estimated_tokens: ${m.estimated_tokens ?? "?"}`,
    `words: ${m.words ?? "?"}    characters: ${m.characters ?? "?"}    lines: ${m.lines ?? "?"}`,
    `paragraphs: ${m.paragraphs ?? "?"}   sentences: ${m.sentences ?? "?"}   avg_sentence_length: ${m.avg_sentence_length ?? "?"}`,
    `headings: ${m.headings ?? 0}   instruction_density: ${((m.instruction_density || 0) * 100).toFixed(0)}%`,
    `structural_complexity: ${(m.structural_complexity || "low").toUpperCase()}`,
    `near_dup_threshold: ${m.near_dup_threshold ?? "default"}`,
  ].join("\n");
  wrapText(metricsText, 9);

  const findingsSummary = [
    `exact_duplicate_sentences: ${(findings.exact_duplicate_sentences || []).length}`,
    `near_duplicate_sentences:  ${(findings.near_duplicate_sentences || []).length}`,
    `repeated_phrases:          ${(findings.repeated_phrases || []).length}`,
    `duplicate_paragraphs:      ${(findings.duplicate_paragraphs || []).length}`,
    `unusually_long_sections:   ${(findings.unusually_long_sections || []).length}`,
    `repeated_keywords:         ${(findings.repeated_keywords || []).length}`,
  ].join("\n");
  line(4);
  wrapText(findingsSummary, 9);

  // Semantic
  if (report.semantic_analysis?.result) {
    heading("Semantic analysis");
    const s = report.semantic_analysis.result;
    wrapText(
      `efficiency_score: ${s.efficiency_score}/100     estimated_reduction: ~${s.estimated_reduction_percent}%`,
      10,
      "bold"
    );
    wrapText(s.summary || "");
    if ((s.issues || []).length) {
      line(4);
      wrapText("issues:", 9, "bold");
      for (const it of s.issues) {
        wrapText(`- [${(it.severity || "medium").toUpperCase()}] ${it.type || "issue"}: ${it.description || ""}`, 9);
        if (it.suggestion) wrapText(`  suggestion: ${it.suggestion}`, 9, "italic", [100, 110, 120]);
      }
    }
    if (report.semantic_analysis.cost_estimate) {
      const c = report.semantic_analysis.cost_estimate;
      line(4);
      wrapText(`cost estimate: $${c.cost_usd} (${c.tokens} tok · $${c.price_per_1m}/1M · ${c.model_id})`, 9, "italic", [100, 110, 120]);
    }
  }

  // Optimization
  if (report.optimization?.optimized_prompt) {
    heading("Optimization");
    wrapText(
      `mode: ${report.optimization.mode}     tokens_saved: ${report.optimization.tokens_saved}     reduction: ${report.optimization.reduction_percent}%`,
      10,
      "bold"
    );
    wrapText(
      `original: ${report.optimization.original_metrics?.estimated_tokens} tokens   →   optimized: ${report.optimization.optimized_metrics?.estimated_tokens} tokens`,
      9
    );
    line(6);
    wrapText("optimized prompt:", 10, "bold");
    wrapText(report.optimization.optimized_prompt, 9);
    if ((report.optimization.preserved_requirements || []).length) {
      line(4);
      wrapText("preserved requirements:", 9, "bold");
      for (const r of report.optimization.preserved_requirements) wrapText(`- ${r}`, 9);
    }
    if ((report.optimization.potential_behavior_changes || []).length) {
      line(4);
      wrapText("potential behavior changes:", 9, "bold");
      for (const r of report.optimization.potential_behavior_changes) wrapText(`- ${r}`, 9);
    }
  }

  // Behavior validation
  if (report.behavior_validation) {
    heading("Behavior preservation");
    const v = report.behavior_validation;
    wrapText(`confidence: ${v.confidence}%`, 10, "bold");
    wrapText(v.overall_assessment || "");
    if ((v.requirements || []).length) {
      line(4);
      wrapText("requirements:", 9, "bold");
      for (const r of v.requirements) wrapText(`- [${(r.status || "?").toUpperCase()}] ${r.requirement}: ${r.explanation || ""}`, 9);
    }
  }

  // Original prompt
  heading("Original prompt");
  wrapText(report.original_prompt || "", 9);

  doc.save(`tokenscope-report-${tsStamp()}.pdf`);
}

export default function DownloadReport(props) {
  const build = () => buildReportObject(props);

  return (
    <div data-testid="download-report-group" className="inline-flex items-center gap-1.5">
      <button
        data-testid="download-report"
        onClick={() => {
          downloadJson(build());
          toast.success("JSON report downloaded");
        }}
        className="mono inline-flex h-8 items-center gap-1.5 rounded-md border border-cyan/30 bg-cyan/[0.06] px-3 text-[11px] uppercase tracking-wider text-cyan transition-colors hover:bg-cyan/[0.1]"
      >
        <FileJson size={11} strokeWidth={1.75} /> JSON
      </button>
      <button
        data-testid="download-report-pdf"
        onClick={() => {
          try {
            downloadPdf(build());
            toast.success("PDF report downloaded");
          } catch (e) {
            toast.error("PDF generation failed");
          }
        }}
        className="mono inline-flex h-8 items-center gap-1.5 rounded-md border border-cyan/30 bg-cyan/[0.06] px-3 text-[11px] uppercase tracking-wider text-cyan transition-colors hover:bg-cyan/[0.1]"
      >
        <FileText size={11} strokeWidth={1.75} /> PDF
      </button>
    </div>
  );
}

export function _testables() {
  return { buildReportObject, downloadJson, downloadPdf };
}
