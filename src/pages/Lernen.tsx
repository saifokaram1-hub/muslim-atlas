import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { alleFragen, ziehe, THEMEN, STUFEN, type Frage, type Stufe } from "../lib/fragen";
import { logEvent } from "../lib/analytics";

interface Karte {
  id: string;
  vorne: string;
  hinten: string;
  thema: string;
}

function QuizBereich() {
  const [thema, setThema] = useState<string>("alle");
  const [stufe, setStufe] = useState<Stufe | 0>(0);
  const [fragen, setFragen] = useState<Frage[] | null>(null);
  const [index, setIndex] = useState(0);
  const [antwort, setAntwort] = useState<number | null>(null);
  const [punkte, setPunkte] = useState(0);

  const starten = () => {
    setFragen(ziehe(thema as never, stufe, 10));
    setIndex(0);
    setAntwort(null);
    setPunkte(0);
    logEvent("search", { query: `quiz:${thema}:${stufe}`, section: "lernen" });
  };

  if (!fragen) {
    return (
      <div className="karte p-6 max-w-xl">
        <h2 className="font-serif text-2xl text-gold">Quiz starten</h2>
        <p className="text-sm text-cremedim mt-2">
          {alleFragen.length} Fragen, automatisch aus den geprüften Datensätzen des Atlas erzeugt —
          jede Antwort ist quellengedeckt. Wähle Thema und Schwierigkeit:
        </p>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div>
            <label className="text-sm text-gold font-semibold">Thema</label>
            <select className="eingabe mt-1" value={thema} onChange={(e) => setThema(e.target.value)}>
              <option value="alle">Alle Themen</option>
              {Object.entries(THEMEN).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm text-gold font-semibold">Schwierigkeit</label>
            <select className="eingabe mt-1" value={stufe} onChange={(e) => setStufe(Number(e.target.value) as Stufe | 0)}>
              <option value={0}>Gemischt</option>
              {Object.entries(STUFEN).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        </div>
        <button className="knopf knopf-gold mt-5 w-full" onClick={starten}>10 Fragen starten</button>
      </div>
    );
  }

  if (index >= fragen.length) {
    return (
      <div className="karte p-8 max-w-xl text-center">
        <h2 className="font-serif text-3xl gold-text">Ergebnis: {punkte} von {fragen.length}</h2>
        <p className="text-cremedim mt-3">
          {punkte === fragen.length ? "Masha'Allah — fehlerfrei!" :
            punkte >= 7 ? "Stark! Wiederhole die offenen Punkte im Atlas." :
              "Guter Anfang — die Erklärungen führen dich zu den passenden Karten im Atlas."}
        </p>
        <div className="flex gap-3 justify-center mt-6">
          <button className="knopf knopf-gold" onClick={starten}>Neue Runde</button>
          <button className="knopf" onClick={() => setFragen(null)}>Thema wechseln</button>
        </div>
      </div>
    );
  }

  const frage = fragen[index];
  const beantwortet = antwort !== null;

  return (
    <div className="max-w-2xl">
      <div className="flex justify-between items-center text-sm text-cremedim mb-3">
        <span>Frage {index + 1} / {fragen.length} · {THEMEN[frage.thema]} · {STUFEN[frage.stufe]}</span>
        <span className="text-goldhell font-semibold">{punkte} Punkte</span>
      </div>
      <div className="karte p-6">
        <h2 className="text-lg text-creme leading-relaxed">{frage.text}</h2>
        <div className="mt-4 space-y-2">
          {frage.optionen.map((o, i) => {
            let stil = "border-gold/25 hover:border-gold/60";
            if (beantwortet) {
              if (i === frage.richtig) stil = "border-smaragdhell bg-smaragd/20";
              else if (i === antwort) stil = "border-warn bg-warn/15";
              else stil = "border-gold/15 opacity-60";
            }
            return (
              <button
                key={i}
                disabled={beantwortet}
                className={`block w-full text-left px-4 py-2.5 rounded-lg border text-sm text-creme transition ${stil}`}
                onClick={() => {
                  setAntwort(i);
                  if (i === frage.richtig) setPunkte((p) => p + 1);
                }}
              >
                {o}
              </button>
            );
          })}
        </div>
        {beantwortet && (
          <div className="mt-4 border-t border-gold/15 pt-3 space-y-1">
            <p className={`font-semibold ${antwort === frage.richtig ? "text-smaragdhell" : "text-warn"}`}>
              {antwort === frage.richtig ? "Richtig!" : "Leider falsch."}
            </p>
            {frage.erklärung && <p className="text-sm text-cremedim">{frage.erklärung}</p>}
            {frage.quelle && <p className="text-xs text-goldhell">Quelle: {frage.quelle}</p>}
            <button className="knopf knopf-gold mt-2" onClick={() => { setIndex(index + 1); setAntwort(null); }}>
              {index + 1 < fragen.length ? "Nächste Frage" : "Zum Ergebnis"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function KartenBereich() {
  const { user } = useAuth();
  const [karten, setKarten] = useState<Karte[]>([]);
  const [vorne, setVorne] = useState("");
  const [hinten, setHinten] = useState("");
  const [thema, setThema] = useState("Allgemein");
  const [lernIndex, setLernIndex] = useState<number | null>(null);
  const [gedreht, setGedreht] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("flashcards").select("id, vorne, hinten, thema").order("created_at", { ascending: false })
      .then(({ data }) => setKarten((data as Karte[]) ?? []));
  }, [user?.id]);

  if (!user) {
    return (
      <div className="karte p-6 max-w-xl">
        <p className="text-creme">
          Eigene Karteikarten brauchen ein Konto, damit sie dir überall erhalten bleiben.{" "}
          <Link to="/login" className="text-goldhell underline">Anmelden</Link> oder{" "}
          <Link to="/registrieren" className="text-goldhell underline">registrieren</Link>.
        </p>
      </div>
    );
  }

  const anlegen = async () => {
    if (vorne.trim().length < 2 || hinten.trim().length < 2) return;
    const { data } = await supabase.from("flashcards")
      .insert({ user_id: user.id, vorne: vorne.trim(), hinten: hinten.trim(), thema: thema.trim() || "Allgemein" })
      .select("id, vorne, hinten, thema").single();
    if (data) setKarten([data as Karte, ...karten]);
    setVorne(""); setHinten("");
  };

  const löschen = async (id: string) => {
    await supabase.from("flashcards").delete().eq("id", id);
    setKarten(karten.filter((k) => k.id !== id));
    setLernIndex(null);
  };

  if (lernIndex !== null && karten.length > 0) {
    const k = karten[lernIndex % karten.length];
    return (
      <div className="max-w-xl">
        <button className="text-sm text-cremedim hover:text-creme" onClick={() => setLernIndex(null)}>← Zur Übersicht</button>
        <div
          className="karte p-10 mt-3 min-h-52 flex items-center justify-center text-center cursor-pointer select-none"
          onClick={() => setGedreht(!gedreht)}
        >
          <div>
            <p className="text-xs text-goldhell mb-2">{gedreht ? "Rückseite" : "Vorderseite"} · {k.thema} · Karte {(lernIndex % karten.length) + 1}/{karten.length}</p>
            <p className="text-xl text-creme leading-relaxed">{gedreht ? k.hinten : k.vorne}</p>
            <p className="text-xs text-cremedim mt-4">Klicken zum Umdrehen</p>
          </div>
        </div>
        <div className="flex gap-3 mt-4 justify-center">
          <button className="knopf" onClick={() => { setGedreht(false); setLernIndex(lernIndex + 1); }}>Nächste Karte</button>
          <button className="knopf knopf-gold" onClick={() => { setGedreht(false); setLernIndex(Math.floor(Math.random() * karten.length)); }}>Zufällig</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div className="karte p-5">
        <h2 className="font-serif text-xl text-gold">Neue Karteikarte</h2>
        <div className="grid gap-2 mt-3">
          <input className="eingabe" placeholder="Vorderseite (Frage / Begriff)" value={vorne} onChange={(e) => setVorne(e.target.value)} />
          <textarea className="eingabe min-h-20" placeholder="Rückseite (Antwort / Erklärung)" value={hinten} onChange={(e) => setHinten(e.target.value)} />
          <input className="eingabe" placeholder="Thema (z. B. Sira, Tajwid, Vokabeln)" value={thema} onChange={(e) => setThema(e.target.value)} />
          <button className="knopf knopf-gold" onClick={anlegen}>Karte speichern</button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl text-gold">Meine Karten ({karten.length})</h2>
        {karten.length > 0 && (
          <button className="knopf text-sm" onClick={() => { setGedreht(false); setLernIndex(0); }}>Lernmodus starten</button>
        )}
      </div>
      {karten.length === 0 && <p className="text-sm text-cremedim">Noch keine Karten — leg oben die erste an.</p>}
      <ul className="space-y-2">
        {karten.map((k) => (
          <li key={k.id} className="karte p-3 flex justify-between gap-3 items-start">
            <div>
              <p className="text-sm text-creme">{k.vorne}</p>
              <p className="text-xs text-cremedim mt-1">{k.hinten}</p>
              <p className="text-[10px] text-goldhell mt-1">{k.thema}</p>
            </div>
            <button className="text-warn text-sm hover:underline shrink-0" onClick={() => löschen(k.id)}>Löschen</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Lernen() {
  const [tab, setTab] = useState<"quiz" | "karten">("quiz");
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 w-full">
      <h1 className="font-serif text-4xl text-gold">Lernen</h1>
      <p className="text-cremedim mt-2 max-w-3xl">
        Teste dein Wissen mit quellengedeckten Quizfragen aus allen Atlas-Bereichen oder baue dir
        deine eigene Karteikarten-Sammlung.
      </p>
      <div className="flex gap-2 mt-6 mb-6">
        <button className={tab === "quiz" ? "knopf knopf-gold" : "knopf"} onClick={() => setTab("quiz")}>Quiz</button>
        <button className={tab === "karten" ? "knopf knopf-gold" : "knopf"} onClick={() => setTab("karten")}>Meine Karteikarten</button>
      </div>
      {tab === "quiz" ? <QuizBereich /> : <KartenBereich />}
    </div>
  );
}
