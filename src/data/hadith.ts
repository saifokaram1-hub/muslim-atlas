// Hadith-Atlas: die sechs großen Sammlungen (al-Kutub as-Sitta) mit exemplarischen,
// korrekt belegten Überlieferungsketten (Isnad). Tradentenbewertungen nach Ibn Hajar
// (Taqrib at-Tahdhib) und adh-Dhahabi (Mizan al-Itidal). Kuratierter Kerndatensatz V1.

export type Generation = "prophet" | "sahabi" | "tabii" | "tabi_tabii" | "später";
export type Bewertung = "prophet" | "sahabi" | "thiqa" | "saduq" | "daif" | "matruk";
export type GradingStufe = "sahih" | "hasan" | "daif" | "sahih_li_ghayrihi";

export interface Narrator {
  id: string;
  name: string;
  arabisch?: string;
  generation: Generation;
  gestorben?: string;
  bewertung: Bewertung;
  anmerkung?: string;
}

export interface Hadith {
  id: string;
  buchId: string;
  nummer: string;
  titel: string;
  textDe: string;
  themen: string[];
  grading: { stufe: GradingStufe; von: string; begründung?: string };
  // Hauptkette vom Propheten ﷺ zum Sammler; optionale Parallelstränge
  kette: string[];
  parallel?: { vonIndex: number; bisIndex: number; narratorId: string; notiz: string };
  ketteVereinfacht?: boolean;
  kontext?: string;
  schwachstellen?: { narratorId: string; erklärung: string }[];
  // Bewertungen verschiedener Gelehrter mit ihrer Richtung, damit Leser
  // nachvollziehen können, wer wie urteilte
  meinungen?: { gelehrter: string; richtung: string; position: string }[];
  lehrpunkt?: string;
  siraLink?: string;
  quelleUrl: string;
}

export interface HadithBuch {
  id: string;
  name: string;
  arabisch: string;
  autor: string;
  autorLebensdaten: string;
  anzahl: string;
  methodik: string;
}

export const GENERATION_LABEL: Record<Generation, string> = {
  prophet: "Der Prophet ﷺ",
  sahabi: "Sahabi (Gefährte)",
  tabii: "Tabi'i (Nachfolger)",
  tabi_tabii: "Tabi at-Tabi'in",
  später: "Spätere Tradenten",
};

export const BEWERTUNG_INFO: Record<Bewertung, { label: string; farbe: string }> = {
  prophet: { label: "ﷺ", farbe: "#d4af37" },
  sahabi: { label: "Sahabi (per Definition glaubwürdig)", farbe: "#d4af37" },
  thiqa: { label: "Thiqa (vertrauenswürdig)", farbe: "#2f9d77" },
  saduq: { label: "Saduq (ehrlich, leichte Schwäche)", farbe: "#7fbf5f" },
  daif: { label: "Da'if (schwach)", farbe: "#e09a4f" },
  matruk: { label: "Matruk (verworfen)", farbe: "#b5483d" },
};

export const GRADING_INFO: Record<GradingStufe, { label: string; farbe: string }> = {
  sahih: { label: "Sahih", farbe: "#2f9d77" },
  hasan: { label: "Hasan", farbe: "#d4af37" },
  daif: { label: "Da'if", farbe: "#b5483d" },
  sahih_li_ghayrihi: { label: "Sahih li-ghayrihi", farbe: "#2f9d77" },
};

