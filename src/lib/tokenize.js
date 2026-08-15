// Client-side prompt metrics. Estimated tokens use a ~4 chars/token heuristic
// which is good enough for live UI feedback. The backend uses tiktoken for
// authoritative counts returned in analysis/optimization responses.

export function computeMetrics(text) {
  const s = text || "";
  const characters = s.length;
  const words = (s.match(/\S+/g) || []).length;
  const lines = s.length === 0 ? 0 : s.split(/\n/).length;
  const estimated_tokens = estimateTokens(s);
  return { characters, words, lines, estimated_tokens };
}

export function estimateTokens(text) {
  if (!text) return 0;
  // Blend of char and word heuristics — trends within ~10-15% of tiktoken.
  const byChars = text.length / 4;
  const words = (text.match(/\S+/g) || []).length;
  const byWords = words * 1.33;
  return Math.max(1, Math.round((byChars + byWords) / 2));
}

export function formatNumber(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return "0";
  return new Intl.NumberFormat("en-US").format(Math.round(n));
}

export function formatCompact(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return "0";
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(n);
}
