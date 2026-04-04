import { AbsoluteFill, Sequence, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

// ═══════════════════════════════════════════════════════
// SCENE: Explosive Title (0-3s, frames 0-90)
// ═══════════════════════════════════════════════════════
const ExplosiveTitle: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({ frame, fps, config: { damping: 8, stiffness: 80 } });
  const taglineOpacity = interpolate(frame, [30, 50], [0, 1], { extrapolateRight: "clamp" });
  const taglineY = interpolate(frame, [30, 50], [30, 0], { extrapolateRight: "clamp" });
  const glowPulse = Math.sin(frame * 0.15) * 0.3 + 0.7;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a", justifyContent: "center", alignItems: "center" }}>
      {/* Radial glow */}
      <div style={{
        position: "absolute", width: 800, height: 800, borderRadius: "50%",
        background: `radial-gradient(circle, rgba(52,211,153,${0.15 * glowPulse}) 0%, transparent 70%)`,
        transform: `scale(${scale * 1.5})`,
      }} />
      {/* Grid lines */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.04,
        backgroundImage: "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
        backgroundSize: "80px 80px",
      }} />
      {/* AEGIS */}
      <div style={{
        fontSize: 140, fontWeight: 900, letterSpacing: -4,
        background: "linear-gradient(135deg, #34d399, #38bdf8, #a78bfa)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        transform: `scale(${scale})`, fontFamily: "Inter, sans-serif",
      }}>
        AEGIS
      </div>
      {/* Tagline */}
      <div style={{
        position: "absolute", bottom: 280,
        fontSize: 32, color: "rgba(255,255,255,0.8)", fontWeight: 500,
        opacity: taglineOpacity, transform: `translateY(${taglineY}px)`,
        fontFamily: "Inter, sans-serif", letterSpacing: 1,
      }}>
        The Commerce Protocol for Agent Economies
      </div>
      {/* OWS badge */}
      <div style={{
        position: "absolute", bottom: 220,
        fontSize: 16, color: "rgba(52,211,153,0.8)", fontWeight: 600,
        opacity: taglineOpacity, letterSpacing: 3, textTransform: "uppercase",
        fontFamily: "Inter, sans-serif",
      }}>
        Built on Open Wallet Standard
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════
// SCENE: Rapid Features (3-10s, frames 90-300)
// ═══════════════════════════════════════════════════════
const RapidFeatures: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const features = [
    { label: "GATE", desc: "Any API → Paid service", detail: "One line of Express middleware", color: "#34d399", startFrame: 0 },
    { label: "POLICIES", desc: "Budget · Guard · Deadswitch", detail: "OWS-native spending governance", color: "#38bdf8", startFrame: 45 },
    { label: "NEXUS", desc: "Live economy dashboard", detail: "Money flow · P&L · Policy enforcement", color: "#a78bfa", startFrame: 90 },
    { label: "ON-CHAIN", desc: "Real Solana transactions", detail: "Verified on Solana Explorer", color: "#f472b6", startFrame: 135 },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a", justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", gap: 30, flexWrap: "wrap", justifyContent: "center", maxWidth: 1600, padding: "0 60px" }}>
        {features.map((f, i) => {
          const localFrame = frame - f.startFrame;
          const s = spring({ frame: Math.max(0, localFrame), fps, config: { damping: 10, stiffness: 100 } });
          const isActive = localFrame > 0 && localFrame < 100;

          return (
            <div key={i} style={{
              width: 360, padding: "40px 30px", borderRadius: 20,
              background: isActive ? `rgba(${f.color === "#34d399" ? "52,211,153" : f.color === "#38bdf8" ? "56,189,248" : f.color === "#a78bfa" ? "167,139,250" : "244,114,182"},0.08)` : "rgba(255,255,255,0.02)",
              border: `1px solid ${isActive ? f.color + "40" : "rgba(255,255,255,0.06)"}`,
              transform: `scale(${s}) ${isActive ? "translateY(-8px)" : ""}`,
              opacity: s,
              transition: "background 0.3s, border 0.3s",
              boxShadow: isActive ? `0 0 60px ${f.color}15` : "none",
            }}>
              <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: 4, color: f.color, fontFamily: "Inter, sans-serif", marginBottom: 12 }}>
                {f.label}
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "white", fontFamily: "Inter, sans-serif", lineHeight: 1.2 }}>
                {f.desc}
              </div>
              <div style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", fontFamily: "Inter, sans-serif", marginTop: 10 }}>
                {f.detail}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════
