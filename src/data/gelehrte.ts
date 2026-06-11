// Gelehrten-Atlas: Schlüsselgelehrte der sunnitischen Tradition mit Werken,
// Lehrer-Schüler-Linien und Rezeption. Innersunnitische Meinungsverschiedenheiten
// (z. B. zur Aqida-Methodik) sind neutral dargestellt und mit [Khilaf] markiert.
// Biografische Daten: adh-Dhahabi (Siyar A'lam an-Nubala), Ibn Hajar (Taqrib).

import type { AtlasNode, AtlasEdge, AtlasConfig } from "../components/AtlasGraph";

const KATEGORIEN: AtlasConfig["kategorien"] = {
  imam: { label: "Madhhab-Imame", farbe: "#d4af37" },
  muhaddith: { label: "Hadith-Sammler", farbe: "#2f9d77" },
  gelehrter: { label: "Gelehrte", farbe: "#4f8fd1" },
  werk: { label: "Werke", farbe: "#c98bc9" },
  thema: { label: "Debatten & Rezeption", farbe: "#d18b4f" },
};

const EDGE_TYPEN: AtlasConfig["edgeTypen"] = {
  lehrte: { label: "Lehrte", farbe: "#a07fd1" },
  verfasste: { label: "Verfasste", farbe: "#c98bc9" },
  madhhab: { label: "Rechtsschule", farbe: "#d4af37", gestrichelt: true },
  rezeption: { label: "Rezeption / Debatte", farbe: "#d18b4f", gestrichelt: true },
};

const ERAS: AtlasConfig["eras"] = {
  frühzeit: "Frühe Imame (8. bis 9. Jh.)",
  sammler: "Zeit der Sammler (9. bis 10. Jh.)",
  klassik: "Klassik (11. bis 13. Jh.)",
  damaskus: "Damaszener Schule (13. bis 15. Jh.)",
};

