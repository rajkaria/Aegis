import { AbsoluteFill, Sequence } from "remotion";
import { Title } from "./scenes/Title";
import { Problem } from "./scenes/Problem";
import { ThreeLayers } from "./scenes/ThreeLayers";
import { SupplyChain } from "./scenes/SupplyChain";
import { OnChainProof } from "./scenes/OnChainProof";
import { DashboardPreview } from "./scenes/DashboardPreview";
import { TechStack } from "./scenes/TechStack";
import { Closing } from "./scenes/Closing";

export const Video: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a" }}>
      {/* Scene 1: Title (0:00-0:05, frames 0-150) */}
      <Sequence from={0} durationInFrames={150}>
        <Title />
      </Sequence>

      {/* Scene 2: The Problem (0:05-0:15, frames 150-450) */}
      <Sequence from={150} durationInFrames={300}>
        <Problem />
      </Sequence>

      {/* Scene 3: Three Layers (0:15-0:35, frames 450-1050) */}
      <Sequence from={450} durationInFrames={600}>
        <ThreeLayers />
      </Sequence>

      {/* Scene 4: The Supply Chain (0:35-0:55, frames 1050-1650) */}
      <Sequence from={1050} durationInFrames={600}>
        <SupplyChain />
      </Sequence>

      {/* Scene 5: On-Chain Proof (0:55-1:10, frames 1650-2100) */}
      <Sequence from={1650} durationInFrames={450}>
        <OnChainProof />
      </Sequence>

      {/* Scene 6: Dashboard Preview (1:10-1:30, frames 2100-2700) */}
      <Sequence from={2100} durationInFrames={600}>
        <DashboardPreview />
      </Sequence>

      {/* Scene 7: Tech Stack (1:30-1:45, frames 2700-3150) */}
      <Sequence from={2700} durationInFrames={450}>
        <TechStack />
      </Sequence>

      {/* Scene 8: Closing (1:45-2:00, frames 3150-3600) */}
      <Sequence from={3150} durationInFrames={450}>
        <Closing />
      </Sequence>
    </AbsoluteFill>
  );
};
