import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { STUFEN_LABEL, setzeStufe, stufeLokal, type Wissensstufe } from "../lib/stufe";
import { THEMES, aktivesTheme, wendeThemeAn, knotenform, setzeKnotenform, type Knotenform } from "../lib/design";
import { Logo } from "../components/Logo";

// Onboarding-Fragebogen: Wissensstand, Lernziele und Design — die Mindmaps
// passen sich danach automatisch an. Jederzeit wieder aufrufbar (/willkommen).

const BEREICHE: { id: string; label: string }[] = [
  { id: "sira", label: "Sira des Propheten ﷺ" },
  { id: "propheten", label: "Prophetengeschichten" },
  { id: "quran", label: "Quran" },
  { id: "hadith", label: "Hadith-Wissenschaft" },
  { id: "gelehrte", label: "Gelehrte & Werke" },
];

const LERNZIELE = [
  "Sira verstehen", "Quran auswendig lernen", "Hadith-Wissenschaft", "Die Gefährten kennenlernen",
  "Prophetengeschichten", "Gelehrte & Rechtsschulen", "Quizze & Karteikarten",
];

function interessenLokal(): string[] {
  try { return JSON.parse(localStorage.getItem("interessen") ?? "[]"); } catch { return []; }
}

export default function Willkommen() {
  const { user, profil } = useAuth();
  const navigate = useNavigate();
  const [stufen, setStufen] = useState<Record<string, Wissensstufe>>(() =>
    Object.fromEntries(BEREICHE.map((b) => [b.id, stufeLokal(b.id)])),
  );
  const [interessen, setInteressen] = useState<string[]>(interessenLokal());
  const [theme, setTheme] = useState(aktivesTheme());
  const [form, setForm] = useState<Knotenform>(knotenform());

  const speichern = async () => {
    for (const [bereich, wert] of Object.entries(stufen)) setzeStufe(bereich, wert, user?.id);
    localStorage.setItem("interessen", JSON.stringify(interessen));
    wendeThemeAn(theme);
    setzeKnotenform(form);
    if (user) {
      await supabase.from("profiles").update({ interessen }).eq("id", user.id);
    }
    navigate(interessen.includes("Quran auswendig lernen") ? "/hifz" : "/sira");
  };

  return (
    <div className="muster flex-1">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="text-center">
          <div className="flex justify-center mb-3"><Logo className="h-14 w-14" /></div>
          <h1 className="font-serif text-4xl gold-text">
            {profil?.username ? `Willkommen, ${profil.username}!` : "Willkommen im Muslim-Atlas!"}
          </h1>
          <p className="text-cremedim mt-3 max-w-xl mx-auto">
            Drei kurze Fragen, damit sich der Atlas an dich anpasst — alles lässt sich später
            jederzeit ändern (diese Seite ist unter „Einstellungen" wieder erreichbar).
          </p>
        </div>

        <div className="karte p-6 mt-8">
          <h2 className="font-serif text-xl text-gold">1. Wie viel Wissen bringst du mit?</h2>
          <p className="text-xs text-cremedim mt-1">Die Mindmaps zeigen dir dann genau die richtige Tiefe.</p>
          <div className="mt-4 space-y-3">
            {BEREICHE.map((b) => (
              <div key={b.id} className="flex flex-col md:flex-row md:items-center gap-2">
                <span className="text-sm text-creme md:w-56">{b.label}</span>
                <div className="flex gap-2">
                  {([1, 2, 3] as Wissensstufe[]).map((w) => (
                    <button
                      key={w}
                      className={`px-3 py-1.5 rounded-lg border text-xs transition ${
                        stufen[b.id] === w ? "border-gold text-gold bg-gold/10" : "border-gold/20 text-cremedim hover:border-gold/50"
                      }`}
                      onClick={() => setStufen({ ...stufen, [b.id]: w })}
                    >
                      {STUFEN_LABEL[w].split(" — ")[0]}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="karte p-6 mt-5">
          <h2 className="font-serif text-xl text-gold">2. Was möchtest du lernen?</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {LERNZIELE.map((z) => (
              <button
                key={z}
                className={`px-3 py-1.5 rounded-full border text-sm transition ${
                  interessen.includes(z) ? "border-smaragdhell text-smaragdhell bg-smaragd/15" : "border-gold/20 text-cremedim hover:border-gold/50"
                }`}
                onClick={() =>
                  setInteressen(interessen.includes(z) ? interessen.filter((x) => x !== z) : [...interessen, z])
                }
              >
                {z}
              </button>
            ))}
          </div>
        </div>

        <div className="karte p-6 mt-5">
          <h2 className="font-serif text-xl text-gold">3. Dein Design</h2>
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
            {THEMES.map((t) => (
              <button
                key={t.id}
                className={`rounded-xl border p-3 text-left transition ${theme === t.id ? "border-gold" : "border-gold/20 hover:border-gold/50"}`}
                onClick={() => { setTheme(t.id); wendeThemeAn(t.id); }}
              >
                <div className="flex gap-1.5 mb-2">
                  <span className="h-4 w-4 rounded-full" style={{ background: t.vars["--color-grund"] ?? "#0a1812" }} />
                  <span className="h-4 w-4 rounded-full" style={{ background: t.vars["--color-smaragd"] ?? "#1f6f54" }} />
                  <span className="h-4 w-4 rounded-full" style={{ background: t.vars["--color-gold"] ?? "#d4af37" }} />
                </div>
                <span className="text-xs text-creme">{t.label}</span>
              </button>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-3">
            <span className="text-sm text-creme">Knotenform auf den Karten:</span>
            {(["rund", "eckig"] as Knotenform[]).map((f) => (
              <button
                key={f}
                className={`px-3 py-1.5 border text-sm transition ${f === "rund" ? "rounded-full" : "rounded-md"} ${
                  form === f ? "border-gold text-gold bg-gold/10" : "border-gold/20 text-cremedim hover:border-gold/50"
                }`}
                onClick={() => setForm(f)}
              >
                {f === "rund" ? "Rund" : "Eckig"}
              </button>
            ))}
          </div>
        </div>

        <button className="knopf knopf-gold w-full mt-6 text-lg py-3" onClick={speichern}>
          Los geht's — Atlas an mich anpassen
        </button>
      </div>
    </div>
  );
}
