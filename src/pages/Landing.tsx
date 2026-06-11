import { Link } from "react-router-dom";
import { siraNodes, siraEdges } from "../data/sira";
import { hadithBücher, hadithe, narratoren } from "../data/hadith";
import { prophetenConfig } from "../data/propheten";
import { surenAnzahl } from "../data/quran";
import { gelehrteConfig } from "../data/gelehrte";
import { alleFragen } from "../lib/fragen";
import { Logo } from "../components/Logo";

function Stern({ klasse }: { klasse?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={klasse ?? "h-4 w-4"} aria-hidden>
      <path
        d="M50 4 L60 28 L84 16 L72 40 L96 50 L72 60 L84 84 L60 72 L50 96 L40 72 L16 84 L28 60 L4 50 L28 40 L16 16 L40 28 Z"
        fill="currentColor"
      />
    </svg>
  );
}

const BEREICHE = [
  {
    zu: "/sira",
    zeichen: "ﷺ",
    titel: "Sira des Propheten ﷺ",
    text: `${siraNodes.length} Knoten, ${siraEdges.length} Verbindungen (570 bis 632): Familie, Gefährten, Gegner, Schlachten, Konversionen, Korrekturen durch Offenbarung.`,
  },
  {
    zu: "/sira?bereich=sahaba",
    zeichen: "صحابة",
    titel: "Die Sahaba",
    text: "Die Gefährtinnen und Gefährten mit Nähe-Filter und Wirkungsorten: vom engsten Kreis bis zu den Reisenden nach Zypern, Konstantinopel und Samarkand.",
  },
  {
    zu: "/propheten",
    zeichen: "الأنبياء",
    titel: "Propheten: Adam bis Isa",
    text: `${prophetenConfig.nodes.length} Knoten: alle 25 im Quran genannten Propheten mit ihren Gefährten, Gegnern, Völkern und Schlüsselereignissen (Qasas al-Anbiya).`,
  },
  {
    zu: "/quran",
    zeichen: "القرآن",
    titel: "Quran-Chronologie",
    text: `Alle ${surenAnzahl} Suren nach ungefährer Offenbarungsreihenfolge, mit Überlieferern, Offenbarungsanlässen und Hinweisen zur abschnittsweisen Offenbarung.`,
  },
  {
    zu: "/hadith",
    zeichen: "الحديث",
    titel: "Hadith-Atlas",
    text: `Die ${hadithBücher.length} großen Sammlungen, ${narratoren.length} bewertete Tradenten, ${hadithe.length} Beispielketten: jede Schwachstelle erklärt, Gelehrtenstimmen mit Richtung.`,
  },
  {
    zu: "/gelehrte",
    zeichen: "العلماء",
    titel: "Gelehrten-Atlas",
    text: `${gelehrteConfig.nodes.length} Knoten von Abu Hanifa bis Ibn Hajar, filterbar nach Richtung (Athari/Salafi, Ash'ari, Maturidi, Sufi) und Rechtsschule; Debatten fair mit [Khilaf].`,
  },
  {
    zu: "/hifz",
    zeichen: "حفظ",
    titel: "Quran lesen & auswendig lernen",
    text: "Der vollständige Qurantext (Hafs an Asim) mit deutscher Übersetzung, Auswendiglern-Abfrage mit Gelb-Orange-Rot-System, persönlichem Lernplan und den zehn Lesarten.",
  },
  {
    zu: "/lernen",
    zeichen: "تعلم",
    titel: "Lernen: Quiz & Karteikarten",
    text: `${alleFragen.length} quellengedeckte Quizfragen aus allen Bereichen, nach Thema und Schwierigkeit wählbar; dazu deine eigene Karteikarten-Sammlung.`,
  },
];

