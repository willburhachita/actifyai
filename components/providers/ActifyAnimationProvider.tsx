"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

type AnimationContextType = {
  triggerAnimation: () => void;
  isPlaying: boolean;
};

const AnimationContext = createContext<AnimationContextType | undefined>(undefined);

export function useActifyAnimation() {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error("useActifyAnimation must be used within an ActifyAnimationProvider");
  }
  return context;
}

export function ActifyAnimationProvider({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<"idle" | "in" | "hold" | "out">("idle");
  const [mounted, setMounted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isPlaying = phase !== "idle";

  const triggerAnimation = useCallback(() => {
    // Cancel any existing animation cycle
    if (timerRef.current) clearTimeout(timerRef.current);

    setPhase("in");

    // Letters finish sliding in at ~0.8s + 5 * 0.12s stagger = ~1.4s
    timerRef.current = setTimeout(() => {
      setPhase("hold");

      // Hold fully visible for 0.6s, then fade out
      timerRef.current = setTimeout(() => {
        setPhase("out");

        // Fade-out takes 0.6s
        timerRef.current = setTimeout(() => {
          setPhase("idle");
        }, 650);
      }, 600);
    }, 1500);
  }, []);

  // Clean up timers
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <AnimationContext.Provider value={{ triggerAnimation, isPlaying }}>
      {children}
      {mounted && phase !== "idle" &&
        createPortal(<ActifyOverlay phase={phase} />, document.body)}
    </AnimationContext.Provider>
  );
}

function ActifyOverlay({ phase }: { phase: "in" | "hold" | "out" }) {
  const letters = [
    { char: "A", dir: -1 },
    { char: "C", dir: 1 },
    { char: "T", dir: -1 },
    { char: "I", dir: 1 },
    { char: "F", dir: -1 },
    { char: "Y", dir: 1 },
  ];

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{
        backgroundColor: "var(--color-bg-deep, #050b1a)",
        opacity: phase === "out" ? 0 : 1,
        transition: "opacity 0.6s ease-in-out",
        pointerEvents: phase === "out" ? "none" : "auto",
      }}
    >
      <div className="flex gap-3 sm:gap-6 items-center justify-center">
        {letters.map((l, i) => (
          <span
            key={l.char}
            className="font-display text-7xl sm:text-9xl font-black"
            style={{
              opacity: 0,
              transform: `translateY(${l.dir * 120}px) scale(0.6)`,
              color: "transparent",
              WebkitTextStroke: "2px rgba(255,255,255,0.8)",
              willChange: "transform, opacity",
              animation: `actifySlideIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.12}s forwards`,
            } as React.CSSProperties}
          >
            {l.char}
          </span>
        ))}
      </div>
    </div>
  );
}
