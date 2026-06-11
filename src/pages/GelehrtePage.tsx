import { AtlasGraph } from "../components/AtlasGraph";
import { gelehrteConfig } from "../data/gelehrte";

export default function GelehrtePage() {
  return <AtlasGraph cfg={gelehrteConfig} />;
}
