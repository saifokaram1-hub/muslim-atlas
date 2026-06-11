// Quran-Chronologie: alle 114 Suren mit Offenbarungsort (makki/madani) und der
// traditionellen (ägyptischen) Offenbarungsreihenfolge. WICHTIG: Die genaue
// Reihenfolge ist Ergebnis klassischer Gelehrsamkeit und in Teilen umstritten;
// sie ist hier als "ca." zu verstehen. Umstrittene Einordnungen: [Khilaf].
// Verszahlen nach der kufischen Zählung (Hafs an Asim).

import type { AtlasNode, AtlasEdge, AtlasConfig } from "../components/AtlasGraph";

type Typ = "makki" | "madani";

// [Nr, Name, Arabisch, Verse, Typ, ca.-Offenbarungsreihenfolge, Themen, typKhilaf?]
const S: [number, string, string, number, Typ, number, string, boolean?][] = [
  [1, "al-Fatiha", "الفاتحة", 7, "makki", 5, "Du'a, Fundament des Gebets", true],
  [2, "al-Baqara", "البقرة", 286, "madani", 87, "Recht, Gemeinschaft, Banu Israil"],
  [3, "Al Imran", "آل عمران", 200, "madani", 89, "Ahl al-Kitab, Uhud, Maryam"],
  [4, "an-Nisa", "النساء", 176, "madani", 92, "Familienrecht, Frauen, Erbrecht"],
  [5, "al-Ma'ida", "المائدة", 120, "madani", 112, "Verträge, Speisegebote, Isa"],
  [6, "al-An'am", "الأنعام", 165, "makki", 55, "Tawhid, Widerlegung des Schirk"],
  [7, "al-A'raf", "الأعراف", 206, "makki", 39, "Prophetengeschichten, Adam und Iblis"],
  [8, "al-Anfal", "الأنفال", 75, "madani", 88, "Badr, Beuteverteilung"],
  [9, "at-Tawba", "التوبة", 129, "madani", 113, "Tabuk, Heuchler, Vertragsbruch"],
  [10, "Yunus", "يونس", 109, "makki", 51, "Tawhid, Yunus, Geduld"],
  [11, "Hud", "هود", 123, "makki", 52, "Prophetengeschichten, Standhaftigkeit"],
  [12, "Yusuf", "يوسف", 111, "makki", 53, "Geschichte Yusufs, Vergebung"],
  [13, "ar-Ra'd", "الرعد", 43, "madani", 96, "Allmacht Allahs, Wahrheit", true],
  [14, "Ibrahim", "إبراهيم", 52, "makki", 72, "Ibrahim, Dankbarkeit, Du'a"],
  [15, "al-Hijr", "الحجر", 99, "makki", 54, "Thamud, Schutz des Quran"],
  [16, "an-Nahl", "النحل", 128, "makki", 70, "Gnaden Allahs, Schöpfung"],
  [17, "al-Isra", "الإسراء", 111, "makki", 50, "Nachtreise, Banu Israil, Ethik"],
  [18, "al-Kahf", "الكهف", 110, "makki", 69, "Höhlenleute, Khidr, Dhul-Qarnayn"],
  [19, "Maryam", "مريم", 98, "makki", 44, "Maryam, Isa, Zakariyya"],
  [20, "TaHa", "طه", 135, "makki", 45, "Musa, Trost für den Propheten ﷺ"],
  [21, "al-Anbiya", "الأنبياء", 112, "makki", 73, "Die Propheten, Auferstehung"],
  [22, "al-Hajj", "الحج", 78, "madani", 103, "Hajj, Erlaubnis zur Verteidigung", true],
  [23, "al-Mu'minun", "المؤمنون", 118, "makki", 74, "Eigenschaften der Gläubigen"],
  [24, "an-Nur", "النور", 64, "madani", 102, "Ifk-Freispruch, Gesellschaftsregeln"],
  [25, "al-Furqan", "الفرقان", 77, "makki", 42, "Unterscheidung, Diener des Erbarmers"],
  [26, "ash-Shu'ara", "الشعراء", 227, "makki", 47, "Propheten vor ihren Völkern, Dichter"],
  [27, "an-Naml", "النمل", 93, "makki", 48, "Sulayman, Königin von Saba"],
  [28, "al-Qasas", "القصص", 88, "makki", 49, "Musa in Madyan, Qarun"],
  [29, "al-Ankabut", "العنكبوت", 69, "makki", 85, "Prüfung der Gläubigen"],
  [30, "ar-Rum", "الروم", 60, "makki", 84, "Byzanz-Prophezeiung, Zeichen Allahs"],
  [31, "Luqman", "لقمان", 34, "makki", 57, "Weisheit Luqmans, Erziehung"],
  [32, "as-Sajda", "السجدة", 30, "makki", 75, "Niederwerfung, Auferstehung"],
  [33, "al-Ahzab", "الأحزاب", 73, "madani", 90, "Grabenkrieg, Zaynab, Adoption"],
  [34, "Saba", "سبأ", 54, "makki", 58, "Saba, Dawud und Sulayman"],
  [35, "Fatir", "فاطر", 45, "makki", 43, "Der Schöpfer, Engel"],
  [36, "YaSin", "يس", 83, "makki", 41, "Auferstehung, Zeichen, Gesandte"],
  [37, "as-Saffat", "الصافات", 182, "makki", 56, "Engelreihen, Ibrahims Opfer"],
  [38, "Sad", "ص", 88, "makki", 38, "Dawud, Sulayman, Ayyub"],
  [39, "az-Zumar", "الزمر", 75, "makki", 59, "Aufrichtigkeit, Barmherzigkeit (53er Vers)"],
  [40, "Ghafir", "غافر", 85, "makki", 60, "Der Vergebende, gläubiger Mann Pharaos"],
  [41, "Fussilat", "فصلت", 54, "makki", 61, "Offenbarung, Utbas Begegnung"],
  [42, "ash-Shura", "الشورى", 53, "makki", 62, "Beratung, Einheit der Botschaft"],
  [43, "az-Zukhruf", "الزخرف", 89, "makki", 63, "Diesseitsschmuck, Isa kein Gott"],
  [44, "ad-Dukhan", "الدخان", 59, "makki", 64, "Der Rauch, Nacht der Segnung"],
  [45, "al-Jathiya", "الجاثية", 37, "makki", 65, "Die Kniende, Rechenschaft"],
  [46, "al-Ahqaf", "الأحقاف", 35, "makki", 66, "Ad, Eltern-Gehorsam, Dschinn hören zu"],
  [47, "Muhammad ﷺ", "محمد", 38, "madani", 95, "Kampfregeln, Heuchler"],
  [48, "al-Fath", "الفتح", 29, "madani", 111, "Hudaybiyya als offener Sieg, Ridwan-Eid"],
  [49, "al-Hujurat", "الحجرات", 18, "madani", 106, "Umgangsformen, Brüderlichkeit"],
  [50, "Qaf", "ق", 45, "makki", 34, "Auferstehung, Nähe Allahs"],
  [51, "adh-Dhariyat", "الذاريات", 60, "makki", 67, "Schwurverse, Gäste Ibrahims"],
  [52, "at-Tur", "الطور", 49, "makki", 76, "Der Berg, Gewissheit des Gerichts"],
  [53, "an-Najm", "النجم", 62, "makki", 23, "Der Stern, Wahrhaftigkeit der Schau"],
  [54, "al-Qamar", "القمر", 55, "makki", 37, "Mondspaltung, Mahn-Refrain"],
  [55, "ar-Rahman", "الرحمن", 78, "madani", 97, "Gnaden Allahs, \"Welche Wohltat leugnet ihr?\"", true],
  [56, "al-Waqi'a", "الواقعة", 96, "makki", 46, "Die drei Gruppen im Jenseits"],
  [57, "al-Hadid", "الحديد", 29, "madani", 94, "Das Eisen, Spenden vor dem Sieg"],
  [58, "al-Mujadila", "المجادلة", 22, "madani", 105, "Zihar-Streitfall, Allah hört"],
  [59, "al-Hashr", "الحشر", 24, "madani", 101, "Banu Nadir, die Schönsten Namen"],
  [60, "al-Mumtahana", "الممتحنة", 13, "madani", 91, "Loyalität, Prüfung der Auswanderinnen"],
  [61, "as-Saff", "الصف", 14, "madani", 109, "Reihen, Isas Verheißung Ahmads"],
  [62, "al-Jumu'a", "الجمعة", 11, "madani", 110, "Freitagsgebet"],
  [63, "al-Munafiqun", "المنافقون", 11, "madani", 104, "Die Heuchler um Ibn Ubayy"],
  [64, "at-Taghabun", "التغابن", 18, "madani", 108, "Tag der Übervorteilung", true],
  [65, "at-Talaq", "الطلاق", 12, "madani", 99, "Scheidungsrecht"],
  [66, "at-Tahrim", "التحريم", 12, "madani", 107, "Das selbstauferlegte Verbot (Itab)"],
  [67, "al-Mulk", "الملك", 30, "makki", 77, "Herrschaft Allahs, Schutz im Grab"],
  [68, "al-Qalam", "القلم", 52, "makki", 2, "Das Schreibrohr, Charakter des Propheten ﷺ"],
  [69, "al-Haqqa", "الحاقة", 52, "makki", 78, "Die Unvermeidbare"],
  [70, "al-Ma'arij", "المعارج", 44, "makki", 79, "Wege des Aufstiegs, Geduld"],
  [71, "Nuh", "نوح", 28, "makki", 71, "Nuhs 950-jährige Da'wa"],
  [72, "al-Jinn", "الجن", 28, "makki", 40, "Die Dschinn hören den Quran"],
  [73, "al-Muzzammil", "المزمل", 20, "makki", 3, "Nachtgebet, Vorbereitung"],
  [74, "al-Muddaththir", "المدثر", 56, "makki", 4, "Steh auf und warne, al-Walid"],
  [75, "al-Qiyama", "القيامة", 40, "makki", 31, "Auferstehung, Blick zum Herrn"],
  [76, "al-Insan", "الإنسان", 31, "madani", 98, "Der Mensch, Paradiesschilderung", true],
  [77, "al-Mursalat", "المرسلات", 50, "makki", 33, "Die Gesandten Winde"],
  [78, "an-Naba", "النبأ", 40, "makki", 80, "Die große Kunde"],
  [79, "an-Nazi'at", "النازعات", 46, "makki", 81, "Engel, die Stunde"],
  [80, "Abasa", "عبس", 42, "makki", 24, "Korrektur: der blinde Ibn Umm Maktum"],
  [81, "at-Takwir", "التكوير", 29, "makki", 7, "Weltende, Schau Jibrils"],
  [82, "al-Infitar", "الانفطار", 19, "makki", 82, "Spaltung des Himmels"],
  [83, "al-Mutaffifin", "المطففين", 36, "makki", 86, "Die im Mass Betruegen"],
  [84, "al-Inshiqaq", "الانشقاق", 25, "makki", 83, "Das Zerreißen"],
  [85, "al-Buruj", "البروج", 22, "makki", 27, "Die Grabenleute, Standhaftigkeit"],
  [86, "at-Tariq", "الطارق", 17, "makki", 36, "Der Nachtstern, Schöpfung"],
  [87, "al-A'la", "الأعلى", 19, "makki", 8, "Der Höchste, Erleichterung"],
  [88, "al-Ghashiya", "الغاشية", 26, "makki", 68, "Die Bedeckende, Gesichter im Jenseits"],
  [89, "al-Fajr", "الفجر", 30, "makki", 10, "Morgenröte, Ad und Thamud, die zufriedene Seele"],
  [90, "al-Balad", "البلد", 20, "makki", 35, "Die Stadt Mekka, der steile Weg"],
  [91, "ash-Shams", "الشمس", 15, "makki", 26, "Die Sonne, Läuterung der Seele, Thamud"],
  [92, "al-Layl", "الليل", 21, "makki", 9, "Die Nacht, zwei Wege"],
  [93, "ad-Duha", "الضحى", 11, "makki", 11, "Trost nach der Offenbarungspause"],
  [94, "ash-Sharh", "الشرح", 8, "makki", 12, "Weitung der Brust, mit Schwere kommt Leichtigkeit"],
  [95, "at-Tin", "التين", 8, "makki", 28, "Die Feige, beste Gestalt des Menschen"],
  [96, "al-Alaq", "العلق", 19, "makki", 1, "Iqra: die erste Offenbarung in Hira"],
  [97, "al-Qadr", "القدر", 5, "makki", 25, "Nacht der Bestimmung"],
  [98, "al-Bayyina", "البينة", 8, "madani", 100, "Der klare Beweis", true],
  [99, "az-Zalzala", "الزلزلة", 8, "madani", 93, "Das Erdbeben, Staubkorn-Gerechtigkeit", true],
  [100, "al-Adiyat", "العاديات", 11, "makki", 14, "Die Renner, Undank des Menschen"],
  [101, "al-Qari'a", "القارعة", 11, "makki", 30, "Die Katastrophe, die Waage"],
  [102, "at-Takathur", "التكاثر", 8, "makki", 16, "Wettstreit um Vermehrung"],
  [103, "al-Asr", "العصر", 3, "makki", 13, "Die Zeit, der Mensch im Verlust"],
  [104, "al-Humaza", "الهمزة", 9, "makki", 32, "Der Lästerer und Geizige"],
  [105, "al-Fil", "الفيل", 5, "makki", 19, "Das Jahr des Elefanten"],
  [106, "Quraysh", "قريش", 4, "makki", 29, "Die Karawanen der Quraysh"],
  [107, "al-Ma'un", "الماعون", 7, "makki", 17, "Kleine Hilfeleistung, Gebetsvergessene"],
  [108, "al-Kawthar", "الكوثر", 3, "makki", 15, "Der Überfluss, kürzeste Sure"],
  [109, "al-Kafirun", "الكافرون", 6, "makki", 18, "Klare Abgrenzung im Glauben"],
  [110, "an-Nasr", "النصر", 3, "madani", 114, "Der Sieg, Ankündigung des Abschieds"],
  [111, "al-Masad", "المسد", 5, "makki", 6, "Verurteilung Abu Lahabs"],
  [112, "al-Ikhlas", "الإخلاص", 4, "makki", 22, "Reiner Tawhid, ein Drittel des Quran", true],
  [113, "al-Falaq", "الفلق", 5, "makki", 20, "Schutzsure (Morgendämmerung)", true],
  [114, "an-Nas", "الناس", 6, "makki", 21, "Schutzsure (die Menschen)", true],
];

