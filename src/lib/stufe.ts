// Wissensstufen-System: Nutzer geben pro Bereich an, wie tief ihr Wissen ist.
// Die Mindmaps passen sich als Standardfilter an; jederzeit hochstufbar.
// Gespeichert lokal im Browser und (wenn eingeloggt) im Profil (profiles.stufen jsonb).

import { supabase } from "./supabase";

export type Wissensstufe = 1 | 2 | 3;

export const STUFEN_LABEL: Record<Wissensstufe, string> = {
  1: "Anfänger — die großen Linien",
  2: "Fortgeschritten — mehr Tiefe",
  3: "Experte — alles anzeigen",
};

function lokalAlle(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem("wissensstufen") ?? "{}"); } catch { return {}; }
}

export function stufeLokal(bereich: string): Wissensstufe {
  const w = lokalAlle()[bereich];
  return w === 1 || w === 2 || w === 3 ? w : 1;
}

export function setzeStufe(bereich: string, wert: Wissensstufe, userId?: string) {
  const alle = { ...lokalAlle(), [bereich]: wert };
  localStorage.setItem("wissensstufen", JSON.stringify(alle));
  if (userId) {
    // Profil-Update (fire and forget); ganzes Objekt schreiben haelt es einfach
    supabase.from("profiles").update({ stufen: alle }).eq("id", userId).then(() => {});
  }
}

export async function ladeStufen(userId: string): Promise<void> {
  const { data } = await supabase.from("profiles").select("stufen").eq("id", userId).single();
  const stufen = (data?.stufen ?? {}) as Record<string, number>;
  if (Object.keys(stufen).length > 0) {
    localStorage.setItem("wissensstufen", JSON.stringify({ ...lokalAlle(), ...stufen }));
  }
}
