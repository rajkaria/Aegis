import { AbsoluteFill, Sequence, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

const BG = "#050508";
const FONT = "Inter, system-ui, sans-serif";

// ═══════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════
function useSpring(delay = 0) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 12, stiffness: 120 } });
}

function GradientText({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <span style={{
      background: "linear-gradient(135deg, #34d399 0%, #38bdf8 50%, #a78bfa 100%)",
      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
      ...style,
    }}>{children}</span>
  );
}

function Pill({ children, delay = 0 }: { children: string; delay?: number }) {
  const s = useSpring(delay);
  return (
    <div style={{
      padding: "8px 20px", borderRadius: 100, fontSize: 14, fontWeight: 600,
      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
      color: "rgba(255,255,255,0.7)", transform: `scale(${s})`, opacity: s,
      fontFamily: FONT,
    }}>{children}</div>
  );
}

// ═══════════════════════════════════════════════════════
// SCENE 1: Title Slam (0-2.5s / 0-75 frames)
// ═══════════════════════════════════════════════════════
const TitleSlam: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleScale = spring({ frame, fps, config: { damping: 6, stiffness: 100 } });
  const subOpacity = interpolate(frame, [25, 45], [0, 1], { extrapolateRight: "clamp" });
  const badgeOpacity = interpolate(frame, [40, 55], [0, 1], { extrapolateRight: "clamp" });
  const glow = Math.sin(frame * 0.12) * 0.3 + 0.7;

  return (
    <AbsoluteFill style={{ backgroundColor: BG, justifyContent: "center", alignItems: "center" }}>
      <div style={{ position: "absolute", width: 900, height: 900, borderRadius: "50%",
        background: `radial-gradient(circle, rgba(52,211,153,${0.12 * glow}) 0%, rgba(56,189,248,${0.08 * glow}) 40%, transparent 70%)`,
        transform: `scale(${titleScale * 1.2})`,
      }} />
      <div style={{ position: "absolute", inset: 0, opacity: 0.03,
        backgroundImage: "linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />
      <div style={{ textAlign: "center", position: "relative" }}>
        <div style={{ fontSize: 130, fontWeight: 900, letterSpacing: -5, fontFamily: FONT,
          transform: `scale(${titleScale})`,
        }}>
          <GradientText>AEGIS</GradientText>
        </div>
        <div style={{ fontSize: 26, fontWeight: 500, color: "rgba(255,255,255,0.8)", marginTop: -5,
          opacity: subOpacity, fontFamily: FONT, letterSpacing: 1,
        }}>
          The Commerce Protocol for Agent Economies
        </div>
        <div style={{ marginTop: 20, opacity: badgeOpacity, fontSize: 13, fontWeight: 600,
          color: "#34d399", letterSpacing: 3, textTransform: "uppercase", fontFamily: FONT,
        }}>
          Published on npm &middot; Live on Solana &middot; Built on OWS
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════
// SCENE 2: Feature Barrage (2.5-8s / 75-240 frames)
// Rapid-fire feature cards with staggered animations
// ═══════════════════════════════════════════════════════
const FeatureBarrage: React.FC = () => {
  const frame = useCurrentFrame();

  const features = [
    { label: "GATE", stat: "npm install", desc: "Any API → paid in one line", color: "#34d399", start: 0 },
    { label: "POLICIES", stat: "3 executables", desc: "Budget · Guard · Deadswitch", color: "#38bdf8", start: 25 },
    { label: "NEXUS", stat: "Live dashboard", desc: "Money flow · P&L · AI insights", color: "#a78bfa", start: 50 },
    { label: "ON-CHAIN", stat: "7 verified txs", desc: "Solana devnet + receipts", color: "#f472b6", start: 75 },
    { label: "MCP", stat: "7 tools", desc: "Claude & Cursor native", color: "#fbbf24", start: 100 },
    { label: "AUTONOMOUS", stat: "Self-deciding", desc: "Agents buy/skip independently", color: "#06b6d4", start: 125 },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: BG, justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 16, maxWidth: 1500, padding: "0 40px" }}>
        {features.map((f, i) => {
          const localFrame = frame - f.start;
          const s = spring({ frame: Math.max(0, localFrame), fps: 30, config: { damping: 10, stiffness: 130 } });
          const isActive = localFrame > 0 && localFrame < 80;
          const r = parseInt(f.color.slice(1, 3), 16);
          const g = parseInt(f.color.slice(3, 5), 16);
          const b = parseInt(f.color.slice(5, 7), 16);

          return (
            <div key={i} style={{
              width: 440, padding: "24px 28px", borderRadius: 16,
              background: isActive ? `rgba(${r},${g},${b},0.06)` : "rgba(255,255,255,0.015)",
              border: `1px solid ${isActive ? f.color + "30" : "rgba(255,255,255,0.05)"}`,
              transform: `scale(${s})${isActive ? " translateY(-4px)" : ""}`,
              opacity: s, transition: "background 0.2s, border 0.2s",
              boxShadow: isActive ? `0 0 40px rgba(${r},${g},${b},0.08)` : "none",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, color: f.color, fontFamily: FONT }}>
                  {f.label}
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", fontFamily: FONT }}>
                  {f.stat}
                </div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "white", fontFamily: FONT, lineHeight: 1.2 }}>
                {f.desc}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════
// SCENE 3: Supply Chain + Numbers (8-14s / 240-420 frames)
// ═══════════════════════════════════════════════════════
const SupplyChainBlast: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const agents = [
    { name: "research-buyer", pl: "-$0.05", color: "#ef4444" },
    { name: "analyst", pl: "+$0.04", color: "#34d399" },
    { name: "data-miner", pl: "+$0.01", color: "#34d399" },
  ];

  const arrow1 = interpolate(frame, [25, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const arrow2 = interpolate(frame, [55, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const numbersIn = interpolate(frame, [85, 100], [0, 1], { extrapolateRight: "clamp" });

  // Stats that fly in at the bottom
  const stats = [
    { n: "130", l: "Source Files" }, { n: "50", l: "Tests" }, { n: "16", l: "API Routes" },
    { n: "8", l: "Partners" }, { n: "7", l: "On-Chain Txs" }, { n: "3", l: "Tracks" },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: BG, justifyContent: "center", alignItems: "center" }}>
      <div style={{ position: "absolute", top: 70, fontSize: 14, fontWeight: 700,
        letterSpacing: 5, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", fontFamily: FONT,
      }}>Agent Supply Chain &middot; Real Solana Transactions</div>

      {/* Supply chain flow */}
      <div style={{ display: "flex", alignItems: "center", marginTop: -40 }}>
        {agents.map((agent, i) => {
          const s = spring({ frame: Math.max(0, frame - i * 15), fps, config: { damping: 10 } });
          return (
            <div key={i} style={{ display: "flex", alignItems: "center" }}>
              <div style={{
                padding: "22px 32px", borderRadius: 14, textAlign: "center", minWidth: 180,
                background: `rgba(${agent.color === "#ef4444" ? "239,68,68" : "52,211,153"},0.07)`,
                border: `1px solid ${agent.color}25`,
                transform: `scale(${s})`, opacity: s,
                boxShadow: `0 0 30px ${agent.color}08`,
              }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: "white", fontFamily: FONT }}>{agent.name}</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: agent.color, fontFamily: FONT, marginTop: 4, opacity: numbersIn }}>
                  {agent.pl}
                </div>
              </div>
              {i < 2 && (
                <div style={{ width: 100, height: 3, margin: "0 8px", position: "relative" }}>
                  <div style={{ position: "absolute", inset: 0, borderRadius: 2,
                    background: "linear-gradient(90deg, #34d399, #38bdf8)",
                    transformOrigin: "left", transform: `scaleX(${i === 0 ? arrow1 : arrow2})`,
                  }} />
                  <div style={{ position: "absolute", right: -6, top: -5, width: 0, height: 0,
                    borderTop: "7px solid transparent", borderBottom: "7px solid transparent",
                    borderLeft: "10px solid #38bdf8", opacity: i === 0 ? arrow1 : arrow2,
                  }} />
                  <div style={{ position: "absolute", top: -20, left: "50%", transform: "translateX(-50%)",
                    fontSize: 12, fontWeight: 700, color: "#38bdf8", fontFamily: FONT,
                    opacity: i === 0 ? arrow1 : arrow2,
                  }}>{i === 0 ? "$0.05" : "$0.01"}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Stats bar */}
      <div style={{ position: "absolute", bottom: 80, display: "flex", gap: 20 }}>
        {stats.map((st, i) => {
          const s = spring({ frame: Math.max(0, frame - 100 - i * 8), fps, config: { damping: 12 } });
          return (
            <div key={i} style={{
              textAlign: "center", transform: `scale(${s})`, opacity: s,
              padding: "10px 18px", borderRadius: 10,
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
            }}>
              <div style={{ fontSize: 28, fontWeight: 900, fontFamily: FONT }}>
                <GradientText>{st.n}</GradientText>
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontFamily: FONT, fontWeight: 600 }}>
                {st.l}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════
// SCENE 4: Security + Partners Flash (14-20s / 420-600 frames)
// ═══════════════════════════════════════════════════════
const SecurityAndPartners: React.FC = () => {
  const frame = useCurrentFrame();

  const security = [
    "EIP-712 Signatures", "Chain-Agnostic Verification", "Rate Limiting",
    "On-Chain Receipts", "Webhook Alerts", "File Locking",
  ];

  const partners = [
    "Solana", "Ripple XRPL", "Zerion", "Uniblock",
    "Allium", "MoonPay", "XMTP", "OWS",
  ];

  const securityDone = frame > 80;

  return (
    <AbsoluteFill style={{ backgroundColor: BG, justifyContent: "center", alignItems: "center" }}>
      {!securityDone ? (
        // Security pills
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 5, color: "rgba(255,255,255,0.25)",
            textTransform: "uppercase", fontFamily: FONT, marginBottom: 30,
          }}>Production Security</div>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12, maxWidth: 800 }}>
            {security.map((s, i) => <Pill key={i} delay={i * 8}>{s}</Pill>)}
          </div>
        </div>
      ) : (
        // Partners
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 5, color: "rgba(255,255,255,0.25)",
            textTransform: "uppercase", fontFamily: FONT, marginBottom: 30,
          }}>8 Partner Integrations</div>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 14, maxWidth: 900 }}>
            {partners.map((name, i) => {
              const s = spring({ frame: Math.max(0, frame - 80 - i * 7), fps: 30, config: { damping: 12 } });
              return (
                <div key={i} style={{
                  padding: "14px 28px", borderRadius: 12, fontSize: 18, fontWeight: 600,
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                  color: "rgba(255,255,255,0.8)", transform: `scale(${s})`, opacity: s, fontFamily: FONT,
                }}>
                  {name}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════
// SCENE 5: npm Install Proof (20-24s / 600-720 frames)
// ═══════════════════════════════════════════════════════
const NpmProof: React.FC = () => {
  const frame = useCurrentFrame();
  const line1 = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const line2 = interpolate(frame, [25, 45], [0, 1], { extrapolateRight: "clamp" });
  const line3 = interpolate(frame, [50, 70], [0, 1], { extrapolateRight: "clamp" });
  const badge = interpolate(frame, [75, 90], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: BG, justifyContent: "center", alignItems: "center" }}>
      <div style={{ maxWidth: 800, width: "100%" }}>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 5, color: "rgba(255,255,255,0.25)",
          textTransform: "uppercase", fontFamily: FONT, marginBottom: 24, textAlign: "center",
        }}>Ready to Use — Right Now</div>

        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 16, padding: 32, fontFamily: "JetBrains Mono, monospace",
        }}>
          <div style={{ opacity: line1, fontSize: 18, color: "#34d399", marginBottom: 16 }}>
            $ npm install aegis-ows-gate
          </div>
          <div style={{ opacity: line2, fontSize: 15, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>
            {`import { aegisGate } from "aegis-ows-gate";`}
          </div>
          <div style={{ opacity: line3, fontSize: 15, color: "rgba(255,255,255,0.5)" }}>
            {`app.get("/api", aegisGate({ price: "0.001" }), handler);`}
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 24, opacity: badge }}>
          <span style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.3)",
            borderRadius: 100, padding: "8px 24px", fontSize: 14, fontWeight: 600,
            color: "#34d399", fontFamily: FONT,
          }}>
            402 → Pay → 200 &middot; Verified end-to-end
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════
// SCENE 6: Closing CTA (24-30s / 720-900 frames)
// ═══════════════════════════════════════════════════════
const ClosingCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const s = spring({ frame, fps: 30, config: { damping: 8 } });
  const urlOpacity = interpolate(frame, [35, 55], [0, 1], { extrapolateRight: "clamp" });
  const glow = Math.sin(frame * 0.1) * 0.4 + 0.6;

  return (
    <AbsoluteFill style={{ backgroundColor: BG, justifyContent: "center", alignItems: "center" }}>
      <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%",
        background: `radial-gradient(circle, rgba(52,211,153,${0.1 * glow}) 0%, rgba(56,189,248,${0.06 * glow}) 40%, transparent 70%)`,
      }} />
      <div style={{ textAlign: "center", position: "relative" }}>
        <div style={{ fontSize: 44, fontWeight: 800, color: "white", fontFamily: FONT,
          lineHeight: 1.3, transform: `scale(${s})`, maxWidth: 800,
        }}>
          OWS is the vault.<br />
          <GradientText style={{ fontSize: 48 }}>Aegis is the economy.</GradientText>
        </div>
        <div style={{ marginTop: 40, display: "flex", justifyContent: "center", gap: 32,
          opacity: urlOpacity, fontFamily: FONT,
        }}>
          <div style={{ fontSize: 22, fontWeight: 600, color: "#34d399" }}>useaegis.xyz</div>
          <div style={{ fontSize: 22, fontWeight: 500, color: "rgba(255,255,255,0.4)" }}>github.com/rajkaria/aegis</div>
        </div>
        <div style={{ marginTop: 16, display: "flex", justifyContent: "center", gap: 20,
          opacity: urlOpacity, fontFamily: FONT,
        }}>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>npm: aegis-ows-gate</span>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>Live x402: useaegis.xyz/api/x402/scrape</span>
        </div>
        <div style={{ marginTop: 24, opacity: urlOpacity, fontSize: 12, fontWeight: 600,
          letterSpacing: 3, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", fontFamily: FONT,
        }}>
          OWS Hackathon 2026
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════
// MAIN — 30 seconds, 6 scenes, fast cuts
// ═══════════════════════════════════════════════════════
export const Video: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <Sequence from={0} durationInFrames={75}>
        <TitleSlam />
      </Sequence>
      <Sequence from={75} durationInFrames={165}>
        <FeatureBarrage />
      </Sequence>
      <Sequence from={240} durationInFrames={180}>
        <SupplyChainBlast />
      </Sequence>
      <Sequence from={420} durationInFrames={180}>
        <SecurityAndPartners />
      </Sequence>
      <Sequence from={600} durationInFrames={120}>
        <NpmProof />
      </Sequence>
      <Sequence from={720} durationInFrames={180}>
        <ClosingCTA />
      </Sequence>
    </AbsoluteFill>
  );
};
