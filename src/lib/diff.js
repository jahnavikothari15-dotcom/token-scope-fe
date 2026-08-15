// Lightweight word-level diff (LCS-based) for the Original vs Optimized view.

function tokenizeForDiff(text) {
  // Split into words + whitespace/punctuation as separate tokens so
  // reconstruction is faithful.
  return (text || "").split(/(\s+)/).filter((t) => t !== "");
}

export function diffWords(a, b) {
  const A = tokenizeForDiff(a);
  const B = tokenizeForDiff(b);
  const n = A.length;
  const m = B.length;

  // Build LCS table (bounded — TokenScope caps prompts server-side).
  const dp = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (A[i - 1] === B[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
      else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }

  const ops = [];
  let i = n;
  let j = m;
  while (i > 0 && j > 0) {
    if (A[i - 1] === B[j - 1]) {
      ops.push({ type: "equal", value: A[i - 1] });
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      ops.push({ type: "removed", value: A[i - 1] });
      i--;
    } else {
      ops.push({ type: "added", value: B[j - 1] });
      j--;
    }
  }
  while (i > 0) {
    ops.push({ type: "removed", value: A[i - 1] });
    i--;
  }
  while (j > 0) {
    ops.push({ type: "added", value: B[j - 1] });
    j--;
  }
  ops.reverse();

  // Merge consecutive same-type ops for compact rendering.
  const merged = [];
  for (const op of ops) {
    const last = merged[merged.length - 1];
    if (last && last.type === op.type) last.value += op.value;
    else merged.push({ ...op });
  }
  return merged;
}
