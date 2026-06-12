// Bibliothek: die Referenzwerke des Atlas zum Online-Lesen plus Kaufhinweise.
// Nur sunnitische Standardwerke; keine Shop-Partnerschaften — Kauflinks sind
// neutrale Suchanfragen, bis Karams geprüfte Händlerliste eingepflegt ist.

interface Werk {
  titel: string;
  arabisch?: string;
  autor: string;
  beschreibung: string;
  lesen: { label: string; url: string }[];
  kaufenSuche?: string;
}

const KATEGORIEN: { titel: string; werke: Werk[] }[] = [
  {
    titel: "Quran & Übersetzung",
    werke: [
      {
        titel: "Der edle Qur'an (arabisch)", arabisch: "القرآن الكريم",
        autor: "Riwaya Hafs an Asim (weitere Riwayat in der App)",
        beschreibung: "Vollständig in dieser App lesbar (Bereich Hifz) — in fünf Riwayat.",
        lesen: [
          { label: "In dieser App lesen", url: "hifz" },
          { label: "quran.com (mit Übersetzungen, Tafsir, Audio)", url: "https://quran.com" },
        ],
        kaufenSuche: "Quran Mushaf Hafs Medina Druck",
      },
      {
        titel: "Übersetzung Bubenheim & Elyas", autor: "A. F. Bubenheim, N. Elyas",
        beschreibung: "Die verbreitetste deutsche Bedeutungsübersetzung (König-Fahd-Komplex); auch in dieser App eingebunden.",
        lesen: [{ label: "islam.de / quran.com (de)", url: "https://quran.com/?translations=27" }],
        kaufenSuche: "Bubenheim Elyas Quran Übersetzung kaufen",
      },
    ],
  },
  {
    titel: "Die sechs Hadith-Sammlungen",
    werke: [
      {
        titel: "Sahih al-Bukhari", arabisch: "صحيح البخاري", autor: "Imam al-Bukhari",
        beschreibung: "Das authentischste Buch nach dem Quran [Jumhur]. Volltext (arabisch) im Hadith-Atlas dieser App durchsuchbar.",
        lesen: [
          { label: "In dieser App (Volltext)", url: "hadith/bukhari" },
          { label: "sunnah.com (mit Übersetzungen)", url: "https://sunnah.com/bukhari" },
        ],
        kaufenSuche: "Sahih al-Bukhari deutsch kaufen",
      },
      {
        titel: "Sahih Muslim", arabisch: "صحيح مسلم", autor: "Imam Muslim",
        beschreibung: "Zweites Sahih-Werk; brillante thematische Anordnung.",
        lesen: [
          { label: "In dieser App (Volltext)", url: "hadith/muslim" },
          { label: "sunnah.com", url: "https://sunnah.com/muslim" },
        ],
        kaufenSuche: "Sahih Muslim deutsch kaufen",
      },
      {
        titel: "Die vier Sunan", autor: "Abu Dawud · at-Tirmidhi · an-Nasa'i · Ibn Majah",
        beschreibung: "Alle vier im Hadith-Atlas dieser App als Volltext, mit Methodik-Profilen und Beispielketten.",
        lesen: [
          { label: "In dieser App", url: "hadith" },
          { label: "sunnah.com", url: "https://sunnah.com" },
        ],
        kaufenSuche: "Sunan Abu Dawud Tirmidhi deutsch",
      },
      {
        titel: "Riyad as-Salihin", arabisch: "رياض الصالحين", autor: "Imam an-Nawawi",
        beschreibung: "Der beste Einstieg in die Hadith-Lektüre für den Alltag — weltweit bewährt.",
        lesen: [{ label: "sunnah.com/riyadussalihin", url: "https://sunnah.com/riyadussalihin" }],
        kaufenSuche: "Riyad us-Salihin deutsch kaufen",
      },
    ],
  },
  {
    titel: "Sira & Geschichte",
    werke: [
      {
        titel: "ar-Rahiq al-Makhtum (Der versiegelte Nektar)", arabisch: "الرحيق المختوم", autor: "Safi ar-Rahman al-Mubarakpuri",
        beschreibung: "Die beste moderne Sira-Zusammenfassung; Hauptquelle der Sira-Karte dieser App.",
        lesen: [{ label: "Sira-Karte dieser App", url: "sira" }],
        kaufenSuche: "Der versiegelte Nektar Sira Buch deutsch",
      },
      {
        titel: "as-Sira an-Nabawiyya", arabisch: "السيرة النبوية لابن هشام", autor: "Ibn Hisham",
        beschreibung: "Die klassische Sira (Redaktion des Ibn Ishaq); arabisches Original frei auf Shamela lesbar.",
        lesen: [{ label: "shamela.ws (arabisch)", url: "https://shamela.ws/book/23833" }],
        kaufenSuche: "Ibn Hisham Sira deutsch kaufen",
      },
      {
        titel: "Qasas al-Anbiya (Prophetengeschichten)", arabisch: "قصص الأنبياء", autor: "Ibn Kathir",
        beschreibung: "Grundlage des Propheten-Atlas dieser App: die Geschichten von Adam bis Isa nach Quran und Sunna.",
        lesen: [{ label: "Propheten-Atlas dieser App", url: "propheten" }],
        kaufenSuche: "Ibn Kathir Geschichten der Propheten deutsch",
      },
    ],
  },
  {
    titel: "Gelehrte, Aqida & Nachschlagewerke",
    werke: [
      {
        titel: "Siyar A'lam an-Nubala", arabisch: "سير أعلام النبلاء", autor: "adh-Dhahabi",
        beschreibung: "25 Bände Gelehrtenbiografien — Hauptquelle des Gelehrten-Atlas.",
        lesen: [{ label: "shamela.ws (arabisch)", url: "https://shamela.ws/book/10906" }],
      },
      {
        titel: "al-Aqida al-Wasitiyya", arabisch: "العقيدة الواسطية", autor: "Ibn Taymiyya",
        beschreibung: "Kompaktes Aqida-Bekenntnis im Stil der Salaf [Rezeption siehe Gelehrten-Atlas].",
        lesen: [{ label: "Gelehrten-Atlas dieser App", url: "gelehrte" }],
        kaufenSuche: "Aqida Wasitiyya deutsch kaufen",
      },
      {
        titel: "Vierzig Hadithe (al-Arba'in)", arabisch: "الأربعون النووية", autor: "an-Nawawi",
        beschreibung: "Die 42 Fundament-Hadithe der Religion; ideal zum Auswendiglernen.",
        lesen: [{ label: "sunnah.com/nawawi40", url: "https://sunnah.com/nawawi40" }],
        kaufenSuche: "40 Hadithe Nawawi deutsch kaufen",
      },
    ],
  },
];

