// Kompaktiert die alquran.cloud-Antworten zu schlanken statischen Dateien:
// public/quran-ar.json und public/quran-de.json
// Format: { s: [ { n: 1, name: "...", a: ["Vers1", "Vers2", ...] }, ... ] }
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

function kompakt(quellDatei, zielDatei, nameFeld) {
  const roh = JSON.parse(readFileSync(quellDatei, "utf8"));
  const s = roh.data.surahs.map((su) => ({
    n: su.number,
    name: su[nameFeld] ?? su.englishName,
    a: su.ayahs.map((ay) => ay.text),
  }));
  writeFileSync(zielDatei, JSON.stringify({ s }), "utf8");
  console.log(zielDatei, "->", s.length, "Suren");
}

const tmp = process.env.TEMP || tmpdir();
kompakt(join(tmp, "quran-ar.json"), "public/quran-ar.json", "name");
kompakt(join(tmp, "quran-de.json"), "public/quran-de.json", "englishName");
