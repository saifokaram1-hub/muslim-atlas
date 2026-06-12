import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

// Sternchen zum Favorisieren (Personen, Bereiche, eigene Maps) — pro Konto gespeichert.
export function FavStern({ art, refId, name }: { art: string; refId: string; name: string }) {
  const { user } = useAuth();
  const [aktiv, setAktiv] = useState(false);

  useEffect(() => {
    setAktiv(false);
    if (!user) return;
    supabase
      .from("favoriten")
      .select("ref")
      .eq("art", art)
      .eq("ref", refId)
      .maybeSingle()
      .then(({ data }) => setAktiv(!!data));
  }, [user?.id, art, refId]);

  if (!user) return null;

  return (
    <button
      className={`text-xl leading-none transition ${aktiv ? "text-gold" : "text-cremedim hover:text-goldhell"}`}
      title={aktiv ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufügen"}
      onClick={async () => {
        if (aktiv) {
          await supabase.from("favoriten").delete().eq("art", art).eq("ref", refId);
          setAktiv(false);
        } else {
          await supabase.from("favoriten").upsert({ user_id: user.id, art, ref: refId, name });
          setAktiv(true);
        }
      }}
    >
      {aktiv ? "★" : "☆"}
    </button>
  );
}
