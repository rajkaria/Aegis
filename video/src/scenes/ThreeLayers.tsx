import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

const LayerCard: React.FC<{
  title: string;
  subtitle: string;
  code?: string;
  index: number;
  color: string;
}> = ({ title, subtitle, code, index, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterDelay = index * 50 + 30;

  const slideX = spring({
    frame: frame - enterDelay,
    fps,
    config: { damping: 14, stiffness: 80 },
  });

  const x = interpolate(slideX, [0, 1], [400, 0]);

  const opacity = interpolate(
    frame,
    [enterDelay, enterDelay + 20],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        opacity,
        transform: `translateX(${x}px)`,
        background: "linear-gradient(135deg, #171717, #1a1a2e)",
        borderRadius: 20,
        padding: 48,
        border: `1px solid ${color}33`,
        width: 480,
        minHeight: 280,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          color,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: 12,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 24,
          fontWeight: 500,
          color: "#e5e5e5",
          lineHeight: 1.4,
          marginBottom: code ? 20 : 0,
        }}
      >
        {subtitle}
      </div>
      {code && (
        <div
          style={{
            background: "#0d0d0d",
            borderRadius: 10,
            padding: 16,
            fontFamily: "monospace",
            fontSize: 15,
            color: "#10b981",
            lineHeight: 1.5,
            border: "1px solid #262626",
          }}
        >
          {code}
        </div>
      )}
    </div>
  );
};

export const ThreeLayers: React.FC = () => {
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
        Three Layers
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
        Everything agents need to trade
      </div>

      {/* Cards */}
      <div
        style={{
          display: "flex",
          gap: 32,
          justifyContent: "center",
          alignItems: "stretch",
        }}
      >
        <LayerCard
          title="Aegis Gate"
          subtitle="One line of code. Any API becomes a paid service."
          code={'app.use(gate({ price: "$0.01" }))'}
          index={0}
          color="#10b981"
        />
        <LayerCard
          title="Aegis Policies"
          subtitle="Budget caps. Address guard. Dead man's switch."
          index={1}
          color="#0ea5e9"
        />
        <LayerCard
          title="Aegis Nexus"
          subtitle="See money flow between agents in real-time."
          index={2}
          color="#8b5cf6"
        />
      </div>
    </AbsoluteFill>
  );
};
