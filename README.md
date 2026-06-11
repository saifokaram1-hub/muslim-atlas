# Muslim-Atlas

Deutschsprachige Recherche-Website mit interaktiven Wissenskarten (Mindmaps) zu den
islamischen Wissensbereichen aus sunnitischer Sicht. Jede Angabe trägt ihre Quelle;
Hadith- und Quran-Belege sind direkt zu sunnah.com und quran.com verlinkt.

## Wissensbereiche

- **Sira-Mindmap** (`/sira`): 133 Knoten, 183 Verbindungen (570 bis 632 n. Chr.).
  Suche, Filter (Kategorie, Epoche, Jahresbereich, Beziehungstyp), Zoom/Pan/Minimap,
  Detail-Panel mit Zeitangaben (n. Chr. + AH), Quellen und klickbaren Verbindungen.
  Eigene Kategorie "Korrekturen durch Offenbarung (Itab)".
- **Sahaba-Ansicht** (`/sira?bereich=sahaba`): dieselbe Karte mit vorgefiltertem
  Blick auf die Gefährtinnen und Gefährten.
- **Propheten-Atlas** (`/propheten`): die 25 im Quran genannten Propheten von Adam
  bis Isa mit Völkern und Schlüsselereignissen in überlieferter Abfolge
  (Qasas al-Anbiya); ausdrücklich ohne erfundene Jahreszahlen, Unsicheres [Khilaf].
- **Quran-Chronologie** (`/quran`): alle 114 Suren nach traditioneller (ägyptischer)
  Offenbarungsreihenfolge, makki/madani, Phasen, Themen, Verszahlen (Hafs-Zählung),
  jede Sure zu quran.com verlinkt.
- **Hadith-Atlas** (`/hadith`): Die sechs Bücher mit Methodik-Profilen und
  Begriffs-Glossar (sahih, hasan, mutawatir, gharib, matruk, Mudallis); pro Hadith
  die Isnad-Kette als Mindmap mit Rijal-Bewertung jedes Tradenten, Kontext (Asbab
  al-Wurud), Schwachstellen-Analyse ("Woran scheitert die Kette?") und Lehrpunkten.
- **Gelehrten-Atlas** (`/gelehrte`): von Abu Hanifa bis Ibn Hajar; Lehrer-Schüler-
  Linien, Hauptwerke (u. a. Ibn Taymiyya: Majmu, Wasitiyya, Minhaj) und Debatten
  (Mihna, Rezeption Ibn Taymiyyas, Hadith-Kritik am Ihya), neutral mit [Khilaf].
- Die Graph-Engine ist generisch (`src/components/AtlasGraph.tsx`); neue Bereiche
  brauchen nur eine Datendatei in `src/data/` plus eine Mini-Seite.
- **Accounts**: Registrierung mit Username + E-Mail + Passwort, Passwort-Reset per
  E-Mail, eigene Notizen an jedem Knoten (`/notizen`).
- **Adminportal** (`/admin`, nur role=admin): Registrierungen, Rollenverwaltung,
  Aktivität (Seitenaufrufe/Suchen pro Tag), häufigste Suchanfragen.
  saifokaram1@gmail.com wird bei Registrierung automatisch Admin.

## Stack

- React 18 + Vite 6 + TypeScript + Tailwind CSS 4 + React Flow (@xyflow/react)
- Supabase (Projekt "sira-atlas", ID `fyymraquxubpdaabfyau`, Region eu-central-1):
  Auth, Tabellen `profiles`, `notes`, `events`, alles mit Row Level Security;
  Admin-Statistiken über security-definer-Funktionen.

## Entwicklung

```
npm install
npm run dev      # http://localhost:5173
npm run build    # Produktions-Build nach dist/
```

## Deployment (wenn Domain bereit)

1. Hosting: dist/ ist rein statisch; Vercel oder Netlify (Build-Command `npm run build`,
   Output `dist`, SPA-Fallback auf index.html aktivieren).
2. Supabase Dashboard -> Authentication -> URL Configuration:
   - Site URL auf die Domain setzen (z. B. https://sira-atlas.de)
   - Redirect URLs ergänzen: https://DOMAIN/passwort-ändern (und für lokale Tests
     http://localhost:5173/passwort-ändern)
3. Optional eigene SMTP (Resend o. ä.) in Supabase eintragen, damit Bestätigungs-
   und Reset-Mails vom eigenen Absender kommen (Standard-SMTP ist stark ratenlimitiert).
4. Datenpflege: Sira-Daten in `src/data/sira.ts`, Hadithe in `src/data/hadith.ts`
   ergänzen; Format ist selbsterklärend, IDs müssen eindeutig sein.

## Inhaltliche Leitlinien

Quellenpflicht für jeden Fakt; Umstrittenes mit [Khilaf], Mehrheitsmeinung mit [Jumhur];
schwache Tradenten werden benannt und erklärt, nicht versteckt. Der Datensatz ist ein
kuratierter, wachsender Kern (V1).
