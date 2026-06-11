import { supabase } from "./supabase";

// Leichtgewichtige Aktivitäts-Erfassung für das Adminportal.
// Schreibfehler werden bewusst ignoriert (Statistik darf die Seite nie stören).
export async function logEvent(
  typ: "page_view" | "search",
  payload: Record<string, unknown>,
) {
  try {
    const { data } = await supabase.auth.getUser();
    await supabase.from("events").insert({
      typ,
      payload,
      user_id: data.user?.id ?? null,
    });
  } catch {
    /* still */
  }
}

let suchTimer: ReturnType<typeof setTimeout> | undefined;
export function logSearchDebounced(query: string, section: string) {
  if (suchTimer) clearTimeout(suchTimer);
  const q = query.trim();
  if (q.length < 3) return;
  suchTimer = setTimeout(() => logEvent("search", { query: q.toLowerCase(), section }), 1200);
}
