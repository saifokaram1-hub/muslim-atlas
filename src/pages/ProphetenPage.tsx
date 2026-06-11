import { AtlasGraph } from "../components/AtlasGraph";
import { prophetenConfig } from "../data/propheten";

export default function ProphetenPage() {
  return <AtlasGraph cfg={prophetenConfig} />;
}
