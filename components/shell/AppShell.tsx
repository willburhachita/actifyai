"use client";

import { useState, useCallback, useEffect } from "react";
import { LeftRail } from "./LeftRail";
import { WorldViewport } from "./WorldViewport";
import { ContextPanel } from "./ContextPanel";
import { WorldExperienceProvider } from "@/lib/stores/world-experience";
import type { EbayCategory } from "@/lib/ebay/client";
import { useActifyAnimation } from "@/components/providers/ActifyAnimationProvider";

export function AppShell({ children }: { children: React.ReactNode }) {
  // The active eBay department selected in the 3D world — shared between WorldViewport and ContextPanel
  const [ebayCategory, setEbayCategory] = useState<EbayCategory>("electronics");
  const { triggerAnimation, isPlaying } = useActifyAnimation();
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    // Trigger animation when the user initially enters the world/dashboard
    if (!hasTriggered) {
      setHasTriggered(true);
      triggerAnimation();
    }
  }, [triggerAnimation, hasTriggered]);

  const handleEbayCategory = useCallback((cat: EbayCategory) => {
    setEbayCategory(cat);
  }, []);

  return (
    <WorldExperienceProvider>
      <div className="h-screen w-screen overflow-hidden bg-bg-deep flex flex-col">
        {/* Three-pane grid: 280px | flex | 380px, completely hidden while animating to prevent unstyled flashes */}
        <div 
          className={`flex-1 grid grid-cols-[280px_minmax(0,1fr)_380px] min-h-0 transition-opacity duration-1000 ${
            (!hasTriggered || isPlaying) ? "opacity-0" : "opacity-100"
          }`}
        >
          <LeftRail />
          <WorldViewport onEbayCategory={handleEbayCategory}>
            {children}
          </WorldViewport>
          <ContextPanel ebayCategory={ebayCategory} />
        </div>
      </div>
    </WorldExperienceProvider>
  );
}
