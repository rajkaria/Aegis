"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

/* ------------------------------------------------------------------ */
/*  Intersection Observer hook for scroll-triggered animations        */
/* ------------------------------------------------------------------ */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("animate-slide-in-up");
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function RevealSection({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const ref = useReveal();
  return (
    <div ref={ref} id={id} className={`opacity-0 ${className}`}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Dot Grid Background                                               */
/* ------------------------------------------------------------------ */
function DotGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl animate-pulse-glow animation-delay-600" />
      <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-violet-500/8 rounded-full blur-3xl animate-pulse-glow animation-delay-400" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Feature Card (glass-morphism)                                     */
/* ------------------------------------------------------------------ */
function FeatureCard({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="group relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 transition-all duration-300 hover:scale-[1.02] hover:border-white/20 hover:shadow-[0_0_40px_-12px_rgba(52,211,153,0.15)]">
      <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-sky-500/20 border border-white/10">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-1">{title}</h3>
      <p className="text-sm font-medium text-emerald-400 mb-3">{subtitle}</p>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SVG Icons                                                         */
/* ------------------------------------------------------------------ */
function GateIcon() {
  return (
    <svg
      className="w-6 h-6 text-emerald-400"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 21h18" />
      <path d="M5 21V7l7-4 7 4v14" />
      <path d="M9 21v-6h6v6" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      className="w-6 h-6 text-sky-400"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function NexusIcon() {
  return (
    <svg
      className="w-6 h-6 text-violet-400"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <circle cx="5" cy="6" r="2" />
      <circle cx="19" cy="6" r="2" />
      <circle cx="5" cy="18" r="2" />
      <circle cx="19" cy="18" r="2" />
      <path d="M7 7l3 3" />
      <path d="M17 7l-3 3" />
      <path d="M7 17l3-3" />
      <path d="M17 17l-3-3" />
    </svg>
  );
}

/* ================================================================== */
/*  LANDING PAGE                                                       */
/* ================================================================== */
export default function LandingPage() {
  return (
    <div className="relative min-h-screen">
      <DotGrid />

      {/* ---- HERO ---- */}
      <section className="relative pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hackathon badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-xs text-muted-foreground mb-8 animate-slide-in-up">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Built for OWS Hackathon
          </div>

          {/* Title */}
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-extrabold tracking-tight mb-6 animate-slide-in-up animation-delay-200">
            <span className="bg-gradient-to-r from-emerald-400 via-sky-400 to-violet-400 bg-clip-text text-transparent animate-gradient">
              Aegis
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl sm:text-2xl font-medium text-foreground/90 mb-4 animate-slide-in-up animation-delay-400">
            The Commerce Protocol for Agent Economies
          </p>

          {/* Description */}
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-in-up animation-delay-600">
            Agents earn via x402-gated services, spend within policy guardrails,
            and operate transparently — one OWS wallet, one dashboard, one
            protocol.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-in-up animation-delay-800">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 text-white font-semibold text-sm transition-all hover:shadow-[0_0_30px_-5px_rgba(52,211,153,0.4)] hover:scale-105"
            >
              View Live Dashboard
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
            <a
              href="https://github.com/rajkaria/aegis"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm text-sm font-medium text-foreground hover:bg-white/10 transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </a>
          </div>
        </div>
      </section>

      {/* ---- STATS BANNER ---- */}
      <RevealSection className="py-16 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {[
            { value: "3", label: "Policy Executables" },
            { value: "6", label: "Commerce Tools" },
            { value: "3", label: "Agent Demo Economy" },
          ].map((stat) => (
            <div key={stat.label} className="space-y-2">
              <div className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </RevealSection>

      {/* ---- THREE PILLARS ---- */}
      <RevealSection className="py-24 px-6" id="features">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Three Pillars of Agent Commerce
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Everything an autonomous agent needs to earn, spend, and stay
              accountable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Aegis Gate */}
            <FeatureCard
              icon={<GateIcon />}
              title="Aegis Gate"
              subtitle="API Monetization via x402"
            >
              <p className="text-sm text-muted-foreground mb-4">
                One line of Express middleware turns any endpoint into a paid
                service. Agents pay per call with USDC.
              </p>
              <div className="rounded-lg bg-black/40 border border-white/5 p-4 font-mono text-xs overflow-x-auto">
                <span className="text-muted-foreground">app.</span>
                <span className="text-sky-400">get</span>
                <span className="text-muted-foreground">(</span>
                <span className="text-emerald-400">
                  &quot;/api/data&quot;
                </span>
                <span className="text-muted-foreground">, </span>
                <span className="text-violet-400">aegisGate</span>
                <span className="text-muted-foreground">{"({ "}</span>
                <span className="text-sky-300">price</span>
                <span className="text-muted-foreground">{": "}</span>
                <span className="text-emerald-400">
                  &quot;0.01&quot;
                </span>
                <span className="text-muted-foreground">{" })"}</span>
                <span className="text-muted-foreground">, handler)</span>
              </div>
            </FeatureCard>

            {/* Aegis Policies */}
            <FeatureCard
              icon={<ShieldIcon />}
              title="Aegis Policies"
              subtitle="Spend Governance"
            >
              <p className="text-sm text-muted-foreground mb-4">
                Budget caps, address allowlists, and a dead man&#39;s switch —
                all plugging into OWS&#39;s native policy engine.
              </p>
              <div className="space-y-2">
                {[
                  {
                    name: "budget-policy",
                    desc: "Per-token, per-period spend caps",
                  },
                  {
                    name: "guard-policy",
                    desc: "Address allowlist / blocklist",
                  },
                  {
                    name: "deadswitch-policy",
                    desc: "Auto-freeze on inactivity",
                  },
                ].map((p) => (
                  <div
                    key={p.name}
                    className="flex items-start gap-2 text-xs"
                  >
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                    <div>
                      <span className="font-mono text-foreground">
                        {p.name}
                      </span>
                      <span className="text-muted-foreground ml-1">
                        — {p.desc}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </FeatureCard>

            {/* Aegis Nexus */}
            <FeatureCard
              icon={<NexusIcon />}
              title="Aegis Nexus"
              subtitle="Economy Visualizer"
            >
              <p className="text-sm text-muted-foreground mb-4">
                See money flowing between agents in real-time. P&amp;L tables,
                budget bars, policy enforcement logs — all in one dashboard.
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Money Flow",
                  "P&L Tables",
                  "Budget Bars",
                  "Activity Feed",
                  "Policy Logs",
                  "Agent Profiles",
                ].map((feature) => (
                  <span
                    key={feature}
                    className="text-xs px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-muted-foreground"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </FeatureCard>
          </div>
        </div>
      </RevealSection>

      {/* ---- SUPPLY CHAIN DEMO ---- */}
      <RevealSection className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Supply Chain in Action
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              A 3-agent economy where research buyers pay analysts, who pay data
              miners — all governed by policy.
            </p>
          </div>

          {/* Flow Visualization */}
          <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 sm:p-12">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-8 sm:gap-4">
              {/* Agent 1 */}
              <div className="text-center flex-1">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20 mb-3">
                  <span className="text-2xl font-bold text-emerald-400">R</span>
                </div>
                <div className="font-semibold text-sm">research-buyer</div>
                <div className="text-xs text-muted-foreground mt-1">
                  pays $0.05
                </div>
              </div>

              {/* Arrow 1 */}
              <div className="hidden sm:flex flex-col items-center gap-1 flex-shrink-0">
                <div className="text-xs text-emerald-400 font-mono">$0.05</div>
                <div className="w-24 h-px bg-gradient-to-r from-emerald-500 to-sky-500 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-sky-500 animate-flow-pulse" />
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[4px] border-b-[4px] border-l-[6px] border-t-transparent border-b-transparent border-l-sky-500" />
                </div>
              </div>
              <div className="sm:hidden w-px h-8 bg-gradient-to-b from-emerald-500 to-sky-500 relative">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[6px] border-l-transparent border-r-transparent border-t-sky-500" />
              </div>

              {/* Agent 2 */}
              <div className="text-center flex-1">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500/20 to-sky-500/5 border border-sky-500/20 mb-3">
                  <span className="text-2xl font-bold text-sky-400">A</span>
                </div>
                <div className="font-semibold text-sm">analyst</div>
                <div className="text-xs text-muted-foreground mt-1">
                  pays $0.01
                </div>
              </div>

              {/* Arrow 2 */}
              <div className="hidden sm:flex flex-col items-center gap-1 flex-shrink-0">
                <div className="text-xs text-sky-400 font-mono">$0.01</div>
                <div className="w-24 h-px bg-gradient-to-r from-sky-500 to-violet-500 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-sky-500 to-violet-500 animate-flow-pulse animation-delay-400" />
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[4px] border-b-[4px] border-l-[6px] border-t-transparent border-b-transparent border-l-violet-500" />
                </div>
              </div>
              <div className="sm:hidden w-px h-8 bg-gradient-to-b from-sky-500 to-violet-500 relative">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[6px] border-l-transparent border-r-transparent border-t-violet-500" />
              </div>

              {/* Agent 3 */}
              <div className="text-center flex-1">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-violet-500/5 border border-violet-500/20 mb-3">
                  <span className="text-2xl font-bold text-violet-400">D</span>
                </div>
                <div className="font-semibold text-sm">data-miner</div>
                <div className="text-xs text-muted-foreground mt-1">
                  earns $0.01
                </div>
              </div>
            </div>
          </div>
        </div>
      </RevealSection>

      {/* ---- XMTP DISCOVERY ---- */}
      <RevealSection className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500/20 to-violet-500/20 border border-white/10 mb-6">
            <svg
              className="w-7 h-7 text-sky-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            XMTP Service Discovery
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            Agents discover each other via wallet-to-wallet messaging before
            paying via x402. No central registry, no DNS — just cryptographic
            identity.
          </p>
        </div>
      </RevealSection>

      {/* ---- PARTNER INTEGRATIONS ---- */}
      <RevealSection className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Partner Integrations
            </h2>
            <p className="text-muted-foreground">
              Powered by best-in-class infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: "Zerion",
                desc: "Real-time EVM wallet portfolio data for agent balance tracking.",
                color: "emerald",
              },
              {
                name: "Uniblock",
                desc: "Multi-chain token balance queries across Ethereum, Base, Polygon, and Arbitrum.",
                color: "sky",
              },
              {
                name: "Allium",
                desc: "On-chain transaction verification via SQL queries across EVM and Solana.",
                color: "violet",
              },
              {
                name: "MoonPay",
                desc: "Fiat-to-crypto on-ramp for funding agent wallets via CLI or web.",
                color: "sky",
              },
              {
                name: "Solana",
                desc: "Native SOL and SPL token balance queries via Solana RPC.",
                color: "emerald",
              },
              {
                name: "Ripple XRPL",
                desc: "XRP Ledger balance and trust line queries for cross-border agent payments.",
                color: "violet",
              },
            ].map((partner) => (
              <div
                key={partner.name}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 text-center"
              >
                <div
                  className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-4 ${
                    partner.color === "emerald"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : partner.color === "sky"
                        ? "bg-sky-500/20 text-sky-400"
                        : "bg-violet-500/20 text-violet-400"
                  }`}
                >
                  <span className="text-lg font-bold">
                    {partner.name.charAt(0)}
                  </span>
                </div>
                <h3 className="text-lg font-bold mb-2">{partner.name}</h3>
                <p className="text-sm text-muted-foreground">{partner.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </RevealSection>

      {/* ---- TECH STACK ---- */}
      <RevealSection className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Tech Stack</h2>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            {[
              "TypeScript",
              "Express",
              "Next.js",
              "OWS",
              "x402",
              "shadcn/ui",
              "XMTP",
              "Zerion API",
              "Uniblock",
              "Allium",
              "MoonPay",
              "Solana",
              "Ripple XRPL",
            ].map((tech) => (
              <span
                key={tech}
                className="px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm text-sm font-medium text-foreground/80 hover:bg-white/10 transition-colors"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </RevealSection>

      {/* ---- FOOTER ---- */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Built for OWS Hackathon
          </div>
          <div>MIT License</div>
          <a
            href="https://github.com/rajkaria/aegis"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