function phaseVon(typ: Typ, order: number): string {
  if (typ === "madani") return "medinensisch";
  if (order <= 32) return "früh_mekkanisch";
  if (order <= 60) return "mittel_mekkanisch";
  return "spät_mekkanisch";
}

const PHASEN_INFO: Record<string, string> = {
  früh_mekkanisch: "Früh-mekkanisch (ca. 610 bis 615)",
  mittel_mekkanisch: "Mittel-mekkanisch (ca. 615 bis 619)",
  spät_mekkanisch: "Spät-mekkanisch (ca. 619 bis 622)",
  medinensisch: "Medinensisch (622 bis 632)",
};

const KATEGORIEN: AtlasConfig["kategorien"] = {
  makki: { label: "Makki (Mekka)", farbe: "#2f9d77" },
  madani: { label: "Madani (Medina)", farbe: "#d4af37" },
  person: { label: "Überlieferung & Anlass", farbe: "#c98bc9" },
};

const EDGE_TYPEN: AtlasConfig["edgeTypen"] = {
  reihenfolge: { label: "danach offenbart (ca.)", farbe: "#7d8a80", gestrichelt: true },
  niederschrift: { label: "Schrieb nieder / lehrte", farbe: "#a07fd1" },
  asbab: { label: "Offenbarungsanlass / Bezug", farbe: "#e09a4f" },
};

