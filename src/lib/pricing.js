// Per-model pricing overrides + user preferences (stage tiers, similarity
// threshold) persisted in localStorage.

const KEY_PRICING = "tokenscope:pricing-overrides:v1";
const KEY_PREFS = "tokenscope:prefs:v1";

const DEFAULT_PREFS = {
  stageTiers: { semantic: "cheap", optimize: "standard", validate: "standard" },
  nearDupThreshold: 0.55,
};

export function loadOverrides() {
  try {
    const raw = localStorage.getItem(KEY_PRICING);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveOverrides(overrides) {
  try {
    localStorage.setItem(KEY_PRICING, JSON.stringify(overrides || {}));
  } catch {
    /* ignore */
  }
}

export function loadPrefs() {
  try {
    const raw = localStorage.getItem(KEY_PREFS);
    if (!raw) return { ...DEFAULT_PREFS };
    const parsed = JSON.parse(raw);
    return {
      stageTiers: {
        ...DEFAULT_PREFS.stageTiers,
        ...(parsed.stageTiers || {}),
      },
      nearDupThreshold:
        typeof parsed.nearDupThreshold === "number"
          ? parsed.nearDupThreshold
          : DEFAULT_PREFS.nearDupThreshold,
    };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

export function savePrefs(prefs) {
  try {
    localStorage.setItem(KEY_PREFS, JSON.stringify(prefs || DEFAULT_PREFS));
  } catch {
    /* ignore */
  }
}

export function effectivePrice(modelId, catalog, overrides) {
  const base = catalog?.models?.[modelId]?.input_per_1m;
  const ov = overrides?.[modelId];
  return typeof ov === "number" && ov >= 0 ? ov : base;
}

/**
 * Rewrite a server cost_estimate block so cost_usd is recomputed with the
 * user's override (if any). Returns a new object; leaves original untouched.
 */
export function applyOverrideToCost(costEstimate, catalog, overrides) {
  if (!costEstimate) return costEstimate;
  const modelId = costEstimate.model_id;
  if (!modelId) return costEstimate;
  const override = overrides?.[modelId];
  if (typeof override !== "number" || override < 0) return costEstimate;
  const tokens = Number(costEstimate.tokens || 0);
  return {
    ...costEstimate,
    price_per_1m: override,
    cost_usd: Number(((tokens / 1_000_000) * override).toFixed(6)),
    overridden: true,
  };
}

export function withOverriddenCost(response, catalog, overrides) {
  if (!response || !response.cost_estimate) return response;
  return {
    ...response,
    cost_estimate: applyOverrideToCost(response.cost_estimate, catalog, overrides),
  };
}
