export function DashboardPreview() {
  return (
    <section className="relative py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Your Command <span className="text-accent-cyan">Center</span>
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            A three-pane dashboard that gives you control, immersion, and intelligence in one view.
          </p>
        </div>

        {/* Dashboard mockup */}
        <div className="relative rounded-xl border border-line-panel bg-bg-panel/40 backdrop-blur p-1 shadow-2xl shadow-accent-cyan/5 mx-auto max-w-5xl">
          <div className="rounded-lg overflow-hidden bg-bg-deep">
            {/* Titlebar */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-bg-panel-strong border-b border-line-panel">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-danger/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-accent-amber/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-accent-lime/60" />
              </div>
              <span className="ml-3 text-xs text-text-muted font-mono">
                actify.ai/app/world
              </span>
            </div>

            {/* Three panes */}
            <div className="grid grid-cols-[200px_1fr_220px] min-h-[320px]">
              {/* Left pane */}
              <div className="border-r border-line-panel p-4 space-y-4">
                <div className="flex items-center gap-3 border-b border-line-panel/50 pb-4 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-bg-deep to-bg-panel flex items-center justify-center border border-accent-cyan/20 shadow-[0_0_15px_rgba(5,231,255,0.15)] overflow-hidden">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L3 20h3l4-8h4l4 8h3L12 2z" fill="#05e7ff" />
                      <path d="M12 11l-1.5 3h3L12 11z" fill="#0a0a0a" />
                      <line x1="12" y1="2" x2="12" y2="6" stroke="#05e7ff" strokeWidth="2" />
                      <circle cx="12" cy="18" r="1.5" fill="#05e7ff" className="animate-pulse" />
                    </svg>
                  </div>
                  <span className="text-xs font-display font-semibold tracking-wider text-text-primary">
                    ACTIFY
                  </span>
                </div>
                {["World", "Orders", "Activity", "Wallet", "Settings"].map(
                  (item, i) => (
                    <div
                      key={item}
                      className={`flex items-center gap-2 px-3 py-2 rounded text-xs ${
                        i === 0
                          ? "bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan"
                          : "text-text-muted hover:text-text-secondary"
                      }`}
                    >
                      <div
                        className={`w-3 h-3 rounded-sm ${
                          i === 0 ? "bg-accent-cyan/30" : "bg-bg-panel"
                        }`}
                      />
                      {item}
                    </div>
                  )
                )}

                <div className="mt-auto pt-8">
                  <div className="text-[10px] text-text-muted mb-1">BUDGET</div>
                  <div className="h-1.5 bg-bg-panel rounded-full overflow-hidden">
                    <div className="h-full w-3/5 bg-accent-lime/60 rounded-full" />
                  </div>
                  <div className="text-[10px] text-text-muted mt-1">$340 / $500</div>
                </div>
              </div>

              {/* Center pane */}
              <div className="relative bg-bg-deep">
                <div className="absolute inset-0 bg-grid opacity-20" />

                {/* World entities */}
                {[
                  { x: "18%", y: "28%", label: "Spawn Deck", color: "bg-accent-cyan" },
                  { x: "55%", y: "18%", label: "Verified Market", color: "bg-accent-lime" },
                  { x: "75%", y: "40%", label: "Compare Terminal", color: "bg-accent-cyan" },
                  { x: "40%", y: "65%", label: "Approval Vault", color: "bg-accent-amber" },
                  { x: "22%", y: "72%", label: "Activity Beacon", color: "bg-danger" },
                ].map((entity) => (
                  <div
                    key={entity.label}
                    className="absolute flex flex-col items-center gap-1"
                    style={{ left: entity.x, top: entity.y }}
                  >
                    <div className={`w-4 h-4 rounded-full ${entity.color}/80 border border-white/20`} />
                    <span className="text-[8px] text-text-muted whitespace-nowrap font-mono uppercase">
                      {entity.label}
                    </span>
                  </div>
                ))}

                {/* Zone label */}
                <div className="absolute bottom-3 left-4">
                  <span className="text-[10px] text-text-muted font-mono bg-bg-panel/60 px-2 py-1 rounded">
                    ZONE: COMMERCE DISTRICT
                  </span>
                </div>
              </div>

              {/* Right pane */}
              <div className="border-l border-line-panel p-4 space-y-3">
                <div className="text-[10px] text-text-muted font-mono uppercase tracking-wider">
                  Context Panel
                </div>
                <div className="bg-bg-panel/50 rounded p-3 space-y-2">
                  <div className="text-xs font-semibold text-accent-cyan">
                    Verified Market
                  </div>
                  <div className="text-[10px] text-text-secondary leading-relaxed">
                    Browse curated products from trusted vendors within your spending limits.
                  </div>
                  <div className="flex items-center gap-1 text-[9px] text-accent-lime">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-lime" />
                    Verified Vendor
                  </div>
                </div>

                <div className="bg-bg-panel/50 rounded p-3 space-y-2">
                  <div className="text-[10px] text-text-muted uppercase">
                    Agent Status
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-accent-lime animate-pulse" />
                    <span className="text-xs text-text-primary">Ready</span>
                  </div>
                </div>

                <div className="mt-auto pt-4 space-y-2">
                  <button className="w-full py-2 text-[11px] font-semibold rounded bg-accent-cyan text-bg-deep">
                    Launch Mission
                  </button>
                  <button className="w-full py-2 text-[11px] font-medium rounded border border-line-panel text-text-secondary">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Glow */}
          <div className="absolute -inset-8 bg-accent-cyan/3 blur-3xl rounded-full pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
