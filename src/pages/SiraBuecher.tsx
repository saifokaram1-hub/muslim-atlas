import { Link } from "react-router-dom";
import { siraNodes } from "../data/sira";

// Pro Sira-Quellenwerk eine eigene gefilterte Mindmap (/sira?quelle=...).
// Gezeigt werden nur Knoten, deren Quellenangabe dieses Werk enthält.

interface Buch {
  quelle: string; // Filter-Schlüssel (muss in node.quellen vorkommen)
  titel: string;
  arabisch?: string;
  autor: string;
  daten: string;
  beschreibung: string;
  lesen?: { label: string; url: string };
}

const BUECHER: Buch[] = [
  {
    quelle: "Ibn Hisham",
    titel: "as-Sira an-Nabawiyya",
    arabisch: "السيرة النبوية",
    autor: "Ibn Hisham (Redaktion des Ibn Ishaq)",
    daten: "gest. 218 AH / 833",
    beschreibung: "Die älteste erhaltene Gesamt-Sira; Grundlage fast aller späteren Werke. Erzählt von der Abstammung über Mekka und Medina bis zum Tod des Propheten ﷺ.",
    lesen: { label: "Arabisches Original (Shamela)", url: "https://shamela.ws/book/23833" },
  },
  {
    quelle: "ar-Rahiq al-Makhtum",
    titel: "ar-Rahiq al-Makhtum",
    arabisch: "الرحيق المختوم",
    autor: "Safi ar-Rahman al-Mubarakpuri",
    daten: "20. Jh.",
    beschreibung: "Der versiegelte Nektar — preisgekrönte moderne Zusammenfassung der Sira auf Grundlage der klassischen Quellen; klare Chronologie der Ereignisse und Schlachten.",
  },
  {
    quelle: "Ibn Sa'd",
    titel: "at-Tabaqat al-Kubra",
    arabisch: "الطبقات الكبرى",
    autor: "Ibn Sa'd",
    daten: "gest. 230 AH / 845",
    beschreibung: "Das große biografische Klassen-Werk: Tausende Kurzbiografien der Sahaba und der Generation danach — Hauptquelle für die Lebensdaten der Personen.",
    lesen: { label: "Arabisches Original (Shamela)", url: "https://shamela.ws/book/1718" },
  },
  {
    quelle: "Bukhari",
    titel: "Sahih al-Bukhari (Kitab al-Maghazi)",
    arabisch: "كتاب المغازي",
    autor: "Imam al-Bukhari",
    daten: "gest. 256 AH / 870",
    beschreibung: "Das authentischste Buch enthält ein eigenes Kapitel über die Feldzüge (Maghazi) — die mit Kette belegten Sira-Berichte. Volltext im Hadith-Atlas.",
    lesen: { label: "Volltext im Hadith-Atlas", url: "/hadith/bukhari" },
  },
  {
    quelle: "Muslim",
    titel: "Sahih Muslim",
    arabisch: "صحيح مسلم",
    autor: "Imam Muslim",
    daten: "gest. 261 AH / 875",
    beschreibung: "Die mit Kette belegten Sira- und Tugend-Berichte (Fada'il); zweites der beiden Sahih-Werke. Volltext im Hadith-Atlas.",
    lesen: { label: "Volltext im Hadith-Atlas", url: "/hadith/muslim" },
  },
];

export default function SiraBuecher() {
  const zählung = (quelle: string) =>
    siraNodes.filter((n) => (n.quellen ?? []).some((q) => q.toLowerCase().includes(quelle.toLowerCase()))).length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 w-full">
      <h1 className="font-serif text-4xl text-gold">Sira nach Büchern</h1>
      <p className="text-cremedim mt-2 max-w-3xl">
        Jedes der großen Sira-Werke als eigene Mindmap: Du siehst genau die Personen und Ereignisse,
        deren Beleg aus diesem Buch stammt — verlinkt mit dem Werk selbst.
      </p>
      <p className="text-xs text-goldhell mt-2 border border-gold/30 rounded px-3 py-2 inline-block">
        Hinweis: Viele Fakten stehen in mehreren Werken; ein Knoten kann daher in mehreren
        Buch-Karten auftauchen. Die große Gesamtkarte findest du unter „Sira".
      </p>

      <div className="grid md:grid-cols-2 gap-4 mt-8">
        {BUECHER.map((b) => (
          <div key={b.quelle} className="karte karte-aktiv p-5 flex flex-col">
            <div className="flex justify-between items-start gap-2">
              <h2 className="font-serif text-xl text-gold">{b.titel}</h2>
              {b.arabisch && <span className="font-arabic text-lg text-cremedim shrink-0" dir="rtl">{b.arabisch}</span>}
            </div>
            <p className="text-xs text-goldhell mt-0.5">{b.autor} · {b.daten}</p>
            <p className="text-sm text-cremedim mt-2 leading-relaxed flex-1">{b.beschreibung}</p>
            <p className="text-xs text-smaragdhell mt-2">{zählung(b.quelle)} Knoten aus diesem Werk</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Link to={`/sira?quelle=${encodeURIComponent(b.quelle)}`} className="knopf knopf-gold text-sm py-1">
                Mindmap dieses Buches
              </Link>
              {b.lesen && (
                b.lesen.url.startsWith("http") ? (
                  <a href={b.lesen.url} target="_blank" rel="noopener noreferrer" className="knopf text-sm py-1">📖 {b.lesen.label}</a>
                ) : (
                  <Link to={b.lesen.url} className="knopf text-sm py-1">📖 {b.lesen.label}</Link>
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
