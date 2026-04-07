"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useWallet } from "@/lib/web3/provider";
import { useEbaySearch, EBAY_CATEGORIES, type EbayItemSummary, type EbayItemDetail, type EbayCategory } from "@/lib/ebay/useEbaySearch";
import { FREE_STARTER_ACT } from "@/lib/web3/contracts";
import toast from "react-hot-toast";
import { useActifyAnimation } from "@/components/providers/ActifyAnimationProvider";

type ContextPanelProps = {
  ebayCategory?: EbayCategory;
};

type RecommendedItem = {
  _id: string;
  ebayItemId: string;
  category: string;
  score: number;
  reason: string;
  batchId: string;
  createdAt: number;
  title: string;
  price: number;
  currency: string;
  imageUrl?: string;
  condition?: string;
  itemWebUrl: string;
  sellerUsername?: string;
  sellerFeedbackScore?: number;
  sellerFeedbackPct?: string;
  buyingOptions?: string[];
};

export function ContextPanel({ ebayCategory = "electronics" }: ContextPanelProps) {
  const { user } = useUser();
  const auth0Id = user?.sub ?? "";
  const wallet = useWallet();
  const ebayConn = useQuery(api.ebay.getEbayConnection, auth0Id ? { auth0Id } : "skip");

  const [activeTab, setActiveTab] = useState<"browse" | "search">("browse");

  const {
    category, setCategory,
    query, setQuery,
    items, total, loading, error, isMock,
    selectedItem, itemDetail, detailLoading,
    selectItem, clearSelection,
    search,
  } = useEbaySearch(ebayCategory);

  // Auto-load items for browse tab
  useEffect(() => {
    if (activeTab === "browse" && items.length === 0 && !loading) {
      void search("", category);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, category]);

  const userPrefs = useQuery(api.users.getPreference, auth0Id ? { auth0Id } : "skip");

  const [purchasing, setPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const { triggerAnimation } = useActifyAnimation();

  // Sync category from 3D world
  useEffect(() => {
    if (ebayCategory !== category) {
      setCategory(ebayCategory);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ebayCategory]);

  const handleTrackView = useCallback(async (_ebayItemId: string, _cat: string) => {
    // Placeholder — tracking can be wired to an analytics endpoint later
  }, []);

  const handleSelectFromBrowse = useCallback(async (item: EbayItemSummary) => {
    await handleTrackView(item.itemId, category);
    selectItem(item);
  }, [handleTrackView, selectItem, category]);

  const createOrderMut = useMutation(api.purchaseOrders.createOrder);

  const handlePurchase = useCallback(async (item: EbayItemSummary) => {
    if (!wallet.isConnected) {
      await wallet.connectWallet();
      return;
    }
    if (!auth0Id || !user?.email) {
      toast.error("Please log in to purchase.");
      return;
    }

    const price = parseFloat(item.price.value);
    const tokenAmount = Math.max(1, Math.round(price));
    setPurchasing(true);
    try {
      // Step 1: Lock tokens in Ethereum Escrow Contract (on-chain)
      const purchaseResult = await wallet.purchaseProduct({
        orderId: `ebay_${item.itemId}_${Date.now().toString().slice(-6)}`,
        productTitle: item.title,
        shopLabel: "eBay Mall",
        tokenAmount,
        productImage: item.image?.imageUrl,
        ebayItemId: item.itemId,
        ebayListingUrl: item.itemWebUrl,
      });

      if (!purchaseResult) {
        throw new Error("Escrow transaction was not completed. Please try again.");
      }

      if (purchaseResult.mode === "onchain") {
        toast.success("Tokens locked on-chain!");
      } else {
        toast.success(purchaseResult.note || "Demo escrow mode enabled for this purchase.");
      }

      // Step 2: Create Escrow.com transaction (financial escrow)
      let escrowComId: string | undefined;
      const escrowResp = await fetch("/api/escrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ebayItemId: item.itemId,
          amount: price,
          title: item.title,
          buyerEmail: user.email,
        }),
      });

      const escrowData = await escrowResp.json();
      
      if (!escrowResp.ok || !escrowData.success) {
        const errMsg = escrowData.error || "Transaction creation failed";
        throw new Error(`Escrow.com: ${errMsg}`);
      }

      escrowComId = escrowData.transactionId ? String(escrowData.transactionId) : undefined;
      if (escrowComId) {
        toast.success(`Escrow.com transaction #${escrowComId} created`);
      }
      console.log("Escrow Transaction:", escrowData);

      // Step 3: Verify item on eBay & get checkout URL
      let ebayCheckoutUrl: string | undefined;
      try {
        const ebayOrderResp = await fetch("/api/ebay/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ebayItemId: item.itemId,
            escrowHash: purchaseResult.receiptId,
            amount: price,
          }),
        });
        const ebayOrderData = await ebayOrderResp.json();
        if (ebayOrderData.success && ebayOrderData.checkoutUrl) {
          ebayCheckoutUrl = ebayOrderData.checkoutUrl;
          toast.success("eBay item verified ✓");
          console.log("[eBay Order] Verified:", ebayOrderData.verified);
        } else {
          console.warn("[eBay Order] Verification note:", ebayOrderData.error || "Could not verify");
          // Use the original listing URL as fallback
          ebayCheckoutUrl = item.itemWebUrl;
        }
      } catch {
        // eBay verification is non-blocking — use listing URL as fallback
        ebayCheckoutUrl = item.itemWebUrl;
      }

      // Step 4: Save order to Convex database (persistent record)
      const orderId = await createOrderMut({
        auth0Id,
        ebayItemId: item.itemId,
        ebayListingUrl: item.itemWebUrl,
        ebayCheckoutUrl,
        tokenAmount,
        walletAddress: wallet.address || "",
        productTitle: item.title,
        shopLabel: "eBay Mall",
        productImage: item.image?.imageUrl,
        escrowTxHash: purchaseResult.receiptId,
        escrowComId,
      });

      console.log("[Order] Saved to Convex:", orderId);

      if (ebayCheckoutUrl) {
        window.open(ebayCheckoutUrl, "_blank", "noopener,noreferrer");
      }

      setPurchaseSuccess(true);
      triggerAnimation();
      toast.success("Purchase complete! Escrow auto-settles in 3 days.");
    } catch (e: any) {
      console.error("Purchase failed:", e);
      if (!e?.message?.includes("rejected")) {
        toast.error(e?.message || "Purchase failed");
      }
    } finally {
      setPurchasing(false);
    }
  }, [wallet, auth0Id, user?.email, createOrderMut, triggerAnimation]);

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
          </div>
          <div className="text-[10px] text-text-muted mt-0.5">
            {total > 0 ? `${total.toLocaleString()} listings` : "Browse the mall"}
          </div>
        </div>
        {selectedItem && (
          <button
            onClick={clearSelection}
            className="rounded-lg border border-line-panel/50 bg-bg-panel/60 px-2 py-1 text-[10px] text-text-muted hover:text-text-secondary transition"
          >
            Back
          </button>
        )}
      </div>

      {selectedItem ? (
        <ItemDetailView
          item={selectedItem}
          detail={itemDetail}
          detailLoading={detailLoading}
          wallet={wallet}
          purchasing={purchasing}
          purchaseSuccess={purchaseSuccess}
          onPurchase={handlePurchase}
          catColor={EBAY_CATEGORIES[category].color}
          userPrefs={userPrefs}
          auth0Id={auth0Id}
        />
      ) : (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Tab bar */}
          <div className="px-4 pt-3 flex gap-1 shrink-0">
            <button
              onClick={() => setActiveTab("browse")}
              className="flex-1 rounded-t-xl py-2 text-[11px] font-semibold transition-all border-b-2"
              style={{
                borderColor: activeTab === "browse" ? catColor : "transparent",
                color: activeTab === "browse" ? catColor : "rgba(255,255,255,0.35)",
                background: activeTab === "browse" ? `${catColor}08` : "transparent",
              }}
            >
              Browse
            </button>
            <button
              onClick={() => setActiveTab("search")}
              className="flex-1 rounded-t-xl py-2 text-[11px] font-semibold transition-all border-b-2"
              style={{
                borderColor: activeTab === "search" ? catColor : "transparent",
                color: activeTab === "search" ? catColor : "rgba(255,255,255,0.35)",
                background: activeTab === "search" ? `${catColor}08` : "transparent",
              }}
            >
              Search
            </button>
          </div>

          {/* Category tabs */}
          <div className="px-4 pt-2 pb-2 flex gap-1.5 overflow-x-auto shrink-0">
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

          {activeTab === "search" && (
            <div className="px-4 pb-2 shrink-0">
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
                  Go
                </button>
              </form>
            </div>
          )}

          {/* eBay not connected notice */}
          {!ebayConn && activeTab === "search" && (
            <div className="mx-4 mb-3 rounded-xl border border-line-panel/40 bg-bg-deep/40 px-4 py-3">
              <div className="text-xs text-text-muted leading-relaxed">
                <span className="font-semibold text-text-secondary">eBay dev account pending.</span>{" "}
                Connect eBay in Settings once approved to see live listings. Showing sandbox data.
              </div>
            </div>
          )}

          {/* Results */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <SearchResultsView
              items={items}
              loading={loading}
              error={error}
              isMock={isMock}
              catColor={catColor}
                onSelect={(item) => {
                  void handleTrackView(item.itemId, category);
                  selectItem(item);
                }}
              />
          </div>

          <WalletStrip wallet={wallet} />
        </div>
      )}
    </aside>
  );
}

