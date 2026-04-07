"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useUser } from "@auth0/nextjs-auth0/client";

import { api } from "@/convex/_generated/api";
import { useWallet } from "@/lib/web3/provider";

const ACTION_OPTIONS = [
  { value: "browse", label: "Browse catalog" },
  { value: "compare", label: "Compare deals" },
  { value: "draft_purchase", label: "Create draft purchases" },
  { value: "execute_purchase", label: "Allow execution requests" },
];

const CATEGORY_OPTIONS = [
  { value: "electronics", label: "Electronics" },
  { value: "fashion", label: "Fashion" },
  { value: "home", label: "Home & Garden" },
  { value: "sports", label: "Sports" },
  { value: "collectibles", label: "Collectibles" },
];

const DEFAULT_TWILIO_NUMBER =
  process.env.NEXT_PUBLIC_TWILIO_WHATSAPP_NUMBER ?? "whatsapp:+14155238886";

export default function SettingsPage() {
  const { user } = useUser();
  const auth0Id = user?.sub ?? "";
  const wallet = useWallet();

  const dbWallet = useQuery(api.wallets.getWalletByAuth0Id, auth0Id ? { auth0Id } : "skip");
  const dbTokenAddress = useQuery(api.system.getConfig, { key: "TOKEN_ADDRESS" });
  const dbEscrowAddress = useQuery(api.system.getConfig, { key: "ESCROW_ADDRESS" });
  const ebayConn = useQuery(api.ebay.getEbayConnection, auth0Id ? { auth0Id } : "skip");
  const agentSettings = useQuery(api.agentSettings.getAgentSettings, auth0Id ? { auth0Id } : "skip");
  const recentIntents = useQuery(api.whatsapp.listRecentAgentIntents, auth0Id ? { auth0Id, limit: 6 } : "skip");

  const disconnectEbay = useMutation(api.ebay.disconnectEbay);
  const updateAgentSettings = useMutation(api.agentSettings.updateAgentSettings);
  const generateWhatsAppVerificationCode = useMutation(api.agentSettings.generateWhatsAppVerificationCode);
  const unlinkWhatsApp = useMutation(api.agentSettings.unlinkWhatsApp);
  const linkWhatsApp = useMutation(api.users.linkWhatsAppDirect);

  const [maxBudget, setMaxBudget] = useState(250);
  const [approvalThreshold, setApprovalThreshold] = useState(50);
  const [allowedActions, setAllowedActions] = useState<string[]>(ACTION_OPTIONS.map((item) => item.value));
  const [allowedCategories, setAllowedCategories] = useState<string[]>(CATEGORY_OPTIONS.map((item) => item.value));
  const [verifiedOnly, setVerifiedOnly] = useState(true);
  const [agentPaused, setAgentPaused] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [pendingCode, setPendingCode] = useState<string | null>(null);
  const [pendingCodeExpiresAt, setPendingCodeExpiresAt] = useState<number | null>(null);
  const [notice, setNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (!agentSettings) return;

    setMaxBudget(agentSettings.maxBudget);
    setApprovalThreshold(agentSettings.approvalThreshold);
    setAllowedActions(agentSettings.allowedActions);
    setAllowedCategories(agentSettings.allowedCategories);
    setVerifiedOnly(agentSettings.verifiedOnly);
    setAgentPaused(agentSettings.agentPaused);
    setPendingCode(agentSettings.pendingWhatsAppLink?.code ?? null);
    setPendingCodeExpiresAt(agentSettings.pendingWhatsAppLink?.expiresAt ?? null);
  }, [agentSettings]);

  useEffect(() => {
    if (typeof window !== "undefined" && auth0Id) {
      const urlParams = new URLSearchParams(window.location.search);
      const waLink = urlParams.get("wa");
      if (waLink) {
        linkWhatsApp({ auth0Id, whatsappId: waLink })
          .then(() => {
            setNotice({ type: "success", message: `WhatsApp number ${waLink} successfully linked!` });
            window.history.replaceState({}, '', '/app/settings');
          })
          .catch(() => setNotice({ type: "error", message: "Failed to link WhatsApp via URL." }));
      }
    }
  }, [auth0Id, linkWhatsApp]);

  const whatsAppInstructions = useMemo(() => {
    if (!pendingCode) return null;
    return `Send "${pendingCode}" to ${DEFAULT_TWILIO_NUMBER}`;
  }, [pendingCode]);

  const handleConnectEbay = () => {
    window.location.href = "/api/ebay/auth";
  };

  const toggleSelection = (
    current: string[],
    value: string,
    setter: (next: string[]) => void,
  ) => {
    setter(
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  };

  const handleSaveAgentSettings = async () => {
    if (!auth0Id) return;

    setSavingSettings(true);
    try {
      await updateAgentSettings({
        auth0Id,
        maxBudget,
        approvalThreshold,
        allowedActions,
        allowedCategories,
        verifiedOnly,
        agentPaused,
      });
      setNotice({ type: "success", message: "Agent policy updated." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update agent settings.";
      setNotice({ type: "error", message });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleGenerateCode = async () => {
    if (!auth0Id) return;

    setGeneratingCode(true);
    try {
      const result = await generateWhatsAppVerificationCode({ auth0Id });
      setPendingCode(result.code);
      setPendingCodeExpiresAt(result.expiresAt);
      setNotice({ type: "success", message: "WhatsApp verification code generated." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to generate WhatsApp code.";
      setNotice({ type: "error", message });
    } finally {
      setGeneratingCode(false);
    }
  };

  const handleUnlinkWhatsApp = async () => {
    if (!auth0Id) return;

    try {
      await unlinkWhatsApp({ auth0Id });
      setNotice({ type: "success", message: "WhatsApp disconnected." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to disconnect WhatsApp.";
      setNotice({ type: "error", message });
    }
  };

  return (
    <div className="h-full overflow-y-auto px-8 py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h2 className="font-display text-3xl font-bold text-text-primary">Settings</h2>
          <p className="mt-2 text-sm text-text-muted">
            Wallet configuration, marketplace integrations, and AI agent policy.
          </p>
        </div>

        {notice ? (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm ${
              notice.type === "success"
                ? "border-accent-lime/30 bg-accent-lime/10 text-accent-lime"
                : "border-rose-500/30 bg-rose-500/10 text-rose-400"
            }`}
          >
            {notice.message}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-line-panel bg-bg-panel/60 p-5 space-y-5">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-text-muted">AI Agent Configuration</div>
                <h3 className="mt-2 font-display text-2xl text-text-primary">WhatsApp Agent Policy</h3>
                <p className="mt-2 text-sm text-text-secondary">
                  These controls define what the WhatsApp agent is allowed to do on your behalf.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <NumberField
                  label="Max Budget (ACT)"
                  value={maxBudget}
                  onChange={setMaxBudget}
                  hint="Hard cap. Requests above this are rejected."
                />
                <NumberField
                  label="Approval Threshold (ACT)"
                  value={approvalThreshold}
                  onChange={setApprovalThreshold}
                  hint="Requests above this go to pending approval."
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <ToggleCard
                  label="Verified Sellers Only"
                  description="Only allow the agent to work with trusted sellers."
                  enabled={verifiedOnly}
                  onChange={setVerifiedOnly}
                />
                <ToggleCard
                  label="Pause Agent"
                  description="Stop the WhatsApp agent from acting until resumed."
                  enabled={agentPaused}
                  onChange={setAgentPaused}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <SelectionCard
                  title="Allowed Actions"
                  options={ACTION_OPTIONS}
                  selected={allowedActions}
                  onToggle={(value) => toggleSelection(allowedActions, value, setAllowedActions)}
                />
                <SelectionCard
                  title="Allowed Categories"
                  options={CATEGORY_OPTIONS}
                  selected={allowedCategories}
                  onToggle={(value) => toggleSelection(allowedCategories, value, setAllowedCategories)}
                />
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-line-panel/50 bg-bg-deep/40 p-4">
                <div>
                  <div className="text-sm font-semibold text-text-primary">Save Agent Policy</div>
                  <div className="mt-1 text-xs text-text-muted">
                    Policy changes apply immediately to new WhatsApp instructions.
                  </div>
                </div>
                <button
                  onClick={handleSaveAgentSettings}
                  disabled={savingSettings || !auth0Id}
                  className="rounded-xl bg-accent-cyan px-4 py-2.5 text-sm font-semibold text-bg-deep transition hover:shadow-[0_0_18px_rgba(5,231,255,0.3)] disabled:opacity-50"
                >
                  {savingSettings ? "Saving..." : "Save Policy"}
                </button>
              </div>
            </section>

            <section className="rounded-2xl border border-line-panel bg-bg-panel/60 p-5 space-y-5">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-text-muted">WhatsApp Linking</div>
                <h3 className="mt-2 font-display text-2xl text-text-primary">Connect Twilio WhatsApp</h3>
                <p className="mt-2 text-sm text-text-secondary">
                  Link your WhatsApp number to this logged-in Actify account using a one-time verification code.
                </p>
              </div>

              <div className="rounded-2xl border border-line-panel/50 bg-bg-deep/40 p-4 space-y-3">
                <div className="text-xs uppercase tracking-[0.24em] text-text-muted">Twilio Number</div>
                <div className="font-mono text-sm text-accent-cyan">{DEFAULT_TWILIO_NUMBER}</div>
                <div className="text-xs text-text-muted">
                  Use this exact WhatsApp destination when sending your verification code.
                </div>
              </div>

              {agentSettings?.whatsappId ? (
                <div className="rounded-2xl border border-accent-lime/30 bg-accent-lime/10 p-4 space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs uppercase tracking-[0.24em] text-accent-lime">Linked</div>
                      <div className="mt-1 font-mono text-sm text-text-primary">{agentSettings.whatsappId}</div>
                    </div>
                    <button
                      onClick={handleUnlinkWhatsApp}
                      className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm font-semibold text-rose-400 transition hover:bg-rose-500/20"
                    >
                      Unlink
                    </button>
                  </div>
                  <div className="text-xs text-text-secondary">
                    This number can now send shopping instructions to the Actify bot.
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-line-panel/50 bg-bg-deep/40 p-4 space-y-3">
                    <div className="text-xs uppercase tracking-[0.24em] text-text-muted">Step 1</div>
                    <div className="text-sm text-text-secondary">
                      Generate a one-time code from this dashboard.
                    </div>
                    <button
                      onClick={handleGenerateCode}
                      disabled={generatingCode || !auth0Id}
                      className="rounded-xl border border-accent-cyan/30 bg-accent-cyan/10 px-4 py-2.5 text-sm font-semibold text-accent-cyan transition hover:bg-accent-cyan/20 disabled:opacity-50"
                    >
                      {generatingCode ? "Generating..." : "Generate Verification Code"}
                    </button>
                  </div>

                  {pendingCode ? (
                    <div className="rounded-2xl border border-accent-amber/30 bg-accent-amber/10 p-4 space-y-3">
                      <div className="text-xs uppercase tracking-[0.24em] text-accent-amber">Step 2</div>
                      <div className="font-mono text-2xl font-semibold text-text-primary">{pendingCode}</div>
                      <div className="text-sm text-text-secondary">
                        {whatsAppInstructions}
                      </div>
                      {pendingCodeExpiresAt ? (
                        <div className="text-xs text-text-muted" suppressHydrationWarning>
                          Expires at {new Date(pendingCodeExpiresAt).toLocaleTimeString()}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-line-panel bg-bg-panel/60 p-5 space-y-4">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-text-muted">Recent Agent Intents</div>
                <h3 className="mt-2 font-display text-2xl text-text-primary">Latest WhatsApp Decisions</h3>
              </div>
              <div className="space-y-3">
                {(recentIntents ?? []).length ? (
                  recentIntents!.map((intent) => (
                    <div
                      key={intent._id}
                      className="rounded-2xl border border-line-panel/50 bg-bg-deep/40 p-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="text-sm font-semibold text-text-primary">
                          {intent.actionType.replaceAll("_", " ")}
                        </div>
                        <IntentBadge status={intent.status} />
                      </div>
                      <div className="mt-2 text-sm text-text-secondary">{intent.instruction}</div>
                      {intent.resultSummary ? (
                        <div className="mt-2 text-xs text-text-muted">{intent.resultSummary}</div>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-line-panel/60 bg-bg-deep/30 p-5 text-sm text-text-muted">
                    No WhatsApp intents yet. Link your number and send a message to start.
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-2xl border border-line-panel bg-bg-panel/60 p-5 space-y-4">
              <div className="text-[10px] uppercase tracking-wider text-text-muted">Wallet</div>
              {wallet.isConnected && dbWallet ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 xl:gap-4">
                    <MetricCard label="Balance" value={`${dbWallet.tokenBalance} ACT`} />
                    <MetricCard label="Chain" value={wallet.isCorrectChain ? "Sepolia" : "Wrong"} />
                    <MetricCard label="Faucet" value={dbWallet.hasClaimed ? "Claimed" : "Available"} />
                  </div>
                  <ContractRow label="Address" address={wallet.address ?? undefined} />
                  <ContractRow
                    label="Connected"
                    address={new Date(dbWallet.connectedAt).toLocaleString()}
                    isText
                  />
                  {!dbWallet.hasClaimed ? (
                    <button
                      onClick={async () => {
                        await wallet.claimFaucet();
                      }}
                      className="w-full rounded-xl bg-accent-cyan/10 border border-accent-cyan/30 px-4 py-3 text-sm font-semibold text-accent-cyan transition hover:bg-accent-cyan/20"
                    >
                      Claim 100 On-chain ACT Tokens
                    </button>
                  ) : null}
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-text-secondary">
                    No wallet connected. Connect MetaMask to enable purchases.
                  </p>
                  <button
                    onClick={wallet.connectWallet}
                    disabled={wallet.isConnecting}
                    className="rounded-xl bg-accent-cyan px-4 py-3 text-sm font-semibold text-bg-deep transition hover:shadow-[0_0_18px_rgba(5,231,255,0.3)] disabled:opacity-50"
                  >
                    {wallet.isConnecting ? "Connecting..." : "Connect MetaMask"}
                  </button>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-line-panel bg-bg-panel/60 p-5 space-y-4">
              <div className="text-[10px] uppercase tracking-wider text-text-muted">Marketplace Integrations</div>
              <p className="text-sm text-text-secondary">
                Connect your eBay account so the AI agent can browse live listings.
              </p>
              {ebayConn ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xl:gap-4">
                    <MetricCard label="eBay Username" value={ebayConn.ebayUsername || "Connected"} />
                    <MetricCard label="Status" value={ebayConn.isExpired ? "Token Expired" : "Active"} />
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => disconnectEbay({ auth0Id })}
                      className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm font-semibold text-rose-500 transition hover:bg-rose-500/20"
                    >
                      Disconnect
                    </button>
                    {ebayConn.isExpired ? (
                      <button
                        onClick={handleConnectEbay}
                        className="rounded-xl border border-accent-cyan/30 bg-accent-cyan/10 px-4 py-2.5 text-sm font-semibold text-accent-cyan transition hover:bg-accent-cyan/20"
                      >
                        Refresh Token
                      </button>
                    ) : null}
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleConnectEbay}
                  className="rounded-xl bg-gradient-to-r from-[#0064d2] to-[#004f9e] px-4 py-3 text-sm font-semibold text-white transition hover:shadow-[0_0_18px_rgba(0,100,210,0.3)]"
                >
                  Connect eBay Account
                </button>
              )}
            </section>

            <section className="rounded-2xl border border-line-panel bg-bg-panel/60 p-5 space-y-3">
              <div className="text-[10px] uppercase tracking-wider text-text-muted">Smart Contracts</div>
              <div className="space-y-2">
                <ContractRow label="Token (ACT)" address={dbTokenAddress || process.env.NEXT_PUBLIC_TOKEN_ADDRESS} />
                <ContractRow label="Escrow" address={dbEscrowAddress || process.env.NEXT_PUBLIC_ESCROW_ADDRESS} />
                <ContractRow label="Network" address="Sepolia Testnet (Chain ID: 11155111)" isText />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  hint: string;
}) {
  return (
    <label className="rounded-2xl border border-line-panel/50 bg-bg-deep/40 p-4 block">
      <div className="text-[10px] uppercase tracking-wider text-text-muted truncate">{label}</div>
      <input
        type="number"
        min={0}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-3 w-full rounded-xl border border-line-panel/60 bg-bg-panel/60 px-4 py-3 text-base text-text-primary outline-none focus:border-accent-cyan/50"
      />
      <div className="mt-2 text-xs text-text-muted">{hint}</div>
    </label>
  );
}

function ToggleCard({
  label,
  description,
  enabled,
  onChange,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`rounded-2xl border p-4 text-left transition ${
        enabled
          ? "border-accent-cyan/40 bg-accent-cyan/10"
          : "border-line-panel/50 bg-bg-deep/40"
      }`}
    >
      <div className="flex items-start sm:items-center justify-between gap-4">
        <div className="min-w-0 flex-1 pr-2">
          <div className="text-sm font-semibold text-text-primary truncate">{label}</div>
          <div className="mt-1 text-xs text-text-muted line-clamp-2 md:line-clamp-none">{description}</div>
        </div>
        <div
          className={`shrink-0 h-6 w-11 rounded-full p-1 transition ${
            enabled ? "bg-accent-cyan" : "bg-line-panel"
          }`}
        >
          <div
            className={`h-4 w-4 rounded-full bg-white transition ${
              enabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </div>
      </div>
    </button>
  );
}

function SelectionCard({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: Array<{ value: string; label: string }>;
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-line-panel/50 bg-bg-deep/40 p-4">
      <div className="text-[10px] uppercase tracking-wider text-text-muted">{title}</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selected.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onToggle(option.value)}
              className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                isSelected
                  ? "border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan"
                  : "border-line-panel/60 bg-bg-panel/40 text-text-secondary"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col justify-center rounded-2xl border border-line-panel bg-bg-panel/60 p-3 sm:p-4 min-w-0">
      <div className="text-lg sm:text-xl font-display text-accent-cyan truncate" title={value}>{value}</div>
      <div className="mt-1 sm:mt-2 text-[10px] uppercase tracking-wider text-text-muted truncate" title={label}>{label}</div>
    </div>
  );
}

function ContractRow({
  label,
  address,
  isText,
}: {
  label: string;
  address?: string;
  isText?: boolean;
}) {
  return (
    <div className="rounded-xl border border-line-panel/50 bg-bg-deep/40 px-4 py-2.5">
      <div className="text-[10px] text-text-muted uppercase tracking-wider truncate" title={label}>{label}</div>
      <div className="mt-1 text-xs text-text-secondary font-mono break-all">
        {address || (isText ? address : "Not deployed yet")}
      </div>
    </div>
  );
}

function IntentBadge({ status }: { status: string }) {
  const style =
    status === "blocked"
      ? "border-rose-500/30 bg-rose-500/10 text-rose-400"
      : status === "pending_approval"
        ? "border-accent-amber/30 bg-accent-amber/10 text-accent-amber"
        : "border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan";

  return (
    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${style}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
}
