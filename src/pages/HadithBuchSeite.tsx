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
  // Volltext des gesamten Buches (arabisch, lazy geladen)
  const [volltext, setVolltext] = useState<[number, string][] | null>(null);
  const [vtLädt, setVtLädt] = useState(false);
  const [vtSuche, setVtSuche] = useState("");

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

      {/* Volltext des gesamten Buches */}
      <div className="mt-10">
        <h2 className="font-serif text-2xl text-goldhell">Volltext durchsuchen (arabisch)</h2>
        <p className="text-sm text-cremedim mt-1">
          Das komplette Buch als digitalisierter arabischer Text (freier Open-Source-Datensatz).
          Die Überliefererkette (Isnad) steht in jedem Hadith am Anfang des Textes; Übersetzung
          und Gegenprüfung über den sunnah.com-Link am jeweiligen Hadith.
        </p>
        {!volltext ? (
          <button
            className="knopf knopf-gold mt-3"
            disabled={vtLädt}
            onClick={async () => {
              setVtLädt(true);
              try {
                const r = await fetch(`${import.meta.env.BASE_URL}hadith/${buch.id}.json`);
                const j = (await r.json()) as { h: [number, string][] };
                setVolltext(j.h);
              } finally {
                setVtLädt(false);
              }
            }}
          >
            {vtLädt ? "Lade Volltext…" : `Volltext laden (${buch.anzahl.split(" ")[1] ?? "alle"} Hadithe)`}
          </button>
        ) : (
          <>
            <input
              className="eingabe mt-3"
              placeholder={`In allen ${volltext.length} Hadithen suchen: Nummer (z. B. 1) oder arabischer Text...`}
              value={vtSuche}
              onChange={(e) => {
                setVtSuche(e.target.value);
                logSearchDebounced(e.target.value, `hadith-volltext:${buch.id}`);
              }}
            />
            {(() => {
              const q = vtSuche.trim();
              let treffer: [number, string][] = [];
              if (/^\d+$/.test(q)) {
                treffer = volltext.filter(([n]) => String(n) === q || String(n).startsWith(q)).slice(0, 20);
              } else if (q.length >= 3) {
                treffer = volltext.filter(([, t]) => t.includes(q)).slice(0, 50);
              }
              if (q.length === 0) {
                return <p className="text-xs text-cremedim mt-2">Tipp: Hadith-Nummer eingeben (z. B. 6018) oder ein arabisches Wort.</p>;
              }
              if (treffer.length === 0) {
                return <p className="text-sm text-cremedim mt-3">Keine Treffer.</p>;
              }
              return (
                <div className="mt-3 space-y-3">
                  {treffer.map(([n, t]) => (
                    <div key={n} className="karte p-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-goldhell font-mono">Nr. {n}</span>
                        <a
                          href={`https://sunnah.com/${buch.id}:${n}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-goldhell underline"
                        >
                          Übersetzung & Prüfung auf sunnah.com ↗
                        </a>
                      </div>
                      <p className="font-arabic text-xl leading-loose text-right mt-2 text-creme" dir="rtl">{t}</p>
                    </div>
                  ))}
                </div>
              );
            })()}
          </>
        )}
      </div>
    </div>
  );
}
