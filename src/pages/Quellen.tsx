// Vollständiges Quellenverzeichnis des Muslim-Atlas — jede Datengrundlage
// der App als Text, extern nachprüfbar.

const HADITH_BUECHER = [
  { name: "Sahih al-Bukhari", arabisch: "صحيح البخاري", autor: "Abu Abdillah Muhammad ibn Ismail al-Bukhari", daten: "194–256 AH / 810–870 n. Chr., Buchara und Naysabur", umfang: "ca. 7563 Hadithe mit Wiederholungen (ca. 2602 ohne)", nummerierung: "Nummerierung nach der Fath-al-Bari-Zählung (wie auf sunnah.com)", url: "https://sunnah.com/bukhari" },
  { name: "Sahih Muslim", arabisch: "صحيح مسلم", autor: "Abu l-Husayn Muslim ibn al-Hajjaj an-Naysaburi", daten: "204–261 AH / ca. 821–875 n. Chr., Naysabur", umfang: "ca. 7500 Hadithe mit Wiederholungen (ca. 3033 ohne; Zählung variiert)", nummerierung: "Nummerierung nach der Edition von Muhammad Fuad Abd al-Baqi", url: "https://sunnah.com/muslim" },
  { name: "Sunan Abi Dawud", arabisch: "سنن أبي داود", autor: "Abu Dawud Sulayman ibn al-Ash'ath as-Sijistani", daten: "202–275 AH / 817–889 n. Chr., Sijistan und Basra", umfang: "ca. 5274 Hadithe", nummerierung: "fortlaufende Standardzählung (sunnah.com)", url: "https://sunnah.com/abudawud" },
  { name: "Jami' at-Tirmidhi", arabisch: "جامع الترمذي", autor: "Abu Isa Muhammad ibn Isa at-Tirmidhi", daten: "209–279 AH / 824–892 n. Chr., Tirmidh", umfang: "ca. 3956 Hadithe, jeder vom Autor selbst bewertet", nummerierung: "fortlaufende Standardzählung (sunnah.com)", url: "https://sunnah.com/tirmidhi" },
  { name: "Sunan an-Nasa'i (al-Mujtaba)", arabisch: "سنن النسائي", autor: "Abu Abd ar-Rahman Ahmad ibn Shu'ayb an-Nasa'i", daten: "215–303 AH / 830–915 n. Chr., Nasa und Ägypten", umfang: "ca. 5758 Hadithe", nummerierung: "fortlaufende Standardzählung (sunnah.com)", url: "https://sunnah.com/nasai" },
  { name: "Sunan Ibn Majah", arabisch: "سنن ابن ماجه", autor: "Abu Abdillah Muhammad ibn Yazid Ibn Majah al-Qazwini", daten: "209–273 AH / 824–887 n. Chr., Qazwin", umfang: "ca. 4341 Hadithe", nummerierung: "fortlaufende Standardzählung (sunnah.com)", url: "https://sunnah.com/ibnmajah" },
];

