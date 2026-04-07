"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const triggerAnimation = useCallback(() => {
    setIsPlaying(true);
    // The animation takes about 2 seconds total, fade out after 2.5s
    setTimeout(() => {
      setIsPlaying(false);
    }, 2800);
  }, []);

  return (
    <AnimationContext.Provider value={{ triggerAnimation, isPlaying }}>
      {children}
      {mounted &&
        createPortal(
          <div
            className={`fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center transition-opacity duration-700 ${
              isPlaying ? "bg-bg-deep opacity-100" : "bg-bg-deep opacity-0"
            }`}
          >
            {isPlaying && <ActifyLogoOverlay />}
          </div>,
          document.body
        )}
    </AnimationContext.Provider>
  );
}

function ActifyLogoOverlay() {
  const letters = [
    { char: "A", dir: -1 }, // Top
    { char: "C", dir: 1 },  // Bottom
    { char: "T", dir: -1 },
    { char: "I", dir: 1 },
    { char: "F", dir: -1 },
    { char: "Y", dir: 1 },
  ];

  return (
    <div className="flex gap-4 sm:gap-8 items-center justify-center overflow-hidden h-[300px]">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes letterSlide {
          0% {
            transform: translateY(var(--start-y)) scale(0.5);
            opacity: 0;
            filter: blur(10px);
          }
          60% {
            transform: translateY(calc(var(--start-y) * -0.1)) scale(1.1);
            opacity: 1;
            filter: blur(0px);
            color: #05e7ff;
            text-shadow: 0 0 20px #05e7ff;
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
            color: white;
            text-shadow: 0 0 10px rgba(255,255,255,0.5);
          }
        }
        @keyframes glowFadeOut {
          0% { opacity: 1; }
          100% { opacity: 0; filter: blur(5px); transform: scale(1.1); }
        }
      `}} />
      
      {letters.map((l, i) => (
        <span
          key={i}
          className="font-display text-7xl sm:text-9xl font-black text-transparent opacity-0"
          style={{
            /* 100px up or down starting point */
            "--start-y": `${l.dir * 150}px`,
            WebkitTextStroke: "2px rgba(255,255,255,0.8)",
            animation: `
              letterSlide 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards ${i * 0.15}s,
              glowFadeOut 0.5s ease-out forwards 2.2s
            `
          } as React.CSSProperties}
        >
          {l.char}
        </span>
      ))}
    </div>
  );
}
