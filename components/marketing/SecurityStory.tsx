export function SecurityStory() {
  const features = [
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" stroke="#05e7ff" strokeWidth="1.5" />
          <path d="M9 12l2 2 4-4" stroke="#05e7ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      label: "Delegated Permissions",
      desc: "The agent acts within scoped authorization — never with your full credentials.",
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="11" width="18" height="10" rx="2" stroke="#05e7ff" strokeWidth="1.5" />
          <path d="M7 11V7a5 5 0 0110 0v4" stroke="#05e7ff" strokeWidth="1.5" />
          <circle cx="12" cy="16" r="1.5" fill="#05e7ff" />
        </svg>
      ),
      label: "Step-Up Confirmation",
      desc: "High-risk actions require explicit approval before execution.",
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M4 6h16M4 10h16M4 14h10M4 18h6" stroke="#05e7ff" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
      label: "Action Logs",
      desc: "Every action, decision, and rejection is recorded with a reason and timestamp.",
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="#05e7ff" strokeWidth="1.5" />
          <path d="M15 9l-6 6M9 9l6 6" stroke="#ff647c" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
      label: "No Blind Execution",
      desc: "Nothing happens without visibility. The world shows what the agent is doing and why.",
    },
  ];

  return (
    <section className="relative py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Security Is The <span className="text-accent-cyan">Product</span>
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Delegated authorization isn&#39;t a backend footnote — it&#39;s the core
            experience. Every permission boundary is visible.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 stagger-children">
          {features.map((f, i) => (
            <div
              key={i}
              className="flex gap-4 p-5 rounded-lg bg-bg-panel/40 border border-line-panel hover:border-accent-cyan/30 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-accent-cyan/10 flex-shrink-0 flex items-center justify-center group-hover:bg-accent-cyan/15 transition-colors">
                {f.icon}
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold mb-1">
                  {f.label}
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
