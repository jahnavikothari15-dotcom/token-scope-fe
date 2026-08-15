import { useState } from "react";
import { Sparkles, Github, Menu, X, Settings } from "lucide-react";

export default function Header({ onAnalyzeClick, onOpenPricing }) {
  const [open, setOpen] = useState(false);

  const nav = [
    { id: "analyzer", label: "Analyzer" },
    { id: "how", label: "How it works" },
    { id: "examples", label: "Examples" },
  ];

  const scrollTo = (id) => {
    setOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header
      data-testid="site-header"
      className="sticky top-0 z-40 border-b border-hairline bg-obsidian/85 backdrop-blur-md"
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5 sm:px-8">
        <button
          data-testid="brand-logo"
          onClick={() => scrollTo("top")}
          className="group flex items-center gap-2.5 transition-opacity hover:opacity-90"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-md border border-edge bg-surface">
            <Sparkles size={14} strokeWidth={1.75} className="text-cyan" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-ink">
            TokenScope
          </span>
          <span className="mono ml-1 hidden text-[10px] uppercase tracking-widest text-muted2 sm:inline">
            v0.1
          </span>
        </button>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((n) => (
            <button
              key={n.id}
              data-testid={`nav-${n.id}`}
              onClick={() => scrollTo(n.id)}
              className="rounded-md px-3 py-1.5 text-[13px] text-muted2 transition-colors hover:bg-surface hover:text-ink"
            >
              {n.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            data-testid="header-pricing-settings"
            onClick={onOpenPricing}
            className="hidden h-9 w-9 items-center justify-center rounded-md border border-hairline bg-surface text-muted2 transition-colors hover:text-ink sm:flex"
            aria-label="Custom pricing"
            title="Custom pricing"
          >
            <Settings size={14} strokeWidth={1.75} />
          </button>
          <a
            data-testid="github-link"
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="hidden h-9 w-9 items-center justify-center rounded-md border border-hairline bg-surface text-muted2 transition-colors hover:text-ink sm:flex"
            aria-label="GitHub"
          >
            <Github size={15} strokeWidth={1.75} />
          </a>
          <button
            data-testid="header-cta-analyze"
            onClick={onAnalyzeClick}
            className="hidden h-9 items-center rounded-md bg-cyan px-3.5 text-[13px] font-medium text-obsidian transition-colors hover:bg-cyan/90 md:inline-flex"
          >
            Analyze a Prompt
          </button>
          <button
            data-testid="mobile-menu-toggle"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-hairline bg-surface text-ink md:hidden"
            aria-label="Menu"
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-hairline bg-obsidian md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-3">
            {nav.map((n) => (
              <button
                key={n.id}
                data-testid={`mobile-nav-${n.id}`}
                onClick={() => scrollTo(n.id)}
                className="rounded-md px-3 py-2 text-left text-sm text-muted2 hover:bg-surface hover:text-ink"
              >
                {n.label}
              </button>
            ))}
            <button
              data-testid="mobile-cta-analyze"
              onClick={() => {
                setOpen(false);
                onAnalyzeClick && onAnalyzeClick();
              }}
              className="mt-1 h-9 rounded-md bg-cyan text-[13px] font-medium text-obsidian"
            >
              Analyze a Prompt
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
