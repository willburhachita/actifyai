"use client";

import { useEffect, useRef } from "react";

export function Hero() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (glowRef.current) {
        glowRef.current.style.setProperty("--mx", `${e.clientX}px`);
        glowRef.current.style.setProperty("--my", `${e.clientY}px`);
      }
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Ambient glow that follows cursor */}
      <div
        ref={glowRef}
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(600px circle at var(--mx, 50%) var(--my, 50%), rgba(5, 231, 255, 0.06), transparent 60%)",
        }}
      />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-grid opacity-40" />

      {/* Horizontal scan line */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-cyan/30 to-transparent"
          style={{
            animation: "scanLine 8s linear infinite",
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left: Copy */}
        <div className="stagger-children">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent-cyan/20 bg-accent-cyan/5 mb-6">
            <span className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
            <span className="text-xs font-medium text-accent-cyan tracking-wide uppercase">
              Auth0 AI Hackathon
            </span>
          </div>

          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-6">
            Authorize your
            <br />
            AI agent.
            <br />
            <span className="text-accent-cyan">Watch it act.</span>
          </h1>

          <p className="text-lg md:text-xl text-text-secondary max-w-lg mb-8 leading-relaxed">
            Actify AI turns delegated commerce into a visible world of
            permissions, missions, and auditable actions — not guesswork.
          </p>

          <div className="flex flex-wrap gap-4">
            <a
              href="/auth/login?returnTo=/app/world"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold rounded-full bg-accent-cyan text-bg-deep hover:bg-accent-cyan/90 transition-all hover:shadow-[0_0_30px_rgba(5,231,255,0.4)] animate-pulse-glow"
            >
              Enter The World
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-medium rounded-full border border-accent-cyan/30 text-accent-cyan hover:bg-accent-cyan/10 transition-all"
            >
              See How It Works
            </a>
          </div>

          {/* Trust strip */}
          <div className="mt-12 flex items-center gap-6 text-text-muted text-sm">
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="5" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.2" />
                <path d="M4 5V3a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.2" />
              </svg>
              Auth0 Secured
            </div>
            <div className="w-px h-4 bg-line-panel" />
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
                <path d="M7 4v3l2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              Real-time Observable
            </div>
            <div className="w-px h-4 bg-line-panel" />
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1l6 3.5v5L7 13l-6-3.5v-5L7 1z" stroke="currentColor" strokeWidth="1.2" />
              </svg>
              Agent Powered
            </div>
          </div>
        </div>

        {/* Right: World preview mockup */}
        <div className="relative hidden lg:block">
          <div className="relative rounded-xl border border-line-panel bg-bg-panel/60 backdrop-blur-sm p-1 shadow-2xl shadow-accent-cyan/5">
            {/* Dashboard mock */}
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

              {/* Three-pane preview */}
              <div className="grid grid-cols-[80px_1fr_120px] h-64">
                {/* Left nav mock */}
                <div className="border-r border-line-panel p-3 space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`h-6 rounded ${
                        i === 1
                          ? "bg-accent-cyan/20 border border-accent-cyan/30"
                          : "bg-bg-panel"
                      }`}
                    />
                  ))}
                </div>

                {/* Center world mock */}
                <div className="relative bg-bg-deep p-4">
                  <div className="absolute inset-4 bg-grid opacity-30 rounded" />
                  {/* Entity dots */}
                  {[
                    { x: "20%", y: "30%", color: "bg-accent-cyan", pulse: true },
                    { x: "60%", y: "20%", color: "bg-accent-lime" },
                    { x: "45%", y: "65%", color: "bg-accent-amber" },
                    { x: "75%", y: "50%", color: "bg-accent-cyan" },
                    { x: "30%", y: "75%", color: "bg-danger" },
                  ].map((dot, i) => (
                    <div
                      key={i}
                      className="absolute"
                      style={{ left: dot.x, top: dot.y }}
                    >
                      <div
                        className={`w-3 h-3 rounded-full ${dot.color}${
                          dot.pulse ? " animate-pulse" : ""
                        }`}
                      />
                      {dot.pulse && (
                        <div className="absolute inset-0 w-3 h-3 rounded-full bg-accent-cyan/30 animate-ping" />
                      )}
                    </div>
                  ))}
                  <div className="absolute bottom-3 left-4 right-4 h-6 bg-bg-panel/50 rounded flex items-center px-2">
                    <span className="text-[9px] text-text-muted font-mono">
                      SECTOR: COMMERCE DISTRICT
                    </span>
                  </div>
                </div>

                {/* Right panel mock */}
                <div className="border-l border-line-panel p-3 space-y-2">
                  <div className="h-3 w-16 bg-accent-cyan/20 rounded" />
                  <div className="h-2 w-full bg-bg-panel rounded" />
                  <div className="h-2 w-3/4 bg-bg-panel rounded" />
                  <div className="mt-3 h-2 w-12 bg-accent-lime/20 rounded" />
                  <div className="h-2 w-full bg-bg-panel rounded" />
                  <div className="h-2 w-2/3 bg-bg-panel rounded" />
                  <div className="mt-auto pt-4">
                    <div className="h-5 w-full bg-accent-cyan/15 rounded border border-accent-cyan/20" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating glow */}
          <div className="absolute -inset-4 bg-accent-cyan/5 blur-3xl rounded-full pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
