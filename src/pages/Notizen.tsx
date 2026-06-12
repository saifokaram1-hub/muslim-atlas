import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { nodeById } from "../data/sira";
import { hadithe } from "../data/hadith";

interface Notiz {
  id: string;
  node_id: string;
  section: string;
  content: string;
  updated_at: string;
}

interface Favorit { art: string; ref: string; name: string }

// Wohin führt ein Favorit?
function favoritLink(f: Favorit): string {
  if (f.art === "sira") return `/sira?fokus=${f.ref}`;
  if (f.art === "eigene") return "/meine-maps";
  return `/${f.art}`;
}

export default function Notizen() {
  const { user, laden } = useAuth();
  const [notizen, setNotizen] = useState<Notiz[]>([]);
  const [favoriten, setFavoriten] = useState<Favorit[]>([]);
  const [geladen, setGeladen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!laden && !user) navigate("/login");
  }, [laden, user, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("notes")
      .select("id, node_id, section, content, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .then(({ data }) => {
        setNotizen((data as Notiz[]) ?? []);
        setGeladen(true);
      });
    supabase
      .from("favoriten")
      .select("art, ref, name")
      .order("created_at", { ascending: false })
      .then(({ data }) => setFavoriten((data as Favorit[]) ?? []));
  }, [user?.id]);

  const titelFür = (n: Notiz) => {
    if (n.section === "sira") return nodeById.get(n.node_id)?.name ?? n.node_id;
    return hadithe.find((h) => h.id === n.node_id)?.titel ?? n.node_id;
  };

  const linkFür = (n: Notiz) => {
    if (n.section === "sira") return `/sira?fokus=${n.node_id}`;
    const h = hadithe.find((x) => x.id === n.node_id);
    return h ? `/hadith/${h.buchId}/${h.id}` : "/hadith";
  };

  const löschen = async (id: string) => {
    await supabase.from("notes").delete().eq("id", id);
    setNotizen((alt) => alt.filter((n) => n.id !== id));
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 w-full">
      <h1 className="font-serif text-3xl text-gold">Meine Notizen & Favoriten</h1>
      <p className="text-cremedim mt-1 text-sm">Alles, was du im Atlas gespeichert und mit ★ markiert hast.</p>

      {favoriten.length > 0 && (
        <div className="mt-6">
          <h2 className="font-serif text-xl text-goldhell mb-2">★ Favoriten</h2>
          <div className="flex flex-wrap gap-2">
            {favoriten.map((f) => (
              <Link
                key={`${f.art}-${f.ref}`}
                to={favoritLink(f)}
                className="karte karte-aktiv px-3 py-1.5 text-sm text-creme inline-flex items-center gap-1.5"
              >
                <span className="text-gold">★</span> {f.name || f.ref}
                <span className="text-[10px] text-cremedim">({f.art})</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {!geladen && <p className="text-cremedim mt-6">Lädt...</p>}
      {geladen && notizen.length === 0 && (
        <p className="text-cremedim mt-6">
          Noch keine Notizen. Öffne die <Link to="/sira" className="text-goldhell underline">Sira-Mindmap</Link>,
          klicke einen Knoten an und schreibe deine erste Notiz.
        </p>
      )}

      <div className="mt-6 space-y-3">
        {notizen.map((n) => (
          <div key={n.id} className="karte p-4">
            <div className="flex justify-between items-start gap-2">
              <Link to={linkFür(n)} className="text-creme font-medium hover:text-goldhell">
                {titelFür(n)}
                <span className="ml-2 text-xs text-cremedim">({n.section === "sira" ? "Sira-Atlas" : "Hadith-Atlas"})</span>
              </Link>
              <button className="text-xs text-warn hover:underline" onClick={() => löschen(n.id)}>Löschen</button>
            </div>
            <p className="text-sm text-cremedim mt-1 whitespace-pre-wrap">{n.content}</p>
            <p className="text-xs text-cremedim/60 mt-2">Zuletzt geändert: {new Date(n.updated_at).toLocaleString("de-DE")}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