// Hinweise zu Suren, die NICHT am Stück offenbart wurden (abschnittsweise Offenbarung)
const TEIL_OFFENBARUNG: Record<number, string> = {
  2: "Die längste Sure wurde über nahezu das gesamte Jahrzehnt von Medina hinweg abschnittsweise offenbart; der Zinsverbots-Abschnitt (2:278 ff.) gehört zu den letzten Offenbarungen überhaupt.",
  3: "In Abschnitten offenbart; der große Uhud-Teil (3:121 ff.) kam nach der Schlacht 625, der Mubahala-Teil zur Najran-Delegation 631.",
  4: "Über mehrere Jahre in Medina offenbart, viele Abschnitte mit konkreten Rechtsanlässen.",
  8: "Im Wesentlichen nach Badr (624) offenbart und auf die Schlacht bezogen.",
  9: "Späte Abschnitte (Tabuk 630, Lossagung 631); eine der letzten großen Offenbarungseinheiten.",
  33: "Abschnitte zu Grabenkrieg (627), Zaynab-Heirat und Regelungen für die Prophetenfamilie.",
  96: "Nur die ersten fünf Verse (Iqra) bildeten die allererste Offenbarung in der Höhle Hira; der Rest der Sure kam später (Abu-Jahl-Abschnitt 96:9 ff.).",
  74: "Die Anfangsverse (\"Steh auf und warne\") gehören zu den allerersten Offenbarungen nach der Pause; der al-Walid-Abschnitt (74:11 ff.) kam danach.",
  73: "Der Anfang früh in Mekka (Nachtgebet), der letzte Vers (73:20) mit der Erleichterung nach verbreiteter Auffassung erst in Medina [Khilaf].",
};

