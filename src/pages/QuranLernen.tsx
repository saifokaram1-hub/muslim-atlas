import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { surenListe } from "../data/quran";

interface QuranDaten { s: { n: number; name: string; a: string[] }[] }
interface Fortschritt { fehler: number; gemeistert: boolean }
interface Plan { id: string; sure: number; vers_von: number; vers_bis: number; pro_tag: number; start_datum: string }

// Textbasis: Riwaya Hafs an Asim (Uthmani-Schrift), Quelle: api.alquran.cloud
// Übersetzung: Bubenheim & Elyas (deutsch)

const FEHLER_FARBEN: Record<number, { farbe: string; label: string }> = {
  1: { farbe: "#eab308", label: "1 Fehler — noch einmal üben (gelb)" },
  2: { farbe: "#f97316", label: "2 Fehler — gezielt wiederholen (orange)" },
  3: { farbe: "#ef5350", label: "3+ Fehler — dieser Vers braucht volle Aufmerksamkeit (rot)" },
};

const QIRAAT = [
  { name: "Nafi' al-Madani", ueberlieferer: "Qalun & Warsh", region: "Medina", zehn: false },
  { name: "Ibn Kathir al-Makki", ueberlieferer: "al-Bazzi & Qunbul", region: "Mekka", zehn: false },
  { name: "Abu Amr al-Basri", ueberlieferer: "ad-Duri & as-Susi", region: "Basra", zehn: false },
  { name: "Ibn Amir ash-Shami", ueberlieferer: "Hisham & Ibn Dhakwan", region: "Damaskus", zehn: false },
  { name: "Asim al-Kufi", ueberlieferer: "Hafs & Shu'ba", region: "Kufa", zehn: false, hinweis: "Hafs an Asim ist die heute weltweit verbreitetste Lesart und die Textbasis dieser App." },
  { name: "Hamza al-Kufi", ueberlieferer: "Khalaf & Khallad", region: "Kufa", zehn: false },
  { name: "al-Kisa'i", ueberlieferer: "Abu l-Harith & ad-Duri", region: "Kufa", zehn: false },
  { name: "Abu Ja'far al-Madani", ueberlieferer: "Ibn Wardan & Ibn Jammaz", region: "Medina", zehn: true },
  { name: "Ya'qub al-Hadrami", ueberlieferer: "Ruways & Rawh", region: "Basra", zehn: true },
  { name: "Khalaf al-Bazzar", ueberlieferer: "Ishaq & Idris", region: "Bagdad", zehn: true },
];

function lokalLaden(): Record<string, Fortschritt> {
  try { return JSON.parse(localStorage.getItem("hifz") ?? "{}"); } catch { return {}; }
}
function lokalSpeichern(f: Record<string, Fortschritt>) {
  localStorage.setItem("hifz", JSON.stringify(f));
}

