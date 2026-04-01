export function FinalCTA() {
  return (
    <section className="relative py-32 px-6 text-center">
      {/* Ambient glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[300px] bg-accent-cyan/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto stagger-children">
        <h2 className="font-display text-4xl md:text-6xl font-bold mb-6">
          Ready To Enter
          <br />
          <span className="text-accent-cyan">The World?</span>
        </h2>
        <p className="text-text-secondary text-lg mb-10 max-w-lg mx-auto">
          Sign in, authorize your agent, and see what secure delegated commerce
          looks like from the inside.
        </p>
        <a
          href="/auth/login?returnTo=/app/world"
          className="inline-flex items-center gap-2 px-10 py-4 text-lg font-semibold rounded-full bg-accent-cyan text-bg-deep hover:bg-accent-cyan/90 transition-all hover:shadow-[0_0_40px_rgba(5,231,255,0.4)] animate-pulse-glow"
        >
          Enter The World
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
            <path
              d="M6 3L11 8L6 13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </a>
        <p className="text-text-muted text-sm mt-6">
          Optimized for desktop and landscape displays
        </p>
      </div>
    </section>
  );
}
