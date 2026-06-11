import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { buchById, haditheProBuch, GRADING_INFO, narratorById, type GradingStufe } from "../data/hadith";
import { logSearchDebounced } from "../lib/analytics";

export default function HadithBuchSeite() {
  const { buchId } = useParams();
  const buch = buchId ? buchById.get(buchId) : undefined;
  const [suche, setSuche] = useState("");
  const [grading, setGrading] = useState<GradingStufe | "alle">("alle");
  const [thema, setThema] = useState<string>("alle");

  const alle = useMemo(() => (buchId ? haditheProBuch(buchId) : []), [buchId]);
  const themen = useMemo(() => Array.from(new Set(alle.flatMap((h) => h.themen))).sort(), [alle]);

  const liste = useMemo(() => {
    const q = suche.trim().toLowerCase();
    return alle.filter((h) => {
      if (grading !== "alle" && h.grading.stufe !== grading) return false;
      if (thema !== "alle" && !h.themen.includes(thema)) return false;
      if (q.length < 2) return true;
      return (
        h.nummer.includes(q) ||
        h.titel.toLowerCase().includes(q) ||
        h.textDe.toLowerCase().includes(q) ||
        h.kette.some((id) => narratorById.get(id)?.name.toLowerCase().includes(q))
      );
    });
  }, [alle, suche, grading, thema]);

  if (!buch) {
    return <div className="p-10 text-center text-cremedim">Buch nicht gefunden.</div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 w-full">
      <Link to="/hadith" className="text-sm text-cremedim hover:text-creme">← Alle Bücher</Link>
      <div className="flex justify-between items-start gap-3 mt-2">
        <h1 className="font-serif text-3xl text-gold">{buch.name}</h1>
        <span className="font-arabic text-xl text-cremedim" dir="rtl">{buch.arabisch}</span>
      </div>
      <p className="text-creme mt-1">{buch.autor} <span className="text-goldhell font-mono text-sm">({buch.autorLebensdaten})</span></p>
      <p className="text-sm text-cremedim mt-1">{buch.anzahl}</p>
      <p className="text-sm text-cremedim mt-3 karte p-4 leading-relaxed">{buch.methodik}</p>

      <div className="flex flex-col md:flex-row gap-2 mt-6">
        <input
          className="eingabe flex-1"
          placeholder="Suche in diesem Buch (Nummer, Text, Tradent)..."
          value={suche}
          onChange={(e) => {
            setSuche(e.target.value);
            logSearchDebounced(e.target.value, `hadith:${buch.id}`);
          }}
        />
        <select className="eingabe md:w-44" value={grading} onChange={(e) => setGrading(e.target.value as GradingStufe | "alle")}>
          <option value="alle">Alle Bewertungen</option>
          {(Object.keys(GRADING_INFO) as GradingStufe[]).map((g) => (
            <option key={g} value={g}>{GRADING_INFO[g].label}</option>
          ))}
        </select>
        <select className="eingabe md:w-44" value={thema} onChange={(e) => setThema(e.target.value)}>
          <option value="alle">Alle Themen</option>
          {themen.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="mt-4 space-y-3">
        {liste.length === 0 && <p className="text-cremedim text-sm">Keine Treffer im kuratierten Kerndatensatz.</p>}
        {liste.map((h) => (
          <Link key={h.id} to={`/hadith/${buch.id}/${h.id}`} className="karte block p-4 hover:border-gold/50 transition">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-goldhell font-mono">Nr. {h.nummer}</span>
              <span className="text-xs px-1.5 py-0.5 rounded" style={{ border: `1px solid ${GRADING_INFO[h.grading.stufe].farbe}`, color: GRADING_INFO[h.grading.stufe].farbe }}>
                {GRADING_INFO[h.grading.stufe].label}
              </span>
              {h.schwachstellen && <span className="text-xs text-warn">Kette mit Schwachstelle</span>}
              {h.themen.map((t) => (
                <span key={t} className="text-xs px-1.5 py-0.5 rounded bg-flaeche2 text-cremedim">{t}</span>
              ))}
            </div>
            <h3 className="text-creme font-medium mt-1.5">{h.titel}</h3>
            <p className="text-sm text-cremedim mt-1 line-clamp-2">{h.textDe}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
