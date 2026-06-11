// Quiz-Generator: erzeugt Fragen programmgesteuert aus den kuratierten Datensätzen.
// Dadurch ist jede Antwort durch die Quellen der Knoten gedeckt — nichts ist erfunden.

import { siraNodes, siraEdges, nodeById, KATEGORIE_INFO } from "../data/sira";
import { prophetenConfig } from "../data/propheten";
import { quranConfig, surenListe } from "../data/quran";
import { narratoren, hadithBücher, BEWERTUNG_INFO } from "../data/hadith";
import { gelehrteConfig } from "../data/gelehrte";

export type Stufe = 1 | 2 | 3;

export interface Frage {
  id: string;
  thema: string;
  stufe: Stufe;
  text: string;
  optionen: string[];
  richtig: number; // Index in optionen
  erklärung?: string;
  quelle?: string;
}

export const THEMEN: Record<string, string> = {
  sira: "Sira des Propheten ﷺ",
  propheten: "Propheten & Geschichten",
  quran: "Quran",
  hadith: "Hadith-Wissenschaft",
  gelehrte: "Gelehrte & Werke",
};

export const STUFEN: Record<Stufe, string> = { 1: "Leicht", 2: "Mittel", 3: "Schwer" };

function mische<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function kurz(text: string, max = 160): string {
  const erster = text.split(/(?<=[.;])\s/)[0] ?? text;
  return erster.length > max ? erster.slice(0, max - 1) + "…" : erster;
}

// Baut eine Multiple-Choice-Frage mit 3 Distraktoren aus einem Pool
function mc(
  id: string, thema: string, stufe: Stufe, text: string,
  richtigeAntwort: string, pool: string[], erklärung?: string, quelle?: string,
): Frage | null {
  const distraktoren = mische(pool.filter((p) => p !== richtigeAntwort)).slice(0, 3);
  if (distraktoren.length < 3) return null;
  const optionen = mische([richtigeAntwort, ...distraktoren]);
  return { id, thema, stufe, text, optionen, richtig: optionen.indexOf(richtigeAntwort), erklärung, quelle };
}

