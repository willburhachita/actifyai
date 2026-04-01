"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useWallet } from "@/lib/web3/provider";
import { useWorldExperience } from "@/lib/stores/world-experience";
import { EBAY_CATEGORIES } from "@/lib/ebay/client";

const navItems = [
  {
    label: "World",
    href: "/app/world",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 1l7 4v8l-7 4-7-4V5l7-4z" stroke="currentColor" strokeWidth="1.3" />
        <circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="1" />
      </svg>
    ),
  },
  {
    label: "Missions",
    href: "/app",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="3" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.3" />
        <path d="M6 7h6M6 10h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Orders",
    href: "/app/orders",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M3 5l2-3h8l2 3" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
        <rect x="3" y="5" width="12" height="10" rx="1" stroke="currentColor" strokeWidth="1.3" />
        <path d="M7 8h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Activity",
    href: "/app/activity",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <polyline points="2,12 5,8 8,10 11,4 14,7 17,3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    ),
  },
  {
    label: "Settings",
    href: "/app/settings",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.3" />
        <path d="M9 1v2M9 15v2M1 9h2M15 9h2M3.5 3.5l1.4 1.4M13.1 13.1l1.4 1.4M14.5 3.5l-1.4 1.4M4.9 13.1l-1.4 1.4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function LeftRail() {
  const pathname = usePathname();
  const { user } = useUser();
  const auth0Id = user?.sub ?? "";
  const wallet = useWallet();

  const {
    activeMission,
    activity,
    launchBestDealMission,
    policy,
    selectedShop,
    shops,
    source,
  } = useWorldExperience();

  const myOrders = useQuery(api.purchaseOrders.getMyOrders, auth0Id ? { auth0Id } : "skip");
  const escrowCount = (myOrders ?? []).filter(o => o.status === "escrowed").length;
  const ebayConn = useQuery(api.ebay.getEbayConnection, auth0Id ? { auth0Id } : "skip");

  return (
    <aside className="h-full bg-bg-panel-strong border-r border-line-panel flex flex-col">
      {/* Logo */}
      <div className="px-5 h-16 flex items-center gap-2 border-b border-line-panel/50">
        <div className="w-7 h-7 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M8 1L14 5V11L8 15L2 11V5L8 1Z" stroke="#05e7ff" strokeWidth="1.5" fill="none" />
            <circle cx="8" cy="8" r="2" fill="#05e7ff" />
          </svg>
        </div>
        <span className="font-display text-sm font-semibold tracking-wider text-text-primary">
          ACTIFY<span className="text-accent-cyan">.AI</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== "/app" && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20"
                  : "text-text-muted hover:text-text-secondary hover:bg-bg-panel/60"
              }`}
            >
              <span className={isActive ? "text-accent-cyan" : "text-text-muted"}>
                {item.icon}
              </span>
              {item.label}
              {item.label === "Orders" && escrowCount > 0 ? (
                <span className="ml-auto rounded-full bg-accent-amber/20 border border-accent-amber/30 px-1.5 py-0.5 text-[10px] font-semibold text-accent-amber">
                  {escrowCount}
                </span>
              ) : null}
            </Link>
          );
        })}

        {/* eBay Connection */}
        <div className="mt-5 rounded-2xl border border-line-panel/60 bg-bg-panel/60 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-[0.24em] text-text-muted">eBay Mall</span>
            <span className={`w-1.5 h-1.5 rounded-full ${ebayConn ? 'bg-accent-lime' : 'bg-text-muted'}`} />
          </div>
          {ebayConn ? (
            <div className="space-y-1">
              <div className="text-xs font-semibold text-accent-lime">Connected ✓</div>
              {ebayConn.ebayUsername && (
                <div className="text-[10px] text-text-muted font-mono">{ebayConn.ebayUsername}</div>
              )}
              <div className="text-[10px] text-text-secondary leading-relaxed">
                Browse all {Object.keys(EBAY_CATEGORIES).length} departments live
              </div>
            </div>
          ) : (
            <>
              <p className="text-xs text-text-secondary leading-relaxed mb-3">
                Connect your eBay account to browse real listings in the mall.
              </p>
              <a
                href="/api/ebay/auth"
                className="block w-full text-center rounded-xl bg-gradient-to-r from-[#e53238] to-[#f5af02] px-3 py-2 text-xs font-semibold text-white transition hover:shadow-[0_0_18px_rgba(229,50,56,0.3)]"
              >
                Connect eBay
              </a>
              <p className="mt-2 text-[10px] text-text-muted text-center">eBay dev account pending approval</p>
            </>
          )}
        </div>
      </nav>

      {/* Wallet Section */}
      <div className="px-3 mb-2">
        {wallet.isConnected ? (
          <div className="rounded-xl bg-bg-panel/60 border border-line-panel/50 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-text-muted uppercase tracking-wider font-medium">Wallet</span>
              <span className="text-[10px] text-text-secondary font-mono">
                {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-display text-accent-cyan">{wallet.tokenBalance}</span>
              <span className="text-[10px] text-text-muted">ACT tokens</span>
            </div>
            <div className="h-1.5 bg-bg-deep rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent-cyan/80 to-accent-cyan rounded-full transition-all"
                style={{ width: `${Math.min((wallet.tokenBalance / 100) * 100, 100)}%` }}
              />
            </div>
            {!wallet.hasClaimed && (
              <button
                onClick={wallet.claimFaucet}
                className="w-full rounded-lg bg-accent-lime/15 border border-accent-lime/25 px-2 py-1.5 text-[10px] font-semibold text-accent-lime transition hover:bg-accent-lime/25"
              >
                Claim On-chain Tokens
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={wallet.connectWallet}
            disabled={wallet.isConnecting}
            className="w-full rounded-xl bg-gradient-to-r from-accent-amber to-[#ff8a00] px-3 py-2.5 text-xs font-semibold text-bg-deep transition hover:shadow-[0_0_18px_rgba(255,191,95,0.3)] disabled:opacity-50"
          >
            {wallet.isConnecting ? "Connecting..." : "🦊 Connect MetaMask"}
          </button>
        )}
      </div>

      {/* Agent status */}
      <div className="px-4 py-3 mx-3 mb-3 rounded-lg bg-bg-panel/60 border border-line-panel/50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent-lime animate-pulse" />
          <span className="text-xs text-text-secondary">
            {activeMission
              ? `Agent ${activeMission.status.replace("_", " ")}`
              : ebayConn ? "eBay Mall live" : "eBay Mall ready"}
          </span>
        </div>
        <div className="mt-1 text-[10px] text-text-muted">
          {activity.length} event{activity.length === 1 ? "" : "s"} this session
        </div>
      </div>

      {/* User & logout */}
      <div className="px-3 py-3 border-t border-line-panel/50">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-accent-cyan/15 border border-accent-cyan/20 flex items-center justify-center">
            <span className="text-xs font-semibold text-accent-cyan">
              {user?.name?.[0]?.toUpperCase() ?? "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-text-primary font-medium truncate">
              {user?.name ?? "User"}
            </div>
            <div className="text-[10px] text-text-muted truncate">
              {user?.email ?? "user@actify.ai"}
            </div>
          </div>
          <a
            href="/auth/logout"
            className="text-text-muted hover:text-danger transition-colors"
            title="Sign out"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>
    </aside>
  );
}
