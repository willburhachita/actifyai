"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { WalletProvider } from "@/lib/web3/provider";
import { ReactNode } from "react";
import { ActifyAnimationProvider } from "@/components/providers/ActifyAnimationProvider";
import { Toaster } from "react-hot-toast";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ConvexProvider client={convex}>
      <WalletProvider>
        <ActifyAnimationProvider>
          {children}
          <Toaster position="bottom-right" toastOptions={{ style: { background: '#1c1c1e', color: '#fff', border: '1px solid #333' } }} />
        </ActifyAnimationProvider>
      </WalletProvider>
    </ConvexProvider>
  );
}