export const hadithBücher: HadithBuch[] = [
  { id: "bukhari", name: "Sahih al-Bukhari", arabisch: "صحيح البخاري", autor: "Muhammad ibn Ismail al-Bukhari", autorLebensdaten: "194 bis 256 AH / 810 bis 870 n. Chr.", anzahl: "ca. 7563 Hadithe (mit Wiederholungen), ca. 2602 ohne", methodik: "Strengste Bedingungen aller Sammler: Er verlangte für jedes Kettenglied ein belegtes Treffen (Liqa) der Tradenten und höchste Zuverlässigkeit. Gilt als das authentischste Buch nach dem Quran [Jumhur]." },
  { id: "muslim", name: "Sahih Muslim", arabisch: "صحيح مسلم", autor: "Muslim ibn al-Hajjaj an-Naysaburi", autorLebensdaten: "204 bis 261 AH / ca. 821 bis 875 n. Chr.", anzahl: "ca. 7500 Hadithe (mit Wiederholungen), ca. 3033 ohne [Zählung variiert]", methodik: "Berühmter Methodenunterschied zu Bukhari: Zeitgenossenschaft (Mu'asara) der Tradenten genügt ihm, ein belegtes Treffen verlangt er nicht. Brillante thematische Anordnung aller Varianten eines Hadith an einem Ort." },
  { id: "abudawud", name: "Sunan Abi Dawud", arabisch: "سنن أبي داود", autor: "Abu Dawud Sulayman as-Sijistani", autorLebensdaten: "202 bis 275 AH / 817 bis 889 n. Chr.", anzahl: "ca. 5274 Hadithe", methodik: "Fokus auf rechtsrelevante (Fiqh-)Hadithe. Eigene Regel: Was er kommentarlos lässt, ist bei ihm \"salih\" (als Beleg tauglich); deutliche Schwächen kommentiert er." },
  { id: "tirmidhi", name: "Jami at-Tirmidhi", arabisch: "جامع الترمذي", autor: "Abu Isa Muhammad at-Tirmidhi", autorLebensdaten: "209 bis 279 AH / 824 bis 892 n. Chr.", anzahl: "ca. 3956 Hadithe", methodik: "Erster Sammler, der systematisch jeden Hadith bewertet (sahih, hasan, gharib, daif und Kombinationen) und die Praxis der Gelehrten dazu nennt. Schüler al-Bukharis." },
  { id: "nasai", name: "Sunan an-Nasa'i (al-Mujtaba)", arabisch: "سنن النسائي", autor: "Ahmad ibn Shu'ayb an-Nasa'i", autorLebensdaten: "215 bis 303 AH / 830 bis 915 n. Chr.", anzahl: "ca. 5758 Hadithe", methodik: "Nach Bukhari und Muslim die strengste Tradentenkritik der sechs Bücher; al-Mujtaba ist die geprüfte Kurzfassung seiner großen Sunan." },
  { id: "ibnmajah", name: "Sunan Ibn Majah", arabisch: "سنن ابن ماجه", autor: "Muhammad ibn Yazid Ibn Majah al-Qazwini", autorLebensdaten: "209 bis 273 AH / 824 bis 887 n. Chr.", anzahl: "ca. 4341 Hadithe", methodik: "Sechstes Buch des Kanons; enthält deutlich mehr schwache Hadithe als die übrigen fünf. Genau deshalb hier ideal, um zu zeigen, woran eine Kette scheitert." },
];