const N: AtlasNode[] = [
  // Madhhab-Imame
  { id: "abu-hanifa", name: "Abu Hanifa", arabisch: "أبو حنيفة", kategorie: "imam", era: "frühzeit", jahr: 767, daten: "80 bis 150 AH / 699 bis 767, Kufa/Bagdad", zusammenfassung: "Imam der Hanafiyya, \"al-Imam al-A'zam\"; Begründer der systematischen Rechtsfindung mit Ra'y und Qiyas; Kaufmann, lehnte das Richteramt unter Folter ab.", quellen: ["adh-Dhahabi, Siyar A'lam an-Nubala"] },
  { id: "malik", name: "Malik ibn Anas", arabisch: "مالك بن أنس", kategorie: "imam", era: "frühzeit", jahr: 795, daten: "93 bis 179 AH / 711 bis 795, Medina", zusammenfassung: "Imam von Medina (Malikiyya); sein al-Muwatta ist eines der frühesten Hadith-Rechtswerke; die Praxis der Medinenser (Amal Ahl al-Madina) als eigene Quelle.", quellen: ["adh-Dhahabi, Siyar A'lam an-Nubala"] },
  { id: "shafii", name: "ash-Shafi'i", arabisch: "الشافعي", kategorie: "imam", era: "frühzeit", jahr: 820, daten: "150 bis 204 AH / 767 bis 820, Gaza/Mekka/Bagdad/Kairo", zusammenfassung: "Schüler Maliks, Lehrer Ahmads; begründete mit ar-Risala die Wissenschaft der Rechtsmethodik (Usul al-Fiqh); Shafi'iyya.", quellen: ["adh-Dhahabi, Siyar A'lam an-Nubala"] },
  { id: "ahmad", name: "Ahmad ibn Hanbal", arabisch: "أحمد بن حنبل", kategorie: "imam", era: "frühzeit", jahr: 855, daten: "164 bis 241 AH / 780 bis 855, Bagdad", zusammenfassung: "Imam der Hanbaliyya und großer Muhaddith (Musnad mit ca. 27.000 Hadithen); blieb in der Mihna (Inquisition zur Erschaffenheit des Quran) unter Folter standhaft; Symbol der Ahl al-Hadith.", quellen: ["adh-Dhahabi, Siyar A'lam an-Nubala"] },
  // Sammler
  { id: "g-bukhari", name: "al-Bukhari", arabisch: "البخاري", kategorie: "muhaddith", era: "sammler", jahr: 870, daten: "194 bis 256 AH / 810 bis 870, Buchara/Naysabur", zusammenfassung: "Verfasser des Sahih al-Bukhari, des authentischsten Buchs nach dem Quran [Jumhur]; prüft jede Kette auf belegtes Treffen der Tradenten. Details: Bereich Hadith-Atlas.", quellen: ["adh-Dhahabi, Siyar A'lam an-Nubala"] },
  { id: "g-muslim", name: "Muslim ibn al-Hajjaj", arabisch: "مسلم بن الحجاج", kategorie: "muhaddith", era: "sammler", jahr: 875, daten: "204 bis 261 AH / ca. 821 bis 875, Naysabur", zusammenfassung: "Verfasser des Sahih Muslim; Schüler und Verteidiger al-Bukharis; berühmt für die thematisch geschlossene Anordnung aller Varianten.", quellen: ["adh-Dhahabi, Siyar A'lam an-Nubala"] },
  { id: "g-abudawud", name: "Abu Dawud", arabisch: "أبو داود", kategorie: "muhaddith", era: "sammler", jahr: 889, daten: "202 bis 275 AH / 817 bis 889, Sijistan/Basra", zusammenfassung: "Sunan Abi Dawud: die rechtsrelevanten Hadithe; Schüler Ahmad ibn Hanbals.", quellen: ["adh-Dhahabi, Siyar A'lam an-Nubala"] },
  { id: "g-tirmidhi", name: "at-Tirmidhi", arabisch: "الترمذي", kategorie: "muhaddith", era: "sammler", jahr: 892, daten: "209 bis 279 AH / 824 bis 892, Tirmidh", zusammenfassung: "Jami at-Tirmidhi: bewertet als Erster systematisch jeden Hadith und dokumentiert die Praxis der Gelehrten; Schüler al-Bukharis.", quellen: ["adh-Dhahabi, Siyar A'lam an-Nubala"] },
  { id: "g-nasai", name: "an-Nasa'i", arabisch: "النسائي", kategorie: "muhaddith", era: "sammler", jahr: 915, daten: "215 bis 303 AH / 830 bis 915, Nasa/Ägypten", zusammenfassung: "Sunan an-Nasa'i: nach den beiden Sahih-Werken die strengste Tradentenkritik der sechs Bücher.", quellen: ["adh-Dhahabi, Siyar A'lam an-Nubala"] },
  { id: "g-ibnmajah", name: "Ibn Majah", arabisch: "ابن ماجه", kategorie: "muhaddith", era: "sammler", jahr: 887, daten: "209 bis 273 AH / 824 bis 887, Qazwin", zusammenfassung: "Sunan Ibn Majah, das sechste Buch des Kanons; enthält die meisten schwachen Hadithe der Sechs, was die Rijal-Kritik gut sichtbar macht.", quellen: ["adh-Dhahabi, Siyar A'lam an-Nubala"] },
  { id: "tabari", name: "at-Tabari", arabisch: "الطبري", kategorie: "gelehrter", era: "sammler", jahr: 923, daten: "224 bis 310 AH / 839 bis 923, Tabaristan/Bagdad", zusammenfassung: "\"Imam der Mufassirun\": sein Tafsir sammelt die Deutungen der Frühzeit mit Ketten; sein Tarikh ist die große Weltchronik, sammelt aber Berichte MIT Ketten ohne eigene Prüfung; nicht jeder Bericht darin ist belastbar.", quellen: ["adh-Dhahabi, Siyar A'lam an-Nubala"] },
  // Aqida- und Tasawwuf-Schulen
  { id: "junayd", name: "al-Junayd al-Baghdadi", arabisch: "الجنيد البغدادي", kategorie: "gelehrter", era: "sammler", jahr: 910, daten: "gest. 298 AH / ca. 910, Bagdad", zusammenfassung: "Meister der nüchternen Sufiyya: \"Unser Weg ist an Quran und Sunna gebunden; wer den Quran nicht trägt und den Hadith nicht schreibt, dem folgt man auf diesem Weg nicht.\" Maßstab des sunnitisch verankerten Tasawwuf.", quellen: ["adh-Dhahabi, Siyar A'lam an-Nubala", "al-Qushayri, ar-Risala"] },
  { id: "al-ashari", name: "Abu l-Hasan al-Ash'ari", arabisch: "أبو الحسن الأشعري", kategorie: "gelehrter", era: "sammler", jahr: 935, daten: "260 bis 324 AH / 873 bis ca. 935, Basra/Bagdad", zusammenfassung: "Kehrte nach 40 Jahren der Mu'tazila ab und verteidigte die Sunna mit deren eigenen Argumentationswerkzeugen; Begründer der Ash'ariyya; Spätwerk al-Ibana [Verhältnis seiner Phasen: Khilaf].", quellen: ["adh-Dhahabi, Siyar A'lam an-Nubala", "Ibn Asakir, Tabyin Kadhib al-Muftari"] },
  { id: "al-maturidi", name: "Abu Mansur al-Maturidi", arabisch: "أبو منصور الماتريدي", kategorie: "gelehrter", era: "sammler", jahr: 944, daten: "gest. 333 AH / 944, Samarkand", zusammenfassung: "Begründer der Maturidiyya (Kitab at-Tawhid); knüpft an die Aqida-Schriften Abu Hanifas an; prägend für die hanafische Welt von Anatolien bis Zentralasien.", quellen: ["al-Bayadi, Isharat al-Maram", "Kitab at-Tawhid"] },
  // Klassik
  { id: "jilani", name: "Abd al-Qadir al-Jilani", arabisch: "عبد القادر الجيلاني", kategorie: "gelehrter", era: "klassik", jahr: 1166, daten: "470 bis 561 AH / ca. 1077 bis 1166, Bagdad", zusammenfassung: "Hanbalitischer Prediger und Rechtsgelehrter, auf den die Qadiriyya zurückgeführt wird; verband strenge Sunna-Bindung mit Herzenserziehung (al-Ghunya, Futuh al-Ghayb). [Spätere Legendenbildung von der historischen Person zu unterscheiden.]", quellen: ["adh-Dhahabi, Siyar A'lam an-Nubala", "Ibn Rajab, Dhayl Tabaqat al-Hanabila"] },
  { id: "ghazali", name: "al-Ghazali", arabisch: "الغزالي", kategorie: "gelehrter", era: "klassik", jahr: 1111, daten: "450 bis 505 AH / 1058 bis 1111, Tus/Bagdad", zusammenfassung: "\"Hujjat al-Islam\": Shafi'it, Ash'arit und Erneuerer der Spiritualität (Ihya Ulum ad-Din); seine Hadith-Auswahl im Ihya enthält viele schwache Überlieferungen, was spätere Gelehrte per Takhrij dokumentierten.", quellen: ["adh-Dhahabi, Siyar A'lam an-Nubala"] },
  { id: "nawawi", name: "an-Nawawi", arabisch: "النووي", kategorie: "gelehrter", era: "klassik", jahr: 1277, daten: "631 bis 676 AH / 1233 bis 1277, Nawa/Damaskus", zusammenfassung: "Shafi'itischer Gelehrter von enormer Wirkung: Riyad as-Salihin, die Vierzig Hadithe, der große Muslim-Kommentar; Vorbild an Askese, starb mit 45.", quellen: ["adh-Dhahabi, Siyar A'lam an-Nubala"] },
  // Damaszener Schule
  { id: "ibn-taymiyya", name: "Ibn Taymiyya", arabisch: "ابن تيمية", kategorie: "gelehrter", era: "damaskus", jahr: 1328, daten: "661 bis 728 AH / 1263 bis 1328, Harran/Damaskus", zusammenfassung: "\"Shaykh al-Islam\" der Damaszener Schule: enzyklopädischer Hanbali-Gelehrter, Verteidiger der Sunna gegen Mongolen, Philosophie und Übertreibungen; mehrfach inhaftiert (gestorben in der Zitadelle von Damaskus); seine Aqida-Methodik (Bestätigung der Eigenschaften Allahs ohne Umdeutung) ist innersunnitisch bis heute diskutiert [Khilaf].", quellen: ["adh-Dhahabi, Siyar A'lam an-Nubala", "Ibn Hajar, ad-Durar al-Kamina"] },
  { id: "dhahabi", name: "adh-Dhahabi", arabisch: "الذهبي", kategorie: "gelehrter", era: "damaskus", jahr: 1348, daten: "673 bis 748 AH / 1274 bis 1348, Damaskus", zusammenfassung: "Der große Historiker und Rijal-Kritiker: Siyar A'lam an-Nubala (Gelehrtenbiografien), Mizan al-Itidal (Tradentenkritik); Schüler und zugleich differenzierter Kritiker Ibn Taymiyyas.", quellen: ["Ibn Hajar, ad-Durar al-Kamina"] },
  { id: "ibn-qayyim", name: "Ibn al-Qayyim", arabisch: "ابن قيم الجوزية", kategorie: "gelehrter", era: "damaskus", jahr: 1350, daten: "691 bis 751 AH / 1292 bis 1350, Damaskus", zusammenfassung: "Engster Schüler Ibn Taymiyyas, mit ihm inhaftiert; verband dessen Methodik mit spiritueller Tiefe: Zad al-Ma'ad (Sira als Rechtsquelle), Madarij as-Salikin (Stationen des Herzenswegs).", quellen: ["Ibn Hajar, ad-Durar al-Kamina"] },
  { id: "ibn-kathir", name: "Ibn Kathir", arabisch: "ابن كثير", kategorie: "gelehrter", era: "damaskus", jahr: 1373, daten: "701 bis 774 AH / ca. 1300 bis 1373, Damaskus", zusammenfassung: "Shafi'itischer Schüler aus dem Kreis Ibn Taymiyyas; sein Tafsir (Quran durch Quran und Hadith) und al-Bidaya wan-Nihaya (Weltgeschichte inkl. Qasas al-Anbiya) gehören zu den meistgelesenen Werken der Umma.", quellen: ["Ibn Hajar, ad-Durar al-Kamina"] },
  { id: "ibn-hajar", name: "Ibn Hajar al-Asqalani", arabisch: "ابن حجر العسقلاني", kategorie: "gelehrter", era: "damaskus", jahr: 1449, daten: "773 bis 852 AH / 1372 bis 1449, Kairo", zusammenfassung: "\"Amir al-Mu'minin im Hadith\": Fath al-Bari (der große Bukhari-Kommentar), Taqrib at-Tahdhib (Standard-Tradentenbewertung, Grundlage der Bewertungen in diesem Atlas).", quellen: ["as-Sakhawi, ad-Daw al-Lami"] },
  // Werke
  { id: "w-muwatta", name: "al-Muwatta", arabisch: "الموطأ", kategorie: "werk", era: "frühzeit", jahr: 790, daten: "von Malik", zusammenfassung: "Eines der frühesten Rechts- und Hadithwerke: Hadithe, Aussprüche der Sahaba und die Praxis Medinas.", quellen: ["Malik, al-Muwatta"] },
  { id: "w-risala", name: "ar-Risala", arabisch: "الرسالة", kategorie: "werk", era: "frühzeit", jahr: 815, daten: "von ash-Shafi'i", zusammenfassung: "Gründungswerk der Usul al-Fiqh: definiert den Rang von Quran, Sunna, Ijma und Qiyas.", quellen: ["ash-Shafi'i, ar-Risala"] },
  { id: "w-musnad", name: "al-Musnad", arabisch: "المسند", kategorie: "werk", era: "frühzeit", jahr: 850, daten: "von Ahmad ibn Hanbal", zusammenfassung: "Riesige Sammlung von ca. 27.000 Hadithen, nach Sahaba geordnet; enthält Sahih wie Schwaches; massgebliche Prüfung durch spätere Kritiker (u. a. al-Arna'ut-Edition).", quellen: ["Ahmad, al-Musnad"] },
  { id: "w-tafsir-tabari", name: "Tafsir at-Tabari", arabisch: "جامع البيان", kategorie: "werk", era: "sammler", jahr: 920, daten: "von at-Tabari", zusammenfassung: "Jami al-Bayan: Mutter der Tafsir-Werke; sammelt die Deutungen der Sahaba und Tabi'in mit Ketten.", quellen: ["at-Tabari, Jami al-Bayan"] },
  { id: "w-tarikh-tabari", name: "Tarikh at-Tabari", arabisch: "تاريخ الطبري", kategorie: "werk", era: "sammler", jahr: 921, daten: "von at-Tabari", zusammenfassung: "Die große Weltchronik. WICHTIG für Recherche: at-Tabari sammelt Berichte mit ihren Ketten, ohne sie zu bewerten; einzelne Berichte können schwach oder falsch sein und müssen einzeln geprüft werden.", quellen: ["at-Tabari, Tarikh ar-Rusul wal-Muluk"] },
  { id: "w-ihya", name: "Ihya Ulum ad-Din", arabisch: "إحياء علوم الدين", kategorie: "werk", era: "klassik", jahr: 1105, daten: "von al-Ghazali", zusammenfassung: "Die \"Wiederbelebung der Religionswissenschaften\": prägendstes Spiritualitätswerk der Klassik; enthält jedoch zahlreiche schwache und einige erfundene Hadithe, dokumentiert im Takhrij von al-Iraqi [siehe Debatten-Knoten].", quellen: ["al-Ghazali, Ihya Ulum ad-Din", "al-Iraqi, al-Mughni an haml al-asfar"] },
  { id: "w-riyad", name: "Riyad as-Salihin & al-Arba'in", arabisch: "رياض الصالحين", kategorie: "werk", era: "klassik", jahr: 1270, daten: "von an-Nawawi", zusammenfassung: "Die \"Gärten der Rechtschaffenen\" und die Vierzig Hadithe: die weltweit verbreitetsten Hadith-Lehrwerke für den Alltag.", quellen: ["an-Nawawi, Riyad as-Salihin"] },
  { id: "w-majmu", name: "Majmu al-Fatawa", arabisch: "مجموع الفتاوى", kategorie: "werk", era: "damaskus", jahr: 1320, daten: "von Ibn Taymiyya (gesammelt)", zusammenfassung: "37 Bände gesammelter Rechtsgutachten und Abhandlungen zu fast jedem Wissensgebiet.", quellen: ["Ibn Taymiyya, Majmu al-Fatawa"] },
  { id: "w-wasitiyya", name: "al-Aqida al-Wasitiyya", arabisch: "العقيدة الواسطية", kategorie: "werk", era: "damaskus", jahr: 1306, daten: "von Ibn Taymiyya", zusammenfassung: "Kompaktes Aqida-Bekenntnis im Stil der Salaf; Gegenstand berühmter Damaszener Disputationen (711 AH), in denen es als sunnitisch bestätigt wurde [Verlauf und Deutung Khilaf].", quellen: ["Ibn Taymiyya, al-Aqida al-Wasitiyya"] },
  { id: "w-minhaj", name: "Minhaj as-Sunna", arabisch: "منهاج السنة النبوية", kategorie: "werk", era: "damaskus", jahr: 1317, daten: "von Ibn Taymiyya", zusammenfassung: "Große Verteidigungsschrift der Sunna und der Sahaba in der Auseinandersetzung mit der Zwölfer-Schia.", quellen: ["Ibn Taymiyya, Minhaj as-Sunna"] },
  { id: "w-zad", name: "Zad al-Ma'ad", arabisch: "زاد المعاد", kategorie: "werk", era: "damaskus", jahr: 1340, daten: "von Ibn al-Qayyim", zusammenfassung: "\"Wegzehrung fürs Jenseits\": die Sira des Propheten ﷺ als gelebte Rechts- und Lebensschule, Kapitel für Kapitel.", quellen: ["Ibn al-Qayyim, Zad al-Ma'ad"] },
  { id: "w-madarij", name: "Madarij as-Salikin", arabisch: "مدارج السالكين", kategorie: "werk", era: "damaskus", jahr: 1345, daten: "von Ibn al-Qayyim", zusammenfassung: "Stationen des Herzenswegs: nüchterne sunnitische Spiritualität entlang von Sure 1:5.", quellen: ["Ibn al-Qayyim, Madarij as-Salikin"] },
  { id: "w-tafsir-ibnkathir", name: "Tafsir Ibn Kathir", arabisch: "تفسير ابن كثير", kategorie: "werk", era: "damaskus", jahr: 1370, daten: "von Ibn Kathir", zusammenfassung: "Maßstab des überlieferungsbasierten Tafsir: Quran durch Quran, dann Hadith, dann Aussagen der Frühgeneration.", quellen: ["Ibn Kathir, Tafsir al-Quran al-Azim"] },
  { id: "w-bidaya", name: "al-Bidaya wan-Nihaya", arabisch: "البداية والنهاية", kategorie: "werk", era: "damaskus", jahr: 1365, daten: "von Ibn Kathir", zusammenfassung: "Weltgeschichte von der Schöpfung bis zu den Zeichen der Stunde; Quelle des Bereichs Propheten-Atlas (Qasas al-Anbiya).", quellen: ["Ibn Kathir, al-Bidaya wan-Nihaya"] },
  { id: "w-siyar", name: "Siyar A'lam an-Nubala", arabisch: "سير أعلام النبلاء", kategorie: "werk", era: "damaskus", jahr: 1340, daten: "von adh-Dhahabi", zusammenfassung: "25 Bände Gelehrten- und Persönlichkeitsbiografien; Hauptquelle der Lebensdaten in diesem Atlas.", quellen: ["adh-Dhahabi, Siyar A'lam an-Nubala"] },
  { id: "w-mizan", name: "Mizan al-Itidal", arabisch: "ميزان الاعتدال", kategorie: "werk", era: "damaskus", jahr: 1345, daten: "von adh-Dhahabi", zusammenfassung: "Die \"Waage der Ausgewogenheit\": kritisches Lexikon der angezweifelten Tradenten; Grundlage vieler Daif-Einstufungen.", quellen: ["adh-Dhahabi, Mizan al-Itidal"] },
  { id: "w-fath", name: "Fath al-Bari", arabisch: "فتح الباري", kategorie: "werk", era: "damaskus", jahr: 1440, daten: "von Ibn Hajar", zusammenfassung: "Der Kommentar zum Sahih al-Bukhari; \"Es gibt keine Hidschra nach dem Fath\": das Standardwerk, mit dem Bukhari gelesen wird.", quellen: ["Ibn Hajar, Fath al-Bari"] },
  { id: "w-taqrib", name: "Taqrib at-Tahdhib", arabisch: "تقريب التهذيب", kategorie: "werk", era: "damaskus", jahr: 1435, daten: "von Ibn Hajar", zusammenfassung: "Kurzbewertung tausender Tradenten (thiqa, saduq, daif, matruk...); die Bewertungsskala des Hadith-Atlas stammt aus diesem Werk.", quellen: ["Ibn Hajar, Taqrib at-Tahdhib"] },
  // Debatten / Rezeption
  { id: "t-mihna", name: "Die Mihna (Prüfung)", kategorie: "thema", era: "frühzeit", jahr: 833, eckig: true, daten: "218 bis 234 AH / 833 bis 848", zusammenfassung: "Staatliche Inquisition unter al-Ma'mun zur These vom \"erschaffenen Quran\" (mutazilitisch); Ahmad ibn Hanbal widerstand unter Folter; Wendepunkt für die Autorität der Ahl al-Hadith.", quellen: ["adh-Dhahabi, Siyar A'lam an-Nubala"] },
  { id: "t-rezeption-it", name: "Rezeption Ibn Taymiyyas", kategorie: "thema", era: "damaskus", jahr: 1330, eckig: true, daten: "[Khilaf innerhalb der Sunna]", zusammenfassung: "Bis heute diskutiert: Die Salafiyya sieht in ihm die zentrale Autorität der Aqida der Salaf; ashari-maturidische Gelehrte kritisieren Teile seiner Eigenschaftslehre und einzelner Fatawa; UNUMSTRITTEN sind seine Gelehrsamkeit, sein Hadith-Rang und sein Einsatz für die Umma. Beide Sichtweisen gehören zur sunnitischen Binnendebatte [Khilaf].", quellen: ["Ibn Hajar, ad-Durar al-Kamina", "adh-Dhahabi (Würdigung)"] },
  { id: "t-ihya-kritik", name: "Hadith-Kritik am Ihya", kategorie: "thema", era: "klassik", jahr: 1120, eckig: true, daten: "[dokumentierter Befund]", zusammenfassung: "Al-Iraqi prüfte im Takhrij jeden Hadith des Ihya: viele sind schwach, einzelne ohne Grundlage. Lehrstück der Recherche: Auch ein Jahrhundertwerk ersetzt nicht die Prüfung der Einzelüberlieferung.", quellen: ["al-Iraqi, al-Mughni an haml al-asfar"] },
];

