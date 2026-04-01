export function WhySection() {
  return (
    <section className="relative py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16 stagger-children">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            The Problem With <span className="text-accent-cyan">Invisible AI</span>
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Most AI agents operate off-screen. You type a command, something
            happens, and you hope it was right. That&#39;s not trust — it&#39;s a leap of faith.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-children">
          {[
            {
              icon: (
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <circle cx="14" cy="14" r="12" stroke="#05e7ff" strokeWidth="1.5" strokeDasharray="4 3" />
                  <path d="M10 14l3 3 5-6" stroke="#05e7ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ),
              title: "Permissioned By Design",
              desc: "Every agent action is bounded by rules you define. No blind execution, no unlimited access.",
            },
            {
              icon: (
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <rect x="3" y="6" width="22" height="16" rx="3" stroke="#05e7ff" strokeWidth="1.5" />
                  <circle cx="14" cy="14" r="4" stroke="#05e7ff" strokeWidth="1.5" />
                  <path d="M14 10v4l2.5 2" stroke="#05e7ff" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              ),
              title: "Observable In Real Time",
              desc: "Watch every decision, every comparison, every action as it happens — in a world you can explore.",
            },
            {
              icon: (
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M14 3l10 6v10l-10 6L4 19V9l10-6z" stroke="#05e7ff" strokeWidth="1.5" />
                  <circle cx="14" cy="14" r="3" fill="#05e7ff" fillOpacity="0.3" stroke="#05e7ff" strokeWidth="1" />
                </svg>
              ),
              title: "Built For Agent Action",
              desc: "Purpose-built for AI agents that browse, compare, and act — not chatbots that suggest.",
            },
          ].map((card, i) => (
            <div
              key={i}
              className="group relative bg-bg-panel/60 border border-line-panel rounded-lg p-6 hover:border-accent-cyan/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(5,231,255,0.08)]"
            >
              <div className="w-12 h-12 rounded-lg bg-accent-cyan/10 flex items-center justify-center mb-4 group-hover:bg-accent-cyan/15 transition-colors">
                {card.icon}
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">
                {card.title}
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