export const narratoren: Narrator[] = [
  { id: "prophet", name: "Der Prophet Muhammad ﷺ", arabisch: "محمد ﷺ", generation: "prophet", gestorben: "11 AH / 632", bewertung: "prophet" },
  { id: "umar-khattab", name: "Umar ibn al-Khattab", arabisch: "عمر بن الخطاب", generation: "sahabi", gestorben: "23 AH / 644", bewertung: "sahabi" },
  { id: "ibn-umar-n", name: "Abdullah ibn Umar", arabisch: "عبد الله بن عمر", generation: "sahabi", gestorben: "73 AH / 693", bewertung: "sahabi" },
  { id: "aisha-n", name: "Aisha bint Abi Bakr", arabisch: "عائشة", generation: "sahabi", gestorben: "58 AH / 678", bewertung: "sahabi" },
  { id: "ibn-abbas-n", name: "Abdullah ibn Abbas", arabisch: "عبد الله بن عباس", generation: "sahabi", gestorben: "68 AH / 687", bewertung: "sahabi" },
  { id: "anas-n", name: "Anas ibn Malik", arabisch: "أنس بن مالك", generation: "sahabi", gestorben: "ca. 93 AH / 712", bewertung: "sahabi" },
  { id: "abu-sufyan-n", name: "Abu Sufyan ibn Harb", arabisch: "أبو سفيان", generation: "sahabi", gestorben: "ca. 32 AH", bewertung: "sahabi", anmerkung: "Zum Zeitpunkt des Heraklius-Gesprächs noch Nichtmuslim; sein Augenzeugenbericht läuft dennoch über eine makellose Kette." },
  { id: "irbad", name: "al-Irbad ibn Sariya", arabisch: "العرباض بن سارية", generation: "sahabi", gestorben: "ca. 75 AH", bewertung: "sahabi" },
  { id: "alqama-waqqas", name: "Alqama ibn Waqqas al-Laythi", arabisch: "علقمة بن وقاص", generation: "tabii", gestorben: "ca. 80 AH", bewertung: "thiqa" },
  { id: "m-ibrahim-taymi", name: "Muhammad ibn Ibrahim at-Taymi", arabisch: "محمد بن إبراهيم التيمي", generation: "tabii", gestorben: "120 AH", bewertung: "thiqa" },
  { id: "yahya-said-ansari", name: "Yahya ibn Sa'id al-Ansari", arabisch: "يحيى بن سعيد الأنصاري", generation: "tabii", gestorben: "144 AH", bewertung: "thiqa" },
  { id: "sufyan-uyayna", name: "Sufyan ibn Uyayna", arabisch: "سفيان بن عيينة", generation: "tabi_tabii", gestorben: "198 AH", bewertung: "thiqa", anmerkung: "Imam von Mekka." },
  { id: "humaydi", name: "al-Humaydi, Abdullah ibn az-Zubayr", arabisch: "الحميدي", generation: "später", gestorben: "219 AH", bewertung: "thiqa", anmerkung: "Lehrer al-Bukharis." },
  { id: "urwa", name: "Urwa ibn az-Zubayr", arabisch: "عروة بن الزبير", generation: "tabii", gestorben: "94 AH", bewertung: "thiqa", anmerkung: "Neffe Aishas, einer der sieben Fuqaha Medinas." },
  { id: "zuhri", name: "Ibn Shihab az-Zuhri", arabisch: "ابن شهاب الزهري", generation: "tabii", gestorben: "124 AH", bewertung: "thiqa", anmerkung: "Pionier der systematischen Hadith-Sammlung." },
  { id: "uqayl", name: "Uqayl ibn Khalid", arabisch: "عقيل بن خالد", generation: "tabi_tabii", gestorben: "144 AH", bewertung: "thiqa" },
  { id: "layth", name: "al-Layth ibn Sa'd", arabisch: "الليث بن سعد", generation: "tabi_tabii", gestorben: "175 AH", bewertung: "thiqa", anmerkung: "Imam Ägyptens." },
  { id: "yahya-bukayr", name: "Yahya ibn Bukayr", arabisch: "يحيى بن بكير", generation: "später", gestorben: "231 AH", bewertung: "thiqa" },
  { id: "ubaydullah-utba", name: "Ubaydullah ibn Abdillah ibn Utba", arabisch: "عبيد الله بن عبد الله بن عتبة", generation: "tabii", gestorben: "ca. 98 AH", bewertung: "thiqa" },
  { id: "abul-yaman", name: "Abu l-Yaman al-Hakam ibn Nafi", arabisch: "أبو اليمان", generation: "später", gestorben: "222 AH", bewertung: "thiqa" },
  { id: "shuayb", name: "Shu'ayb ibn Abi Hamza", arabisch: "شعيب بن أبي حمزة", generation: "tabi_tabii", gestorben: "162 AH", bewertung: "thiqa" },
  { id: "zuhayr-harb", name: "Zuhayr ibn Harb (Abu Khaythama)", arabisch: "زهير بن حرب", generation: "später", gestorben: "234 AH", bewertung: "thiqa" },
  { id: "waki", name: "Waki ibn al-Jarrah", arabisch: "وكيع بن الجراح", generation: "tabi_tabii", gestorben: "197 AH", bewertung: "thiqa" },
  { id: "kahmas", name: "Kahmas ibn al-Hasan", arabisch: "كهمس بن الحسن", generation: "tabi_tabii", gestorben: "149 AH", bewertung: "thiqa" },
  { id: "ibn-buraydah", name: "Abdullah ibn Buraydah", arabisch: "عبد الله بن بريدة", generation: "tabii", gestorben: "115 AH", bewertung: "thiqa" },
  { id: "yahya-yamar", name: "Yahya ibn Ya'mar", arabisch: "يحيى بن يعمر", generation: "tabii", gestorben: "vor 90 AH", bewertung: "thiqa" },
  { id: "ahmad-hanbal", name: "Ahmad ibn Hanbal", arabisch: "أحمد بن حنبل", generation: "später", gestorben: "241 AH", bewertung: "thiqa", anmerkung: "Imam der Hanbaliyya." },
  { id: "walid-muslim", name: "al-Walid ibn Muslim", arabisch: "الوليد بن مسلم", generation: "später", gestorben: "195 AH", bewertung: "thiqa", anmerkung: "Bekannter Mudallis: Seine Überlieferung zählt nur bei ausdrücklichem \"haddathana\" (direktem Hörvermerk)." },
  { id: "thawr", name: "Thawr ibn Yazid", arabisch: "ثور بن يزيد", generation: "tabi_tabii", gestorben: "153 AH", bewertung: "thiqa" },
  { id: "khalid-madan", name: "Khalid ibn Ma'dan", arabisch: "خالد بن معدان", generation: "tabii", gestorben: "103 AH", bewertung: "thiqa" },
  { id: "abdurrahman-sulami", name: "Abd ar-Rahman ibn Amr as-Sulami", arabisch: "عبد الرحمن بن عمرو السلمي", generation: "tabii", bewertung: "saduq" },
  { id: "ahmad-musa", name: "Ahmad ibn Muhammad ibn Musa", arabisch: "أحمد بن محمد بن موسى", generation: "später", gestorben: "235 AH", bewertung: "thiqa" },
  { id: "ibn-mubarak", name: "Abdullah ibn al-Mubarak", arabisch: "عبد الله بن المبارك", generation: "tabi_tabii", gestorben: "181 AH", bewertung: "thiqa", anmerkung: "Gelehrter, Asket und Mujahid." },
  { id: "ibn-lahia", name: "Abdullah ibn Lahi'a", arabisch: "عبد الله بن لهيعة", generation: "tabi_tabii", gestorben: "174 AH", bewertung: "daif", anmerkung: "Richter Ägyptens; sein Gedächtnis verschlechterte sich nach dem Brand seiner Bücher." },
  { id: "qays-hajjaj", name: "Qays ibn al-Hajjaj", arabisch: "قيس بن الحجاج", generation: "tabi_tabii", gestorben: "ca. 129 AH", bewertung: "saduq" },
  { id: "hanash", name: "Hanash as-San'ani", arabisch: "حنش الصنعاني", generation: "tabii", gestorben: "100 AH", bewertung: "thiqa" },
  { id: "hisham-ammar", name: "Hisham ibn Ammar", arabisch: "هشام بن عمار", generation: "später", gestorben: "245 AH", bewertung: "saduq", anmerkung: "Im Alter nachlassend." },
  { id: "hafs-sulayman", name: "Hafs ibn Sulayman al-Asadi", arabisch: "حفص بن سليمان", generation: "tabi_tabii", gestorben: "180 AH", bewertung: "matruk", anmerkung: "Im Hadith verworfen (matruk), zugleich der Qira'at-Imam der heute weltweit verbreiteten Lesart \"Hafs an Asim\". Paradebeispiel: Autorität in einer Disziplin, untauglich in einer anderen." },
  { id: "kathir-shinzir", name: "Kathir ibn Shinzir", arabisch: "كثير بن شنظير", generation: "tabi_tabii", bewertung: "daif", anmerkung: "Umstritten, schwaches Gedächtnis." },
  { id: "ibn-sirin", name: "Muhammad ibn Sirin", arabisch: "محمد بن سيرين", generation: "tabii", gestorben: "110 AH", bewertung: "thiqa", anmerkung: "Berühmter Traumdeuter und Gelehrter." },
];

