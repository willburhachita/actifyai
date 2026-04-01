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
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-accent-cyan/10 border border-accent-cyan/40 flex items-center justify-center group-hover:bg-accent-cyan/20 transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 1L14 5V11L8 15L2 11V5L8 1Z"
                stroke="#05e7ff"
                strokeWidth="1.5"
                fill="none"
              />
              <circle cx="8" cy="8" r="2" fill="#05e7ff" />
            </svg>
          </div>
          <span className="font-display text-xl font-semibold tracking-wider text-text-primary">
            ACTIFY<span className="text-accent-cyan">.AI</span>
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
