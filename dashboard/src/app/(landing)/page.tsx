"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

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

function RevealSection({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useReveal();
  return <div ref={ref} id={id} className={`opacity-0 ${className}`}>{children}</div>;
}

function DotGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl animate-pulse-glow animation-delay-600" />
      <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-violet-500/8 rounded-full blur-3xl animate-pulse-glow animation-delay-400" />
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="group relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 transition-all duration-300 hover:scale-[1.02] hover:border-white/20 hover:shadow-[0_0_40px_-12px_rgba(52,211,153,0.15)]">
      <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-sky-500/20 border border-white/10">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function useCountUp(target: number, duration = 1500) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
          const computed = window.getComputedStyle(el);
          if (parseFloat(computed.opacity) > 0.5) {
            observer.unobserve(el);
            setStarted(true);
          }
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    const interval = setInterval(() => {
      if (!el) return;
      const computed = window.getComputedStyle(el);
      if (parseFloat(computed.opacity) > 0.5 && el.getBoundingClientRect().top < window.innerHeight) {
        clearInterval(interval);
        setStarted(true);
      }
    }, 200);
    return () => { observer.disconnect(); clearInterval(interval); };
  }, []);

  useEffect(() => {
    if (!started) return;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, target, duration]);

  return { count, ref };
}

