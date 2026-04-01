"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useWallet } from "@/lib/web3/provider";
import { useEbaySearch, EBAY_CATEGORIES, type EbayItemSummary, type EbayItemDetail, type EbayCategory } from "@/lib/ebay/useEbaySearch";

type ContextPanelProps = {
  ebayCategory?: EbayCategory;
};

export function ContextPanel({ ebayCategory = "electronics" }: ContextPanelProps) {
  const { user } = useUser();
  const auth0Id = user?.sub ?? "";
  const wallet = useWallet();
  const ebayConn = useQuery(api.ebay.getEbayConnection, auth0Id ? { auth0Id } : "skip");

  const {
    category, setCategory,
    query, setQuery,
    items, total, loading, error, isMock,
    selectedItem, itemDetail, detailLoading,
    selectItem, clearSelection,
    search,
  } = useEbaySearch(ebayCategory);

  const [purchasing, setPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  // Sync category from 3D world
  useEffect(() => {
    if (ebayCategory !== category) {
      setCategory(ebayCategory);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ebayCategory]);

  const handlePurchase = useCallback(async (item: EbayItemSummary) => {
    if (!wallet.isConnected) {
      await wallet.connectWallet();
      return;
    }
    const price = parseFloat(item.price.value);
    const tokenAmount = Math.max(1, Math.round(price));
    setPurchasing(true);
    try {
      await wallet.purchaseProduct({
        productId: `ebay_${item.itemId}`,
        productTitle: item.title,
        shopLabel: "eBay Mall",
        tokenAmount,
        productImage: item.image?.imageUrl,
        ebayItemId: item.itemId,
        ebayListingUrl: item.itemWebUrl,
      } as Parameters<typeof wallet.purchaseProduct>[0]);
      setPurchaseSuccess(true);
      setTimeout(() => setPurchaseSuccess(false), 3000);
    } catch (e) {
      console.error("Purchase failed", e);
    } finally {
      setPurchasing(false);
    }
  }, [wallet]);

  const catColor = EBAY_CATEGORIES[category].color;
  const catLabel = EBAY_CATEGORIES[category].label;

  return (
    <aside className="h-full flex flex-col border-l border-line-panel bg-bg-panel-strong overflow-hidden">
      {/* Header */}
      <div className="px-5 h-16 flex items-center justify-between border-b border-line-panel/50 shrink-0">
        <div>
          <div className="text-xs font-semibold text-text-primary flex items-center gap-2">
            <span
              className="inline-block w-2 h-2 rounded-full animate-pulse"
              style={{ background: catColor }}
            />
            eBay — {catLabel}
            {isMock && (
              <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 text-[9px] font-bold text-amber-400 uppercase tracking-wider">
                Demo
              </span>
            )}
          </div>
          <div className="text-[10px] text-text-muted mt-0.5">
            {total > 0 ? `${total.toLocaleString()} listings` : "Browse the mall"}
            {isMock && " · Add eBay credentials for live data"}
          </div>
        </div>
        {selectedItem && (
          <button
            onClick={clearSelection}
            className="rounded-lg border border-line-panel/50 bg-bg-panel/60 px-2 py-1 text-[10px] text-text-muted hover:text-text-secondary transition"
          >
            ← Back
          </button>
        )}
      </div>

      {selectedItem ? (
        // ── ITEM DETAIL VIEW ──
        <ItemDetailView
          item={selectedItem}
          detail={itemDetail}
          detailLoading={detailLoading}
          wallet={wallet}
          purchasing={purchasing}
          purchaseSuccess={purchaseSuccess}
          onPurchase={handlePurchase}
          catColor={catColor}
        />
      ) : (
        // ── SEARCH & LISTING VIEW ──
        <div className="flex-1 flex flex-col min-h-0">
          {/* Search bar */}
          <div className="px-4 pt-3 pb-2 shrink-0">
            <form
              onSubmit={(e) => { e.preventDefault(); void search(query, category); }}
              className="flex gap-2"
            >
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${catLabel}...`}
                className="flex-1 rounded-xl border border-line-panel/50 bg-bg-deep/50 px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/20"
              />
              <button
                type="submit"
                className="rounded-xl border border-line-panel/50 bg-bg-panel/60 px-3 py-2 text-xs text-text-secondary hover:text-text-primary hover:border-accent-cyan/30 transition"
              >
                ↵
              </button>
            </form>
          </div>

          {/* Category tabs */}
          <div className="px-4 pb-2 flex gap-1.5 overflow-x-auto shrink-0">
            {(Object.entries(EBAY_CATEGORIES) as [EbayCategory, typeof EBAY_CATEGORIES[EbayCategory]][]).map(([cat, meta]) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className="rounded-full px-2.5 py-1 text-[10px] font-semibold whitespace-nowrap transition-all border"
                style={{
                  borderColor: cat === category ? meta.color + "60" : "rgba(255,255,255,0.08)",
                  background: cat === category ? meta.color + "18" : "transparent",
                  color: cat === category ? meta.color : "rgba(255,255,255,0.4)",
                }}
              >
                {meta.label}
              </button>
            ))}
          </div>

          {/* eBay not connected notice */}
          {!ebayConn && (
            <div className="mx-4 mb-3 rounded-xl border border-line-panel/40 bg-bg-deep/40 px-4 py-3">
              <div className="text-xs text-text-muted leading-relaxed">
                <span className="font-semibold text-text-secondary">eBay dev account pending.</span>{" "}
                Connect eBay in Settings once approved to see live listings. Showing sandbox data.
              </div>
            </div>
          )}

          {/* Results */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-6 h-6 border-2 border-accent-cyan/20 border-t-accent-cyan rounded-full animate-spin" />
              </div>
            ) : error ? (
              <div className="rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-xs text-danger">
                {error.includes("credentials") || error.includes("token")
                  ? "eBay API credentials not yet configured. Add EBAY_APP_ID and EBAY_CERT_ID to .env.local."
                  : error}
              </div>
            ) : items.length === 0 ? (
              <div className="py-10 text-center">
                <div className="text-3xl mb-3">🏬</div>
                <div className="text-sm text-text-muted">No listings found</div>
                <div className="text-xs text-text-muted mt-1">Try a different search or category</div>
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((item) => (
                  <EbayListingCard
                    key={item.itemId}
                    item={item}
                    catColor={catColor}
                    onSelect={selectItem}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Wallet strip */}
          <WalletStrip wallet={wallet} />
        </div>
      )}
    </aside>
  );
}

// ── Listing Card ──
function EbayListingCard({
  item, catColor, onSelect
}: {
  item: EbayItemSummary;
  catColor: string;
  onSelect: (item: EbayItemSummary) => void;
}) {
  const price = parseFloat(item.price.value);
  const img = item.thumbnailImages?.[0]?.imageUrl ?? item.image?.imageUrl;

  return (
    <button
      onClick={() => onSelect(item)}
      className="w-full text-left rounded-2xl border border-line-panel/50 bg-bg-panel/60 hover:border-accent-cyan/30 hover:bg-bg-panel/80 transition-all group p-3 flex gap-3"
    >
      {img ? (
        <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-bg-deep/60">
          <img src={img} alt={item.title} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-14 h-14 rounded-xl shrink-0 bg-bg-deep/60 flex items-center justify-center">
          <span className="text-2xl">🏷️</span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-text-primary line-clamp-2 leading-snug group-hover:text-accent-cyan transition-colors">
          {item.title}
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-sm font-display" style={{ color: catColor }}>
            ${price.toFixed(2)}
          </span>
          {item.condition && (
            <span className="text-[10px] text-text-muted">{item.condition}</span>
          )}
        </div>
        {item.seller && (
          <div className="text-[10px] text-text-muted mt-0.5 truncate">
            {item.seller.username} · {item.seller.feedbackPercentage}% positive
          </div>
        )}
      </div>
    </button>
  );
}

// ── Item Detail View ──
function ItemDetailView({
  item, detail, detailLoading, wallet, purchasing, purchaseSuccess, onPurchase, catColor
}: {
  item: EbayItemSummary;
  detail: EbayItemDetail | null;
  detailLoading: boolean;
  wallet: ReturnType<typeof useWallet>;
  purchasing: boolean;
  purchaseSuccess: boolean;
  onPurchase: (item: EbayItemSummary) => Promise<void>;
  catColor: string;
}) {
  const img = detail?.image?.imageUrl ?? item.thumbnailImages?.[0]?.imageUrl ?? item.image?.imageUrl;
  const price = parseFloat(item.price.value);
  const tokenAmount = Math.max(1, Math.round(price));

  return (
    <div className="flex-1 overflow-y-auto pb-4">
      {/* Product image */}
      {img && (
        <div className="mx-4 mt-3 rounded-2xl overflow-hidden border border-line-panel/30 h-44 bg-bg-deep/40">
          <img src={img} alt={item.title} className="w-full h-full object-contain p-2" />
        </div>
      )}

      <div className="px-4 pt-4 space-y-3">
        {/* Title & price */}
        <div>
          <h2 className="text-sm font-semibold text-text-primary leading-snug">{item.title}</h2>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-display" style={{ color: catColor }}>
              ${price.toFixed(2)}
            </span>
            <span className="text-xs text-text-muted">{item.price.currency}</span>
          </div>
        </div>

        {/* Condition & buying options */}
        <div className="flex flex-wrap gap-2">
          {item.condition && (
            <span className="rounded-full border border-line-panel/50 bg-bg-deep/40 px-2.5 py-1 text-[10px] text-text-secondary">
              {item.condition}
            </span>
          )}
          {item.buyingOptions?.map((opt) => (
            <span key={opt} className="rounded-full border border-line-panel/50 bg-bg-deep/40 px-2.5 py-1 text-[10px] text-text-secondary">
              {opt.replace("_", " ")}
            </span>
          ))}
        </div>

        {/* Seller */}
        {item.seller && (
          <div className="rounded-xl border border-line-panel/40 bg-bg-deep/40 px-3 py-2.5">
            <div className="text-[10px] text-text-muted uppercase tracking-wider">Seller</div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-xs font-semibold text-text-primary">{item.seller.username}</span>
              <span className="text-[10px] text-accent-lime">{item.seller.feedbackPercentage}% ({item.seller.feedbackScore})</span>
            </div>
          </div>
        )}

        {/* Item aspects */}
        {detailLoading && (
          <div className="flex items-center gap-2 py-2">
            <div className="w-4 h-4 border border-accent-cyan/20 border-t-accent-cyan rounded-full animate-spin" />
            <span className="text-xs text-text-muted">Loading details...</span>
          </div>
        )}
        {detail?.localizedAspects && detail.localizedAspects.length > 0 && (
          <div className="rounded-xl border border-line-panel/40 bg-bg-deep/40 px-3 py-2.5">
            <div className="text-[10px] text-text-muted uppercase tracking-wider mb-2">Specs</div>
            <div className="space-y-1.5">
              {detail.localizedAspects.slice(0, 6).map((a) => (
                <div key={a.name} className="flex justify-between gap-3">
                  <span className="text-[11px] text-text-muted">{a.name}</span>
                  <span className="text-[11px] text-text-secondary text-right">{a.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shipping */}
        {detail?.shippingOptions?.[0] && (
          <div className="rounded-xl border border-line-panel/40 bg-bg-deep/40 px-3 py-2.5 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-text-muted uppercase tracking-wider">Shipping</div>
              <div className="mt-1 text-xs text-text-secondary">{detail.shippingOptions[0].shippingServiceCode}</div>
            </div>
            <div className="text-xs font-semibold text-accent-lime">
              {parseFloat(detail.shippingOptions[0].shippingCost.value) === 0
                ? "FREE"
                : `$${parseFloat(detail.shippingOptions[0].shippingCost.value).toFixed(2)}`}
            </div>
          </div>
        )}

        {/* Escrow purchase */}
        <div className="rounded-2xl border border-line-panel/50 bg-bg-deep/40 p-4 space-y-3">
          <div className="text-[10px] uppercase tracking-wider text-text-muted">Purchase via Escrow</div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-display text-accent-cyan">{tokenAmount} ACT</span>
            <span className="text-[10px] text-text-muted">tokens locked until delivery confirmed</span>
          </div>

          {purchaseSuccess ? (
            <div className="rounded-xl bg-accent-lime/10 border border-accent-lime/30 px-4 py-3 text-xs font-semibold text-accent-lime text-center">
              ✓ Tokens locked in escrow! Confirm delivery in Orders.
            </div>
          ) : !wallet.isConnected ? (
            <button
              onClick={wallet.connectWallet}
              disabled={wallet.isConnecting}
              className="w-full rounded-xl bg-gradient-to-r from-accent-amber to-[#ff8a00] py-3 text-sm font-semibold text-bg-deep transition hover:shadow-[0_0_18px_rgba(255,191,95,0.3)] disabled:opacity-50"
            >
              {wallet.isConnecting ? "Connecting..." : "🦊 Connect Wallet to Buy"}
            </button>
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => void onPurchase(item)}
                disabled={purchasing}
                className="w-full rounded-xl py-3 text-sm font-semibold text-bg-deep transition disabled:opacity-60"
                style={{ background: catColor }}
              >
                {purchasing ? "Locking in Escrow..." : `Buy for ${tokenAmount} ACT`}
              </button>
              <a
                href={item.itemWebUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center rounded-xl border border-line-panel/50 py-2.5 text-xs text-text-muted hover:text-text-secondary transition"
              >
                View on eBay →
              </a>
            </div>
          )}

          {wallet.isConnected && (
            <div className="text-[10px] text-text-muted text-center">
              Balance: <span className="text-accent-cyan">{wallet.tokenBalance} ACT</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Wallet strip at bottom ──
function WalletStrip({ wallet }: { wallet: ReturnType<typeof useWallet> }) {
  return (
    <div className="px-4 py-3 border-t border-line-panel/50 shrink-0">
      {wallet.isConnected ? (
        <div className="flex items-center justify-between">
          <div className="text-xs text-text-secondary">
            <span className="text-accent-cyan font-display">{wallet.tokenBalance} ACT</span>
            <span className="text-text-muted ml-1">· {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}</span>
          </div>
          {!wallet.hasClaimed && (
            <button
              onClick={wallet.claimFaucet}
              className="rounded-lg bg-accent-lime/10 border border-accent-lime/25 px-2.5 py-1 text-[10px] font-semibold text-accent-lime hover:bg-accent-lime/20 transition"
            >
              Claim 100 ACT
            </button>
          )}
        </div>
      ) : (
        <button
          onClick={wallet.connectWallet}
          disabled={wallet.isConnecting}
          className="w-full rounded-xl bg-gradient-to-r from-accent-amber/80 to-[#ff8a00] py-2 text-xs font-semibold text-bg-deep transition hover:shadow-[0_0_14px_rgba(255,191,95,0.25)] disabled:opacity-50"
        >
          {wallet.isConnecting ? "Connecting..." : "🦊 Connect Wallet to Purchase"}
        </button>
      )}
    </div>
  );
}
