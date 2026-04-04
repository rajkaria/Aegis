import { Composition } from "remotion";
import { Video } from "./Video";
import "./style.css";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Video"
      component={Video}
      durationInFrames={900}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
