import { createClient } from "@supabase/supabase-js";

// Eigenes Supabase-Projekt "sira-atlas" (EU / Frankfurt).
// Der publishable Key ist für den Browser bestimmt; Sicherheit kommt aus Row Level Security.
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ?? "https://fyymraquxubpdaabfyau.supabase.co";
const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_KEY ?? "sb_publishable_k5An_44qXXtmiCuioR6hSQ_3C-GsLyL";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
