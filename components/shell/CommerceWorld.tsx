"use client";

import { useEffect, useRef, useState } from "react";
import { useWorldExperience } from "@/lib/stores/world-experience";
import { EBAY_CATEGORIES, type EbayCategory } from "@/lib/ebay/client";

type MallProps = {
  onCategoryChange?: (cat: EbayCategory) => void;
};

export function CommerceWorld({ onCategoryChange }: MallProps) {
  const { loading } = useWorldExperience();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [mallReady, setMallReady] = useState(false);

  // Listen for category selections from the 3D mall
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === "EBAY_CATEGORY_SELECTED") {
        const cat = e.data.category as EbayCategory;
        if (cat in EBAY_CATEGORIES) {
          onCategoryChange?.(cat);
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onCategoryChange]);

  // Send init message once iframe loads
  const handleIframeLoad = () => {
    setMallReady(true);
    iframeRef.current?.contentWindow?.postMessage({
      type: "INIT_EBAY_MALL",
      category: "electronics",
    }, "*");
  };

  if (loading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center z-10 bg-black">
        <div className="text-center space-y-3">
          <div className="mx-auto h-14 w-14 rounded-full border-2 border-accent-cyan/30 border-t-accent-cyan animate-spin" />
          <div className="font-display text-lg tracking-wide text-text-primary">
            Loading eBay Mall...
          </div>
          <div className="text-sm text-text-secondary">Preparing the commerce district</div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 w-full h-full bg-[#050b1a]">
      <iframe
        ref={iframeRef}
        src="/marketplace/index.html"
        className="w-full h-full border-none"
        title="Actify AI — eBay Mall"
        onLoad={handleIframeLoad}
        sandbox="allow-scripts allow-same-origin allow-pointer-lock"
      />
    </div>
  );
}
