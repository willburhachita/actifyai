"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-bg-deep/90 backdrop-blur-xl border-b border-line-panel"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-bg-deep to-bg-panel flex items-center justify-center border border-accent-cyan/20 shadow-[0_0_15px_rgba(5,231,255,0.15)] overflow-hidden transition-all group-hover:shadow-[0_0_20px_rgba(5,231,255,0.3)] group-hover:scale-105">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 20h3l4-8h4l4 8h3L12 2z" fill="#05e7ff" />
              <path d="M12 11l-1.5 3h3L12 11z" fill="#0a0a0a" />
              <line x1="12" y1="2" x2="12" y2="6" stroke="#05e7ff" strokeWidth="2" />
              <circle cx="12" cy="18" r="1.5" fill="#05e7ff" className="animate-pulse" />
            </svg>
          </div>
          <span className="font-display text-xl font-semibold tracking-wider text-text-primary">
            ACTIFY
          </span>
        </Link>

        {/* CTA */}
        <a
          href="/auth/login?returnTo=/app/world"
          className="px-5 py-2 text-sm font-medium rounded-full bg-accent-cyan text-bg-deep hover:bg-accent-cyan/90 transition-all hover:shadow-[0_0_20px_rgba(5,231,255,0.3)]"
        >
          Enter The World
        </a>
      </div>
    </nav>
  );
}
