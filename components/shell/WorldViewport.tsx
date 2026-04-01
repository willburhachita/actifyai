"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { useWorldExperience } from "@/lib/stores/world-experience";
import { EBAY_CATEGORIES, type EbayCategory } from "@/lib/ebay/client";

const CommerceWorld = dynamic(
  () => import("./CommerceWorld").then((mod) => mod.CommerceWorld),
  { ssr: false }
);

type WorldViewportProps = {
  children: React.ReactNode;
  onEbayCategory?: (cat: EbayCategory, label: string) => void;
};

export function WorldViewport({ children, onEbayCategory }: WorldViewportProps) {
  const pathname = usePathname();
  const isWorldRoute = pathname === "/app" || pathname === "/app/world";
  const [isPortrait, setIsPortrait] = useState(false);
  const [activeCategory, setActiveCategory] = useState<EbayCategory>("electronics");
  const { activity } = useWorldExperience();

  useEffect(() => {
    const onResize = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleCategoryChange = useCallback((cat: EbayCategory) => {
    setActiveCategory(cat);
    const label = EBAY_CATEGORIES[cat].label;
    onEbayCategory?.(cat, label);
  }, [onEbayCategory]);

  const routeLabel = useMemo(() => {
    if (pathname?.startsWith("/app/activity")) return "Zone: Activity Monitor";
    if (pathname?.startsWith("/app/settings")) return "Zone: Policy Vault";
    if (pathname?.startsWith("/app/orders")) return "Zone: Order History";
    return `Zone: eBay Mall — ${EBAY_CATEGORIES[activeCategory].label}`;
  }, [pathname, activeCategory]);

  return (
    <main className="relative h-full overflow-hidden bg-bg-deep">
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-grid opacity-15 pointer-events-none" />

      <div className="relative z-10 h-full flex flex-col">
        {/* Zone breadcrumb */}
        <div className="px-4 py-2 flex items-center gap-2">
          <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider">
            {routeLabel}
          </span>
          <div className="flex-1" />
          <span
            className="rounded-full border px-2 py-1 text-[10px] uppercase tracking-wider"
            style={{
              borderColor: `${EBAY_CATEGORIES[activeCategory].color}40`,
              color: EBAY_CATEGORIES[activeCategory].color,
              background: `${EBAY_CATEGORIES[activeCategory].color}10`,
            }}
          >
            {EBAY_CATEGORIES[activeCategory].label}
          </span>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-lime animate-pulse" />
            <span className="text-[10px] text-text-muted">
              {activity.length} event{activity.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        {/* World content area */}
        <div className="flex-1 relative">
          {isWorldRoute ? (
            <CommerceWorld onCategoryChange={handleCategoryChange} />
          ) : children}

          {isWorldRoute && isPortrait ? (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-[rgba(5,11,26,0.92)] backdrop-blur-sm p-6">
              <div className="max-w-sm rounded-3xl border border-line-panel bg-bg-panel/90 px-6 py-7 text-center shadow-[0_0_40px_rgba(5,231,255,0.12)]">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-accent-cyan/30 bg-accent-cyan/10">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <rect x="8" y="2" width="12" height="24" rx="3" stroke="#f5fbff" strokeWidth="1.4" />
                    <path d="M22 8C24.4 10.4 24.4 17.6 22 20" stroke="#05e7ff" strokeWidth="1.4" strokeLinecap="round" />
                    <path d="M6 20C3.6 17.6 3.6 10.4 6 8" stroke="#05e7ff" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                </div>
                <p className="font-display text-xl tracking-wide text-text-primary">
                  Rotate for Full Play
                </p>
                <p className="mt-2 text-sm text-text-secondary">
                  The eBay Mall is tuned for landscape so all panels stay readable.
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