const GRUPPEN: { titel: string; eintraege: { t: string; b: string; url?: string }[] }[] = [
  {
    titel: "Quran: Text, Lesarten und Übersetzung",
    eintraege: [
      { t: "Korantext (Standard)", b: "Riwaya Hafs an Asim in Uthmani-Schrift, bezogen über die freie API von alquran.cloud (Edition quran-uthmani).", url: "https://alquran.cloud" },
      { t: "Weitere Riwayat", b: "Warsh an Nafi', Qalun an Nafi', Shu'ba an Asim und ad-Duri an Abi Amr, bezogen über die freie quran-api (fawazahmed0), Editionen ara-quranwarsh, ara-quranqaloon, ara-quranshouba, ara-qurandoori.", url: "https://github.com/fawazahmed0/quran-api" },
      { t: "Deutsche Übersetzung", b: "\"Der edle Qur'an und die Übersetzung seiner Bedeutungen in die deutsche Sprache\" von Abdullah Frank Bubenheim und Nadeem Elyas (Edition de.bubenheim).", url: "https://quran.com" },
      { t: "Verszählung und Chronologie", b: "Verszahlen nach der kufischen Zählung (Hafs); Offenbarungsreihenfolge nach der traditionellen ägyptischen Chronologie, dokumentiert u. a. bei as-Suyuti, al-Itqan fi Ulum al-Qur'an. Die Reihenfolge ist Gelehrtenarbeit und als ungefähr zu verstehen [Khilaf]." },
    ],
  },
  {
    titel: "Sira und Geschichte",
    eintraege: [
      { t: "Ibn Hisham", b: "as-Sira an-Nabawiyya (die Redaktion der Sira des Ibn Ishaq durch Abd al-Malik ibn Hisham, gest. 218 AH / 833) — Hauptquelle der Ereignis- und Personendaten der Sira-Karte." },
      { t: "Safi ar-Rahman al-Mubarakpuri", b: "ar-Rahiq al-Makhtum (\"Der versiegelte Nektar\"), preisgekrönte moderne Sira-Zusammenfassung auf Grundlage der klassischen Quellen." },
      { t: "Ibn Kathir", b: "al-Bidaya wan-Nihaya (Weltgeschichte) und Qasas al-Anbiya (Prophetengeschichten, gest. 774 AH / 1373) — Grundlage des Propheten-Atlas." },
      { t: "Ibn Sa'd", b: "at-Tabaqat al-Kubra (gest. 230 AH / 845) — biografische Angaben zu Gefährtinnen und Gefährten." },
      { t: "at-Tabari", b: "Tarikh ar-Rusul wal-Muluk (gest. 310 AH / 923). Wichtig: at-Tabari sammelt Berichte mit ihren Ketten ohne eigene Bewertung; Einzelberichte sind gesondert zu prüfen." },
    ],
  },
  {
    titel: "Tradentenbewertung (Rijal) und Hadith-Gradings",
    eintraege: [
      { t: "Ibn Hajar al-Asqalani", b: "Taqrib at-Tahdhib (Kurzbewertung der Tradenten — Grundlage der Bewertungsskala im Hadith-Atlas) und al-Isaba fi Tamyiz as-Sahaba (Lexikon der Gefährten, gest. 852 AH / 1449)." },
      { t: "adh-Dhahabi", b: "Siyar A'lam an-Nubala (Gelehrtenbiografien — Hauptquelle der Lebensdaten im Gelehrten-Atlas) und Mizan al-I'tidal (Tradentenkritik, gest. 748 AH / 1348)." },
      { t: "Klassische Gradings", b: "at-Tirmidhis eigene Bewertungen; al-Hakim, al-Mustadrak (mit adh-Dhahabis Talkhis); al-Bayhaqi; al-Mizzi." },
      { t: "Moderne Gradings", b: "Muhammad Nasir ad-Din al-Albani (u. a. Sahih al-Jami as-Saghir, Sahih/Da'if der Sunan-Werke) — stets als Stimme gekennzeichnet, nicht als alleinige Instanz." },
      { t: "Zählung der Überlieferungen pro Gefährte", b: "Nach dem Musnad des Baqi ibn Makhlad (gest. 276 AH / 889), dokumentiert bei Ibn Hazm und Ibn al-Jawzi. Zählungen variieren je Ausgabe; alle Zahlen in der App sind als \"ca.\" zu verstehen." },
    ],
  },
  {
    titel: "Arbeitsweise des Muslim-Atlas",
    eintraege: [
      { t: "Quellenpflicht", b: "Jeder Knoten trägt seine Quellen; Hadith- und Quran-Belege sind direkt zu sunnah.com und quran.com verlinkt und dort extern nachprüfbar." },
      { t: "Kennzeichnung", b: "[Khilaf] = unter den Gelehrten umstritten; [Jumhur] = Mehrheitsmeinung; [Überlieferung/Legende] = nicht gesichert. Schwache Tradenten werden benannt und erklärt, nicht versteckt." },
      { t: "Wachsender Kern", b: "Der Datensatz ist ein kuratierter, korrekt belegter Kern und wächst kontinuierlich; Fehlerhinweise sind ausdrücklich willkommen." },
    ],
  },
];

export default function Quellen() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 w-full">
      <h1 className="font-serif text-4xl text-gold">Quellenverzeichnis</h1>
      <p className="text-cremedim mt-2 max-w-3xl">
        Alle Datengrundlagen des Muslim-Atlas im Überblick — vollständig und extern nachprüfbar.
      </p>

      <h2 className="font-serif text-2xl text-goldhell mt-8 mb-3">Die sechs Hadith-Sammlungen (al-Kutub as-Sitta)</h2>
      <div className="space-y-3">
        {HADITH_BUECHER.map((b) => (
          <div key={b.name} className="karte p-4">
            <div className="flex justify-between items-start gap-3 flex-wrap">
              <h3 className="text-creme font-semibold">{b.name}</h3>
              <span className="font-arabic text-lg text-cremedim" dir="rtl">{b.arabisch}</span>
            </div>
            <p className="text-sm text-cremedim mt-1">{b.autor} ({b.daten})</p>
            <p className="text-sm text-cremedim">{b.umfang} · {b.nummerierung}</p>
            <a href={b.url} target="_blank" rel="noopener noreferrer" className="text-xs text-goldhell underline">
              Volltext auf sunnah.com ↗
            </a>
          </div>
        ))}
      </div>

      {GRUPPEN.map((g) => (
        <div key={g.titel}>
          <h2 className="font-serif text-2xl text-goldhell mt-8 mb-3">{g.titel}</h2>
          <div className="space-y-3">
            {g.eintraege.map((e) => (
              <div key={e.t} className="karte p-4">
                <h3 className="text-creme font-semibold text-sm">{e.t}</h3>
                <p className="text-sm text-cremedim mt-1 leading-relaxed">{e.b}</p>
                {e.url && (
                  <a href={e.url} target="_blank" rel="noopener noreferrer" className="text-xs text-goldhell underline">
                    {e.url} ↗
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
