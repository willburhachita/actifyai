"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useWallet } from "@/lib/web3/provider";
import type { Id } from "@/convex/_generated/dataModel";

export default function OrdersPage() {
  const { user } = useUser();
  const auth0Id = user?.sub ?? "";
  const wallet = useWallet();
  const orders = useQuery(api.purchaseOrders.getMyOrders, auth0Id ? { auth0Id } : "skip");
  const updateOrderStatus = useMutation(api.purchaseOrders.updateOrderStatus);

  const handleConfirm = async (orderId: Id<"purchaseOrders">) => {
    if (!auth0Id) return;
    const txHash = await wallet.confirmDelivery(orderId as string);
    await updateOrderStatus({
      orderId,
      auth0Id,
      status: "completed",
      txHash: txHash ?? undefined,
    });
  };

  const handleRefund = async (orderId: Id<"purchaseOrders">) => {
    if (!auth0Id) return;
    const txHash = await wallet.requestRefund(orderId as string);
    await updateOrderStatus({
      orderId,
      auth0Id,
      status: "refunded",
      txHash: txHash ?? undefined,
    });
  };

  const statusConfig: Record<string, { color: string; bg: string; border: string }> = {
    pending: { color: "text-text-muted", bg: "bg-bg-deep/50", border: "border-line-panel/50" },
    escrowed: { color: "text-accent-amber", bg: "bg-accent-amber/8", border: "border-accent-amber/25" },
    completed: { color: "text-accent-lime", bg: "bg-accent-lime/8", border: "border-accent-lime/25" },
    disputed: { color: "text-danger", bg: "bg-danger/8", border: "border-danger/25" },
    refunded: { color: "text-[#7bc8ff]", bg: "bg-[#7bc8ff]/8", border: "border-[#7bc8ff]/25" },
  };

  return (
    <div className="h-full overflow-y-auto px-8 py-8">
      <div className="mx-auto max-w-3xl space-y-4">
        <div>
          <h2 className="font-display text-3xl font-bold text-text-primary">Orders</h2>
          <p className="mt-2 text-sm text-text-muted">
            Your purchase history. Confirm delivery to release escrowed tokens to the seller.
          </p>
        </div>

        {orders === undefined ? (
          <div className="flex items-center gap-3 py-8">
            <div className="w-5 h-5 border-2 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin" />
            <span className="text-sm text-text-secondary">Loading orders...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-line-panel bg-bg-panel/60 px-5 py-8 text-center">
            <div className="text-lg text-text-muted mb-2">No orders yet</div>
            <p className="text-sm text-text-secondary">
              Browse the 3D marketplace, select a product, and purchase with ACT tokens.
            </p>
          </div>
        ) : (
          orders.map((order) => {
            const cfg = statusConfig[order.status] ?? statusConfig.pending;
            return (
              <div
                key={order._id}
                className={`rounded-2xl border ${cfg.border} ${cfg.bg} px-5 py-4 space-y-3`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-base font-semibold text-text-primary">{order.productTitle}</div>
                    <div className="mt-1 text-xs text-text-secondary">{order.shopLabel}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-display text-accent-cyan">{order.tokenAmount} ACT</div>
                    <span className={`inline-block mt-1 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold ${cfg.color} border ${cfg.border}`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                {order.productImage ? (
                  <div className="rounded-xl overflow-hidden border border-line-panel/30 h-32">
                    <img src={order.productImage} alt={order.productTitle} className="w-full h-full object-cover" />
                  </div>
                ) : null}

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {order.escrowTxHash ? (
                    <div className="rounded-lg bg-bg-deep/40 px-3 py-2">
                      <div className="text-[10px] text-text-muted uppercase">Escrow Tx</div>
                      <div className="mt-1 font-mono text-text-secondary truncate">{order.escrowTxHash}</div>
                    </div>
                  ) : null}
                  {order.releaseTxHash ? (
                    <div className="rounded-lg bg-bg-deep/40 px-3 py-2">
                      <div className="text-[10px] text-text-muted uppercase">Release Tx</div>
                      <div className="mt-1 font-mono text-text-secondary truncate">{order.releaseTxHash}</div>
                    </div>
                  ) : null}
                  <div className="rounded-lg bg-bg-deep/40 px-3 py-2">
                    <div className="text-[10px] text-text-muted uppercase">Created</div>
                    <div className="mt-1 text-text-secondary">{new Date(order.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="rounded-lg bg-bg-deep/40 px-3 py-2">
                    <div className="text-[10px] text-text-muted uppercase">Wallet</div>
                    <div className="mt-1 font-mono text-text-secondary truncate">{order.walletAddress}</div>
                  </div>
                </div>

                {order.status === "escrowed" ? (
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleConfirm(order._id)}
                      className="flex-1 rounded-xl bg-accent-lime/15 border border-accent-lime/30 px-3 py-2.5 text-xs font-semibold text-accent-lime transition hover:bg-accent-lime/25"
                    >
                      ✓ Confirm Delivery & Release Funds
                    </button>
                    <button
                      onClick={() => handleRefund(order._id)}
                      className="rounded-xl bg-danger/10 border border-danger/30 px-3 py-2.5 text-xs font-semibold text-danger transition hover:bg-danger/20"
                    >
                      ✕ Dispute
                    </button>
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
