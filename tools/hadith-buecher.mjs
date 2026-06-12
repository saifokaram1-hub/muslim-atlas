// Lädt die arabischen Volltexte der sechs Hadith-Sammlungen aus der freien
// hadith-api (fawazahmed0) und kompaktiert sie für die App:
// public/hadith/{buchId}.json -> { h: [[nummer, text], ...] }
// Hinweis: Im arabischen Text ist jeweils die volle Überliefererkette (Isnad)
// enthalten ("haddathana ... an ..."). Referenz/Übersetzung: sunnah.com.
import { writeFileSync, mkdirSync } from "node:fs";

const BUECHER = [
  ["bukhari", "ara-bukhari"],
  ["muslim", "ara-muslim"],
  ["abudawud", "ara-abudawud"],
  ["tirmidhi", "ara-tirmidhi"],
  ["nasai", "ara-nasai"],
  ["ibnmajah", "ara-ibnmajah"],
];

mkdirSync("public/hadith", { recursive: true });

for (const [buchId, edition] of BUECHER) {
  const url = `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${edition}.min.json`;
  const antwort = await fetch(url);
  if (!antwort.ok) {
    console.error("FEHLER:", edition, antwort.status);
    continue;
  }
  const roh = await antwort.json();
  const h = roh.hadiths
    .filter((x) => x.text && x.hadithnumber)
    .map((x) => [x.hadithnumber, x.text]);
  writeFileSync(`public/hadith/${buchId}.json`, JSON.stringify({ h }), "utf8");
  console.log(buchId, "->", h.length, "Hadithe");
}
