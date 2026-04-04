import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

const FeatureCard: React.FC<{
  title: string;
  icon: string;
  index: number;
  color: string;
}> = ({ title, icon, index, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const row = Math.floor(index / 3);
  const col = index % 3;
  const delay = 40 + index * 30;

  const scale = spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  const opacity = interpolate(
    frame,
    [delay, delay + 15],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        background: "linear-gradient(135deg, #171717, #1a1a2e)",
        borderRadius: 20,
        padding: 36,
        border: `1px solid ${color}33`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        width: 300,
        height: 180,
      }}
    >
      <div style={{ fontSize: 42 }}>{icon}</div>
      <div
        style={{
          fontSize: 20,
          fontWeight: 600,
          color: "#e5e5e5",
          textAlign: "center",
        }}
      >
        {title}
      </div>
    </div>
  );
};

export const DashboardPreview: React.FC = () => {
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

  const features = [
    { title: "Money Flow Visualization", icon: "\uD83C\uDF10", color: "#10b981" },
    { title: "Per-Agent P&L", icon: "\uD83D\uDCB0", color: "#0ea5e9" },
    { title: "Interactive Policy Editor", icon: "\uD83D\uDEE1\uFE0F", color: "#8b5cf6" },
    { title: "XMTP Agent Discovery", icon: "\uD83D\uDD0D", color: "#f59e0b" },
    { title: "7 Partner Integrations", icon: "\uD83D\uDD17", color: "#ef4444" },
  ];

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
          color: "#8b5cf6",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: 12,
        }}
      >
        Aegis Nexus Dashboard
      </div>
      <div
        style={{
          opacity: headerOpacity,
          fontSize: 48,
          fontWeight: 700,
          color: "#ffffff",
          marginBottom: 60,
        }}
      >
        Full visibility into your agent economy
      </div>

      {/* Feature grid */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 28,
          justifyContent: "center",
        }}
      >
        {features.map((feature, i) => (
          <FeatureCard key={i} {...feature} index={i} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