function StatPill({ value, label, animate }: { value: string; label: string; animate?: number }) {
  const { count, ref } = useCountUp(animate ?? 0);
  return (
    <div className="text-center px-6" ref={animate !== undefined ? ref : undefined}>
      <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">
        {animate !== undefined ? count : value}
      </div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="relative min-h-screen">
      <DotGrid />

      {/* ---- HERO ---- */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-extrabold tracking-tight mb-6 animate-slide-in-up">
            <span className="bg-gradient-to-r from-emerald-400 via-sky-400 to-violet-400 bg-clip-text text-transparent animate-gradient">
              Aegis
            </span>
          </h1>

          <p className="text-xl sm:text-2xl font-medium text-foreground/90 mb-4 animate-slide-in-up animation-delay-200">
            The Commerce Protocol for Agent Economies
          </p>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-in-up animation-delay-400">
            Deploy unlimited agents with their own wallets. Monetize any API with one line of code.
            Enforce spending policies before every transaction. See everything in one dashboard.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-in-up animation-delay-600">
            <Link href="/dashboard?demo=true" className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 text-white font-semibold text-sm transition-all hover:shadow-[0_0_30px_-5px_rgba(52,211,153,0.4)] hover:scale-105">
              View Live Demo
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Link>
            <Link href="/signup" className="inline-flex items-center gap-2 px-8 py-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 backdrop-blur-sm text-sm font-medium text-emerald-300 hover:bg-emerald-500/10 transition-all">
              Sign Up Free
            </Link>
            <Link href="/docs" className="inline-flex items-center gap-2 px-8 py-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm text-sm font-medium text-foreground hover:bg-white/10 transition-all">
              Read Docs
            </Link>
          </div>
        </div>
      </section>

      {/* ---- STATS BAR ---- */}
      <RevealSection className="pb-20 px-6">
        <div className="max-w-3xl mx-auto flex flex-wrap justify-center gap-8 sm:gap-12 py-8 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
          <StatPill value="Unlimited" label="Agents & Wallets" />
          <StatPill value="8" label="Chains Supported" animate={8} />
          <StatPill value="3" label="Built-in Policies" animate={3} />
          <StatPill value="7" label="On-Chain Transactions" animate={7} />
        </div>
      </RevealSection>

      {/* ---- WHAT AEGIS DOES ---- */}
      <RevealSection className="py-24 px-6" id="features">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything You Need for Agent Economies</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Aegis is the missing layer between OWS wallets and a functioning economy. It handles monetization, governance, discovery, visibility, reputation, and fleet management — so you focus on your agents.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<svg className="w-6 h-6 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>}
              title="Monetize Any API"
              description="One line of Express middleware turns any endpoint into a paid x402 service. EIP-712 signed payments with automatic revenue tracking."
            />
            <FeatureCard
              icon={<svg className="w-6 h-6 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></svg>}
              title="Policy Guardrails"
              description="Budget caps, address allowlists, and a dead man's switch. Three fail-closed policies that evaluate every transaction before it's signed."
            />
            <FeatureCard
              icon={<svg className="w-6 h-6 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><circle cx="5" cy="6" r="2" /><circle cx="19" cy="6" r="2" /><circle cx="5" cy="18" r="2" /><circle cx="19" cy="18" r="2" /><path d="M7 7l3 3M17 7l-3 3M7 17l3-3M17 17l-3-3" /></svg>}
              title="Economy Dashboard"
              description="Money flow visualization, per-agent P&L, AI-powered insights, interactive policy editor, and on-chain receipt verification in real-time."
            />
            <FeatureCard
              icon={<svg className="w-6 h-6 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>}
              title="Agent Communication"
              description="12 structured XMTP message types for discovery, negotiation, health checks, receipts, reputation, SLAs, disputes, and supply chain coordination."
            />
            <FeatureCard
              icon={<svg className="w-6 h-6 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>}
              title="Reputation & Trust"
              description="0-100 reputation scores per agent. Levels from New to Elite based on payment history, policy compliance, and peer gossip."
            />
            <FeatureCard
              icon={<svg className="w-6 h-6 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>}
              title="Full Control Panel"
              description="Create wallets, register policies, fund agents, and send real on-chain payments from the browser. CLI and MCP server included."
            />
          </div>
        </div>
      </RevealSection>

      {/* ---- WHY AEGIS FOR OWS ---- */}
      <RevealSection className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Supercharge Your OWS Implementation</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              OWS gives agents wallets. Aegis gives them an economy. Every feature plugs directly into OWS&apos;s architecture — policies use the native engine, payments flow through the signing enclave, keys never leave the vault.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-6">
              <div className="text-emerald-400 text-sm font-bold mb-2">Without Aegis</div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">✗</span> Agents have wallets but no way to earn</li>
                <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">✗</span> No spending limits — agents can drain wallets</li>
                <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">✗</span> No visibility into what agents are doing</li>
                <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">✗</span> Agents can&apos;t find or pay each other</li>
                <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">✗</span> No audit trail of payments</li>
              </ul>
            </div>
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03] p-6">
              <div className="text-emerald-400 text-sm font-bold mb-2">With Aegis</div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">✓</span> Any API becomes a revenue source via x402</li>
                <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">✓</span> Budget, guard, and deadswitch policies on every tx</li>
                <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">✓</span> Real-time dashboard with money flow + P&L</li>
                <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">✓</span> XMTP discovery + HTTP registry for agent-to-agent</li>
                <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">✓</span> On-chain receipts anchored to Solana</li>
                <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">✓</span> Agent reputation scores + fleet-wide monitoring</li>
              </ul>
            </div>
          </div>
        </div>
      </RevealSection>

      {/* ---- HOW IT WORKS ---- */}
      <RevealSection className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Three Layers, One Protocol</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-6 text-center">
              <div className="text-emerald-400 font-bold text-lg mb-2">Gate</div>
              <p className="text-sm text-muted-foreground">Express middleware that wraps any API behind x402 micropayments. One line of code.</p>
            </div>
            <div className="rounded-2xl border border-sky-500/20 bg-sky-500/[0.04] p-6 text-center">
              <div className="text-sky-400 font-bold text-lg mb-2">Policies</div>
              <p className="text-sm text-muted-foreground">Budget caps, address guards, and a dead man&apos;s switch. Runs before every payment is signed.</p>
            </div>
            <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.04] p-6 text-center">
              <div className="text-violet-400 font-bold text-lg mb-2">Nexus</div>
              <p className="text-sm text-muted-foreground">Real-time dashboard with money flow, per-agent P&L, AI insights, and policy enforcement.</p>
            </div>
          </div>

          {/* Supply Chain */}
          <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 sm:p-12">
            <p className="text-sm text-muted-foreground text-center mb-6">Agents buying from agents — a real supply chain:</p>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-8 sm:gap-4">
              <div className="text-center flex-1">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-500/5 border border-red-500/20 mb-3">
                  <span className="text-2xl font-bold text-red-400">B</span>
                </div>
                <div className="font-semibold text-sm">Buyer</div>
                <div className="text-xs text-muted-foreground mt-1">spends $0.05</div>
              </div>
              <div className="hidden sm:flex flex-col items-center gap-1 shrink-0">
                <div className="text-xs text-emerald-400 font-mono">$0.05</div>
                <div className="w-24 h-px bg-gradient-to-r from-emerald-500 to-sky-500 relative">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[4px] border-b-[4px] border-l-[6px] border-t-transparent border-b-transparent border-l-sky-500" />
                </div>
              </div>
              <div className="sm:hidden w-px h-8 bg-gradient-to-b from-emerald-500 to-sky-500" />
              <div className="text-center flex-1">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20 mb-3">
                  <span className="text-2xl font-bold text-emerald-400">A</span>
                </div>
                <div className="font-semibold text-sm">Analyst</div>
                <div className="text-xs text-emerald-400 mt-1">+$0.04 profit</div>
              </div>
              <div className="hidden sm:flex flex-col items-center gap-1 shrink-0">
                <div className="text-xs text-sky-400 font-mono">$0.01</div>
                <div className="w-24 h-px bg-gradient-to-r from-sky-500 to-violet-500 relative">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[4px] border-b-[4px] border-l-[6px] border-t-transparent border-b-transparent border-l-violet-500" />
                </div>
              </div>
              <div className="sm:hidden w-px h-8 bg-gradient-to-b from-sky-500 to-violet-500" />
              <div className="text-center flex-1">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20 mb-3">
                  <span className="text-2xl font-bold text-emerald-400">M</span>
                </div>
                <div className="font-semibold text-sm">Miner</div>
                <div className="text-xs text-emerald-400 mt-1">+$0.01 earned</div>
              </div>
            </div>
          </div>
        </div>
      </RevealSection>

      {/* ---- END-TO-END AGENT MESSAGING ---- */}
      <RevealSection className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-3">Powered by XMTP</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">End-to-End Messaging for Agents</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Agents don&apos;t just pay each other &mdash; they talk. Aegis uses XMTP to give every agent a secure, decentralized communication channel for discovery, negotiation, and coordination.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5">
              <div className="text-lg mb-2">🔍</div>
              <h4 className="font-semibold text-sm">Service Discovery</h4>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">Agents broadcast capabilities and find each other by keyword &mdash; no central registry required.</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5">
              <div className="text-lg mb-2">💬</div>
              <h4 className="font-semibold text-sm">Price Negotiation</h4>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">Buyers propose prices, sellers counter-offer. Deals happen before any payment is signed.</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5">
              <div className="text-lg mb-2">🏥</div>
              <h4 className="font-semibold text-sm">Health Monitoring</h4>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">Ping/pong checks verify agent availability and queue depth before committing funds.</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5">
              <div className="text-lg mb-2">⭐</div>
              <h4 className="font-semibold text-sm">Reputation Gossip</h4>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">Agents share trust observations after transactions, building a decentralized trust graph.</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5">
              <div className="text-lg mb-2">📋</div>
              <h4 className="font-semibold text-sm">SLAs &amp; Disputes</h4>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">Formal service agreements with uptime guarantees. Automated dispute resolution when things go wrong.</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5">
              <div className="text-lg mb-2">🔗</div>
              <h4 className="font-semibold text-sm">Supply Chains</h4>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">Coordinate multi-agent workflows with named groups, roles, and end-to-end tracking.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">12 structured message types over encrypted XMTP channels</p>
            <div className="relative overflow-hidden mask-gradient">
              <div className="flex gap-3 text-xs animate-ticker whitespace-nowrap">
                {[...["service_announcement", "service_query", "negotiation_offer", "negotiation_response", "health_ping", "health_pong", "payment_receipt", "reputation_gossip", "sla_agreement", "supply_chain_invite", "business_card", "dispute"], ...["service_announcement", "service_query", "negotiation_offer", "negotiation_response", "health_ping", "health_pong", "payment_receipt", "reputation_gossip", "sla_agreement", "supply_chain_invite", "business_card", "dispute"]].map((t, i) => (
                  <span key={`${t}-${i}`} className="px-2.5 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 font-mono text-emerald-400/80 shrink-0">{t}</span>
                ))}
              </div>
            </div>
            <style>{`
              @keyframes ticker {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
              .animate-ticker { animation: ticker 30s linear infinite; }
              .animate-ticker:hover { animation-play-state: paused; }
              .mask-gradient { mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent); -webkit-mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent); }
            `}</style>
            <div className="mt-6">
              <Link href="/docs/xmtp" className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
                Read the full XMTP guide &rarr;
              </Link>
            </div>
          </div>
        </div>
      </RevealSection>

      {/* ---- REAL ON-CHAIN ---- */}
      <RevealSection className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Real Blockchain. Not Mocks.</h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg mb-8">
            Every payment is a real transaction signed through OWS&apos;s secure enclave and broadcast to Solana. Receipts are anchored on-chain via the Memo program.
          </p>
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">Verified Transaction</p>
            <a href="https://explorer.solana.com/tx/JEX7PjWZLia2NpRVSZGFBUvhqP6cqXMWv5NKXHf2JjZZxkim8Ni5wuiVziNmdLwo4kBLVV7pGM1X3cnhywqb5GA?cluster=devnet" target="_blank" rel="noopener noreferrer" className="inline-block font-mono text-sm text-emerald-400 hover:text-emerald-300 break-all transition-colors">
              JEX7PjWZLia2NpRVSZGFBUvhqP6cqXMWv5NKXHf2JjZZxkim8Ni5wuiVziNmdLwo4kBLVV7pGM1X3cnhywqb5GA
            </a>
            <p className="text-xs text-muted-foreground mt-3">research-buyer &rarr; analyst &mdash; 0.005 SOL on Solana devnet</p>
          </div>
        </div>
      </RevealSection>

      {/* ---- PRODUCTION SECURITY ---- */}
      <RevealSection className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-6">Production Security</p>
          <div className="flex flex-wrap justify-center gap-3 text-xs text-muted-foreground">
            {["EIP-712 Signature Verification", "Chain-Agnostic Settlement", "Rate Limiting", "On-Chain Receipts", "Webhook Alerts", "File Locking", "Input Sanitization", "Replay Protection"].map(f => (
              <span key={f} className="px-3 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.02]">{f}</span>
            ))}
          </div>
        </div>
      </RevealSection>

      {/* ---- PARTNERS ---- */}
      <RevealSection className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-10">Integrated Partners</h2>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {["Solana", "Stellar", "Ripple XRPL", "Zerion", "Uniblock", "Allium", "MoonPay", "XMTP", "OWS"].map(name => (
              <span key={name} className="px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm text-sm font-medium text-foreground/80">{name}</span>
            ))}
          </div>
        </div>
      </RevealSection>

      {/* ---- CTA ---- */}
      <RevealSection className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-2xl sm:text-3xl font-bold mb-3">OWS is the vault. Aegis is the economy.</p>
          <p className="text-muted-foreground mb-10">The first complete commerce protocol for the Open Wallet Standard.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard?demo=true" className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 text-white font-semibold text-sm transition-all hover:shadow-[0_0_30px_-5px_rgba(52,211,153,0.4)] hover:scale-105">Try Live Demo</Link>
            <Link href="/signup" className="inline-flex items-center gap-2 px-8 py-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-sm font-medium text-emerald-300 hover:bg-emerald-500/10 transition-all">Sign Up Free</Link>
            <Link href="/docs" className="inline-flex items-center gap-2 px-8 py-3 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-foreground hover:bg-white/10 transition-all">Documentation</Link>
            <a href="https://github.com/rajkaria/aegis" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-8 py-3 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-foreground hover:bg-white/10 transition-all">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
              GitHub
            </a>
          </div>
        </div>
      </RevealSection>

      {/* ---- FOOTER ---- */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <img src="/favicon.svg" alt="Aegis" className="w-4 h-4" />
            Aegis Protocol
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Built for OWS Hackathon 2026
          </div>
          <div>MIT License</div>
        </div>
      </footer>
    </div>
  );
}
