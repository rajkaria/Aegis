import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

export const OnChainProof: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const fadeOut = interpolate(frame, [410, 450], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const hashScale = spring({
    frame: frame - 30,
    fps,
    config: { damping: 12, stiffness: 80 },
  });

  const hashOpacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const verifiedOpacity = interpolate(frame, [80, 100], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const urlOpacity = interpolate(frame, [130, 150], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const taglineOpacity = interpolate(frame, [200, 230], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Scanning animation for tx hash
  const scanX = interpolate(frame, [50, 120], [0, 100], {
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
      }}
    >
      {/* Tx Hash */}
      <div
        style={{
          opacity: hashOpacity,
          transform: `scale(${hashScale})`,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: "#737373",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: 12,
            textAlign: "center",
          }}
        >
          Transaction Hash
        </div>
        <div
          style={{
            position: "relative",
            background: "#171717",
            borderRadius: 16,
            padding: "24px 40px",
            border: "1px solid #262626",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 32,
              fontWeight: 600,
              color: "#e5e5e5",
              letterSpacing: "0.02em",
            }}
          >
            4SEWKHGx...
          </div>
          {/* Scan line */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: `${scanX}%`,
              width: 2,
              height: "100%",
              background: "linear-gradient(180deg, transparent, #10b981, transparent)",
              opacity: scanX < 100 ? 0.8 : 0,
            }}
          />
        </div>
      </div>

      {/* Verified badge */}
      <div
        style={{
          opacity: verifiedOpacity,
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 32,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "#10b981",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: 18,
            color: "#fff",
            fontWeight: 700,
          }}
        >
          {"\u2713"}
        </div>
        <div
          style={{
            fontSize: 24,
            fontWeight: 600,
            color: "#10b981",
          }}
        >
          Verified on Solana Explorer
        </div>
      </div>

      {/* URL */}
      <div
        style={{
          opacity: urlOpacity,
          fontFamily: "monospace",
          fontSize: 18,
          color: "#525252",
          marginBottom: 60,
        }}
      >
        explorer.solana.com/tx/4SEWKHGx...
      </div>

      {/* Tagline */}
      <div
        style={{
          opacity: taglineOpacity,
          fontSize: 36,
          fontWeight: 600,
          color: "#ffffff",
          textAlign: "center",
          lineHeight: 1.5,
        }}
      >
        Real money. Real blockchain.{" "}
        <span
          style={{
            background: "linear-gradient(135deg, #10b981, #0ea5e9)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Real economy.
        </span>
      </div>
    </AbsoluteFill>
  );
};
