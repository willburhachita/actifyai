"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/lib/web3/provider";

export default function WalletPage() {
  const wallet = useWallet();
  const [ethPrice, setEthPrice] = useState<number | null>(null);

  useEffect(() => {
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd')
      .then(res => res.json())
      .then(data => setEthPrice(data.ethereum?.usd ?? null))
      .catch(() => setEthPrice(null));
  }, []);

  return (
    <div className="h-full overflow-y-auto px-8 py-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h2 className="font-display text-3xl font-bold text-text-primary">Wallet & Tokens</h2>
          <p className="mt-2 text-sm text-text-muted">
            Manage your Actify Tokens (ACT) and MetaMask connection for purchases.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Balance Tracker */}
          <div className="rounded-2xl border border-line-panel bg-bg-panel/60 p-6 space-y-4">
            <div className="text-[10px] uppercase tracking-wider text-text-muted">Current Balance</div>
            <div className="text-4xl font-display text-accent-cyan">
              {wallet.isConnected ? `${wallet.tokenBalance.toLocaleString()} ACT` : '---'}
            </div>
            
            <div className="text-xs text-text-secondary leading-relaxed">
              ACT is the native escrow token used for purchases in the eBay Mall. Tokens are locked safely until delivery is confirmed.
            </div>

            {wallet.isConnected ? (
              <div className="space-y-3">
                <div className="rounded-xl border border-line-panel/50 bg-bg-deep/40 p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-text-muted uppercase tracking-wider">Address</span>
                    <span className="text-[11px] text-text-secondary font-mono">
                      {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-text-muted uppercase tracking-wider">Network</span>
                    <span className={`text-[11px] font-semibold ${wallet.isCorrectChain ? 'text-accent-lime' : 'text-danger'}`}>
                      {wallet.isCorrectChain ? 'Sepolia ✓' : 'Wrong Network'}
                    </span>
                  </div>
                </div>

                {!wallet.isCorrectChain && (
                  <button
                    onClick={wallet.switchToSepolia}
                    className="w-full rounded-xl bg-danger/10 border border-danger/30 py-3 text-sm font-semibold text-danger transition hover:bg-danger/20"
                  >
                    Switch to Sepolia Testnet
                  </button>
                )}

                {!wallet.hasClaimed && (
                  <button
                    onClick={wallet.claimFaucet}
                    className="w-full rounded-xl bg-accent-cyan/10 border border-accent-cyan/30 py-3 text-sm font-semibold text-accent-cyan transition hover:bg-accent-cyan/20"
                  >
                    Claim On-chain ACT Tokens
                  </button>
                )}

                {wallet.hasClaimed && (
                  <div className="rounded-xl border border-accent-cyan/30 bg-accent-cyan/5 p-3 text-xs text-center text-accent-cyan font-semibold">
                    Faucet claimed ✓ — Ready to trade
                  </div>
                )}

                {/* Token balance bar */}
                <div className="space-y-1">
                  <div className="text-[10px] text-text-muted">Token balance</div>
                  <div className="h-2 bg-bg-deep rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-accent-cyan/80 to-accent-cyan rounded-full transition-all"
                      style={{ width: `${Math.min((wallet.tokenBalance / 500) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-text-muted">
                    <span>0 ACT</span>
                    <span>500 ACT</span>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={wallet.connectWallet}
                disabled={wallet.isConnecting}
                className="w-full rounded-xl bg-gradient-to-r from-accent-amber to-[#ff8a00] py-3 text-sm font-semibold text-bg-deep transition hover:shadow-[0_0_18px_rgba(255,191,95,0.3)] disabled:opacity-50"
              >
                {wallet.isConnecting ? "Connecting..." : "Connect MetaMask"}
              </button>
            )}
          </div>

          {/* Info Panel */}
          <div className="rounded-2xl border border-line-panel bg-bg-panel/60 p-6 space-y-5">
            <div className="text-[10px] uppercase tracking-wider text-text-muted">Token Info</div>
            
            <div className="space-y-4">
              <div className="rounded-xl border border-line-panel/40 bg-bg-deep/40 p-4 space-y-3">
                <div className="text-xs font-semibold text-text-primary">How ACT Escrow Works</div>
                <div className="text-[11px] text-text-secondary leading-relaxed space-y-2">
                  <div className="flex gap-2">
                    <span className="text-accent-cyan font-bold">1.</span>
                    <span>Connect your MetaMask wallet and claim initial ACT tokens</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-accent-cyan font-bold">2.</span>
                    <span>Browse products in the eBay Mall or right panel</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-accent-cyan font-bold">3.</span>
                    <span>ACT tokens are locked in the smart contract escrow when you buy</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-accent-cyan font-bold">4.</span>
                    <span>Tokens are released to the seller after delivery confirmation</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-line-panel/40 bg-bg-deep/40 p-4 space-y-2">
                <div className="text-xs font-semibold text-text-primary">Network Details</div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-text-muted">Network</span>
                    <span className="text-text-secondary">Sepolia Testnet</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-text-muted">Token</span>
                    <span className="text-text-secondary">ACT (ERC-20)</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-text-muted">Escrow</span>
                    <span className="text-text-secondary">ActifyEscrow Contract</span>
                  </div>
                  {ethPrice && (
                    <div className="flex justify-between text-[11px]">
                      <span className="text-text-muted">ETH Price</span>
                      <span className="text-accent-cyan">${ethPrice.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {wallet.error && (
                <div className="rounded-xl border border-danger/30 bg-danger/5 p-3 text-xs text-danger">
                  {wallet.error}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