export const hadithe: Hadith[] = [
  {
    id: "bukhari-1", buchId: "bukhari", nummer: "1",
    titel: "Die Taten sind nur entsprechend den Absichten",
    textDe: "Die Taten sind nur entsprechend den Absichten, und jedem Menschen gehört, was er beabsichtigt hat. Wessen Auswanderung zu Allah und Seinem Gesandten war, dessen Auswanderung ist zu Allah und Seinem Gesandten...",
    themen: ["Absicht", "Ikhlas", "Grundlagen"],
    grading: { stufe: "sahih", von: "Konsens der Umma" },
    kette: ["prophet", "umar-khattab", "alqama-waqqas", "m-ibrahim-taymi", "yahya-said-ansari", "sufyan-uyayna", "humaydi"],
    kontext: "Anlass (Wurud): Nach verbreiteter Überlieferung im Zusammenhang mit einem Mann, der nur wegen einer Heirat auswanderte; daher der Zusatz über die Auswanderung [Einzelheiten Khilaf].",
    lehrpunkt: "Eröffnungshadith des Sahih. Am Anfang der Kette \"gharib\" (nur über Umar überliefert), ab Yahya ibn Sa'id dann massenhaft verbreitet. Beispiel dafür, dass \"gharib\" (Einzelüberlieferung) nicht \"schwach\" bedeutet.",
    quelleUrl: "https://sunnah.com/bukhari:1",
  },
  {
    id: "bukhari-3", buchId: "bukhari", nummer: "3",
    titel: "Der Beginn der Offenbarung",
    textDe: "Aishas Bericht: die Höhle Hira, \"Iqra\", das Zittern, Khadijas Trost (\"Allah wird dich niemals zugrunde gehen lassen...\") und Waraqas Bestätigung.",
    themen: ["Offenbarung", "Sira", "Khadija"],
    grading: { stufe: "sahih", von: "al-Bukhari" },
    kette: ["prophet", "aisha-n", "urwa", "zuhri", "uqayl", "layth", "yahya-bukayr"],
    siraLink: "ev-offenbarung",
    lehrpunkt: "Goldene medinensische Kette über az-Zuhri; Sira und Hadith bestätigen sich gegenseitig.",
    quelleUrl: "https://sunnah.com/bukhari:3",
  },
  {
    id: "bukhari-7", buchId: "bukhari", nummer: "7",
    titel: "Heraklius befragt Abu Sufyan",
    textDe: "Der byzantinische Kaiser befragt den (damals nichtmuslimischen) Abu Sufyan systematisch über den Propheten ﷺ: Abstammung, Anhänger, Wahrhaftigkeit, und erkennt: \"Wenn wahr ist, was du sagst, wird er den Boden unter meinen Füßen besitzen.\"",
    themen: ["Sira", "Dawa", "Briefe an Herrscher"],
    grading: { stufe: "sahih", von: "al-Bukhari" },
    kette: ["prophet", "abu-sufyan-n", "ibn-abbas-n", "ubaydullah-utba", "zuhri", "shuayb", "abul-yaman"],
    kontext: "Kontext: Während der Waffenruhe von Hudaybiyya (628) war Abu Sufyan mit einer Karawane in Syrien, als das Einladungsschreiben des Propheten ﷺ Heraklius erreichte; der Kaiser ließ die anwesenden Mekkaner holen.",
    siraLink: "ev-briefe",
    lehrpunkt: "Historischer Augenzeugenbericht eines damaligen Gegners, dennoch über eine makellose Kette überliefert.",
    quelleUrl: "https://sunnah.com/bukhari:7",
  },
  {
    id: "muslim-8", buchId: "muslim", nummer: "8",
    titel: "Der Hadith Jibril",
    textDe: "Jibril erscheint in Menschengestalt und fragt den Propheten ﷺ nach Islam, Iman, Ihsan und der Stunde. \"Das war Jibril, der kam, um euch eure Religion zu lehren.\"",
    themen: ["Aqida", "Islam", "Iman", "Ihsan"],
    grading: { stufe: "sahih", von: "Muslim" },
    kette: ["prophet", "umar-khattab", "ibn-umar-n", "yahya-yamar", "ibn-buraydah", "kahmas", "waki", "zuhayr-harb"],
    lehrpunkt: "Ein Sahabi (Ibn Umar) überliefert von einem Sahabi (Umar); auch das kommt vor und ist die stärkste Form der Bezeugung.",
    quelleUrl: "https://sunnah.com/muslim:8",
  },
  {
    id: "muslim-2363", buchId: "muslim", nummer: "2363",
    titel: "Die Bestäubung der Dattelpalmen",
    textDe: "\"Ihr wisst besser über die Angelegenheiten eures Diesseits Bescheid.\"",
    themen: ["Sira", "Menschlichkeit des Propheten ﷺ", "Offenbarung vs. Ijtihad"],
    grading: { stufe: "sahih", von: "Muslim" },
    kette: ["prophet", "anas-n"],
    ketteVereinfacht: true,
    kontext: "Kontext: Nach der Ankunft in Medina sah der Prophet ﷺ Bauern beim Bestäuben der Dattelpalmen; sein beiläufiger Rat führte zu schlechterer Ernte; darauf folgte die Klarstellung über Weltdinge.",
    siraLink: "ko-palmen",
    lehrpunkt: "Abgrenzung zwischen Offenbarung (unfehlbar) und persönlicher Welteinschätzung des Propheten ﷺ.",
    quelleUrl: "https://sunnah.com/muslim:2363",
  },
  {
    id: "abudawud-4607", buchId: "abudawud", nummer: "4607",
    titel: "Haltet euch an meine Sunna",
    textDe: "Predigt, \"bei der die Augen weinten\": \"Haltet euch an meine Sunna und die Sunna der rechtgeleiteten Kalifen... und hütet euch vor neu eingeführten Dingen.\"",
    themen: ["Sunna", "Bidah", "Methodik"],
    meinungen: [
      { gelehrter: "at-Tirmidhi", richtung: "Früher Sammler", position: "hasan sahih" },
      { gelehrter: "al-Albani", richtung: "Athari / Salafi", position: "sahih (Sahih Sunan Abi Dawud)" },
      { gelehrter: "an-Nawawi", richtung: "Shafi'i / Ash'ari", position: "nahm ihn als Nr. 28 in seine Vierzig Hadithe auf und nannte ihn hasan sahih" },
    ],
    grading: { stufe: "sahih", von: "at-Tirmidhi (hasan sahih); al-Albani (sahih)" },
    kette: ["prophet", "irbad", "abdurrahman-sulami", "khalid-madan", "thawr", "walid-muslim", "ahmad-hanbal"],
    kontext: "Anlass (Wurud): Nach dem Morgengebet hielt der Prophet ﷺ eine eindringliche Predigt, \"bei der die Augen weinten und die Herzen bebten\"; al-Irbad fragte, ob es eine Abschiedspredigt sei; darauf folgte dieses Vermächtnis.",
    lehrpunkt: "al-Walid ibn Muslim ist Mudallis, hier aber mit ausdrücklichem \"haddathana\"; deshalb hält die Kette. Zeigt, wie die Rijal-Kritik selbst kleinste Übertragungsdetails prüft.",
    quelleUrl: "https://sunnah.com/abudawud:4607",
  },
  {
    id: "tirmidhi-2516", buchId: "tirmidhi", nummer: "2516",
    titel: "Bewahre Allah, so bewahrt Er dich",
    textDe: "\"Junge, ich lehre dich Worte: Bewahre Allah, so bewahrt Er dich... Wenn du bittest, bitte Allah; wenn du Hilfe suchst, suche sie bei Allah. Wisse: Würde sich die ganze Gemeinschaft versammeln, um dir zu nützen, sie könnten dir nur nützen, was Allah dir bereits aufgeschrieben hat.\"",
    themen: ["Tawhid", "Tawakkul", "Erziehung"],
    meinungen: [
      { gelehrter: "at-Tirmidhi", richtung: "Früher Sammler", position: "hasan sahih" },
      { gelehrter: "Ibn Rajab al-Hanbali", richtung: "Hanbali", position: "widmete dem Hadith eine eigene Abhandlung (Nur al-Iqtibas) als einem der gewaltigsten Erziehungsworte" },
      { gelehrter: "al-Albani", richtung: "Athari / Salafi", position: "sahih (Prüfung der Mishkat und des Tirmidhi)" },
    ],
    grading: { stufe: "sahih", von: "at-Tirmidhi (hasan sahih)" },
    kette: ["prophet", "ibn-abbas-n", "hanash", "qays-hajjaj", "layth", "ibn-mubarak", "ahmad-musa"],
    parallel: { vonIndex: 3, bisIndex: 5, narratorId: "ibn-lahia", notiz: "Parallelstrang: Ibn Lahi'a überliefert dasselbe von Qays an Ibn al-Mubarak" },
    kontext: "Kontext: Gesprochen zum jungen Abdullah ibn Abbas, der hinter dem Propheten ﷺ auf dem Reittier sass; Erziehung im vertrauten Moment.",
    lehrpunkt: "Mutaba'a (Parallelüberlieferung): Der schwache Ibn Lahi'a läuft neben dem starken al-Layth; die Schwäche des einen schadet nicht, weil der andere ihn stützt.",
    quelleUrl: "https://sunnah.com/tirmidhi:2516",
  },
  {
    id: "nasai-3939", buchId: "nasai", nummer: "3939",
    titel: "Die Frische meiner Augen liegt im Gebet",
    textDe: "\"Mir wurde von eurer Welt lieb gemacht: die Frauen und der Wohlgeruch; und die Frische meiner Augen liegt im Gebet.\"",
    themen: ["Gebet", "Lebensführung"],
    grading: { stufe: "hasan", von: "al-Albani (hasan sahih)" },
    kette: ["prophet", "anas-n"],
    ketteVereinfacht: true,
    lehrpunkt: "Beispiel der Sunan-Werke: korrekt belegter Text; die vollständige Tradentenfolge wird im Atlas schrittweise ergänzt.",
    quelleUrl: "https://sunnah.com/nasai:3939",
  },
  {
    id: "ibnmajah-224", buchId: "ibnmajah", nummer: "224",
    titel: "Das Streben nach Wissen ist Pflicht",
    textDe: "\"Das Streben nach Wissen ist jedem Muslim eine Pflicht.\"",
    themen: ["Wissen", "Bildung"],
    meinungen: [
      { gelehrter: "al-Bayhaqi", richtung: "Frühe Hadith-Kritik / Shafi'i", position: "der Text ist berühmt, doch die einzelnen Ketten sind schwach [sinngemäß überliefert]" },
      { gelehrter: "al-Mizzi", richtung: "Hadith-Kritiker", position: "erreicht durch die Vielzahl der Wege die Stufe hasan [zitiert bei as-Suyuti/al-Munawi]" },
      { gelehrter: "al-Albani", richtung: "Athari / Salafi", position: "sahih li-ghayrihi (Sahih al-Jami 3914)" },
    ],
    grading: { stufe: "sahih_li_ghayrihi", von: "al-Albani (Sahih al-Jami 3914)", begründung: "Diese Kette ist da'if; die Aussage ist durch viele unabhängige Parallelketten gestützt und dadurch sahih li-ghayrihi." },
    kette: ["prophet", "anas-n", "ibn-sirin", "kathir-shinzir", "hafs-sulayman", "hisham-ammar"],
    kontext: "Kontext: Grundsatzaussage; \"Wissen\" meint hier nach den Gelehrten das individuell verpflichtende Religionswissen (Fard al-Ayn) [Deutung].",
    schwachstellen: [
      { narratorId: "hafs-sulayman", erklärung: "Hafs ibn Sulayman ist im Hadith MATRUK (verworfen): Die Rijal-Kritiker (u. a. Ibn Hajar, adh-Dhahabi) verwarfen sein Hadith-Gedächtnis, obwohl er als Quran-Lesemeister (Lesart Hafs an Asim) eine Weltautorität ist." },
      { narratorId: "kathir-shinzir", erklärung: "Kathir ibn Shinzir gilt als schwach (umstrittenes, schwaches Gedächtnis); die Kette bricht also an zwei Gliedern." },
    ],
    lehrpunkt: "Das Paradebeispiel für \"Woran scheitert eine Kette?\": 1) Eine schwache Kette macht die Aussage nicht automatisch falsch. 2) Ein Mensch kann in einer Disziplin Imam und in einer anderen untauglich sein.",
    quelleUrl: "https://sunnah.com/ibnmajah:224",
  },
];

export const narratorById = new Map(narratoren.map((n) => [n.id, n]));
export const buchById = new Map(hadithBücher.map((b) => [b.id, b]));
export const haditheProBuch = (buchId: string) => hadithe.filter((h) => h.buchId === buchId);