const nodes: AtlasNode[] = S.map(([nr, name, arab, verse, typ, order, themen, khilaf]) => ({
  id: `sure-${nr}`,
  name: `${nr}. ${name}`,
  arabisch: arab,
  kategorie: typ,
  era: phaseVon(typ, order),
  jahr: order,
  daten: `${verse} Verse · ca. ${order}. Offenbarung${khilaf ? " · Einordnung [Khilaf]" : ""}`,
  zusammenfassung: `Themen: ${themen}.${khilaf ? " Der Offenbarungsort (makki/madani) bzw. die Einordnung dieser Sure ist unter den Gelehrten umstritten [Khilaf]; angegeben ist die verbreitete Einstufung der traditionellen Zählung." : ""}${TEIL_OFFENBARUNG[nr] ? " ABSCHNITTSWEISE OFFENBART: " + TEIL_OFFENBARUNG[nr] : ""} Die Offenbarungsreihenfolge folgt der traditionellen (ägyptischen) Chronologie und ist als ungefähr zu verstehen.`,
  quellen: [`Quran ${nr}:1`, "Reihenfolge: traditionelle ägyptische Chronologie [ca.]", "as-Suyuti, al-Itqan (Ulum al-Quran)"],
  url: `https://quran.com/${nr}`,
}));

