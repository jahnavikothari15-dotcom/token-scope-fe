import { useMemo, useEffect, useState } from "react";
import { formatCompact, formatNumber } from "@/lib/tokenize";
import { Calculator } from "lucide-react";

export default function SavingsCalculator({ originalTokens, optimizedTokens, defaultPricePerM }) {
  const [requests, setRequests] = useState(10000);
  const [pricePerM, setPricePerM] = useState(defaultPricePerM ?? 3.0);

  // Sync when user picks a different target model
  useEffect(() => {
    if (typeof defaultPricePerM === "number") {
      setPricePerM(defaultPricePerM);
    }
  }, [defaultPricePerM]);

  const stats = useMemo(() => {
    const orig = (originalTokens || 0) * requests;
    const opt = (optimizedTokens || 0) * requests;
    const savedTokens = Math.max(0, orig - opt);
    const savedUsd = (savedTokens / 1_000_000) * pricePerM;
    return {
      orig,
      opt,
      savedTokens,
      savedUsdMonth: savedUsd,
      savedUsdYear: savedUsd * 12,
    };
  }, [requests, pricePerM, originalTokens, optimizedTokens]);

  return (
    <div
      data-testid="savings-calculator"
      className="rounded-lg border border-hairline bg-surface p-6"
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="mono mb-2 inline-flex items-center gap-1.5 rounded-full border border-hairline bg-obsidian px-2 py-1 text-[10px] uppercase tracking-widest text-muted2">
            <Calculator size={11} strokeWidth={1.75} /> Optional
          </div>
          <h3 className="text-lg font-semibold tracking-tight text-ink">
            Savings calculator
          </h3>
          <p className="mt-1 max-w-lg text-sm text-muted2">
            Estimated only. Pricing assumptions are user-configurable and vary
            by provider and model.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Requests per month"
          value={requests}
          onChange={(v) => setRequests(Math.max(0, Number(v) || 0))}
          testid="input-requests"
          suffix="req/mo"
        />
        <Field
          label="Input cost per 1M tokens ($)"
          value={pricePerM}
          onChange={(v) => setPricePerM(Math.max(0, Number(v) || 0))}
          step={0.1}
          testid="input-price"
          suffix="USD"
        />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <ResultCard
          label="Original / month"
          value={formatCompact(stats.orig)}
          sub="tokens"
        />
        <ResultCard
          label="Optimized / month"
          value={formatCompact(stats.opt)}
          sub="tokens"
          accent
        />
        <ResultCard
          label="Reduction / month"
          value={formatCompact(stats.savedTokens)}
          sub="tokens"
          accent
        />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <MoneyCard
          testid="save-monthly"
          label="Estimated savings / month"
          value={stats.savedUsdMonth}
        />
        <MoneyCard
          testid="save-yearly"
          label="Estimated savings / year"
          value={stats.savedUsdYear}
        />
      </div>

      <p className="mono mt-4 text-[10px] uppercase tracking-widest text-muted2">
        Estimated · not a guarantee · configure your own pricing
      </p>
    </div>
  );
}

function Field({ label, value, onChange, step = 1, suffix, testid }) {
  return (
    <label className="block">
      <span className="mono mb-1.5 block text-[10px] uppercase tracking-widest text-muted2">
        {label}
      </span>
      <div className="flex overflow-hidden rounded-md border border-hairline bg-obsidian focus-within:border-cyan/60">
        <input
          data-testid={testid}
          type="number"
          min={0}
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mono h-10 w-full bg-transparent px-3 text-[14px] tabular-nums text-ink outline-none"
        />
        {suffix && (
          <span className="mono flex items-center border-l border-hairline bg-surface-2 px-3 text-[10px] uppercase tracking-widest text-muted2">
            {suffix}
          </span>
        )}
      </div>
    </label>
  );
}

function ResultCard({ label, value, sub, accent }) {
  return (
    <div className="rounded-md border border-hairline bg-obsidian px-4 py-3">
      <div className="mono text-[10px] uppercase tracking-widest text-muted2">
        {label}
      </div>
      <div
        className={`mono text-xl font-medium tabular-nums ${
          accent ? "text-lime" : "text-ink"
        }`}
      >
        {value}
        {sub && (
          <span className="ml-1 text-[10px] font-normal uppercase tracking-widest text-muted2">
            {sub}
          </span>
        )}
      </div>
    </div>
  );
}

function MoneyCard({ label, value, testid }) {
  const usd = value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
  return (
    <div
      data-testid={testid}
      className="rounded-md border border-lime/30 bg-lime/[0.04] px-4 py-3"
    >
      <div className="mono text-[10px] uppercase tracking-widest text-muted2">
        {label} <span className="text-lime">· estimated</span>
      </div>
      <div className="mono text-2xl font-medium tabular-nums text-lime">
        {usd}
      </div>
    </div>
  );
}