// ── Recommendations View ──────────────────────────────────────────────────

function RecommendationsView({
  recommendations, catColor, onSelect,
}: {
  recommendations: RecommendedItem[];
  catColor: string;
  onSelect: (rec: RecommendedItem) => void;
}) {
  if (recommendations.length === 0) {
    return (
      <div className="py-10 text-center">
        <div className="text-sm text-text-muted">No recommendations yet</div>
        <div className="text-xs text-text-muted mt-1">Agent runs every 6 hours to discover new products</div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {recommendations.map((rec) => (
        <button
          key={rec._id}
          onClick={() => onSelect(rec)}
          className="w-full text-left rounded-2xl border border-line-panel/50 bg-bg-panel/60 hover:border-accent-cyan/30 hover:bg-bg-panel/80 transition-all group p-3 flex gap-3"
        >
          {rec.imageUrl && !rec.imageUrl.includes("placeholder") ? (
            <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-bg-deep/60">
              <img src={rec.imageUrl} alt={rec.title} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 bg-bg-deep/60 border border-line-panel/30">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-text-muted">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-text-primary line-clamp-2 leading-snug group-hover:text-accent-cyan transition-colors">
              {rec.title}
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-sm font-display" style={{ color: catColor }}>
                ${rec.price.toFixed(2)}
              </span>
              {rec.condition && (
                <span className="text-[10px] text-text-muted">{rec.condition}</span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-accent-lime/80">{rec.reason}</span>
            </div>
            {rec.sellerUsername && (
              <div className="text-[10px] text-text-muted mt-0.5 truncate">
                {rec.sellerUsername}
                {rec.sellerFeedbackPct && ` · ${rec.sellerFeedbackPct}% positive`}
              </div>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

// ── Search Results View ───────────────────────────────────────────────────

function SearchResultsView({
  items, loading, error, isMock, catColor, onSelect,
}: {
  items: EbayItemSummary[];
  loading: boolean;
  error: string | null;
  isMock: boolean;
  catColor: string;
  onSelect: (item: EbayItemSummary) => void;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="w-6 h-6 border-2 border-accent-cyan/20 border-t-accent-cyan rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-xs text-danger">
        {error.includes("credentials") || error.includes("token")
          ? "eBay API credentials not yet configured. Add EBAY_APP_ID and EBAY_CERT_ID to .env.local."
          : error}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-10 text-center">
        <div className="text-sm text-text-muted">No listings found</div>
        <div className="text-xs text-text-muted mt-1">Try a different search or category</div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <EbayListingCard
          key={item.itemId}
          item={item}
          catColor={catColor}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

// ── Listing Card ──────────────────────────────────────────────────────────

function EbayListingCard({
  item, catColor, onSelect
}: {
  item: EbayItemSummary;
  catColor: string;
  onSelect: (item: EbayItemSummary) => void;
}) {
  const price = parseFloat(item.price.value);
  let img = item.thumbnailImages?.[0]?.imageUrl ?? item.image?.imageUrl;

  return (
    <button
      onClick={() => onSelect(item)}
      className="w-full text-left rounded-2xl border border-line-panel/50 bg-bg-panel/60 hover:border-accent-cyan/30 hover:bg-bg-panel/80 transition-all group p-3 flex gap-3"
    >
      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-bg-deep/60">
        {img ? (
          <img src={img} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center border border-line-panel/30">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-text-muted">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
          </div>
        )}
      </div>
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
            {item.seller.username || "Seller"}{item.seller.feedbackPercentage ? ` · ${item.seller.feedbackPercentage}% positive` : item.seller.feedbackScore ? ` · Score: ${item.seller.feedbackScore}` : ""}
          </div>
        )}
      </div>
    </button>
  );
}

// ── Item Detail View ──────────────────────────────────────────────────────

function ItemDetailView({
  item, detail, detailLoading, wallet, purchasing, purchaseSuccess, onPurchase, catColor, userPrefs, auth0Id
}: {
  item: EbayItemSummary;
  detail: EbayItemDetail | null;
  detailLoading: boolean;
  wallet: ReturnType<typeof useWallet>;
  purchasing: boolean;
  purchaseSuccess: boolean;
  onPurchase: (item: EbayItemSummary) => Promise<void>;
  catColor: string;
  userPrefs: any;
  auth0Id: string;
}) {
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [showShippingForm, setShowShippingForm] = useState(false);
  const [form, setForm] = useState({
    firstName: "", lastName: "", addressLine1: "", city: "", stateOrProvince: "", postalCode: "", country: "US"
  });
  
  let mainImg = detail?.image?.imageUrl ?? item.thumbnailImages?.[0]?.imageUrl ?? item.image?.imageUrl;
  
  // Create gallery. strictly use real data returned from the API
  const detailImages = (detail as any)?.additionalImages?.map((i: any) => i.imageUrl) || [];
  
  const allImages = detailImages.length > 0 ? [mainImg, ...detailImages] : [mainImg];
  const activeImg = allImages[selectedImgIndex] || mainImg;

  const price = parseFloat(item.price.value);
  const tokenAmount = Math.max(1, Math.round(price));

  const handleBuyClick = () => {
    if (!userPrefs?.shippingAddress) {
      setShowShippingForm(true);
    } else {
      onPurchase(item);
    }
  };

  const handleSaveShipping = async () => {
    if (!form.firstName || !form.addressLine1 || !form.city || !form.postalCode) return;
    // Shipping info saved via user prefs — proceed directly
    setShowShippingForm(false);
    onPurchase(item);
  };

  return (
    <div className="flex-1 overflow-y-auto pb-4 custom-scrollbar">
      {allImages.length > 0 && (
        <div className="mx-4 mt-3">
          <button 
            onClick={() => setIsImageExpanded(true)}
            className="w-full relative rounded-2xl overflow-hidden border border-line-panel/30 h-44 bg-bg-deep/40 hover:opacity-90 transition-opacity cursor-zoom-in group"
          >
            {activeImg ? (
              <img src={activeImg} alt={item.title} className="w-full h-full object-contain p-2" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-text-muted/50">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
              </div>
            )}
            
            <div className="absolute top-2 right-2 bg-black/60 shadow-md backdrop-blur-sm p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
               <svg width="18" height="18" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></svg>
            </div>
          </button>
          {allImages.length > 1 && (
            <div className="flex gap-2 mt-2 overflow-x-auto pb-1 px-1 custom-scrollbar">
              {allImages.map((imgUrl, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImgIndex(i)}
                  className={`w-12 h-12 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImgIndex === i ? "border-accent-cyan opacity-100" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={imgUrl} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="px-4 pt-4 space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-text-primary leading-snug">{item.title}</h2>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-display" style={{ color: catColor }}>
              ${price.toFixed(2)}
            </span>
            <span className="text-xs text-text-muted">{item.price.currency}</span>
          </div>
        </div>

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

        {item.seller && (
          <div className="rounded-xl border border-line-panel/40 bg-bg-deep/40 px-3 py-2.5">
            <div className="text-[10px] text-text-muted uppercase tracking-wider">Seller</div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-xs font-semibold text-text-primary">{item.seller.username || "Seller"}</span>
              {item.seller.feedbackPercentage ? (
                <span className="text-[10px] text-accent-cyan/80">{item.seller.feedbackPercentage}% ({item.seller.feedbackScore})</span>
              ) : item.seller.feedbackScore ? (
                <span className="text-[10px] text-accent-cyan/80">Score: {item.seller.feedbackScore}</span>
              ) : null}
            </div>
          </div>
        )}

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

        <div className="rounded-2xl border border-line-panel/50 bg-bg-deep/40 p-4 space-y-3">
          <div className="text-[10px] uppercase tracking-wider text-text-muted">Purchase via Escrow</div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-display text-accent-cyan">{tokenAmount} ACT</span>
            <span className="text-[10px] text-text-muted">tokens locked until delivery confirmed</span>
          </div>

          {purchaseSuccess ? (
            <div className="space-y-2 text-center">
              <div className="rounded-xl bg-accent-cyan/10 border border-accent-cyan/30 px-4 py-4 text-sm font-semibold text-accent-cyan">
                Purchase Successful
                <div className="text-[10px] text-accent-cyan/70 mt-1 font-normal">Your order has been securely submitted to Escrow.com</div>
              </div>
              <button onClick={() => window.location.href = '/app/orders'} className="mt-2 text-xs text-accent-cyan hover:underline">
                View My Orders
              </button>
            </div>
          ) : showShippingForm ? (
            <div className="space-y-2 mt-4 animate-fade-in">
              <div className="text-xs font-semibold text-accent-cyan mb-2">Shipping Information Required</div>
              <input placeholder="First Name" value={form.firstName} onChange={e=>setForm({...form, firstName: e.target.value})} className="w-full bg-bg-panel border border-line-panel/50 rounded-lg px-3 py-2 text-xs text-text-primary outline-none focus:border-accent-cyan" />
              <input placeholder="Last Name" value={form.lastName} onChange={e=>setForm({...form, lastName: e.target.value})} className="w-full bg-bg-panel border border-line-panel/50 rounded-lg px-3 py-2 text-xs text-text-primary outline-none focus:border-accent-cyan" />
              <input placeholder="Address Line 1" value={form.addressLine1} onChange={e=>setForm({...form, addressLine1: e.target.value})} className="w-full bg-bg-panel border border-line-panel/50 rounded-lg px-3 py-2 text-xs text-text-primary outline-none focus:border-accent-cyan" />
              <div className="flex gap-2">
                <input placeholder="City" value={form.city} onChange={e=>setForm({...form, city: e.target.value})} className="w-1/2 bg-bg-panel border border-line-panel/50 rounded-lg px-3 py-2 text-xs text-text-primary outline-none focus:border-accent-cyan" />
                <input placeholder="State" value={form.stateOrProvince} onChange={e=>setForm({...form, stateOrProvince: e.target.value})} className="w-1/2 bg-bg-panel border border-line-panel/50 rounded-lg px-3 py-2 text-xs text-text-primary outline-none focus:border-accent-cyan" />
              </div>
              <input placeholder="Postal Code" value={form.postalCode} onChange={e=>setForm({...form, postalCode: e.target.value})} className="w-full bg-bg-panel border border-line-panel/50 rounded-lg px-3 py-2 text-xs text-text-primary outline-none focus:border-accent-cyan" />
              <button onClick={handleSaveShipping} className="w-full mt-2 rounded-xl py-3 text-sm font-semibold bg-accent-cyan hover:bg-accent-cyan text-bg-deep transition">
                Save & Continue to Escrow
              </button>
            </div>
          ) : !wallet.isConnected ? (
            <button
              onClick={wallet.connectWallet}
              disabled={wallet.isConnecting}
              className="w-full rounded-xl bg-gradient-to-r from-accent-amber to-[#ff8a00] py-3 text-sm font-semibold text-bg-deep transition hover:shadow-[0_0_18px_rgba(255,191,95,0.3)] disabled:opacity-50"
            >
              {wallet.isConnecting ? "Connecting..." : "Connect Wallet to Buy"}
            </button>
          ) : (
            <div className="space-y-2">
              {wallet.tokenBalance < tokenAmount ? (
                <button
                  onClick={() => window.location.href = '/app/wallet'}
                  className="w-full rounded-xl py-3 text-sm font-semibold transition border border-rose-500/50 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
                >
                  Insufficient Balance — Buy ACT Tokens
                </button>
              ) : (
                <button
                  onClick={handleBuyClick}
                  disabled={purchasing}
                  className="w-full rounded-xl py-3 text-sm font-semibold text-bg-deep transition disabled:opacity-60"
                  style={{ background: catColor }}
                >
                  {purchasing ? "Locking in Escrow..." : `Buy for ${tokenAmount} ACT`}
                </button>
              )}
              <a
                href={item.itemWebUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center rounded-xl border border-line-panel/50 py-2.5 text-xs text-text-muted hover:text-text-secondary transition"
              >
                View on eBay
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

// ── Wallet strip at bottom ────────────────────────────────────────────────

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
              Claim {FREE_STARTER_ACT.toLocaleString()} ACT
            </button>
          )}
        </div>
      ) : (
        <button
          onClick={wallet.connectWallet}
          disabled={wallet.isConnecting}
          className="w-full rounded-xl bg-gradient-to-r from-accent-amber/80 to-[#ff8a00] py-2 text-xs font-semibold text-bg-deep transition hover:shadow-[0_0_14px_rgba(255,191,95,0.25)] disabled:opacity-50"
        >
          {wallet.isConnecting ? "Connecting..." : "Connect Wallet to Purchase"}
        </button>
      )}
    </div>
  );
}
