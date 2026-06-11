import { AtlasGraph } from "../components/AtlasGraph";
import { quranConfig } from "../data/quran";

export default function QuranPage() {
  return <AtlasGraph cfg={quranConfig} />;
}