export default function QuranLernen() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"lesen" | "hifz" | "plan" | "lesarten">("lesen");
  const [sure, setSure] = useState(1);
  const [ar, setAr] = useState<QuranDaten | null>(null);
  const [de, setDe] = useState<QuranDaten | null>(null);
  const [deAn, setDeAn] = useState(false);
  const [aufgedeckt, setAufgedeckt] = useState<Set<number>>(new Set());
  const [fortschritt, setFortschritt] = useState<Record<string, Fortschritt>>(lokalLaden());
  const [pläne, setPläne] = useState<Plan[]>([]);
  const [planForm, setPlanForm] = useState({ sure: 1, von: 1, bis: 7, proTag: 3 });

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}quran-ar.json`).then((r) => r.json()).then(setAr);
  }, []);
  useEffect(() => {
    if (deAn && !de) fetch(`${import.meta.env.BASE_URL}quran-de.json`).then((r) => r.json()).then(setDe);
  }, [deAn, de]);
  useEffect(() => {
    if (!user) return;
    supabase.from("hifz_progress").select("sure, vers, fehler, gemeistert").then(({ data }) => {
      if (!data) return;
      const f: Record<string, Fortschritt> = {};
      for (const z of data as { sure: number; vers: number; fehler: number; gemeistert: boolean }[]) {
        f[`${z.sure}:${z.vers}`] = { fehler: z.fehler, gemeistert: z.gemeistert };
      }
      setFortschritt((alt) => ({ ...alt, ...f }));
    });
    supabase.from("hifz_plaene").select("id, sure, vers_von, vers_bis, pro_tag, start_datum")
      .order("created_at", { ascending: false })
      .then(({ data }) => setPläne((data as Plan[]) ?? []));
  }, [user?.id]);

  const sureMeta = surenListe[sure - 1];
  const verse = ar?.s[sure - 1]?.a ?? [];
  const verseDe = de?.s[sure - 1]?.a ?? [];

  const setzeFortschritt = (vers: number, neu: Fortschritt) => {
    const schluessel = `${sure}:${vers}`;
    setFortschritt((alt) => {
      const ges = { ...alt, [schluessel]: neu };
      lokalSpeichern(ges);
      return ges;
    });
    if (user) {
      supabase.from("hifz_progress").upsert(
        { user_id: user.id, sure, vers, fehler: neu.fehler, gemeistert: neu.gemeistert, updated_at: new Date().toISOString() },
        { onConflict: "user_id,sure,vers" },
      ).then(() => {});
    }
  };

  const planTage = useMemo(() => {
    const { von, bis, proTag } = planForm;
    const tage: { tag: number; von: number; bis: number }[] = [];
    let start = von;
    let t = 1;
    while (start <= bis) {
      const ende = Math.min(start + proTag - 1, bis);
      tage.push({ tag: t, von: start, bis: ende });
      start = ende + 1;
      t++;
    }
    return tage;
  }, [planForm]);

  const planSpeichern = async () => {
    if (!user) return;
    const { data } = await supabase.from("hifz_plaene").insert({
      user_id: user.id, sure: planForm.sure, vers_von: planForm.von,
      vers_bis: planForm.bis, pro_tag: planForm.proTag,
    }).select("id, sure, vers_von, vers_bis, pro_tag, start_datum").single();
    if (data) setPläne([data as Plan, ...pläne]);
  };

  const SurenWahl = (
    <select className="eingabe max-w-xs" value={sure} onChange={(e) => { setSure(Number(e.target.value)); setAufgedeckt(new Set()); }}>
      {surenListe.map((s) => <option key={s.nr} value={s.nr}>{s.nr}. {s.name} ({s.verse} Verse)</option>)}
    </select>
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 w-full">
      <h1 className="font-serif text-4xl text-gold">Quran lesen & auswendig lernen</h1>
      <p className="text-cremedim mt-2 max-w-3xl text-sm">
        Vollständiger Qurantext in der Riwaya Hafs an Asim (Uthmani-Schrift, Quelle: alquran.cloud),
        deutsche Übersetzung von Bubenheim & Elyas. Dein Hifz-Fortschritt wird
        {user ? " in deinem Konto" : " lokal im Browser (melde dich an, um ihn dauerhaft zu sichern)"} gespeichert.
      </p>

      <div className="flex flex-wrap gap-2 mt-6 mb-6">
        {([["lesen", "Lesen"], ["hifz", "Auswendig lernen"], ["plan", "Lernplan"], ["lesarten", "Die zehn Lesarten"]] as const).map(([k, l]) => (
          <button key={k} className={tab === k ? "knopf knopf-gold" : "knopf"} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {(tab === "lesen" || tab === "hifz") && (
        <div className="flex flex-wrap items-center gap-3 mb-5">
          {SurenWahl}
          <label className="flex items-center gap-2 text-sm text-cremedim cursor-pointer">
            <input type="checkbox" checked={deAn} onChange={(e) => setDeAn(e.target.checked)} />
            Deutsche Übersetzung anzeigen
          </label>
        </div>
      )}

      {!ar && (tab === "lesen" || tab === "hifz") && <p className="text-cremedim">Lade Qurantext…</p>}

      {tab === "lesen" && ar && (
        <div className="karte p-6 space-y-5">
          <h2 className="font-arabic text-3xl text-gold text-center" dir="rtl">{ar.s[sure - 1].name}</h2>
          {sure !== 1 && sure !== 9 && (
            <p className="font-arabic text-2xl text-creme text-center" dir="rtl">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</p>
          )}
          {verse.map((v, i) => (
            <div key={i} className="border-b border-gold/10 pb-4">
              <p className="font-arabic text-2xl leading-loose text-creme text-right" dir="rtl">
                {v} <span className="text-goldhell text-lg">﴿{i + 1}﴾</span>
              </p>
              {deAn && verseDe[i] && <p className="text-sm text-cremedim mt-2">{i + 1}. {verseDe[i]}</p>}
            </div>
          ))}
        </div>
      )}

      {tab === "hifz" && ar && (
        <div className="space-y-4">
          <div className="karte p-4 text-sm text-cremedim">
            <p><span className="text-gold font-semibold">So funktioniert es:</span> Rezitiere jeden Vers aus dem
              Gedächtnis, decke ihn dann auf und sei ehrlich zu dir: Richtig gelesen oder Fehler gemacht?</p>
            <p className="mt-1">Fehlerstufen: <span style={{ color: "#eab308" }}>■ 1 = gelb</span> ·{" "}
              <span style={{ color: "#f97316" }}>■ 2 = orange</span> ·{" "}
              <span style={{ color: "#ef5350" }}>■ 3+ = rot (gezielt wiederholen!)</span></p>
            <button className="knopf text-xs mt-2" onClick={() => setAufgedeckt(new Set())}>Alle Verse wieder verdecken</button>
          </div>
          {verse.map((v, i) => {
            const schluessel = `${sure}:${i + 1}`;
            const f = fortschritt[schluessel];
            const stufe = Math.min(f?.fehler ?? 0, 3);
            const farbe = f?.gemeistert ? "#2f9d77" : stufe > 0 ? FEHLER_FARBEN[stufe].farbe : undefined;
            const offen = aufgedeckt.has(i);
            return (
              <div key={i} className="karte p-4" style={farbe ? { borderColor: farbe } : undefined}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-goldhell font-mono">Vers {i + 1}</span>
                  <span className="text-xs" style={{ color: farbe ?? "#7d8a80" }}>
                    {f?.gemeistert ? "Gemeistert" : stufe > 0 ? FEHLER_FARBEN[stufe].label : "Noch nicht abgefragt"}
                  </span>
                </div>
                {offen ? (
                  <>
                    <p className="font-arabic text-2xl leading-loose text-right mt-2" dir="rtl"
                      style={{ color: stufe >= 3 ? "#ef5350" : stufe === 2 ? "#f97316" : stufe === 1 ? "#eab308" : "#f4efe3" }}>
                      {v}
                    </p>
                    {deAn && verseDe[i] && <p className="text-xs text-cremedim mt-1">{verseDe[i]}</p>}
                    <div className="flex gap-2 mt-3">
                      <button className="knopf text-sm" onClick={() => setzeFortschritt(i + 1, { fehler: f?.fehler ?? 0, gemeistert: true })}>
                        ✓ Richtig rezitiert
                      </button>
                      <button
                        className="knopf text-sm"
                        style={{ background: "#7a3b33" }}
                        onClick={() => setzeFortschritt(i + 1, { fehler: (f?.fehler ?? 0) + 1, gemeistert: false })}
                      >
                        ✗ Fehler gemacht
                      </button>
                      <button className="knopf text-sm" onClick={() => setzeFortschritt(i + 1, { fehler: 0, gemeistert: false })}>
                        Zurücksetzen
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    className="w-full mt-2 py-6 rounded-lg border border-dashed border-gold/30 text-cremedim hover:border-gold/60 hover:text-creme transition"
                    onClick={() => setAufgedeckt(new Set([...aufgedeckt, i]))}
                  >
                    Erst aus dem Gedächtnis rezitieren — dann hier aufdecken
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {tab === "plan" && (
        <div className="space-y-5 max-w-2xl">
          <div className="karte p-5">
            <h2 className="font-serif text-xl text-gold">Auswendiglern-Plan erstellen</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-sm">
              <div>
                <label className="text-gold font-semibold">Sure</label>
                <select className="eingabe mt-1" value={planForm.sure}
                  onChange={(e) => { const nr = Number(e.target.value); setPlanForm({ ...planForm, sure: nr, von: 1, bis: Math.min(planForm.bis, surenListe[nr - 1].verse) }); }}>
                  {surenListe.map((s) => <option key={s.nr} value={s.nr}>{s.nr}. {s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-gold font-semibold">Vers von</label>
                <input type="number" className="eingabe mt-1" min={1} max={surenListe[planForm.sure - 1].verse}
                  value={planForm.von} onChange={(e) => setPlanForm({ ...planForm, von: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-gold font-semibold">bis</label>
                <input type="number" className="eingabe mt-1" min={planForm.von} max={surenListe[planForm.sure - 1].verse}
                  value={planForm.bis} onChange={(e) => setPlanForm({ ...planForm, bis: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-gold font-semibold">Verse pro Tag</label>
                <input type="number" className="eingabe mt-1" min={1} max={20}
                  value={planForm.proTag} onChange={(e) => setPlanForm({ ...planForm, proTag: Math.max(1, Number(e.target.value)) })} />
              </div>
            </div>
            <div className="mt-4 text-sm text-cremedim">
              <p className="text-creme font-semibold">{planTage.length} Tage — dein Plan:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-1 mt-2 max-h-44 overflow-y-auto">
                {planTage.map((t) => {
                  const datum = new Date(); datum.setDate(datum.getDate() + t.tag - 1);
                  return <span key={t.tag}>Tag {t.tag} ({datum.toLocaleDateString("de-DE")}): Vers {t.von}–{t.bis}</span>;
                })}
              </div>
            </div>
            {user ? (
              <button className="knopf knopf-gold mt-4" onClick={planSpeichern}>Plan speichern</button>
            ) : (
              <p className="text-sm text-cremedim mt-3"><Link to="/login" className="text-goldhell underline">Anmelden</Link>, um Pläne zu speichern.</p>
            )}
          </div>

          {pläne.length > 0 && (
            <div className="karte p-5">
              <h2 className="font-serif text-xl text-gold">Meine Pläne</h2>
              <ul className="mt-2 space-y-2 text-sm">
                {pläne.map((p) => (
                  <li key={p.id} className="flex justify-between items-center gap-2">
                    <span className="text-creme">
                      Sure {p.sure} ({surenListe[p.sure - 1].name}), Vers {p.vers_von}–{p.vers_bis},{" "}
                      {p.pro_tag}/Tag, ab {new Date(p.start_datum).toLocaleDateString("de-DE")}
                    </span>
                    <button className="text-warn text-xs hover:underline" onClick={async () => {
                      await supabase.from("hifz_plaene").delete().eq("id", p.id);
                      setPläne(pläne.filter((x) => x.id !== p.id));
                    }}>Löschen</button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {tab === "lesarten" && (
        <div className="space-y-5">
          <div className="karte p-5 text-sm text-cremedim leading-relaxed">
            <h2 className="font-serif text-xl text-gold">Die zehn anerkannten Lesarten (Qira'at)</h2>
            <p className="mt-2">
              Der Quran wurde in mehreren überlieferten Lesarten herabgesandt (\"Der Quran wurde auf
              sieben Ahruf herabgesandt\", Bukhari 4992). Daraus bewahrte die Umma <span className="text-creme font-semibold">zehn
              mutawatir überlieferte Lesarten</span>: die berühmten Sieben (Ibn Mujahid, gest. 324 AH) plus
              drei weitere (Abu Ja'far, Ya'qub, Khalaf), die nach der Mehrheit der Gelehrten denselben
              Rang haben [Jumhur; Ibn al-Jazari, an-Nashr]. Alle zehn dürfen im Gebet rezitiert werden.
              Lesarten <span className="text-warn">jenseits der Zehn</span> (z. B. al-Hasan al-Basri, Ibn Muhaysin)
              gelten als <span className="text-warn">shadhdh</span>: wertvoll für Tafsir und Sprachwissenschaft,
              aber nicht für die Rezitation im Gebet.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {QIRAAT.map((q) => (
              <div key={q.name} className={`karte p-4 ${q.hinweis ? "border-gold/60" : ""}`}>
                <div className="flex justify-between items-start gap-2">
                  <h3 className="text-creme font-semibold">{q.name}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full border border-goldhell/50 text-goldhell shrink-0">
                    {q.zehn ? "Die Drei (Ergänzung zu den Sieben)" : "Die Sieben"}
                  </span>
                </div>
                <p className="text-sm text-cremedim mt-1">Überlieferer: {q.ueberlieferer} · {q.region}</p>
                {q.hinweis && <p className="text-xs text-goldhell mt-2">{q.hinweis}</p>}
              </div>
            ))}
          </div>
          <div className="karte p-5 text-sm text-cremedim border-smaragd/50">
            <h3 className="font-semibold text-smaragdhell">In Planung</h3>
            <p className="mt-1">Tajwid-Farbkodierung des Textes und eine Rezitations-Prüfung per Mikrofon
              (die App hört mit und markiert Abweichungen) sind als nächste Ausbaustufen vorgemerkt.
              Weitere Lesarten-Texte (z. B. Warsh) folgen, sobald eine verlässliche freie Textquelle eingebunden ist.</p>
          </div>
        </div>
      )}
    </div>
  );
}
