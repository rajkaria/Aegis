"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

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
      { threshold: 0.1 }
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

function DotGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0 opacity-[0.10]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-sky-500/8 rounded-full blur-3xl animate-pulse-glow animation-delay-600" />
      <div className="absolute top-2/3 left-1/3 w-64 h-64 bg-violet-500/8 rounded-full blur-3xl animate-pulse-glow animation-delay-400" />
    </div>
  );
}

type PhaseStatus = "current" | "upcoming" | "future";

function PhaseItem({
  done,
  children,
}: {
  done?: boolean;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-3 text-sm">
      {done ? (
        <span className="shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-xs mt-0.5">
          ✓
        </span>
      ) : (
        <span className="shrink-0 w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground text-xs mt-0.5">
          ○
        </span>
      )}
      <span className={done ? "text-foreground" : "text-muted-foreground"}>
        {children}
      </span>
    </li>
  );
}

function PhaseCard({
  phase,
  period,
  title,
  status,
  children,
}: {
  phase: string;
  period: string;
  title: string;
  status: PhaseStatus;
  children: React.ReactNode;
}) {
  const statusStyles: Record<PhaseStatus, string> = {
    current:
      "border-emerald-500/30 bg-emerald-500/5 shadow-[0_0_40px_-12px_rgba(52,211,153,0.15)]",
    upcoming: "border-sky-500/20 bg-sky-500/5",
    future: "border-violet-500/20 bg-violet-500/5",
  };
  const badgeStyles: Record<PhaseStatus, string> = {
    current:
      "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400",
    upcoming: "bg-sky-500/15 border border-sky-500/30 text-sky-400",
    future: "bg-violet-500/15 border border-violet-500/30 text-violet-400",
  };
  const badgeLabels: Record<PhaseStatus, string> = {
    current: "In Progress",
    upcoming: "Next",
    future: "Planned",
  };

  return (
    <div
      className={`rounded-2xl border p-7 transition-all duration-300 ${statusStyles[status]}`}
    >
      <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            {phase} &middot; {period}
          </div>
          <h3 className="text-xl font-bold">{title}</h3>
        </div>
        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full ${badgeStyles[status]}`}
        >
          {badgeLabels[status]}
        </span>
      </div>
      <ul className="space-y-3">{children}</ul>
    </div>
  );
}

function SectionHeading({
  label,
  title,
  subtitle,
}: {
  label: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="text-center mb-14">
      <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-emerald-400/80 mb-4">
        <span className="w-4 h-px bg-emerald-400/40" />
        {label}
        <span className="w-4 h-px bg-emerald-400/40" />
      </div>
      <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{title}</h2>
      {subtitle && (
        <p className="mt-4 text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default function RoadmapPage() {
  return (
    <div className="relative min-h-screen">
      <DotGrid />

      {/* ---- HERO ---- */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-emerald-400/80 mb-6">
            <span className="w-4 h-px bg-emerald-400/40" />
            Roadmap
            <span className="w-4 h-px bg-emerald-400/40" />
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
            Building the{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">
              Economic Layer
            </span>{" "}
            for OWS
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10">
            Aegis started as a hackathon project. We&apos;re building it into
            the standard commerce infrastructure for every OWS deployment. Our
            goal: any developer using OWS should be able to add earning,
            governance, and visibility to their agents in minutes — not days.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="px-6 py-3 rounded-xl bg-emerald-500 text-black font-semibold text-sm hover:bg-emerald-400 transition-colors"
            >
              Open Dashboard
            </Link>
            <Link
              href="/docs"
              className="px-6 py-3 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold hover:bg-white/10 transition-colors"
            >
              Read Docs
            </Link>
          </div>
        </div>
      </section>

      {/* ---- PHASE TIMELINE ---- */}
      <section className="relative px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <RevealSection>
            <SectionHeading
              label="Phases"
              title="Three Phases to Agent Economy OS"
              subtitle="From foundational infrastructure to a full economy operating system — each phase builds on the last."
            />
          </RevealSection>

          {/* Timeline vertical line */}
          <div className="relative">
            {/* Vertical connector line */}
            <div className="hidden md:block absolute left-[22px] top-0 bottom-0 w-px bg-gradient-to-b from-emerald-500/40 via-sky-500/30 to-violet-500/30" />

            <div className="space-y-6 md:pl-14">
              {/* Phase dot — Phase 1 */}
              <div className="hidden md:flex absolute left-0 w-11 h-11 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 items-center justify-center text-emerald-400 text-xs font-bold">
                1
              </div>
              <RevealSection>
                <PhaseCard
                  phase="Phase 1"
                  period="Months 1–2"
                  title="Foundation"
                  status="current"
                >
                  <PhaseItem done>Gate middleware published on npm</PhaseItem>
                  <PhaseItem done>
                    3 policy executables (budget, guard, deadswitch)
                  </PhaseItem>
                  <PhaseItem done>Nexus real-time economy dashboard</PhaseItem>
                  <PhaseItem done>On-chain receipts on Solana devnet</PhaseItem>
                  <PhaseItem done>XMTP agent discovery</PhaseItem>
                  <PhaseItem done>MCP server for Claude / Cursor</PhaseItem>
                  <PhaseItem>Mainnet deployment &amp; production hardening</PhaseItem>
                  <PhaseItem>Comprehensive developer documentation</PhaseItem>
                </PhaseCard>
              </RevealSection>

              {/* Phase dot — Phase 2 */}
              <div className="hidden md:flex absolute left-0 top-[calc(33.3%+24px)] w-11 h-11 rounded-full bg-sky-500/20 border-2 border-sky-500/40 items-center justify-center text-sky-400 text-xs font-bold">
                2
              </div>
              <RevealSection>
                <PhaseCard
                  phase="Phase 2"
                  period="Months 3–4"
                  title="Ecosystem Growth"
                  status="upcoming"
                >
                  <PhaseItem>
                    <strong className="text-sky-300">Multi-chain Gate</strong>{" "}
                    — extend Gate to Base, Polygon, Arbitrum mainnet payments
                  </PhaseItem>
                  <PhaseItem>
                    <strong className="text-sky-300">Policy Marketplace</strong>{" "}
                    — on-chain registry where developers publish and share custom
                    policies; import by reference
                  </PhaseItem>
                  <PhaseItem>
                    <strong className="text-sky-300">Aegis SDK for Python</strong>{" "}
                    — Gate + payAndFetch for AutoGPT, CrewAI, and LangChain
                  </PhaseItem>
                  <PhaseItem>
                    <strong className="text-sky-300">Real XMTP Transport</strong>{" "}
                    — replace file-based message bus with live
                    wallet-to-wallet messaging for cross-machine discovery
                  </PhaseItem>
                  <PhaseItem>
                    <strong className="text-sky-300">Facilitator Integration</strong>{" "}
                    — integrate with Coinbase&apos;s x402 facilitator for
                    trustless payment verification
                  </PhaseItem>
                  <PhaseItem>
                    <strong className="text-sky-300">OWS Core PR</strong>{" "}
                    — contribute aegis-budget and aegis-guard as official
                    recommended policies in the OWS repository
                  </PhaseItem>
                </PhaseCard>
              </RevealSection>

              {/* Phase dot — Phase 3 */}
              <div className="hidden md:flex absolute left-0 top-[calc(66.6%+48px)] w-11 h-11 rounded-full bg-violet-500/20 border-2 border-violet-500/40 items-center justify-center text-violet-400 text-xs font-bold">
                3
              </div>
              <RevealSection>
                <PhaseCard
                  phase="Phase 3"
                  period="Months 5–8"
                  title="Agent Economy OS"
                  status="future"
                >
                  <PhaseItem>
                    <strong className="text-violet-300">Aegis Escrow</strong>{" "}
                    — hold payments until service delivery is confirmed;
                    trustless agent-to-agent contracts
                  </PhaseItem>
                  <PhaseItem>
                    <strong className="text-violet-300">Reputation v2</strong>{" "}
                    — on-chain reputation scores; agents query reputation before
                    transacting; cross-economy portability
                  </PhaseItem>
                  <PhaseItem>
                    <strong className="text-violet-300">Agent Orchestrator</strong>{" "}
                    — coordinate agent fleets with budget allocation,
                    auto-scaling, and P&amp;L-based lifecycle management
                  </PhaseItem>
                  <PhaseItem>
                    <strong className="text-violet-300">Analytics AI</strong>{" "}
                    — Claude-powered economy analysis: anomaly detection, cost
                    optimization, and automated budget adjustments
                  </PhaseItem>
                  <PhaseItem>
                    <strong className="text-violet-300">Enterprise Dashboard</strong>{" "}
                    — multi-tenant Nexus with team management, RBAC, SSO, and
                    audit logging
                  </PhaseItem>
                  <PhaseItem>
                    <strong className="text-violet-300">Aegis Protocol Standard</strong>{" "}
                    — publish Gate + Policy + Receipt interfaces as an open
                    standard for agent commerce
                  </PhaseItem>
                </PhaseCard>
              </RevealSection>
            </div>
          </div>
        </div>
      </section>

      {/* ---- PARTNER INTEGRATION DEEPENING ---- */}
      <section className="relative px-6 py-20 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <RevealSection>
            <SectionHeading
              label="Partners"
              title="Partner Integration Deepening"
              subtitle="Each integration evolves from proof-of-concept to production-grade infrastructure."
            />
          </RevealSection>

          <RevealSection>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="text-left px-6 py-4 font-semibold text-muted-foreground uppercase tracking-wider text-xs w-32">
                        Partner
                      </th>
                      <th className="text-left px-6 py-4 font-semibold text-muted-foreground uppercase tracking-wider text-xs">
                        Current
                      </th>
                      <th className="text-left px-6 py-4 font-semibold text-emerald-400/80 uppercase tracking-wider text-xs">
                        Next
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {[
                      {
                        partner: "Solana",
                        current: "Devnet transactions + receipts",
                        next: "Mainnet USDC payments + SPL token support",
                      },
                      {
                        partner: "Zerion",
                        current: "Portfolio balance queries",
                        next: "Real-time balance alerts + DeFi position tracking",
                      },
                      {
                        partner: "Uniblock",
                        current: "Multi-chain token balances",
                        next: "Cross-chain payment routing",
                      },
                      {
                        partner: "Allium",
                        current: "Transaction verification",
                        next: "Real-time payment streaming + analytics",
                      },
                      {
                        partner: "MoonPay",
                        current: "On-ramp reference",
                        next: "Automated agent wallet funding when balance low",
                      },
                      {
                        partner: "XMTP",
                        current: "File-based message bus",
                        next: "Live wallet-to-wallet agent messaging + negotiation",
                      },
                      {
                        partner: "Ripple XRPL",
                        current: "Balance queries",
                        next: "Cross-border agent payments via XRP",
                      },
                      {
                        partner: "OWS",
                        current: "Wallets + policies + signing",
                        next: "Core contributor — policies in official repo",
                      },
                    ].map((row) => (
                      <tr
                        key={row.partner}
                        className="hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-6 py-4 font-semibold text-foreground whitespace-nowrap">
                          {row.partner}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {row.current}
                        </td>
                        <td className="px-6 py-4 text-emerald-300/90">
                          {row.next}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ---- USE OF HACKATHON WINNINGS ---- */}
      <section className="relative px-6 py-20 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <RevealSection>
            <SectionHeading
              label="Prize Allocation"
              title="How We'll Use the Prize"
              subtitle="Every dollar goes back into building Aegis as open-source infrastructure for the OWS ecosystem."
            />
          </RevealSection>

          <RevealSection>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden mb-8">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="text-left px-6 py-4 font-semibold text-muted-foreground uppercase tracking-wider text-xs">
                        Allocation
                      </th>
                      <th className="text-left px-6 py-4 font-semibold text-muted-foreground uppercase tracking-wider text-xs w-20">
                        %
                      </th>
                      <th className="text-left px-6 py-4 font-semibold text-muted-foreground uppercase tracking-wider text-xs">
                        What it funds
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {[
                      {
                        allocation: "Mainnet Deployment",
                        pct: "30%",
                        funds:
                          "Gas fees for Solana + Base mainnet, Zerion/Allium API credits, infrastructure",
                        color: "text-emerald-400",
                        bar: "bg-emerald-500",
                        width: "w-[30%]",
                      },
                      {
                        allocation: "Python SDK",
                        pct: "25%",
                        funds:
                          "Aegis Gate + policies for Python agent frameworks (AutoGPT, CrewAI, LangChain)",
                        color: "text-sky-400",
                        bar: "bg-sky-500",
                        width: "w-[25%]",
                      },
                      {
                        allocation: "Policy Marketplace",
                        pct: "20%",
                        funds:
                          "Smart contract development for on-chain policy registry",
                        color: "text-blue-400",
                        bar: "bg-blue-500",
                        width: "w-[20%]",
                      },
                      {
                        allocation: "Community & Docs",
                        pct: "15%",
                        funds:
                          "Developer documentation, tutorial videos, community building",
                        color: "text-violet-400",
                        bar: "bg-violet-500",
                        width: "w-[15%]",
                      },
                      {
                        allocation: "Security Audit",
                        pct: "10%",
                        funds:
                          "Third-party audit of Gate middleware and policy executables",
                        color: "text-amber-400",
                        bar: "bg-amber-500",
                        width: "w-[10%]",
                      },
                    ].map((row) => (
                      <tr
                        key={row.allocation}
                        className="hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-6 py-4 font-semibold text-foreground">
                          {row.allocation}
                        </td>
                        <td className={`px-6 py-4 font-bold ${row.color}`}>
                          {row.pct}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          <div className="mb-1.5">{row.funds}</div>
                          <div className="h-1 w-full bg-white/[0.04] rounded-full overflow-hidden">
                            <div
                              className={`h-full ${row.bar} ${row.width} rounded-full`}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </RevealSection>

          <RevealSection>
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center">
              <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                Aegis is MIT-licensed and will remain open source. We&apos;re
                building infrastructure, not a product — the more developers who
                use it, the stronger the OWS ecosystem becomes.
              </p>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ---- WHY THIS MATTERS FOR OWS ---- */}
      <section className="relative px-6 py-20 border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto">
          <RevealSection>
            <SectionHeading
              label="The Big Picture"
              title="Why This Matters for OWS"
              subtitle="OWS gave agents wallets. Aegis gives them an economy. Together, they make autonomous agent commerce possible — safe, transparent, and verifiable."
            />
          </RevealSection>

          <div className="grid sm:grid-cols-2 gap-5">
            {[
              {
                icon: "◈",
                title: "Wallets Alone Don't Create Economies",
                body: "OWS is the best wallet standard for agents. But wallets alone don't create economies — you also need earning, governance, visibility, trust, and discovery.",
              },
              {
                icon: "⬡",
                title: "Aegis Fills Every Gap",
                body: "Gate handles earning. Policies handle governance. Nexus provides visibility. Reputation builds trust. XMTP enables discovery. Every layer is covered.",
              },
              {
                icon: "↗",
                title: "A Rising Tide",
                body: "As Aegis grows, OWS becomes more valuable. More policies = more reasons to use OWS. More Gate deployments = more OWS wallets created. Our growth is their growth.",
              },
              {
                icon: "◉",
                title: "The Endgame",
                body: "Aegis becomes the default commerce layer that ships with every OWS installation — the standard way to monetize, govern, and monitor any agent economy.",
              },
            ].map((card, i) => (
              <RevealSection key={i}>
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-7 hover:bg-white/[0.04] hover:border-white/[0.14] transition-all duration-300 h-full">
                  <div className="text-2xl mb-4 text-emerald-400">{card.icon}</div>
                  <h3 className="font-bold text-lg mb-2">{card.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {card.body}
                  </p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ---- FOOTER CTA ---- */}
      <section className="relative px-6 py-24 border-t border-white/[0.06]">
        <div className="max-w-3xl mx-auto text-center">
          <RevealSection>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Want to build with Aegis?
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Start now:
            </p>
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl border border-white/10 bg-white/[0.03] font-mono text-sm text-emerald-300 mb-10 select-all">
              npm install aegis-ows-gate
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="px-6 py-3 rounded-xl bg-emerald-500 text-black font-semibold text-sm hover:bg-emerald-400 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/docs"
                className="px-6 py-3 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold hover:bg-white/10 transition-colors"
              >
                Docs
              </Link>
              <a
                href="https://github.com/rajkaria/aegis"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold hover:bg-white/10 transition-colors"
              >
                GitHub
              </a>
              <a
                href="https://www.npmjs.com/package/aegis-ows-gate"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold hover:bg-white/10 transition-colors"
              >
                npm
              </a>
            </div>
          </RevealSection>
        </div>
      </section>
    </div>
  );
}