// SCENE: Supply Chain Animation (10-17s, frames 300-510)
// ═══════════════════════════════════════════════════════
const SupplyChainHype: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const agents = [
    { name: "research-buyer", pl: "-$0.05", color: "#ef4444", y: 0 },
    { name: "analyst", pl: "+$0.04", color: "#34d399", y: 0 },
    { name: "data-miner", pl: "+$0.01", color: "#34d399", y: 0 },
  ];

  const arrow1Progress = interpolate(frame, [30, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const arrow2Progress = interpolate(frame, [70, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const numbersOpacity = interpolate(frame, [110, 130], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a", justifyContent: "center", alignItems: "center" }}>
      {/* Title */}
      <div style={{
        position: "absolute", top: 120, fontSize: 18, fontWeight: 700,
        letterSpacing: 6, color: "rgba(255,255,255,0.3)", textTransform: "uppercase",
        fontFamily: "Inter, sans-serif",
      }}>
        Agent Supply Chain
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
        {agents.map((agent, i) => {
          const s = spring({ frame: Math.max(0, frame - i * 20), fps, config: { damping: 10 } });
          return (
            <div key={i} style={{ display: "flex", alignItems: "center" }}>
              {/* Agent card */}
              <div style={{
                padding: "30px 40px", borderRadius: 16,
                background: `rgba(${agent.color === "#ef4444" ? "239,68,68" : "52,211,153"},0.08)`,
                border: `1px solid ${agent.color}30`,
                transform: `scale(${s})`, opacity: s,
                textAlign: "center", minWidth: 200,
                boxShadow: `0 0 40px ${agent.color}10`,
              }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: "white", fontFamily: "Inter, sans-serif" }}>
                  {agent.name}
                </div>
                <div style={{
                  fontSize: 32, fontWeight: 800, color: agent.color,
                  fontFamily: "Inter, sans-serif", marginTop: 8, opacity: numbersOpacity,
                }}>
                  {agent.pl}
                </div>
              </div>
              {/* Arrow */}
              {i < 2 && (
                <div style={{ width: 120, height: 4, margin: "0 10px", position: "relative" }}>
                  <div style={{
                    position: "absolute", inset: 0, borderRadius: 2,
                    background: `linear-gradient(90deg, #34d399, #38bdf8)`,
                    transformOrigin: "left",
                    transform: `scaleX(${i === 0 ? arrow1Progress : arrow2Progress})`,
                  }} />
                  <div style={{
                    position: "absolute", right: -8, top: -6,
                    width: 0, height: 0,
                    borderTop: "8px solid transparent", borderBottom: "8px solid transparent",
                    borderLeft: "12px solid #38bdf8",
                    opacity: i === 0 ? arrow1Progress : arrow2Progress,
                  }} />
                  <div style={{
                    position: "absolute", top: -24, left: "50%", transform: "translateX(-50%)",
                    fontSize: 14, fontWeight: 700, color: "#38bdf8",
                    fontFamily: "Inter, sans-serif",
                    opacity: i === 0 ? arrow1Progress : arrow2Progress,
                  }}>
                    {i === 0 ? "$0.05" : "$0.01"}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom text */}
      <div style={{
        position: "absolute", bottom: 140, fontSize: 24, fontWeight: 600,
        color: "rgba(255,255,255,0.7)", fontFamily: "Inter, sans-serif",
        opacity: numbersOpacity,
      }}>
        3 agents · 3 OWS wallets · Real SOL on Solana devnet
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════
// SCENE: Stats Explosion (17-22s, frames 510-660)
// ═══════════════════════════════════════════════════════
const StatsExplosion: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const stats = [
    { number: "7", label: "Partner Integrations", delay: 0 },
    { number: "50", label: "Tests Passing", delay: 10 },
    { number: "7", label: "On-Chain Transactions", delay: 20 },
    { number: "3", label: "OWS Policy Executables", delay: 30 },
    { number: "11", label: "API Routes", delay: 40 },
    { number: "106", label: "Source Files", delay: 50 },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a", justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 30, maxWidth: 1200 }}>
        {stats.map((stat, i) => {
          const s = spring({ frame: Math.max(0, frame - stat.delay), fps, config: { damping: 8, stiffness: 120 } });
          return (
            <div key={i} style={{
              width: 320, padding: "30px 20px", borderRadius: 16,
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
              textAlign: "center", transform: `scale(${s})`, opacity: s,
            }}>
              <div style={{
                fontSize: 64, fontWeight: 900, fontFamily: "Inter, sans-serif",
                background: "linear-gradient(135deg, #34d399, #38bdf8)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>
                {stat.number}
              </div>
              <div style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", fontFamily: "Inter, sans-serif", fontWeight: 600 }}>
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════
// SCENE: Partner Logos (22-26s, frames 660-780)
// ═══════════════════════════════════════════════════════
const Partners: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const partners = [
    "Solana", "Ripple XRPL", "Zerion", "Uniblock",
    "Allium", "MoonPay", "XMTP", "OWS",
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a", justifyContent: "center", alignItems: "center" }}>
      <div style={{
        fontSize: 16, fontWeight: 700, letterSpacing: 6, color: "rgba(255,255,255,0.3)",
        textTransform: "uppercase", fontFamily: "Inter, sans-serif", marginBottom: 50,
      }}>
        Integrated Partners
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 20, maxWidth: 1000 }}>
        {partners.map((name, i) => {
          const s = spring({ frame: Math.max(0, frame - i * 8), fps, config: { damping: 12 } });
          return (
            <div key={i} style={{
              padding: "16px 32px", borderRadius: 12,
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
              fontSize: 20, fontWeight: 600, color: "rgba(255,255,255,0.8)",
              fontFamily: "Inter, sans-serif",
              transform: `scale(${s})`, opacity: s,
            }}>
              {name}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════
// SCENE: Closing CTA (26-30s, frames 780-900)
// ═══════════════════════════════════════════════════════
const ClosingCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const s = spring({ frame, fps, config: { damping: 8 } });
  const urlOpacity = interpolate(frame, [40, 60], [0, 1], { extrapolateRight: "clamp" });
  const glowPulse = Math.sin(frame * 0.1) * 0.4 + 0.6;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a", justifyContent: "center", alignItems: "center" }}>
      {/* Glow */}
      <div style={{
        position: "absolute", width: 600, height: 600, borderRadius: "50%",
        background: `radial-gradient(circle, rgba(52,211,153,${0.12 * glowPulse}) 0%, transparent 70%)`,
      }} />
      {/* Tagline */}
      <div style={{
        fontSize: 48, fontWeight: 800, color: "white", fontFamily: "Inter, sans-serif",
        textAlign: "center", lineHeight: 1.3, transform: `scale(${s})`,
        maxWidth: 900,
      }}>
        OWS is the vault.{"\n"}
        <span style={{
          background: "linear-gradient(135deg, #34d399, #38bdf8)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          Aegis is the economy.
        </span>
      </div>
      {/* URLs */}
      <div style={{
        position: "absolute", bottom: 200, display: "flex", gap: 40,
        opacity: urlOpacity, fontFamily: "Inter, sans-serif",
      }}>
        <div style={{ fontSize: 24, fontWeight: 600, color: "#34d399" }}>useaegis.xyz</div>
        <div style={{ fontSize: 24, fontWeight: 500, color: "rgba(255,255,255,0.5)" }}>github.com/rajkaria/aegis</div>
      </div>
      {/* Badge */}
      <div style={{
        position: "absolute", bottom: 140,
        fontSize: 14, fontWeight: 600, letterSpacing: 3, color: "rgba(255,255,255,0.3)",
        textTransform: "uppercase", fontFamily: "Inter, sans-serif", opacity: urlOpacity,
      }}>
        OWS Hackathon 2026
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════
// MAIN COMPOSITION — 30 seconds, fast cuts
// ═══════════════════════════════════════════════════════
export const Video: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a" }}>
      {/* Title blast: 0-3s */}
      <Sequence from={0} durationInFrames={90}>
        <ExplosiveTitle />
      </Sequence>

      {/* Rapid features: 3-10s */}
      <Sequence from={90} durationInFrames={210}>
        <RapidFeatures />
      </Sequence>

      {/* Supply chain: 10-17s */}
      <Sequence from={300} durationInFrames={210}>
        <SupplyChainHype />
      </Sequence>

      {/* Stats: 17-22s */}
      <Sequence from={510} durationInFrames={150}>
        <StatsExplosion />
      </Sequence>

      {/* Partners: 22-26s */}
      <Sequence from={660} durationInFrames={120}>
        <Partners />
      </Sequence>

      {/* Closing: 26-30s */}
      <Sequence from={780} durationInFrames={120}>
        <ClosingCTA />
      </Sequence>
    </AbsoluteFill>
  );
};
