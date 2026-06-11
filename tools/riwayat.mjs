// Lädt weitere Riwaya-Texte (Lesarten) von der freien quran-api (fawazahmed0)
// und kompaktiert sie ins App-Format { s: [{ n, name, a: [...] }] }.
// Surennamen übernehmen wir aus der vorhandenen Hafs-Datei.
import { readFileSync, writeFileSync } from "node:fs";

const EDITIONEN = [
  ["ara-quranwarsh", "public/quran-warsh.json"],
  ["ara-quranqaloon", "public/quran-qalun.json"],
  ["ara-quranshouba", "public/quran-shuba.json"],
  ["ara-qurandoori", "public/quran-duri.json"],
];

const hafs = JSON.parse(readFileSync("public/quran-ar.json", "utf8"));
const namen = hafs.s.map((su) => su.name);

for (const [edition, ziel] of EDITIONEN) {
  const url = `https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions/${edition}.json`;
  const antwort = await fetch(url);
  if (!antwort.ok) {
    console.error("FEHLER beim Laden:", edition, antwort.status);
    continue;
  }
  const roh = await antwort.json();
  const suren = new Map();
  for (const v of roh.quran) {
    if (!suren.has(v.chapter)) suren.set(v.chapter, []);
    suren.get(v.chapter).push(v.text);
  }
  const s = [...suren.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([nr, verse]) => ({ n: nr, name: namen[nr - 1], a: verse }));
  writeFileSync(ziel, JSON.stringify({ s }), "utf8");
  console.log(ziel, "->", s.length, "Suren,", s.reduce((sum, su) => sum + su.a.length, 0), "Verse");
}
