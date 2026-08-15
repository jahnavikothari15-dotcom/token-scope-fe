import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

const http = axios.create({
  baseURL: API,
  timeout: 120000,
  headers: { "Content-Type": "application/json" },
});

export async function getConfig() {
  const { data } = await http.get("/config");
  return data;
}

export async function getPricing() {
  const { data } = await http.get("/pricing");
  return data;
}

// Local — no AI. Fast and always available.
export async function analyzePrompt(prompt, model, near_dup_threshold) {
  const { data } = await http.post("/analyze", {
    prompt,
    model,
    near_dup_threshold,
  });
  return data;
}

// Optional deep semantic pass. `local` should be the payload from analyzePrompt.
export async function semanticAnalyze(prompt, local, tier, model) {
  const { data } = await http.post("/semantic-analyze", {
    prompt,
    local,
    tier,
    model,
  });
  return data;
}

export async function optimizePrompt(prompt, mode = "balanced", extras = {}) {
  const { data } = await http.post("/optimize", {
    prompt,
    mode,
    local: extras.local,
    semantic: extras.semantic,
    tier: extras.tier,
    model: extras.model,
  });
  return data;
}

export async function validateOptimization(original, optimized, tier, model) {
  const { data } = await http.post("/validate", {
    original,
    optimized,
    tier,
    model,
  });
  return data;
}

export async function semanticAnalyzeStream(
  prompt,
  local,
  { model, tier, onStage, onResult, onError } = {}
) {
  const resp = await fetch(`${API}/semantic-analyze/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
    body: JSON.stringify({ prompt, local, tier, model }),
  });
  if (!resp.ok || !resp.body) {
    const text = await resp.text().catch(() => "");
    let detail = "Streaming failed";
    try {
      detail = JSON.parse(text).detail || detail;
    } catch {
      /* ignore */
    }
    onError && onError(detail);
    return;
  }
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx;
    while ((idx = buffer.indexOf("\n\n")) !== -1) {
      const chunk = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      const eventMatch = chunk.match(/^event:\s*(.+)$/m);
      const dataMatch = chunk.match(/^data:\s*(.+)$/m);
      if (!eventMatch || !dataMatch) continue;
      const evt = eventMatch[1].trim();
      let data = {};
      try {
        data = JSON.parse(dataMatch[1]);
      } catch {
        continue;
      }
      if (evt === "stage") onStage && onStage(data);
      else if (evt === "result") onResult && onResult(data);
      else if (evt === "error") {
        onError && onError(data.detail || "error");
        return;
      } else if (evt === "done") return;
    }
  }
}