export default function Bibliothek() {
  const basis = import.meta.env.BASE_URL;
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 w-full">
      <h1 className="font-serif text-4xl text-gold">Bibliothek</h1>
      <p className="text-cremedim mt-2 max-w-3xl">
        Die Referenzwerke des Muslim-Atlas — direkt online lesen oder als Buch anschaffen.
        Alle Werke sind sunnitische Standardliteratur.
      </p>
      <p className="text-xs text-goldhell mt-2 border border-gold/30 rounded px-3 py-2 inline-block">
        Hinweis: Die Kauf-Links sind neutrale Suchanfragen (keine Shop-Partnerschaft).
        Eine geprüfte Liste empfohlener islamischer Buchhandlungen wird ergänzt.
      </p>

      {KATEGORIEN.map((k) => (
        <div key={k.titel}>
          <h2 className="font-serif text-2xl text-goldhell mt-8 mb-3">{k.titel}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {k.werke.map((w) => (
              <div key={w.titel} className="karte karte-aktiv p-5 flex flex-col">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="text-creme font-semibold">{w.titel}</h3>
                  {w.arabisch && <span className="font-arabic text-lg text-cremedim shrink-0" dir="rtl">{w.arabisch}</span>}
                </div>
                <p className="text-xs text-goldhell mt-0.5">{w.autor}</p>
                <p className="text-sm text-cremedim mt-2 leading-relaxed flex-1">{w.beschreibung}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {w.lesen.map((l) => (
                    <a
                      key={l.label}
                      href={l.url.startsWith("http") ? l.url : `${basis}${l.url}`}
                      target={l.url.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="knopf text-xs py-1"
                    >
                      📖 {l.label}
                    </a>
                  ))}
                  {w.kaufenSuche && (
                    <a
                      href={`https://www.google.com/search?tbm=shop&q=${encodeURIComponent(w.kaufenSuche)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="knopf knopf-gold text-xs py-1"
                    >
                      Kaufen (Suche)
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
