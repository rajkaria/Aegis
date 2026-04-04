import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

const AgentNode: React.FC<{
  name: string;
  pnl: string;
  pnlColor: string;
  x: number;
  y: number;
  delay: number;
}> = ({ name, pnl, pnlColor, x, y, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  const pnlOpacity = interpolate(
    frame,
    [delay + 80, delay + 100],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `scale(${scale})`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: 20,
          background: "linear-gradient(135deg, #171717, #1a1a2e)",
          border: "1px solid #262626",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <div
          style={{
            fontSize: 40,
            marginBottom: 8,
          }}
        >
          {name === "research-buyer" ? "\uD83D\uDD0D" : name === "analyst" ? "\uD83D\uDCCA" : "\u26CF\uFE0F"}
        </div>
        <div
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: "#e5e5e5",
            textAlign: "center",
          }}
        >
          {name}
        </div>
      </div>
      <div
        style={{
          opacity: pnlOpacity,
          marginTop: 16,
          fontSize: 28,
          fontWeight: 700,
          color: pnlColor,
          fontFamily: "monospace",
        }}
      >
        {pnl}
      </div>
    </div>
  );
};

const AnimatedArrow: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  delay: number;
  label: string;
}> = ({ x1, y1, x2, y2, delay, label }) => {
  const frame = useCurrentFrame();

  const progress = interpolate(
    frame,
    [delay, delay + 40],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const labelOpacity = interpolate(
    frame,
    [delay + 20, delay + 40],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2 - 30;

  return (
    <svg
      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
    >
      <defs>
        <linearGradient id={`grad-${delay}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
        <marker
          id={`arrowhead-${delay}`}
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#0ea5e9" />
        </marker>
      </defs>
      <line
        x1={x1}
        y1={y1}
        x2={x1 + (x2 - x1) * progress}
        y2={y1 + (y2 - y1) * progress}
        stroke={`url(#grad-${delay})`}
        strokeWidth={3}
        markerEnd={progress > 0.9 ? `url(#arrowhead-${delay})` : undefined}
        strokeDasharray="8 4"
      />
      <text
        x={midX}
        y={midY}
        textAnchor="middle"
        fill="#10b981"
        fontSize={18}
        fontWeight={600}
        fontFamily="monospace"
        opacity={labelOpacity}
      >
        {label}
      </text>
    </svg>
  );
};

export const SupplyChain: React.FC = () => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const fadeOut = interpolate(frame, [560, 600], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const headerOpacity = interpolate(frame, [0, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const footerOpacity = interpolate(frame, [300, 340], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a0a",
        fontFamily: "Inter, sans-serif",
        opacity: fadeIn * fadeOut,
        padding: 80,
      }}
    >
      {/* Header */}
      <div
        style={{
          opacity: headerOpacity,
          fontSize: 20,
          fontWeight: 600,
          color: "#10b981",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: 12,
        }}
      >
        Live Demo
      </div>
      <div
        style={{
          opacity: headerOpacity,
          fontSize: 48,
          fontWeight: 700,
          color: "#ffffff",
          marginBottom: 40,
        }}
      >
        The Agent Supply Chain
      </div>

      {/* Flow diagram */}
      <div style={{ position: "relative", height: 400, marginTop: 20 }}>
        {/* Arrows */}
        <AnimatedArrow
          x1={550}
          y1={170}
          x2={800}
          y2={170}
          delay={80}
          label="$0.03"
        />
        <AnimatedArrow
          x1={1000}
          y1={170}
          x2={1250}
          y2={170}
          delay={130}
          label="$0.02"
        />

        {/* Agents */}
        <AgentNode
          name="research-buyer"
          pnl="-$0.05"
          pnlColor="#ef4444"
          x={350}
          y={80}
          delay={20}
        />
        <AgentNode
          name="analyst"
          pnl="+$0.01"
          pnlColor="#10b981"
          x={800}
          y={80}
          delay={50}
        />
        <AgentNode
          name="data-miner"
          pnl="+$0.04"
          pnlColor="#10b981"
          x={1250}
          y={80}
          delay={80}
        />
      </div>

      {/* Footer text */}
      <div
        style={{
          opacity: footerOpacity,
          textAlign: "center",
          fontSize: 28,
          fontWeight: 500,
          color: "#a3a3a3",
          marginTop: 20,
        }}
      >
        3 agents. 3 OWS wallets.{" "}
        <span style={{ color: "#10b981", fontWeight: 700 }}>
          Real Solana transactions.
        </span>
      </div>
    </AbsoluteFill>
  );
};