type T = [string, string, string, string?, string?];
const E: T[] = [
  // Lehrer-Schüler
  ["abu-hanifa", "shafii", "lehrte", "über seinen Schüler Muhammad ash-Shaybani"],
  ["malik", "shafii", "lehrte", "ash-Shafi'i memorierte den Muwatta"],
  ["shafii", "ahmad", "lehrte", "in Bagdad"],
  ["ahmad", "g-bukhari", "lehrte", "al-Bukhari hörte bei ihm"],
  ["ahmad", "g-abudawud", "lehrte", "engster Schülerkreis"],
  ["g-bukhari", "g-muslim", "lehrte", "Muslim verteidigte ihn in Naysabur"],
  ["g-bukhari", "g-tirmidhi", "lehrte", "at-Tirmidhi übernahm seine Rijal-Methodik"],
  ["ibn-taymiyya", "ibn-qayyim", "lehrte", "engster Schüler, mit ihm inhaftiert"],
  ["ibn-taymiyya", "ibn-kathir", "lehrte", "im Damaszener Schülerkreis"],
  ["ibn-taymiyya", "dhahabi", "lehrte", "Schüler und Weggefährte [Nähe Khilaf]"],
  // Madhhab-Zugehörigkeit
  ["ghazali", "shafii", "madhhab", "Shafi'it"],
  ["nawawi", "shafii", "madhhab", "Shafi'it"],
  ["ibn-kathir", "shafii", "madhhab", "Shafi'it"],
  ["dhahabi", "shafii", "madhhab", "Shafi'it"],
  ["ibn-hajar", "shafii", "madhhab", "Shafi'it"],
  ["ibn-taymiyya", "ahmad", "madhhab", "Hanbali (mit eigenständigem Ijtihad)"],
  ["ibn-qayyim", "ahmad", "madhhab", "Hanbali"],
  // Werke
  ["malik", "w-muwatta", "verfasste"],
  ["shafii", "w-risala", "verfasste"],
  ["ahmad", "w-musnad", "verfasste"],
  ["tabari", "w-tafsir-tabari", "verfasste"],
  ["tabari", "w-tarikh-tabari", "verfasste"],
  ["ghazali", "w-ihya", "verfasste"],
  ["nawawi", "w-riyad", "verfasste"],
  ["ibn-taymiyya", "w-majmu", "verfasste"],
  ["ibn-taymiyya", "w-wasitiyya", "verfasste"],
  ["ibn-taymiyya", "w-minhaj", "verfasste"],
  ["ibn-qayyim", "w-zad", "verfasste"],
  ["ibn-qayyim", "w-madarij", "verfasste"],
  ["ibn-kathir", "w-tafsir-ibnkathir", "verfasste"],
  ["ibn-kathir", "w-bidaya", "verfasste"],
  ["dhahabi", "w-siyar", "verfasste"],
  ["dhahabi", "w-mizan", "verfasste"],
  ["ibn-hajar", "w-fath", "verfasste"],
  ["ibn-hajar", "w-taqrib", "verfasste"],
  // Schulzuordnungen (Aqida)
  ["ghazali", "al-ashari", "madhhab", "Ash'ari-Schule in der Aqida"],
  ["nawawi", "al-ashari", "madhhab", "Ash'ari-Zuordnung [Khilaf]"],
  ["ibn-hajar", "al-ashari", "madhhab", "Ash'ari-Zuordnung [Khilaf]"],
  ["al-maturidi", "abu-hanifa", "madhhab", "knüpft an Abu Hanifas al-Fiqh al-Akbar an"],
  ["jilani", "ahmad", "madhhab", "Hanbali in Fiqh und Aqida"],
  ["jilani", "junayd", "lehrte", "die Qadiriyya führt ihre Kette auf al-Junayd zurück [Tariqa-Überlieferung]"],
  // Debatten
  ["ahmad", "t-mihna", "rezeption", "blieb standhaft"],
  ["ibn-taymiyya", "t-rezeption-it", "rezeption"],
  ["w-wasitiyya", "t-rezeption-it", "rezeption", "Damaszener Disputationen 711 AH"],
  ["w-ihya", "t-ihya-kritik", "rezeption", "Takhrij al-Iraqis"],
  ["ghazali", "t-ihya-kritik", "rezeption"],
  ["w-fath", "g-bukhari", "rezeption", "kommentiert den Sahih"],
];

