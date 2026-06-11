import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { hadithBücher, hadithe, narratorById, GRADING_INFO } from "../data/hadith";
import { logSearchDebounced } from "../lib/analytics";

export default function HadithÜbersicht() {
  const [suche, setSuche] = useState("");

  const treffer = useMemo(() => {
    const q = suche.trim().toLowerCase();
    if (q.length < 2) return [];
    return hadithe.filter(
      (h) =>
        h.nummer.includes(q) ||
        h.titel.toLowerCase().includes(q) ||
        h.textDe.toLowerCase().includes(q) ||
        h.themen.some((t) => t.toLowerCase().includes(q)) ||
        h.kette.some((id) => narratorById.get(id)?.name.toLowerCase().includes(q)),
    );
  }, [suche]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 w-full">
      <h1 className="font-serif text-4xl text-gold">Hadith-Atlas</h1>
      <p className="text-cremedim mt-2 max-w-3xl">
        Die sechs großen Sammlungen (al-Kutub as-Sitta). Öffne ein Buch oder suche global nach
        Nummer, Text, Thema oder Tradent; jede Kette wird als Mindmap mit Bewertung jedes Gliedes gezeigt.
      </p>
      <p className="text-xs text-goldhell mt-2 border border-gold/30 rounded px-3 py-2 inline-block">
        Kuratierter Kerndatensatz V1: korrekt belegte Beispielketten; der Atlas wächst weiter.
        Vollständige Texte: sunnah.com
      </p>

      <input
        className="eingabe mt-6"
        placeholder="Globale Suche: Nummer, Titel, Text, Thema oder Tradent..."
        value={suche}
        onChange={(e) => {
          setSuche(e.target.value);
          logSearchDebounced(e.target.value, "hadith");
        }}
      />
      {treffer.length > 0 && (
        <div className="karte mt-2 divide-y divide-gold/10">
          {treffer.map((h) => (
            <Link key={h.id} to={`/hadith/${h.buchId}/${h.id}`} className="block px-4 py-3 hover:bg-flaeche2">
              <span className="text-sm text-creme font-medium">{h.titel}</span>
              <span className="ml-2 text-xs text-cremedim">
                {hadithBücher.find((b) => b.id === h.buchId)?.name} Nr. {h.nummer}
              </span>
              <span className="ml-2 text-xs px-1.5 py-0.5 rounded" style={{ border: `1px solid ${GRADING_INFO[h.grading.stufe].farbe}`, color: GRADING_INFO[h.grading.stufe].farbe }}>
                {GRADING_INFO[h.grading.stufe].label}
              </span>
            </Link>
          ))}
        </div>
      )}

      <div className="karte p-6 mt-8">
        <h2 className="font-serif text-xl text-gold">Begriffe der Hadith-Wissenschaft</h2>
        <div className="grid md:grid-cols-2 gap-x-8 gap-y-2 mt-3 text-sm text-cremedim">
          <p><span className="text-smaragdhell font-semibold">Mutawatir:</span> von so vielen unabhängigen Ketten überliefert, dass eine Verabredung zur Lüge ausgeschlossen ist; höchste Stufe der Gewissheit (z. B. "Wer über mich absichtlich lügt...").</p>
          <p><span className="text-smaragdhell font-semibold">Sahih:</span> lückenlose Kette aus durchgehend zuverlässigen, präzisen Tradenten, ohne verborgenen Mangel (Illa) und ohne Widerspruch zu Stärkerem (Shudhudh).</p>
          <p><span className="text-goldhell font-semibold">Hasan:</span> wie Sahih, aber mit Tradenten von etwas leichterer Präzision; als Beleg verwendbar.</p>
          <p><span className="text-goldhell font-semibold">Sahih li-ghayrihi:</span> eine für sich schwache Kette, deren Aussage durch unabhängige Parallelketten auf Sahih-Niveau gehoben wird.</p>
          <p><span className="text-warn font-semibold">Da'if:</span> die Kette hat einen Mangel: Lücke (Inqita), schwaches Gedächtnis, Verwechslungen oder Anonymität eines Gliedes.</p>
          <p><span className="text-warn font-semibold">Matruk:</span> ein Tradent, dem die Kritiker das Hadith-Überliefern ganz absprachen; seine Kette gilt als verworfen.</p>
          <p><span className="text-cremedim font-semibold">Gharib:</span> an einer Stelle der Kette nur von EINEM Tradenten überliefert; sagt nichts über schwach oder stark (Bukhari Nr. 1 ist gharib UND sahih).</p>
          <p><span className="text-cremedim font-semibold">Mudallis:</span> ein Tradent, der Lücken sprachlich verschleiert ("von X" statt "X erzählte mir"); seine Überlieferung zählt nur bei ausdrücklichem Hörvermerk.</p>
        </div>
        <p className="text-xs text-cremedim mt-3">
          Woran scheitert eine Kette? Meist an einem Glied: schwaches Gedächtnis, Bruch zwischen zwei
          Personen, die sich nie trafen, oder Verschleierung. Genau das zeigt der Atlas pro Hadith am
          rot markierten Glied. Bewertungsgrundlage: Ibn Hajar (Taqrib at-Tahdhib), adh-Dhahabi (Mizan al-Itidal).
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-5 mt-8">
        {hadithBücher.map((b) => (
          <Link key={b.id} to={`/hadith/${b.id}`} className="karte p-6 hover:border-gold/50 transition group">
            <div className="flex justify-between items-start gap-2">
              <h2 className="font-serif text-xl text-gold group-hover:text-goldhell">{b.name}</h2>
              <span className="font-arabic text-lg text-cremedim" dir="rtl">{b.arabisch}</span>
            </div>
            <p className="text-sm text-creme mt-1">{b.autor}</p>
            <p className="text-xs text-goldhell font-mono">{b.autorLebensdaten}</p>
            <p className="text-xs text-cremedim mt-1">{b.anzahl}</p>
            <p className="text-sm text-cremedim mt-3 leading-relaxed">{b.methodik}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
