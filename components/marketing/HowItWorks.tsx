export function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Sign in and define limits",
      desc: "Authenticate with Auth0 and set your budget, vendor preferences, and action boundaries.",
      accent: "border-accent-cyan",
    },
    {
      number: "02",
      title: "Send the agent into the world",
      desc: "Launch a mission. Your agent browses verified shops, compares options, and evaluates deals within your rules.",
      accent: "border-accent-lime",
    },
    {
      number: "03",
      title: "Approve, observe, and audit",
      desc: "Watch every decision in real time. Approve high-risk actions. Review a complete audit trail.",
      accent: "border-accent-amber",
    },
  ];

  return (
    <section id="how-it-works" className="relative py-24 px-6">
      {/* Subtle center line */}
      <div className="absolute left-1/2 top-32 bottom-32 w-px bg-gradient-to-b from-transparent via-line-panel to-transparent hidden md:block" />

      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            How It <span className="text-accent-cyan">Works</span>
          </h2>
          <p className="text-text-secondary text-lg">
            Three steps from sign-in to auditable execution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger-children">
          {steps.map((step) => (
            <div key={step.number} className="relative">
              <div
                className={`border-l-2 ${step.accent} pl-6 py-2`}
              >
                <span className="font-display text-4xl font-bold text-text-muted/30">
                  {step.number}
                </span>
                <h3 className="font-display text-xl font-semibold mt-2 mb-3">
                  {step.title}
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
