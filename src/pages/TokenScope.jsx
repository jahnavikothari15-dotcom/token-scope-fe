import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import PromptEditor from "@/components/PromptEditor";
import AnalyzingLoader from "@/components/AnalyzingLoader";
import LocalResultsPanel from "@/components/LocalResultsPanel";
import AnalysisCost from "@/components/AnalysisCost";
import EfficiencyScore from "@/components/EfficiencyScore";
import IssuesList from "@/components/IssuesList";
import OptimizerPanel from "@/components/OptimizerPanel";
import Comparison from "@/components/Comparison";
import ComparisonAB from "@/components/ComparisonAB";
import BehaviorCheck from "@/components/BehaviorCheck";
import SavingsCalculator from "@/components/SavingsCalculator";
import HowItWorks from "@/components/HowItWorks";
import Examples from "@/components/Examples";
import Footer from "@/components/Footer";
import TargetModelPicker from "@/components/TargetModelPicker";
import SuspiciousSectionsPanel from "@/components/SuspiciousSectionsPanel";
import PricingSettings from "@/components/PricingSettings";
import DownloadReport from "@/components/DownloadReport";
import ImportReport from "@/components/ImportReport";
import {
  analyzePrompt,
  semanticAnalyzeStream,
  optimizePrompt,
  validateOptimization,
  getConfig,
} from "@/lib/api";
import {
  loadOverrides,
  saveOverrides,
  loadPrefs,
  savePrefs,
  withOverriddenCost,
} from "@/lib/pricing";
import { EXAMPLE_PROMPTS } from "@/lib/examples";
import { Sparkles, Zap, Settings } from "lucide-react";

const AB_STORAGE_KEY = "tokenscope:previousAnalysis";