function baueAlle(): Frage[] {
  const fragen: Frage[] = [];
  const f = (q: Frage | null) => { if (q) fragen.push(q); };

  // ---------- SIRA ----------
  const siraPersonen = siraNodes.filter((n) => !["ereignis", "korrektur"].includes(n.kategorie));
  const siraEreignisse = siraNodes.filter((n) => n.kategorie === "ereignis");
  const namenProKategorie = (kat: string) => siraPersonen.filter((n) => n.kategorie === kat).map((n) => n.name);

  // Wer war ...? (Beschreibung -> Name)
  for (const n of siraPersonen) {
    const ersterToken = n.name.split(" ")[0];
    if (ersterToken.length > 3 && n.zusammenfassung.includes(ersterToken)) continue;
    const stufe: Stufe = (n.nähe ?? 2) as Stufe;
    f(mc(`s-wer-${n.id}`, "sira", stufe > 3 ? 3 : stufe,
      `Wer wird hier beschrieben? "${kurz(n.zusammenfassung)}"`,
      n.name, namenProKategorie(n.kategorie),
      n.zusammenfassung, n.quellen.join("; ")));
  }

  // In welchem Jahr ...? (Ereignisse)
  const beruehmt = new Set(["ev-offenbarung", "ev-hidschra", "ev-badr", "ev-uhud", "ev-fath", "ev-tod", "ev-geburt"]);
  const alleJahre = [...new Set(siraEreignisse.map((e) => String(e.jahr)))];
  for (const e of siraEreignisse) {
    f(mc(`s-jahr-${e.id}`, "sira", beruehmt.has(e.id) ? 1 : 2,
      `In welchem Jahr (n. Chr.) fand statt: ${e.name}?`,
      String(e.jahr), alleJahre, kurz(e.zusammenfassung), e.quellen.join("; ")));
  }

  // Beziehungsfragen aus Kanten
  const beziehungsText: Record<string, (von: string, nach: string) => string> = {
    toetete: (_v, n) => `Wer tötete ${n}?`,
    konvertierte_durch: (v) => `Durch wen kam ${v} zum Islam?`,
    rettete: (_v, n) => `Wer rettete oder schützte ${n}?`,
    freigelassen_von: (v) => `Wer kaufte ${v} frei bzw. ließ ihn frei?`,
  };
  for (const e of siraEdges) {
    const macher = beziehungsText[e.typ];
    if (!macher) continue;
    const von = nodeById.get(e.von)!;
    const nach = nodeById.get(e.nach)!;
    if (nach.kategorie === "ereignis" || von.kategorie === "ereignis") continue;
    const antwort = e.typ === "konvertierte_durch" ? nach.name : von.name;
    const pool = siraPersonen.map((n) => n.name);
    f(mc(`s-bez-${e.id}`, "sira", 2, macher(von.name, nach.name), antwort, pool,
      e.notiz, `${von.quellen[0] ?? ""}`));
  }

  // Wo wirkte ...? (Wirkungsorte)
  for (const n of siraPersonen) {
    if (!n.wirkungsort || n.wirkungsort.length < 12) continue;
    f(mc(`s-ort-${n.id}`, "sira", 3,
      `Welche Wirkungsorte gehören zu ${n.name}?`,
      n.wirkungsort,
      siraPersonen.filter((p) => p.wirkungsort && p.id !== n.id).map((p) => p.wirkungsort!),
      kurz(n.zusammenfassung), n.quellen.join("; ")));
  }

  // ---------- PROPHETEN ----------
  const pNodes = prophetenConfig.nodes;
  const pPropheten = pNodes.filter((n) => n.kategorie === "prophet" || n.kategorie === "ulul_azm");
  for (const e of prophetenConfig.edges.filter((e) => e.typ === "gesandt_zu")) {
    const von = pNodes.find((n) => n.id === e.von)!;
    const nach = pNodes.find((n) => n.id === e.nach)!;
    f(mc(`p-volk-${e.id}`, "propheten", 2,
      `Zu wem wurde ${von.name} gesandt?`, nach.name,
      pNodes.filter((n) => n.kategorie === "volk").map((n) => n.name),
      e.notiz, von.quellen.join("; ")));
  }
  for (const n of pPropheten) {
    const ersterToken = n.name.split(" ")[0];
    if (ersterToken.length > 3 && n.zusammenfassung.includes(ersterToken)) continue;
    f(mc(`p-wer-${n.id}`, "propheten", n.kategorie === "ulul_azm" ? 1 : 2,
      `Welcher Prophet wird hier beschrieben? "${kurz(n.zusammenfassung)}"`,
      n.name, pPropheten.map((p) => p.name), n.zusammenfassung, n.quellen.join("; ")));
  }
  const ululAzm = pNodes.filter((n) => n.kategorie === "ulul_azm").map((n) => n.name);
  for (const name of ululAzm) {
    f(mc(`p-azm-${name}`, "propheten", 1,
      "Wer gehört zu den Ulul-Azm, den fünf Entschlossenen unter den Gesandten (46:35)?",
      name, pPropheten.filter((n) => n.kategorie !== "ulul_azm").map((n) => n.name),
      "Die fünf Entschlossenen: Nuh, Ibrahim, Musa, Isa und Muhammad ﷺ.", "Quran 46:35; Quran 33:7"));
  }

  // ---------- QURAN ----------
  for (const s of surenListe) {
    f(mc(`q-typ-${s.nr}`, "quran", 2,
      `Ist Sure ${s.nr} (${s.name}) mekkanisch oder medinensisch?`,
      s.typ === "makki" ? "Mekkanisch" : "Medinensisch",
      ["Mekkanisch", "Medinensisch", "Teils/teils [es gibt nur makki/madani]", "Unbekannt"],
      undefined, "Traditionelle Einstufung; as-Suyuti, al-Itqan"));
    f(mc(`q-verse-${s.nr}`, "quran", 3,
      `Wie viele Verse hat Sure ${s.nr} (${s.name})? (Hafs-Zählung)`,
      String(s.verse), surenListe.map((x) => String(x.verse)),
      undefined, `Quran ${s.nr}`));
  }
  f(mc("q-erste", "quran", 1, "Welche Verse bildeten die allererste Offenbarung?",
    "Sure 96 (al-Alaq), Verse 1 bis 5", [
      "Sure 1 (al-Fatiha), komplett", "Sure 2 (al-Baqara), Vers 1 bis 5",
      "Sure 114 (an-Nas), komplett", "Sure 93 (ad-Duha), Vers 1 bis 3",
    ], "In der Höhle Hira: Iqra bismi rabbika...", "Bukhari 3"));
  f(mc("q-laengste", "quran", 1, "Welche ist die längste Sure des Quran?",
    "Sure 2 (al-Baqara) mit 286 Versen",
    ["Sure 3 (Al Imran)", "Sure 4 (an-Nisa)", "Sure 26 (ash-Shu'ara)", "Sure 6 (al-An'am)"],
    undefined, "Quran 2"));

  // ---------- HADITH ----------
  for (const b of hadithBücher) {
    f(mc(`h-autor-${b.id}`, "hadith", 1,
      `Wer verfasste ${b.name}?`, b.autor, hadithBücher.map((x) => x.autor),
      kurz(b.methodik), "adh-Dhahabi, Siyar"));
  }
  const bewertbar = narratoren.filter((n) => !["prophet", "sahabi"].includes(n.bewertung));
  for (const n of bewertbar) {
    f(mc(`h-bew-${n.id}`, "hadith", 3,
      `Wie bewerten die Rijal-Kritiker (Ibn Hajar, adh-Dhahabi) den Tradenten ${n.name}?`,
      BEWERTUNG_INFO[n.bewertung].label,
      Object.entries(BEWERTUNG_INFO).filter(([k]) => !["prophet", "sahabi"].includes(k)).map(([, v]) => v.label),
      n.anmerkung, "Ibn Hajar, Taqrib at-Tahdhib; adh-Dhahabi, Mizan al-Itidal"));
  }
  f(mc("h-mutawatir", "hadith", 2, "Was bedeutet 'Mutawatir' in der Hadith-Wissenschaft?",
    "Von so vielen unabhängigen Ketten überliefert, dass eine Verabredung zur Lüge ausgeschlossen ist",
    ["Ein Hadith mit nur einem Überlieferer pro Generation",
      "Ein schwacher Hadith mit unterbrochener Kette",
      "Ein Hadith, der nur im Sahih al-Bukhari steht"],
    undefined, "Ulum al-Hadith (Einführungswerke)"));
  f(mc("h-gharib", "hadith", 3, "Bedeutet 'gharib' (Einzelüberlieferung) automatisch, dass ein Hadith schwach ist?",
    "Nein: gharib beschreibt nur die Zahl der Überlieferer; Bukhari Nr. 1 ist gharib UND sahih",
    ["Ja, gharib bedeutet immer schwach", "Gharib gibt es nur bei erfundenen Hadithen",
      "Gharib bedeutet, der Text ist unverständlich"],
    undefined, "Ulum al-Hadith; Beispiel Bukhari 1"));

  // ---------- GELEHRTE ----------
  const gNodes = gelehrteConfig.nodes;
  const gPersonen = gNodes.filter((n) => ["imam", "muhaddith", "gelehrter"].includes(n.kategorie));
  for (const e of gelehrteConfig.edges.filter((e) => e.typ === "verfasste")) {
    const autor = gNodes.find((n) => n.id === e.von)!;
    const werk = gNodes.find((n) => n.id === e.nach)!;
    f(mc(`g-werk-${e.id}`, "gelehrte", 2,
      `Wer verfasste das Werk "${werk.name}"?`, autor.name, gPersonen.map((n) => n.name),
      kurz(werk.zusammenfassung), werk.quellen.join("; ")));
  }
  for (const n of gPersonen) {
    const madhhab = n.tags?.madhhab?.[0];
    if (!madhhab || madhhab === "mujtahid") continue;
    const labels: Record<string, string> = { hanafi: "Hanafi", maliki: "Maliki", shafii: "Shafi'i", hanbali: "Hanbali" };
    f(mc(`g-madhhab-${n.id}`, "gelehrte", 2,
      `Welcher Rechtsschule wird ${n.name} zugeordnet?`, labels[madhhab],
      ["Hanafi", "Maliki", "Shafi'i", "Hanbali"],
      kurz(n.zusammenfassung), n.quellen.join("; ")));
  }
  for (const e of gelehrteConfig.edges.filter((e) => e.typ === "lehrte")) {
    const lehrer = gNodes.find((n) => n.id === e.von)!;
    const schueler = gNodes.find((n) => n.id === e.nach)!;
    if (!gPersonen.includes(schueler)) continue;
    f(mc(`g-lehrer-${e.id}`, "gelehrte", 3,
      `Bei wem lernte ${schueler.name}?`, lehrer.name, gPersonen.map((n) => n.name),
      e.notiz, lehrer.quellen.join("; ")));
  }
  // Kategorienfrage aus der Sira als Bonus für Gelehrte-Vorstufe
  for (const [kat, info] of Object.entries(KATEGORIE_INFO)) {
    if (!["gefährte", "ansar", "gegner"].includes(kat)) continue;
    const beispiele = siraPersonen.filter((n) => n.kategorie === kat && (n.nähe ?? 2) === 1);
    for (const b of beispiele.slice(0, 6)) {
      f(mc(`s-kat-${b.id}`, "sira", 1,
        `Zu welcher Gruppe gehörte ${b.name}?`, info.label,
        Object.values(KATEGORIE_INFO).map((v) => v.label).filter((l) => !["Ereignisse", "Korrekturen durch Offenbarung", "Der Prophet ﷺ"].includes(l)),
        kurz(b.zusammenfassung), b.quellen.join("; ")));
    }
  }

  return fragen;
}

export const alleFragen: Frage[] = baueAlle();

export function ziehe(thema: string | "alle", stufe: Stufe | 0, anzahl: number): Frage[] {
  const pool = alleFragen.filter(
    (f) => (thema === "alle" || f.thema === thema) && (stufe === 0 || f.stufe === stufe),
  );
  return mische(pool).slice(0, anzahl).map((f) => {
    // Optionen pro Runde neu mischen
    const optionen = mische(f.optionen);
    return { ...f, optionen, richtig: optionen.indexOf(f.optionen[f.richtig]) };
  });
}
