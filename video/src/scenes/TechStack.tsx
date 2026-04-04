import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

const TechBadge: React.FC<{
  name: string;
  index: number;
  color: string;
}> = ({ name, index, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const delay = 30 + index * 15;

  const scale = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 120 },
  });

  const opacity = interpolate(
    frame,
    [delay, delay + 10],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        background: `${color}15`,
        border: `1px solid ${color}40`,
        borderRadius: 12,
        padding: "16px 28px",
        fontSize: 20,
        fontWeight: 600,
        color,
        letterSpacing: "0.02em",
      }}
    >
      {name}
    </div>
  );
};

export const TechStack: React.FC = () => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const fadeOut = interpolate(frame, [410, 450], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const headerOpacity = interpolate(frame, [0, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const protocols = [
    { name: "OWS", color: "#10b981" },
    { name: "x402", color: "#10b981" },
    { name: "Solana", color: "#9945FF" },
    { name: "XRPL", color: "#0ea5e9" },
    { name: "XMTP", color: "#8b5cf6" },
  ];

  const partners = [
    { name: "Zerion", color: "#2962EF" },
    { name: "Uniblock", color: "#f59e0b" },
    { name: "Allium", color: "#ef4444" },
    { name: "MoonPay", color: "#7c3aed" },
  ];

  const stack = [
    { name: "Next.js", color: "#ffffff" },
    { name: "TypeScript", color: "#3178c6" },
    { name: "Express", color: "#68a063" },
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a0a",
        fontFamily: "Inter, sans-serif",
        opacity: fadeIn * fadeOut,
        padding: 80,
        justifyContent: "center",
      }}
    >
      {/* Header */}
      <div
        style={{
          opacity: headerOpacity,
          fontSize: 48,
          fontWeight: 700,
          color: "#ffffff",
          marginBottom: 60,
          textAlign: "center",
        }}
      >
        Built With
      </div>

      {/* Protocols row */}
      <div style={{ marginBottom: 16, textAlign: "center" }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#525252",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: 16,
          }}
        >
          Protocols
        </div>
        <div
          style={{
            display: "flex",
            gap: 16,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {protocols.map((tech, i) => (
            <TechBadge key={tech.name} {...tech} index={i} />
          ))}
        </div>
      </div>

      {/* Partners row */}
      <div style={{ marginBottom: 16, marginTop: 32, textAlign: "center" }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#525252",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: 16,
          }}
        >
          Partner Integrations
        </div>
        <div
          style={{
            display: "flex",
            gap: 16,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {partners.map((tech, i) => (
            <TechBadge key={tech.name} {...tech} index={i + 5} />
          ))}
        </div>
      </div>

      {/* Stack row */}
      <div style={{ marginTop: 32, textAlign: "center" }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#525252",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: 16,
          }}
        >
          Stack
        </div>
        <div
          style={{
            display: "flex",
            gap: 16,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {stack.map((tech, i) => (
            <TechBadge key={tech.name} {...tech} index={i + 9} />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