function loadPrevious() {
  try {
    const raw = sessionStorage.getItem(AB_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function savePrevious(entry) {
  try {
    sessionStorage.setItem(AB_STORAGE_KEY, JSON.stringify(entry));
  } catch {
    /* ignore */
  }
}

// Simple in-session cache: prompt text → { local, semantic }
const analysisCache = new Map();

export default function TokenScope() {
  const [prompt, setPrompt] = useState("");
  const [tiers, setTiers] = useState(null);
  const [catalog, setCatalog] = useState(null);
  const [modelId, setModelId] = useState("gpt-5.4");

  // Custom pricing overrides (persisted in localStorage)
  const [overrides, setOverrides] = useState(() => loadOverrides());
  const [prefs, setPrefs] = useState(() => loadPrefs());
  const [pricingOpen, setPricingOpen] = useState(false);

  // Local analysis (deterministic)
  const [analyzing, setAnalyzing] = useState(false);
  const [local, setLocal] = useState(null);
  const [analyzedPrompt, setAnalyzedPrompt] = useState(""); // prompt text tied to `local`

  // Optional semantic (LLM)
  const [semanticRunning, setSemanticRunning] = useState(false);
  const [semantic, setSemantic] = useState(null);
  const [semanticError, setSemanticError] = useState(null);
  const [semanticStages, setSemanticStages] = useState([]);

  // Optimization
  const [mode, setMode] = useState("balanced");
  const [optimizing, setOptimizing] = useState(false);
  const [optimization, setOptimization] = useState(null);

  // Behavior validation
  const [validating, setValidating] = useState(false);
  const [validation, setValidation] = useState(null);

  // A/B compare
  const [previousRun, setPreviousRun] = useState(() => loadPrevious());
  const pendingRunRef = useRef(null);

  const analyzerRef = useRef(null);
  const resultsRef = useRef(null);
  const optimizeRef = useRef(null);

  useEffect(() => {
    getConfig()
      .then((c) => {
        setTiers(c.tiers);
        setCatalog(c.catalog);
        if (c.catalog?.default_model) setModelId(c.catalog.default_model);
      })
      .catch(() => {});
  }, []);

  const scrollToAnalyzer = () =>
    analyzerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  const scrollToResults = () =>
    setTimeout(
      () => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      60
    );
  const scrollToOptimize = () =>
    setTimeout(
      () => optimizeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      60
    );

  const resetDownstream = () => {
    setSemantic(null);
    setSemanticError(null);
    setOptimization(null);
    setValidation(null);
  };

  // -------------------- LOCAL analyze --------------------
  const runAnalyze = async () => {
    if (!prompt.trim()) {
      toast.error("Paste a prompt to begin analysis.");
      return;
    }
    // Promote previous run for A/B comparison.
    if (pendingRunRef.current) {
      setPreviousRun(pendingRunRef.current);
      savePrevious(pendingRunRef.current);
      pendingRunRef.current = null;
    }

    setAnalyzing(true);
    resetDownstream();
    try {
      // Cache hit — instant path (per prompt + model + threshold)
      const thr = prefs?.nearDupThreshold ?? 0.55;
      const cacheKey = `${modelId}::${thr}::${prompt}`;
      const cached = analysisCache.get(cacheKey);
      let data;
      if (cached?.local) {
        data = cached.local;
      } else {
        data = await analyzePrompt(prompt, modelId, thr);
        analysisCache.set(cacheKey, { ...(cached || {}), local: data });
      }
      setLocal(data);
      setAnalyzedPrompt(prompt);
      pendingRunRef.current = {
        prompt,
        score: null, // score is populated after semantic step
        tokens: data?.metrics?.estimated_tokens || 0,
        issues:
          (data?.findings?.exact_duplicate_sentences?.length || 0) +
          (data?.findings?.near_duplicate_sentences?.length || 0) +
          (data?.findings?.duplicate_paragraphs?.length || 0),
        at: Date.now(),
      };
      scrollToResults();
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        "Local analysis failed unexpectedly. Please try again.";
      toast.error(typeof msg === "string" ? msg : "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  // -------------------- SEMANTIC analyze (optional, streaming) --------------------
  const runSemantic = async () => {
    if (!analyzedPrompt || !local) return;
    setSemanticRunning(true);
    setSemanticError(null);
    setSemanticStages([]);
    try {
      const thr = prefs?.nearDupThreshold ?? 0.55;
      const cacheKey = `${modelId}::${thr}::${analyzedPrompt}`;
      const cached = analysisCache.get(cacheKey);
      if (cached?.semantic) {
        setSemantic(cached.semantic);
        setSemanticRunning(false);
        return;
      }

      let finalData = null;
      await semanticAnalyzeStream(analyzedPrompt, local, {
        model: modelId,
        tier: prefs?.stageTiers?.semantic,
        onStage: (s) =>
          setSemanticStages((prev) => {
            if (prev.some((p) => p.step === s.step)) return prev;
            return [...prev, s];
          }),
        onResult: (data) => {
          finalData = withOverriddenCost(data, catalog, overrides);
        },
        onError: (detail) => {
          throw new Error(detail || "Semantic analysis failed");
        },
      });

      if (!finalData) throw new Error("No result received from stream");
      analysisCache.set(cacheKey, { ...(cached || {}), semantic: finalData });
      setSemantic(finalData);
      if (pendingRunRef.current && pendingRunRef.current.prompt === analyzedPrompt) {
        pendingRunRef.current.score = finalData?.semantic?.efficiency_score ?? null;
        pendingRunRef.current.issues =
          (finalData?.semantic?.issues || []).length ||
          pendingRunRef.current.issues;
      }
    } catch (e) {
      const msg =
        e?.message ||
        "AI semantic analysis is currently unavailable. Your local prompt analysis is still available.";
      setSemanticError(typeof msg === "string" ? msg : "Semantic analysis failed");
      toast.error(
        "AI semantic analysis unavailable — local analysis remains available."
      );
    } finally {
      setSemanticRunning(false);
    }
  };

  // -------------------- OPTIMIZE (optional) --------------------
  const runOptimize = async () => {
    if (!analyzedPrompt || !local) return;
    setOptimizing(true);
    setOptimization(null);
    setValidation(null);
    try {
      const data = await optimizePrompt(analyzedPrompt, mode, {
        local,
        semantic: semantic?.semantic || null,
        model: modelId,
        tier: prefs?.stageTiers?.optimize,
      });
      const dataWithOverrides = withOverriddenCost(data, catalog, overrides);
      setOptimization(dataWithOverrides);
      const optimizedText = dataWithOverrides?.optimization?.optimized_prompt;
      if (optimizedText) {
        setValidating(true);
        validateOptimization(
          analyzedPrompt,
          optimizedText,
          prefs?.stageTiers?.validate,
          modelId
        )
          .then((v) => setValidation(withOverriddenCost(v, catalog, overrides)))
          .catch(() =>
            toast.error(
              "Behavior validation failed — you can still copy the optimized prompt."
            )
          )
          .finally(() => setValidating(false));
      }
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        "Optimization is currently unavailable. Please try again shortly.";
      toast.error(typeof msg === "string" ? msg : "Optimization failed");
    } finally {
      setOptimizing(false);
    }
  };

  const loadExample = (ex) => {
    setPrompt(ex.text);
    setLocal(null);
    setAnalyzedPrompt("");
    resetDownstream();
    scrollToAnalyzer();
    toast(`Loaded example · ${ex.title}`, {
      description: "Click Analyze Prompt when you're ready.",
    });
  };

  const analyzeAgain = () => {
    setOptimization(null);
    setValidation(null);
    scrollToAnalyzer();
  };

  const clearPreviousAB = () => {
    setPreviousRun(null);
    try {
      sessionStorage.removeItem(AB_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };

  // A/B: only show when we have a semantic score for both runs.
  const currentRun =
    local && analyzedPrompt
      ? {
          prompt: analyzedPrompt,
          score: semantic?.semantic?.efficiency_score ?? null,
          tokens: local?.metrics?.estimated_tokens || 0,
          issues: semantic?.semantic
            ? (semantic.semantic.issues || []).length
            : (local?.findings?.exact_duplicate_sentences?.length || 0) +
              (local?.findings?.near_duplicate_sentences?.length || 0) +
              (local?.findings?.duplicate_paragraphs?.length || 0),
        }
      : null;

  const showAB =
    !!previousRun && !!currentRun && previousRun.prompt !== currentRun.prompt;

  const handleOverridesChange = (next) => {
    setOverrides(next);
    saveOverrides(next);
    // Reapply overrides to already-computed cost estimates.
    if (semantic) setSemantic(withOverriddenCost(semantic, catalog, next));
    if (optimization) setOptimization(withOverriddenCost(optimization, catalog, next));
    if (validation) setValidation(withOverriddenCost(validation, catalog, next));
  };

  const handlePrefsChange = (next) => {
    setPrefs(next);
    savePrefs(next);
    // Threshold change invalidates local analysis for the current prompt.
    if (
      local &&
      typeof next?.nearDupThreshold === "number" &&
      Math.abs((prefs?.nearDupThreshold ?? 0.55) - next.nearDupThreshold) > 0.0001
    ) {
      setLocal(null);
      setAnalyzedPrompt("");
      resetDownstream();
    }
  };

  const handleImport = (restored) => {
    setPrompt(restored.prompt || "");
    setAnalyzedPrompt(restored.prompt || "");
    setLocal(restored.local || null);
    setSemantic(restored.semantic || null);
    setOptimization(restored.optimization || null);
    setValidation(restored.validation || null);
    if (restored.targetModelId) setModelId(restored.targetModelId);
    setTimeout(
      () => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      80
    );
  };

  return (
    <div className="min-h-screen bg-obsidian text-ink">
      <Header
        onAnalyzeClick={scrollToAnalyzer}
        onOpenPricing={() => setPricingOpen(true)}
      />
      <PricingSettings
        open={pricingOpen}
        onOpenChange={setPricingOpen}
        catalog={catalog}
        overrides={overrides}
        onChange={handleOverridesChange}
        prefs={prefs}
        onPrefsChange={handlePrefsChange}
      />
      <Hero onScrollToAnalyzer={scrollToAnalyzer} />

      {/* Analyzer */}
      <section
        id="analyzer"
        ref={analyzerRef}
        data-testid="analyzer-section"
        className="border-b border-hairline"
      >
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <span className="mono text-[10px] uppercase tracking-widest text-muted2">
                Analyzer
              </span>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                Paste your prompt.
              </h2>
              <p className="mt-3 text-base text-muted2">
                Optimize AI prompts for efficiency while preserving intent.
                Analysis starts local — no tokens spent until you choose to.
              </p>
            </div>
            {catalog && (
              <div className="flex items-center gap-2">
                <ImportReport onImport={handleImport} />
                <TargetModelPicker
                  value={modelId}
                  onChange={(id) => {
                    setModelId(id);
                    // Model change invalidates cached local analysis for the
                    // current prompt (different tokenizer/pricing).
                    setLocal(null);
                    setAnalyzedPrompt("");
                    resetDownstream();
                  }}
                  catalog={catalog}
                />
              </div>
            )}
          </div>

          <PromptEditor
            value={prompt}
            onChange={setPrompt}
            onAnalyze={runAnalyze}
            onLoadExample={() => loadExample(EXAMPLE_PROMPTS[0])}
            analyzing={analyzing}
          />
        </div>
      </section>

      {/* Results */}
      {(analyzing || local) && (
        <section
          ref={resultsRef}
          data-testid="results-section"
          className="border-b border-hairline bg-obsidian"
        >
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
            <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="mono text-[10px] uppercase tracking-widest text-muted2">
                  Analysis
                </span>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                  Prompt analysis
                </h2>
                {local?.metrics && (
                  <p className="mono mt-2 text-[13px] text-muted2">
                    {new Intl.NumberFormat("en-US").format(local.metrics.estimated_tokens)} estimated tokens · {local.metrics.paragraphs} paragraphs · {local.metrics.sentences} sentences
                  </p>
                )}
              </div>
              {local && !analyzing && (
                <div className="flex items-center gap-2">
                  <ImportReport onImport={handleImport} />
                  <DownloadReport
                    targetModel={local?.model || null}
                    prompt={analyzedPrompt}
                    local={local}
                    semantic={semantic}
                    optimization={optimization}
                    validation={validation}
                    overrides={overrides}
                    prefs={prefs}
                  />
                </div>
              )}
            </div>

            {analyzing && (
              <AnalyzingLoader
                label="Running local analysis"
                stages={[
                  "Counting tokens & words",
                  "Detecting duplicates & phrases",
                  "Scoring structural complexity",
                  "Flagging suspicious sections",
                ]}
              />
            )}

            {local && !analyzing && (
              <>
                {showAB && (
                  <div className="mb-6">
                    <ComparisonAB
                      previous={previousRun}
                      current={currentRun}
                      onClear={clearPreviousAB}
                    />
                  </div>
                )}

                <LocalResultsPanel local={local} />

                {/* Flagged sections — what the semantic step will focus on */}
                <div className="mt-6">
                  <SuspiciousSectionsPanel
                    sections={local?.suspicious_sections || []}
                    prompt={analyzedPrompt}
                  />
                </div>

                {/* Cost + Next actions */}
                <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
                  <AnalysisCost
                    local={local}
                    semantic={semantic}
                    optimize={optimization}
                    validate={validation}
                    tiers={tiers}
                  />
                  <NextActions
                    onSemantic={runSemantic}
                    semanticRunning={semanticRunning}
                    semanticDone={!!semantic}
                    onOptimize={() => {
                      scrollToOptimize();
                    }}
                  />
                </div>

                {/* Semantic analysis loader / results */}
                {semanticRunning && (
                  <div
                    data-testid="semantic-stream-loader"
                    className="mt-6 rounded-lg border border-hairline bg-surface p-6"
                  >
                    <div className="mb-4 flex items-center gap-2">
                      <span className="relative inline-flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-cyan/50 animate-pulse-dot" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan" />
                      </span>
                      <span className="mono text-[11px] uppercase tracking-widest text-muted2">
                        Streaming semantic analysis
                      </span>
                    </div>
                    <ul className="space-y-2.5">
                      {(semanticStages.length > 0
                        ? semanticStages
                        : [{ label: "Preparing targeted request", step: 0 }]
                      ).map((s, i) => (
                        <li
                          key={s.step ?? i}
                          data-testid={`semantic-stage-${s.step ?? i}`}
                          className="mono flex items-center gap-2.5 text-[13px] text-ink"
                          style={{
                            animation: "fade-up 220ms ease-out both",
                          }}
                        >
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-cyan animate-pulse-dot" />
                          {s.label}
                          <span className="mono text-[10px] uppercase tracking-widest text-muted2">
                            ...
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {semanticError && !semanticRunning && (
                  <div
                    data-testid="semantic-error"
                    className="mt-6 rounded-lg border border-orange-500/30 bg-orange-500/[0.04] p-4 text-sm text-orange-200"
                  >
                    {semanticError}
                  </div>
                )}

                {semantic?.semantic && !semanticRunning && (
                  <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
                    <EfficiencyScore
                      analysis={semantic.semantic}
                      metrics={local.metrics}
                    />
                    <IssuesList analysis={semantic.semantic} />
                  </div>
                )}

                {/* Optimizer */}
                <div ref={optimizeRef} className="mt-8">
                  <OptimizerPanel
                    mode={mode}
                    onModeChange={setMode}
                    onOptimize={runOptimize}
                    optimizing={optimizing}
                    disabled={!analyzedPrompt}
                  />
                </div>

                {optimizing && (
                  <div className="mt-6">
                    <AnalyzingLoader
                      label="Optimizing prompt"
                      stages={[
                        "Analyzing instructions",
                        "Applying local findings",
                        "Preserving critical requirements",
                        "Building optimized prompt",
                      ]}
                    />
                  </div>
                )}

                {optimization && !optimizing && (
                  <div className="mt-8 space-y-6">
                    <div>
                      <span className="mono text-[10px] uppercase tracking-widest text-muted2">
                        Optimized prompt
                      </span>
                      <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
                        Original vs Optimized
                      </h3>
                    </div>
                    <Comparison
                      original={analyzedPrompt}
                      optimized={optimization.optimization.optimized_prompt}
                      originalMetrics={optimization.original_metrics}
                      optimizedMetrics={optimization.optimized_metrics}
                      tokensSaved={optimization.tokens_saved}
                      reductionPercent={optimization.reduction_percent}
                      onAnalyzeAgain={analyzeAgain}
                    />
                    <BehaviorCheck validation={validation} validating={validating} />
                    <SavingsCalculator
                      originalTokens={optimization.original_metrics.estimated_tokens}
                      optimizedTokens={optimization.optimized_metrics.estimated_tokens}
                      defaultPricePerM={
                        catalog?.models?.[modelId]?.input_per_1m ?? undefined
                      }
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      )}

      <HowItWorks />
      <Examples onLoad={loadExample} />
      <Footer />
    </div>
  );
}

function NextActions({ onSemantic, semanticRunning, semanticDone, onOptimize }) {
  return (
    <div
      data-testid="next-actions"
      className="rounded-lg border border-hairline bg-surface p-6"
    >
      <div className="mb-4">
        <div className="mono mb-1 inline-flex items-center gap-1.5 rounded-full border border-hairline bg-obsidian px-2 py-1 text-[10px] uppercase tracking-widest text-muted2">
          Optional
        </div>
        <h3 className="text-lg font-semibold tracking-tight text-ink">
          Next steps
        </h3>
        <p className="mt-1 text-[13px] text-muted2">
          Choose when to spend AI resources. Local analysis stays available even
          if the AI provider is down.
        </p>
      </div>
      <div className="grid gap-3">
        <button
          data-testid="btn-deep-semantic"
          onClick={onSemantic}
          disabled={semanticRunning}
          className="group flex items-center justify-between gap-4 rounded-md border border-cyan/30 bg-cyan/[0.04] px-4 py-3.5 text-left transition-colors hover:bg-cyan/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-md border border-cyan/40 bg-obsidian text-cyan">
              <Sparkles size={14} strokeWidth={1.75} />
            </span>
            <div>
              <div className="text-[14px] font-medium text-ink">
                Deep semantic analysis
              </div>
              <div className="mono text-[10px] uppercase tracking-widest text-muted2">
                Targeted · cheap tier · {semanticDone ? "already run — click to re-run" : "not run yet"}
              </div>
            </div>
          </div>
          <span className="mono text-[11px] uppercase tracking-widest text-cyan">
            {semanticRunning ? "Running..." : semanticDone ? "Re-run" : "Run"}
          </span>
        </button>

        <button
          data-testid="btn-jump-optimize"
          onClick={onOptimize}
          className="group flex items-center justify-between gap-4 rounded-md border border-lime/30 bg-lime/[0.04] px-4 py-3.5 text-left transition-colors hover:bg-lime/[0.08]"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-md border border-lime/40 bg-obsidian text-lime">
              <Zap size={14} strokeWidth={2} />
            </span>
            <div>
              <div className="text-[14px] font-medium text-ink">
                Optimize prompt
              </div>
              <div className="mono text-[10px] uppercase tracking-widest text-muted2">
                Standard tier · guided by local findings
              </div>
            </div>
          </div>
          <span className="mono text-[11px] uppercase tracking-widest text-lime">
            Configure
          </span>
        </button>
      </div>
    </div>
  );
}
