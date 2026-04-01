"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { WalletProvider } from "@/lib/web3/provider";
import { ReactNode } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ConvexProvider client={convex}>
      <WalletProvider>
        {children}
      </WalletProvider>
    </ConvexProvider>
  );
}