// Überlieferer und Anlass-Personen: Wer schrieb nieder, wer lehrte, wessen Geschichte
// steckt hinter einer Sure? (jahr = Position auf der Chronologie-Achse)
const PERSONEN: AtlasNode[] = [
  { id: "q-zayd", name: "Zayd ibn Thabit", arabisch: "زيد بن ثابت", kategorie: "person", era: "medinensisch", jahr: 88, daten: "gest. ca. 665", zusammenfassung: "Wichtigster Offenbarungsschreiber in Medina; leitete unter Abu Bakr die erste Sammlung der Blätter und unter Uthman die Erstellung des einheitlichen Mushaf.", quellen: ["Bukhari 4986", "Bukhari 4679"] },
  { id: "q-ubayy", name: "Ubayy ibn Ka'b", arabisch: "أبي بن كعب", kategorie: "person", era: "medinensisch", jahr: 100, daten: "gest. ca. 649", zusammenfassung: "\"Herr der Rezitatoren\"; der Prophet ﷺ sagte ihm: \"Allah hat mir befohlen, dir den Quran vorzutragen\" und rezitierte ihm Sure al-Bayyina; einer der vier, von denen der Quran zu nehmen ist.", quellen: ["Bukhari 4959", "Bukhari 3808"] },
  { id: "q-ibn-masud", name: "Abdullah ibn Mas'ud", arabisch: "عبد الله بن مسعود", kategorie: "person", era: "früh_mekkanisch", jahr: 30, daten: "gest. 653", zusammenfassung: "Erster öffentlicher Rezitator nach dem Propheten ﷺ (Sure ar-Rahman an der Ka'ba); der Prophet ﷺ weinte, als Ibn Mas'ud ihm aus Sure an-Nisa bis zum Vers 4:41 vortrug.", quellen: ["Bukhari 5050", "Ibn Hisham"] },
  { id: "q-ibn-abbas", name: "Abdullah ibn Abbas", arabisch: "عبد الله بن عباس", kategorie: "person", era: "medinensisch", jahr: 110, daten: "gest. 687", zusammenfassung: "\"Übersetzer des Quran\": Begründer der Tafsir-Wissenschaft; deutete Sure an-Nasr als Ankündigung des nahen Abschieds des Propheten ﷺ, was Umar bestätigte.", quellen: ["Bukhari 4294", "Bukhari 75"] },
  { id: "q-aisha", name: "Aisha bint Abi Bakr", arabisch: "عائشة", kategorie: "person", era: "medinensisch", jahr: 102, daten: "gest. 678", zusammenfassung: "Der Freispruch in der Ifk-Affäre (24:11 bis 20) wurde ihretwegen offenbart; ihr Wort: \"Sein Charakter war der Quran\" ist der kürzeste Tafsir der Prophetenpersönlichkeit ﷺ.", quellen: ["Bukhari 4141", "Muslim 746"] },
  { id: "q-khadija", name: "Khadija & die Höhle Hira", arabisch: "خديجة وغار حراء", kategorie: "person", era: "früh_mekkanisch", jahr: 1, daten: "610, Mekka", zusammenfassung: "Beim Iqra-Ereignis (96:1 bis 5) trug Khadija den Erschütterten: \"Allah wird dich niemals zugrunde gehen lassen\"; Beginn der 23-jährigen Offenbarungsgeschichte.", quellen: ["Bukhari 3", "Quran 96:1"] },
];