const edges: AtlasEdge[] = E.map(([von, nach, typ, notiz, datum], i) => ({ id: `ge${i}`, von, nach, typ, notiz, datum }));

// Richtung (Aqida/Prägung) und Rechtsschule pro Gelehrtem. Zuordnungen folgen der
// verbreiteten Einstufung; Strittiges ist in den Knotentexten mit [Khilaf] markiert.
const TAGS: Record<string, { richtung: string[]; madhhab: string[] }> = {
  "abu-hanifa": { richtung: ["früh"], madhhab: ["hanafi"] },
  malik: { richtung: ["früh"], madhhab: ["maliki"] },
  shafii: { richtung: ["früh"], madhhab: ["shafii"] },
  ahmad: { richtung: ["athari"], madhhab: ["hanbali"] },
  "g-bukhari": { richtung: ["früh"], madhhab: ["mujtahid"] },
  "g-muslim": { richtung: ["früh"], madhhab: ["mujtahid"] },
  "g-abudawud": { richtung: ["früh"], madhhab: ["mujtahid"] },
  "g-tirmidhi": { richtung: ["früh"], madhhab: ["mujtahid"] },
  "g-nasai": { richtung: ["früh"], madhhab: ["mujtahid"] },
  "g-ibnmajah": { richtung: ["früh"], madhhab: ["mujtahid"] },
  tabari: { richtung: ["früh"], madhhab: ["mujtahid"] },
  junayd: { richtung: ["sufi", "früh"], madhhab: ["mujtahid"] },
  "al-ashari": { richtung: ["ashari"], madhhab: ["shafii"] },
  "al-maturidi": { richtung: ["maturidi"], madhhab: ["hanafi"] },
  ghazali: { richtung: ["ashari", "sufi"], madhhab: ["shafii"] },
  jilani: { richtung: ["sufi", "athari"], madhhab: ["hanbali"] },
  nawawi: { richtung: ["ashari"], madhhab: ["shafii"] },
  "ibn-taymiyya": { richtung: ["athari"], madhhab: ["hanbali"] },
  dhahabi: { richtung: ["athari"], madhhab: ["shafii"] },
  "ibn-qayyim": { richtung: ["athari"], madhhab: ["hanbali"] },
  "ibn-kathir": { richtung: ["athari"], madhhab: ["shafii"] },
  "ibn-hajar": { richtung: ["ashari"], madhhab: ["shafii"] },
};

