"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useWallet } from "@/lib/web3/provider";
import { useWorldExperience } from "@/lib/stores/world-experience";

export default function SettingsPage() {
  const { user } = useUser();
  const auth0Id = user?.sub ?? "";
  const wallet = useWallet();
  const { policy, shops } = useWorldExperience();
  const dbWallet = useQuery(api.wallets.getWalletByAuth0Id, auth0Id ? { auth0Id } : "skip");
  
  const ebayConn = useQuery(api.ebay.getEbayConnection, auth0Id ? { auth0Id } : "skip");
  const disconnectEbay = useMutation(api.ebay.disconnectEbay);

  const handleConnectEbay = () => {
    window.location.href = "/api/ebay/auth";
  };

  return (
    <div className="h-full overflow-y-auto px-8 py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h2 className="font-display text-3xl font-bold text-text-primary">Settings</h2>
          <p className="mt-2 text-sm text-text-muted">
            Wallet configuration, policy guardrails, and catalog info.
          </p>
        </div>

        {/* Wallet Settings */}
        <div className="rounded-2xl border border-line-panel bg-bg-panel/60 p-5 space-y-4">
          <div className="text-[10px] uppercase tracking-wider text-text-muted">Wallet</div>
          {wallet.isConnected && dbWallet ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <MetricCard label="Balance" value={`${dbWallet.tokenBalance} ACT`} />
                <MetricCard label="Chain" value={wallet.isCorrectChain ? "Sepolia" : "Wrong"} />
                <MetricCard label="Faucet" value={dbWallet.hasClaimed ? "Claimed" : "Available"} />
              </div>
              <div className="rounded-xl border border-line-panel/50 bg-bg-deep/40 px-4 py-3">
                <div className="text-[10px] text-text-muted uppercase tracking-wider">Address</div>
                <div className="mt-1 text-sm text-text-secondary font-mono break-all">
                  {wallet.address}
                </div>
              </div>
              <div className="rounded-xl border border-line-panel/50 bg-bg-deep/40 px-4 py-3">
                <div className="text-[10px] text-text-muted uppercase tracking-wider">Connected</div>
                <div className="mt-1 text-sm text-text-secondary">
                  {new Date(dbWallet.connectedAt).toLocaleString()}
                </div>
              </div>
              {!dbWallet.hasClaimed && (
                <button
                  onClick={wallet.claimFaucet}
                  className="w-full rounded-xl bg-accent-lime/15 border border-accent-lime/30 px-4 py-3 text-sm font-semibold text-accent-lime transition hover:bg-accent-lime/25"
                >
                  Claim 100 On-chain ACT Tokens
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-text-secondary">
                No wallet connected. Connect MetaMask to enable purchases.
              </p>
              <button
                onClick={wallet.connectWallet}
                disabled={wallet.isConnecting}
                className="rounded-xl bg-gradient-to-r from-accent-amber to-[#ff8a00] px-4 py-3 text-sm font-semibold text-bg-deep transition hover:shadow-[0_0_18px_rgba(255,191,95,0.3)] disabled:opacity-50"
              >
                {wallet.isConnecting ? "Connecting..." : "🦊 Connect MetaMask"}
              </button>
            </div>
          )}
        </div>

        {/* eBay Connection */}
        <div className="rounded-2xl border border-line-panel bg-bg-panel/60 p-5 space-y-4">
          <div className="text-[10px] uppercase tracking-wider text-text-muted">Marketplace Integrations</div>
          <p className="text-sm text-text-secondary">
            Connect your eBay account to enable the AI Agent to buy/sell on your behalf in the 3D Mall.
          </p>
          
          {ebayConn ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <MetricCard label="eBay Username" value={ebayConn.ebayUsername || "Connected"} />
                <MetricCard 
                  label="Status" 
                  value={ebayConn.isExpired ? "Token Expired" : "Active"} 
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => disconnectEbay({ auth0Id })}
                  className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm font-semibold text-rose-500 transition hover:bg-rose-500/20"
                >
                  Disconnect
                </button>
                {ebayConn.isExpired && (
                  <button
                    onClick={handleConnectEbay}
                    className="rounded-xl border border-accent-cyan/30 bg-accent-cyan/10 px-4 py-2.5 text-sm font-semibold text-accent-cyan transition hover:bg-accent-cyan/20"
                  >
                    Refresh Token
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={handleConnectEbay}
                className="rounded-xl bg-gradient-to-r from-[#0064d2] to-[#004f9e] px-4 py-3 text-sm font-semibold text-white transition hover:shadow-[0_0_18px_rgba(0,100,210,0.3)]"
              >
                Connect eBay Account
              </button>
            </div>
          )}
        </div>

        {/* Policy */}
        <div className="rounded-2xl border border-line-panel bg-bg-panel/60 p-5 space-y-4">
          <div className="text-[10px] uppercase tracking-wider text-text-muted">Mission Policy</div>
          <div className="grid grid-cols-3 gap-4">
            <MetricCard label="Budget" value={`$${policy.budget}`} />
            <MetricCard label="Approval Threshold" value={`$${policy.approvalThreshold}`} />
            <MetricCard label="Vendor Mode" value={policy.verifiedOnly ? "Verified" : "Open"} />
          </div>
        </div>

        {/* Catalog */}
        <div className="rounded-2xl border border-line-panel bg-bg-panel/60 px-5 py-4">
          <div className="text-[10px] uppercase tracking-wider text-text-muted">Catalog Source</div>
          <p className="mt-2 text-sm text-text-secondary">
            {shops.length} shops loaded from the Convex database (seeded from real brand data).
          </p>
        </div>

        {/* Contract Addresses */}
        <div className="rounded-2xl border border-line-panel bg-bg-panel/60 p-5 space-y-3">
          <div className="text-[10px] uppercase tracking-wider text-text-muted">Smart Contracts</div>
          <div className="space-y-2">
            <ContractRow label="Token (ACT)" address={process.env.NEXT_PUBLIC_TOKEN_ADDRESS} />
            <ContractRow label="Escrow" address={process.env.NEXT_PUBLIC_ESCROW_ADDRESS} />
            <ContractRow label="Network" address="Sepolia Testnet (Chain ID: 11155111)" isText />
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line-panel bg-bg-panel/60 px-4 py-4">
      <div className="text-xl font-display text-accent-cyan">{value}</div>
      <div className="mt-2 text-[10px] uppercase tracking-wider text-text-muted">{label}</div>
    </div>
  );
}

function ContractRow({ label, address, isText }: { label: string; address?: string; isText?: boolean }) {
  return (
    <div className="rounded-xl border border-line-panel/50 bg-bg-deep/40 px-4 py-2.5">
      <div className="text-[10px] text-text-muted uppercase tracking-wider">{label}</div>
      <div className="mt-1 text-xs text-text-secondary font-mono break-all">
        {address || (isText ? address : "Not deployed yet")}
      </div>
    </div>
  );
}
