import Image from "next/image";

const PRODUCT_PILLARS = [
  {
    eyebrow: "LIVE COMMERCE WORLD",
    title: "Explore the eBay Mall like a game, not a spreadsheet.",
    body:
      "The dashboard centers everything around a playable mall view where departments, listings, and detail context stay visible while you browse.",
  },
  {
    eyebrow: "ACT WALLET + ESCROW",
    title: "Fund purchases with ACT and lock value until delivery is confirmed.",
    body:
      "MetaMask, Sepolia exchange, ACT balance, and escrow-backed checkout all live inside the same command surface.",
  },
  {
    eyebrow: "OBSERVABLE ACTIONS",
    title: "Track purchases, token exchanges, releases, and mission events in real time.",
    body:
      "The activity monitor gives users a concrete audit trail instead of vague AI status messages.",
  },
  {
    eyebrow: "WHATSAPP AGENT POLICY",
    title: "Connect WhatsApp with hard limits before the agent ever acts.",
    body:
      "Users can set max ACT budget, approval thresholds, verified-seller-only mode, and pause the channel whenever they need tighter control.",
  },
];

const USER_ACTIONS = [
  "Explore the eBay Mall by department inside a game-like world view.",
  "Inspect live listings, seller reputation, and pricing in the right context panel.",
  "Connect MetaMask, claim faucet ACT, and exchange Sepolia ETH for buying power.",
  "Purchase through ACT escrow instead of blind direct payment flows.",
  "Monitor purchase, wallet, and escrow events in the activity feed.",
  "Set WhatsApp agent policy with budget caps, approval thresholds, and verified-seller controls.",
];

const DASHBOARD_SHOTS = [
  {
    src: "/marketing/media__1775537319695.png",
    alt: "Actify world dashboard showing the eBay Mall and live listings",
    label: "World",
    title: "Browse live listings from inside the mall",
    description:
      "The center pane is the mall itself, while the right pane stays synced to the current department and listings.",
  },
  {
    src: "/marketing/media__1775537344449.png",
    alt: "Actify wallet dashboard showing ACT balance and Sepolia exchange panel",
    label: "Wallet",
    title: "Fund the experience with ACT",
    description:
      "Users connect MetaMask, manage balances, and exchange Sepolia ETH into ACT without leaving the dashboard shell.",
  },
  {
    src: "/marketing/media__1775537402929.png",
    alt: "Actify settings dashboard showing WhatsApp policy controls and marketplace integrations",
    label: "Policy",
    title: "Govern what the WhatsApp agent can do",
    description:
      "WhatsApp linking, approval thresholds, category limits, and verified-seller rules make agent behavior explicit.",
  },
];

const TRUST_POINTS = [
  "Auth0-secured account access",
  "ACT token balance visible at all times",
  "Escrow-backed purchases instead of blind execution",
  "Activity feed for purchases, releases, and token events",
  "WhatsApp agent policy before execution",
];

