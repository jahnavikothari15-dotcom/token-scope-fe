import { Shield } from "lucide-react";

export default function Footer() {
  return (
    <footer
      data-testid="site-footer"
      className="border-t border-hairline bg-obsidian"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div>
          <div className="text-[15px] font-semibold tracking-tight text-ink">
            TokenScope
          </div>
          <p className="mt-1 text-[13px] text-muted2">
            Make every token count.
          </p>
        </div>
        <div
          data-testid="privacy-statement"
          className="flex max-w-md items-start gap-3 rounded-md border border-hairline bg-surface p-3"
        >
          <Shield
            size={15}
            strokeWidth={1.75}
            className="mt-0.5 flex-none text-cyan"
          />
          <div>
            <div className="text-[13px] font-medium text-ink">
              Your prompts stay yours.
            </div>
            <p className="mt-0.5 text-[12px] text-muted2">
              Prompts are not stored. They are sent to Anthropic (Claude Sonnet
              5) for semantic analysis and discarded after the response.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
