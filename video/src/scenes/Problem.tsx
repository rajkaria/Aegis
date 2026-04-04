import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
} from "remotion";

const AnimatedLine: React.FC<{
  text: string;
  startFrame: number;
  highlight?: boolean;
}> = ({ text, startFrame, highlight = false }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [startFrame, startFrame + 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const y = interpolate(frame, [startFrame, startFrame + 25], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${y}px)`,
        fontSize: highlight ? 52 : 44,
        fontWeight: highlight ? 700 : 400,
        color: highlight ? "#ffffff" : "#a3a3a3",
        lineHeight: 1.4,
        marginBottom: 24,
      }}
    >
      {text}
    </div>
  );
};

export const Problem: React.FC = () => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const fadeOut = interpolate(frame, [270, 300], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a0a",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Inter, sans-serif",
        opacity: fadeIn * fadeOut,
        padding: 120,
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 1200 }}>
        <AnimatedLine
          text="AI agents can hold money."
          startFrame={10}
          highlight
        />
        <AnimatedLine
          text="But an economy needs more than wallets."
          startFrame={80}
        />
        <AnimatedLine
          text="It needs commerce, governance, and transparency."
          startFrame={160}
          highlight
        />
      </div>
    </AbsoluteFill>
  );
};
