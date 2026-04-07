"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/lib/web3/provider";

export default function WalletPage() {
  const wallet = useWallet();
  const [ethAmount, setEthAmount] = useState("0.01");
  const [isBuying, setIsBuying] = useState(false);

  const handleBuy = async () => {
    try {
      setIsBuying(true);
      await wallet.buyACTTokens(parseFloat(ethAmount), receiveAmount);
    } catch (err) {
      console.error(err);
    } finally {
      setIsBuying(false);
    }
  };

  const [ethPrice, setEthPrice] = useState<number | null>(null);

  useEffect(() => {
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd')
      .then(res => res.json())
      .then(data => setEthPrice(data.ethereum.usd))
      .catch(console.error);
  }, []);

  const receiveAmount = ethPrice ? parseFloat(ethAmount) * ethPrice : parseFloat(ethAmount) * 5000;

  return (
    <div className="h-full overflow-y-auto px-8 py-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h2 className="font-display text-3xl font-bold text-text-primary">Wallet & Exchange</h2>
          <p className="mt-2 text-sm text-text-muted">
            Manage your Actify Tokens (ACT) or exchange Sepolia ETH for more buying power.
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

            {!wallet.hasTokenContract ? (
              <div className="mt-4 rounded-xl border border-accent-cyan/30 bg-accent-cyan/5 p-4 space-y-3">
                <div className="text-xs font-semibold text-accent-cyan">Step 1: Deploy Token Contract</div>
                <div className="text-[10px] text-text-muted">Deploy or update the ACT token on Sepolia testnet.</div>
                <button
                  onClick={wallet.deployToken}
                  disabled={wallet.isDeploying || !wallet.isConnected}
                  className="w-full rounded-xl bg-accent-cyan py-3 text-sm font-semibold text-bg-deep transition disabled:opacity-50"
                >
                  {wallet.isDeploying ? "Deploying via MetaMask..." : !wallet.isConnected ? "Connect Wallet First" : "Deploy ACT Token to Sepolia"}
                </button>
              </div>
            ) : !wallet.hasEscrowContract ? (
              <div className="mt-4 rounded-xl border border-accent-cyan/30 bg-accent-cyan/5 p-4 space-y-3">
                <div className="text-xs font-semibold text-accent-cyan">Step 2: Deploy Escrow Contract</div>
                <div className="text-[10px] text-text-muted">The escrow contract locks tokens during purchases. Required for buying.</div>
                <button
                 onClick={wallet.deployEscrow}
                 disabled={wallet.isDeploying || !wallet.isConnected}
                 className="w-full rounded-xl bg-accent-cyan py-3 text-sm font-semibold text-bg-deep transition disabled:opacity-50"
                >
                 {wallet.isDeploying ? "Deploying via MetaMask..." : "Deploy Escrow Contract to Sepolia"}
                </button>
              </div>
            ) : !wallet.isConnected ? (
               <button
                 onClick={wallet.connectWallet}
                 disabled={wallet.isConnecting}
                 className="w-full rounded-xl bg-gradient-to-r from-[#ff8a00]/80 to-[#ff8a00] py-3 text-sm font-semibold text-bg-deep transition disabled:opacity-50"
               >
                 {wallet.isConnecting ? "Connecting..." : "Connect MetaMask"}
               </button>
            ) : (
              <div className="space-y-3">
                {!wallet.hasClaimed && (
                  <button
                    onClick={wallet.claimFaucet}
                    className="w-full rounded-xl bg-accent-cyan/10 border border-accent-cyan/30 py-3 text-sm font-semibold text-accent-cyan transition hover:bg-accent-cyan/20"
                  >
                    Claim 100 Free Initial ACT
                  </button>
                )}
                <div className="rounded-xl border border-accent-cyan/30 bg-accent-cyan/5 p-3 text-xs text-center text-accent-cyan font-semibold">
                  All contracts deployed and tokens claimed. Ready to trade.
                </div>
                <button
                  onClick={wallet.deployToken}
                  disabled={wallet.isDeploying}
                  className="w-full rounded-xl border border-line-panel bg-bg-deep py-2 text-xs font-semibold text-text-secondary transition hover:bg-bg-panel disabled:opacity-50 mt-2"
                >
                  {wallet.isDeploying ? "Deploying..." : "Redeploy ACT Token Contract"}
                </button>
              </div>
            )}
          </div>

          {/* Swap UI */}
          <div className="rounded-2xl border border-line-panel bg-bg-panel/60 p-6 space-y-5">
            <div className="text-[10px] uppercase tracking-wider text-text-muted">Exchange ETH for ACT</div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-text-muted font-semibold">Pay (Sepolia ETH)</label>
                <div className="mt-1 flex items-center rounded-xl border border-line-panel/60 bg-bg-deep/50 px-3 py-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={ethAmount}
                    onChange={(e) => setEthAmount(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-text-primary text-sm font-mono"
                  />
                  <span className="text-xs text-text-muted ml-2">ETH</span>
                </div>
              </div>

              <div className="flex justify-center text-accent-cyan">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M19 12l-7 7-7-7" />
                </svg>
              </div>

              <div>
                <label className="text-[10px] text-text-muted font-semibold">Receive (ACT)</label>
                <div className="mt-1 flex items-center rounded-xl border border-line-panel/60 bg-accent-cyan/5 px-3 py-2">
                  <input
                    type="text"
                    disabled
                    value={isNaN(receiveAmount) ? '0' : receiveAmount.toLocaleString()}
                    className="flex-1 bg-transparent outline-none text-accent-cyan font-bold text-lg"
                  />
                  <span className="text-xs text-accent-cyan ml-2">ACT</span>
                </div>
              </div>

              <div className="text-[10px] text-text-muted text-center pt-2">
                Rate: 1 ETH = {ethPrice ? `$${ethPrice.toLocaleString()} USD` : '...'} (1 ACT = $1 USD)
              </div>

              <button
                onClick={handleBuy}
                disabled={!wallet.isConnected || isBuying || isNaN(receiveAmount) || receiveAmount <= 0}
                className="w-full rounded-xl bg-accent-cyan py-3 text-sm font-bold text-bg-deep transition hover:shadow-[0_0_15px_rgba(5,231,255,0.4)] disabled:opacity-50 disabled:shadow-none mt-2"
              >
                {isBuying ? "Processing TX..." : "Buy ACT Tokens"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
