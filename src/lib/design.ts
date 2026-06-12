// Personalisierung: Farb-Themes und Knotenform, lokal gespeichert und sofort wirksam.

export interface Theme {
  id: string;
  label: string;
  vars: Record<string, string>;
}

export const THEMES: Theme[] = [
  {
    id: "smaragd",
    label: "Smaragd & Gold (Standard)",
    vars: {},
  },
  {
    id: "mitternacht",
    label: "Mitternachtsblau",
    vars: {
      "--color-grund": "#0a1220",
      "--color-flaeche": "#101d33",
      "--color-flaeche2": "#16284a",
      "--color-smaragd": "#2456a3",
      "--color-smaragdhell": "#4a86d8",
      "--color-gold": "#d4af37",
      "--color-goldhell": "#e8cd6e",
    },
  },
  {
    id: "royal",
    label: "Königsviolett",
    vars: {
      "--color-grund": "#150a20",
      "--color-flaeche": "#221233",
      "--color-flaeche2": "#2e1a46",
      "--color-smaragd": "#6b3fa0",
      "--color-smaragdhell": "#9a6fd0",
      "--color-gold": "#d4af37",
      "--color-goldhell": "#e8cd6e",
    },
  },
  {
    id: "sand",
    label: "Sand & Braun (warm)",
    vars: {
      "--color-grund": "#1c1410",
      "--color-flaeche": "#2a1f17",
      "--color-flaeche2": "#3a2c20",
      "--color-smaragd": "#8a5a2b",
      "--color-smaragdhell": "#c08445",
      "--color-gold": "#d4af37",
      "--color-goldhell": "#e8cd6e",
    },
  },
];

export type Knotenform = "rund" | "eckig";

export function aktivesTheme(): string {
  try { return localStorage.getItem("design-theme") ?? "smaragd"; } catch { return "smaragd"; }
}

export function knotenform(): Knotenform {
  try { return (localStorage.getItem("knotenform") as Knotenform) ?? "rund"; } catch { return "rund"; }
}

export function setzeKnotenform(f: Knotenform) {
  localStorage.setItem("knotenform", f);
}

export function wendeThemeAn(id: string) {
  const theme = THEMES.find((t) => t.id === id) ?? THEMES[0];
  const wurzel = document.documentElement;
  // Erst Standard wiederherstellen (alle bekannten Variablen löschen) ...
  for (const t of THEMES) for (const k of Object.keys(t.vars)) wurzel.style.removeProperty(k);
  // ... dann das gewählte Theme setzen
  for (const [k, v] of Object.entries(theme.vars)) wurzel.style.setProperty(k, v);
  localStorage.setItem("design-theme", theme.id);
}

export function gespeichertesDesignAnwenden() {
  wendeThemeAn(aktivesTheme());
}
