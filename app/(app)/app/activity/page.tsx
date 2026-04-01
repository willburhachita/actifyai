"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@auth0/nextjs-auth0/client";

export default function ActivityPage() {
  const { user } = useUser();
  const auth0Id = user?.sub ?? "";
  const activity = useQuery(api.activity.getActivityByAuth0Id, auth0Id ? { auth0Id } : "skip");

  return (
    <div className="h-full overflow-y-auto px-8 py-8">
      <div className="mx-auto max-w-3xl space-y-4">
        <div>
          <h2 className="font-display text-3xl font-bold text-text-primary">
            Activity Feed
          </h2>
          <p className="mt-2 text-sm text-text-muted">
            Real-time events from wallet connections, purchases, escrow actions, and missions.
          </p>
        </div>

        {activity === undefined ? (
          <div className="flex items-center gap-3 py-8">
            <div className="w-5 h-5 border-2 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin" />
            <span className="text-sm text-text-secondary">Loading activity...</span>
          </div>
        ) : activity.length === 0 ? (
          <div className="rounded-2xl border border-line-panel bg-bg-panel/60 px-5 py-8 text-center">
            <div className="text-lg text-text-muted mb-2">No activity yet</div>
            <p className="text-sm text-text-secondary">
              Connect your wallet, browse shops, or make a purchase to see events here.
            </p>
          </div>
        ) : (
          activity.map((entry) => (
            <div
              key={entry._id}
              className="rounded-2xl border border-line-panel bg-bg-panel/60 px-5 py-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 ${
                    entry.type === "action" ? "bg-accent-lime" :
                    entry.type === "error" ? "bg-danger" :
                    entry.type === "decision" ? "bg-accent-amber" :
                    "bg-accent-cyan"
                  }`} />
                  <div>
                    <div className="text-sm font-semibold text-text-primary">
                      {entry.title}
                    </div>
                    <div className="mt-1 text-xs leading-relaxed text-text-secondary">
                      {entry.detail}
                    </div>
                  </div>
                </div>
                <div className="text-[10px] uppercase tracking-wider text-text-muted whitespace-nowrap">
                  {new Date(entry.createdAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
