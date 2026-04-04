import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

export const Closing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const taglineScale = spring({
    frame: frame - 10,
    fps,
    config: { damping: 12, stiffness: 80 },
  });

  const taglineOpacity = interpolate(frame, [10, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const urlOpacity = interpolate(frame, [60, 80], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const githubOpacity = interpolate(frame, [90, 110], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const hackathonOpacity = interpolate(frame, [140, 170], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Subtle gradient pulse
  const pulse = interpolate(
    frame % 60,
    [0, 30, 60],
    [0.6, 1, 0.6]
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a0a",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Inter, sans-serif",
        opacity: fadeIn,
      }}
    >
      {/* Background gradient glow */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, #10b98115 0%, transparent 70%)",
          opacity: pulse,
        }}
      />

      {/* Main tagline */}
      <div
        style={{
          opacity: taglineOpacity,
          transform: `scale(${taglineScale})`,
          fontSize: 44,
          fontWeight: 600,
          color: "#e5e5e5",
          textAlign: "center",
          lineHeight: 1.5,
          marginBottom: 60,
          maxWidth: 900,
        }}
      >
        OWS is the vault.{" "}
        <span
          style={{
            background: "linear-gradient(135deg, #10b981, #0ea5e9)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: 800,
          }}
        >
          Aegis is the economy.
        </span>
      </div>

      {/* URL */}
      <div
        style={{
          opacity: urlOpacity,
          fontSize: 36,
          fontWeight: 700,
          background: "linear-gradient(135deg, #10b981, #0ea5e9)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: 20,
        }}
      >
        useaegis.xyz
      </div>

      {/* GitHub */}
      <div
        style={{
          opacity: githubOpacity,
          fontFamily: "monospace",
          fontSize: 22,
          color: "#737373",
          marginBottom: 60,
        }}
      >
        github.com/rajkaria/aegis
      </div>

      {/* Hackathon badge */}
      <div
        style={{
          opacity: hackathonOpacity,
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: "#10b98115",
          border: "1px solid #10b98130",
          borderRadius: 12,
          padding: "14px 32px",
        }}
      >
        <div
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: "#10b981",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          Built for OWS Hackathon
        </div>
      </div>
    </AbsoluteFill>
  );
};