export function StudioLanding() {
  return (
    <div className="w-full min-h-screen bg-bg-deep font-body text-text-primary overflow-x-hidden">
      <section className="relative overflow-hidden border-b border-line-panel/60 pt-28 pb-20">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(5,231,255,0.18),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(5,231,255,0.08),transparent_30%)]" />

        <div className="relative mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent-cyan/25 bg-accent-cyan/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-accent-cyan">
                          
            </div>

            <div className="mt-8 flex items-center gap-4">
              <Image
                src="/marketing/actify_thumbnail_1775532669345.png"
                alt="Actify logo"
                width={92}
                height={92}
                className="rounded-3xl border border-line-panel/60 bg-bg-panel/70 shadow-[0_0_40px_rgba(5,231,255,0.08)]"
              />
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-text-muted">Actify AI</div>
                <div className="font-display text-3xl text-text-primary">Commerce, wallet, escrow, and agent control in one world.</div>
              </div>
            </div>

            <h1 className="mt-8 font-display text-5xl font-bold leading-[1.02] tracking-tight text-white md:text-6xl lg:text-7xl">
              Buy from a live mall,
              <br />
              fund with <span className="text-accent-cyan">ACT</span>,
              <br />
              govern the agent before it acts.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-text-secondary md:text-xl">
              Actify is not a generic AI storefront. It is a three-pane commerce cockpit where users browse live eBay listings in a game-like mall, fund purchases with ACT, lock value in escrow, and control WhatsApp agent behavior with explicit policy.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="/auth/login?returnTo=/app/world"
                className="inline-flex items-center gap-2 rounded-full bg-accent-cyan px-8 py-3.5 text-base font-semibold text-bg-deep transition hover:bg-white hover:shadow-[0_0_28px_rgba(5,231,255,0.35)]"
              >
                Open dashboard
              </a>
              <a
                href="#dashboard"
                className="inline-flex items-center gap-2 rounded-full border border-accent-cyan/30 px-8 py-3.5 text-base font-semibold text-accent-cyan transition hover:bg-accent-cyan/10"
              >
                See the real product
              </a>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              {TRUST_POINTS.map((point) => (
                <div
                  key={point}
                  className="flex items-center gap-3 rounded-2xl border border-line-panel/50 bg-bg-panel/50 px-4 py-3 text-sm text-text-secondary"
                >
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-accent-cyan" />
                  {point}
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-[32px] bg-accent-cyan/10 blur-3xl" />
            <div className="relative rounded-[28px] border border-line-panel/60 bg-bg-panel/50 p-3 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-sm">
              <Image
                src="/marketing/media__1775537319695.png"
                alt="Actify dashboard showing the eBay Mall world view"
                width={1024}
                height={584}
                priority
                className="h-auto w-full rounded-[20px] border border-line-panel/40"
              />
            </div>
            <div className="absolute -bottom-6 -left-4 max-w-[260px] rounded-3xl border border-line-panel/60 bg-bg-panel-strong/95 p-4 shadow-2xl">
              <div className="text-[10px] uppercase tracking-[0.24em] text-text-muted">What the product actually does</div>
              <div className="mt-2 text-lg font-display text-white">Live catalog + ACT wallet + escrow + governed WhatsApp agent.</div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-line-panel/60 bg-bg-panel/30 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <div className="text-[11px] uppercase tracking-[0.3em] text-accent-cyan">Codebase reality</div>
            <h2 className="mt-3 font-display text-4xl font-bold text-white md:text-5xl">
              The app is already a commerce operating surface, not just a landing concept.
            </h2>
            <p className="mt-4 text-lg text-text-secondary">
              Scanning the current codebase and dashboard shows a very specific product shape: a world page, ACT wallet and exchange, escrow-backed orders, an activity monitor, marketplace integration, and a new WhatsApp policy vault. The landing page should describe that product directly.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {PRODUCT_PILLARS.map((pillar) => (
              <div
                key={pillar.title}
                className="rounded-3xl border border-line-panel/60 bg-bg-panel/60 p-6 shadow-[0_0_40px_rgba(0,0,0,0.18)]"
              >
                <div className="text-[10px] uppercase tracking-[0.28em] text-accent-cyan">{pillar.eyebrow}</div>
                <h3 className="mt-3 font-display text-2xl text-white">{pillar.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">{pillar.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="dashboard" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <div className="text-[11px] uppercase tracking-[0.3em] text-accent-cyan">Real dashboard screenshots</div>
            <h2 className="mt-3 font-display text-4xl font-bold text-white md:text-5xl">
              Show the product as it exists today.
            </h2>
            <p className="mt-4 text-lg text-text-secondary">
              These are screenshots from the dashboard itself: the mall view, the ACT wallet and exchange flow, and the WhatsApp policy vault that governs what the connected agent can do.
            </p>
          </div>

          <div className="mt-12 space-y-10">
            {DASHBOARD_SHOTS.map((shot, index) => (
              <div
                key={shot.title}
                className={`grid gap-6 rounded-[32px] border border-line-panel/60 bg-bg-panel/40 p-5 lg:grid-cols-[1.2fr_0.8fr] lg:items-center ${
                  index % 2 === 1 ? "lg:grid-cols-[0.8fr_1.2fr]" : ""
                }`}
              >
                <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                  <Image
                    src={shot.src}
                    alt={shot.alt}
                    width={1024}
                    height={584}
                    className="h-auto w-full rounded-[24px] border border-line-panel/40"
                  />
                </div>
                <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                  <div className="inline-flex rounded-full border border-accent-cyan/30 bg-accent-cyan/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-accent-cyan">
                    {shot.label}
                  </div>
                  <h3 className="mt-4 font-display text-3xl text-white">{shot.title}</h3>
                  <p className="mt-4 text-base leading-relaxed text-text-secondary">{shot.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-line-panel/60 bg-bg-panel/30 py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-accent-cyan">What a user can do</div>
            <h2 className="mt-3 font-display text-4xl font-bold text-white md:text-5xl">
              The dashboard already supports a clear operating loop.
            </h2>
            <p className="mt-4 text-lg text-text-secondary">
              The current app is about controlled commerce actions: browse, fund, buy, observe, and constrain the agent. This is the language the landing page should use everywhere.
            </p>
          </div>

          <div className="grid gap-3">
            {USER_ACTIONS.map((action) => (
              <div
                key={action}
                className="flex items-start gap-4 rounded-2xl border border-line-panel/60 bg-bg-panel/60 px-5 py-4"
              >
                <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-accent-lime" />
                <p className="text-sm leading-relaxed text-text-secondary">{action}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="rounded-[36px] border border-line-panel/60 bg-gradient-to-br from-bg-panel to-bg-deep p-8 md:p-12 shadow-[0_30px_80px_rgba(0,0,0,0.32)]">
            <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
              <div>
                <div className="text-[11px] uppercase tracking-[0.3em] text-accent-cyan">Why it matters</div>
                <h2 className="mt-3 font-display text-4xl font-bold text-white md:text-5xl">
                  Actify makes AI-assisted commerce visible, funded, and governable.
                </h2>
                <p className="mt-5 max-w-2xl text-lg leading-relaxed text-text-secondary">
                  Instead of hiding buying decisions in a chat window, Actify puts the mall, the wallet, the escrow flow, the activity feed, and the agent policy in one place. That is the real story this product tells.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <a
                    href="/auth/login?returnTo=/app/world"
                    className="inline-flex items-center gap-2 rounded-full bg-accent-cyan px-8 py-3.5 text-base font-semibold text-bg-deep transition hover:bg-white hover:shadow-[0_0_28px_rgba(5,231,255,0.35)]"
                  >
                    Sign in and explore
                  </a>
                  <a
                    href="/auth/login?returnTo=/app/settings"
                    className="inline-flex items-center gap-2 rounded-full border border-accent-cyan/30 px-8 py-3.5 text-base font-semibold text-accent-cyan transition hover:bg-accent-cyan/10"
                  >
                    Configure agent policy
                  </a>
                </div>
              </div>

              <div className="rounded-[28px] border border-line-panel/60 bg-bg-panel/70 p-3">
                <Image
                  src="/marketing/media__1775537402929.png"
                  alt="Actify settings screenshot showing WhatsApp connection policy"
                  width={1024}
                  height={584}
                  className="h-auto w-full rounded-[20px] border border-line-panel/40"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