export default function Landing() {
  const knotenGesamt =
    siraNodes.length + prophetenConfig.nodes.length + surenAnzahl + narratoren.length + gelehrteConfig.nodes.length;

  return (
    <div className="muster">
      <section className="hero-glow mx-auto max-w-5xl px-4 pt-16 pb-8 text-center">
        <div className="einblenden relative">
          <div className="flex justify-center mb-4 drop-shadow-[0_0_24px_rgba(212,175,55,0.45)]">
            <Logo className="h-16 w-16" />
          </div>
          <h1 className="font-serif text-5xl md:text-7xl gold-text leading-tight">Muslim-Atlas</h1>
          <p className="font-arabic text-2xl md:text-3xl text-cremedim mt-3" dir="rtl">
            أطلس السيرة والعلوم الإسلامية
          </p>
          <p className="mt-6 text-lg text-creme max-w-2xl mx-auto leading-relaxed">
            Islamisches Wissen als interaktive Wissenskarten, aus sunnitischer Sicht und mit Quelle
            an jedem Fakt: Wähle deinen Bereich, filtere, zoome, recherchiere; und speichere mit
            deinem Konto eigene Notizen an jedem Knoten.
          </p>
        </div>

        <div className="einblenden einblenden-2 mt-8 flex flex-wrap justify-center gap-x-10 gap-y-3 text-sm">
          <div><span className="text-2xl font-serif text-goldhell">{knotenGesamt}+</span><span className="block text-cremedim">Wissensknoten</span></div>
          <div><span className="text-2xl font-serif text-goldhell">{BEREICHE.length}</span><span className="block text-cremedim">Wissensbereiche</span></div>
          <div><span className="text-2xl font-serif text-goldhell">{alleFragen.length}</span><span className="block text-cremedim">Quizfragen</span></div>
          <div><span className="text-2xl font-serif text-goldhell">114</span><span className="block text-cremedim">Suren im Volltext</span></div>
          <div><span className="text-2xl font-serif text-goldhell">100 %</span><span className="block text-cremedim">mit Quellenangabe</span></div>
        </div>

        <div className="ornament mt-10 einblenden einblenden-3">
          <Stern />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {BEREICHE.map((b, i) => (
          <Link
            key={b.zu}
            to={b.zu}
            className={`karte karte-aktiv p-6 group flex flex-col einblenden einblenden-${Math.min(i + 1, 5)}`}
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-serif text-xl text-gold group-hover:text-goldhell transition-colors">{b.titel}</h2>
              <span className="font-arabic text-xl text-smaragdhell/80 shrink-0" dir="rtl">{b.zeichen}</span>
            </div>
            <p className="text-cremedim mt-2 text-sm leading-relaxed flex-1">{b.text}</p>
            <span className="inline-flex items-center gap-1 mt-4 text-smaragdhell font-semibold text-sm group-hover:gap-2 transition-all">
              Karte öffnen <span aria-hidden>→</span>
            </span>
          </Link>
        ))}
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-14">
        <div className="ornament mb-8"><Stern /></div>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="karte p-6">
            <h3 className="font-serif text-xl text-gold">Was ist der Muslim-Atlas?</h3>
            <p className="text-cremedim mt-2 leading-relaxed text-sm">
              Ein Recherche-Werkzeug zum Verstehen von Zusammenhängen: Statt Listen und Fließtext
              zeigt der Atlas Personen, Ereignisse, Suren, Ketten und Werke als Netz. Jede Karte hat
              Suche, Filter und ein Detail-Panel mit Quellen und deiner persönlichen Notiz.
            </p>
          </div>
          <div className="karte p-6 border-gold/40">
            <h3 className="font-serif text-xl text-goldhell">Datengrundlage & Nachprüfbarkeit</h3>
            <p className="text-cremedim mt-2 text-sm leading-relaxed">
              Kuratiert aus klassischen sunnitischen Quellen: Quran, die sechs Hadith-Sammlungen,
              Ibn Hisham, ar-Rahiq al-Makhtum, Ibn Kathir, adh-Dhahabi und Ibn Hajar. Belege sind zu
              sunnah.com und quran.com verlinkt, damit jede Angabe extern nachgeprüft werden kann.
              Umstrittenes trägt [Khilaf], Mehrheitsmeinungen [Jumhur]; der Datensatz ist ein
              wachsender, korrekt belegter Kern.
            </p>
            <Link to="/quellen" className="inline-block mt-3 text-sm text-goldhell underline font-medium">
              Vollständiges Quellenverzeichnis →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