const edges: AtlasEdge[] = [];
const nachOrder = [...S].sort((a, b) => a[5] - b[5]);
for (let i = 0; i < nachOrder.length - 1; i++) {
  edges.push({
    id: `qe${i}`,
    von: `sure-${nachOrder[i][0]}`,
    nach: `sure-${nachOrder[i + 1][0]}`,
    typ: "reihenfolge",
  });
}

type PT = [string, string, string, string?];
const PERSON_EDGES: PT[] = [
  ["q-khadija", "sure-96", "asbab", "die erste Offenbarung in der Höhle Hira (Bukhari 3)"],
  ["q-aisha", "sure-24", "asbab", "Freispruch in der Ifk-Affäre (24:11 bis 20)"],
  ["q-ubayy", "sure-98", "asbab", "der Prophet ﷺ rezitierte sie ihm auf Allahs Geheiß vor (Bukhari 4959)"],
  ["q-ibn-abbas", "sure-110", "asbab", "deutete sie als Ankündigung des Abschieds (Bukhari 4294)"],
  ["q-ibn-masud", "sure-4", "asbab", "bei 4:41 sagte der Prophet ﷺ: \"Genug\", und seine Augen flossen über (Bukhari 5050)"],
  ["q-ibn-masud", "sure-55", "niederschrift", "rezitierte sie als Erster öffentlich an der Ka'ba [Ibn Hisham]"],
  ["q-zayd", "sure-2", "niederschrift", "Offenbarungsschreiber der langen medinensischen Suren"],
  ["q-zayd", "sure-9", "niederschrift", "fand bei der Sammlung das Ende der Sure bei Abu Khuzayma (Bukhari 4679)"],
  ["q-ubayy", "sure-1", "niederschrift", "lehrte al-Fatiha als \"die sieben zu Wiederholenden\""],
];
PERSON_EDGES.forEach(([von, nach, typ, notiz], i) => edges.push({ id: `qp${i}`, von, nach, typ, notiz }));

export const quranConfig: AtlasConfig = {
  section: "quran",
  nodes: [...nodes, ...PERSONEN],
  edges,
  kategorien: KATEGORIEN,
  edgeTypen: EDGE_TYPEN,
  eras: PHASEN_INFO,
  eraLabel: "Offenbarungsphase",
  bandY: { person: -300, makki: 0, madani: 320 },
  xProEinheit: 260,
  minAbstand: 240,
  jahrMin: 1,
  jahrMax: 114,
  jahrLabel: "Offenbarungsreihenfolge (ca.)",
  jahrAnzeigen: false,
  suchPlatzhalter: "Suche: Sure, Nummer, Thema (z. B. Yusuf, 24, Hajj)...",
  stufeProKategorie: { makki: 1, madani: 1, person: 2 },
  hinweis: "Die Offenbarungsreihenfolge folgt der traditionellen ägyptischen Chronologie; sie ist Gelehrtenarbeit, kein Quran-Text, und in Teilen umstritten. Umstrittene Suren tragen [Khilaf].",
};

export const surenAnzahl = S.length;

// Kompakte Surenliste für Hifz-Bereich und Quiz
export const surenListe = S.map(([nr, name, arab, verse, typ]) => ({ nr, name, arab, verse, typ }));