const nodes: AtlasNode[] = N.map((n) => (TAGS[n.id] ? { ...n, tags: TAGS[n.id] } : n));

export const gelehrteConfig: AtlasConfig = {
  section: "gelehrte",
  nodes,
  edges,
  kategorien: KATEGORIEN,
  edgeTypen: EDGE_TYPEN,
  eras: ERAS,
  eraLabel: "Epoche",
  bandY: { imam: -300, muhaddith: -80, gelehrter: 140, werk: 400, thema: 640 },
  xProEinheit: 2.2,
  minAbstand: 250,
  jahrMin: 700,
  jahrMax: 1460,
  jahrLabel: "Zeitraum (n. Chr.)",
  jahrAnzeigen: true,
  suchPlatzhalter: "Suche: Gelehrter, Werk, Debatte (z. B. Ibn Taymiyya, Ihya, Mihna)...",
  hinweis: "Innersunnitische Debatten sind neutral dargestellt und mit [Khilaf] markiert; keine Richtung wird als die allein richtige präsentiert. Schulzuordnungen folgen der verbreiteten Einstufung.",
  extraFilter: [
    {
      feld: "richtung",
      label: "Richtung (Aqida / Prägung)",
      werte: {
        früh: "Frühe Ahl al-Hadith (vor den Schulen)",
        athari: "Athari / Salafi-Methodik",
        ashari: "Ash'ari",
        maturidi: "Maturidi",
        sufi: "Tasawwuf-geprägt",
      },
    },
    {
      feld: "madhhab",
      label: "Rechtsschule (Fiqh)",
      werte: {
        hanafi: "Hanafi",
        maliki: "Maliki",
        shafii: "Shafi'i",
        hanbali: "Hanbali",
        mujtahid: "Eigenständig / keine Schule",
      },
    },
  ],
};
