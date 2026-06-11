import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export function NotizBox({ nodeId, section }: { nodeId: string; section: string }) {
  const { user } = useAuth();
  const [inhalt, setInhalt] = useState("");
  const [status, setStatus] = useState<"" | "lädt" | "speichert" | "gespeichert" | "fehler">("");

  useEffect(() => {
    setInhalt("");
    if (!user) return;
    setStatus("lädt");
    supabase
      .from("notes")
      .select("content")
      .eq("user_id", user.id)
      .eq("section", section)
      .eq("node_id", nodeId)
      .maybeSingle()
      .then(({ data }) => {
        setInhalt(data?.content ?? "");
        setStatus("");
      });
  }, [user?.id, nodeId, section]);

  if (!user) {
    return (
      <p className="text-sm text-cremedim">
        <Link to="/login" className="text-goldhell underline">Anmelden</Link>, um hier eine eigene Notiz zu speichern.
      </p>
    );
  }

  const speichern = async () => {
    setStatus("speichert");
    const { error } = await supabase.from("notes").upsert(
      { user_id: user.id, section, node_id: nodeId, content: inhalt, updated_at: new Date().toISOString() },
      { onConflict: "user_id,section,node_id" },
    );
    setStatus(error ? "fehler" : "gespeichert");
    if (!error) setTimeout(() => setStatus(""), 2000);
  };

  return (
    <div className="space-y-2">
      <textarea
        className="eingabe min-h-24 text-sm"
        placeholder="Meine Notiz zu diesem Knoten..."
        value={inhalt}
        onChange={(e) => setInhalt(e.target.value)}
        disabled={status === "lädt"}
      />
      <div className="flex items-center gap-3">
        <button className="knopf text-sm py-1.5" onClick={speichern} disabled={status === "speichert"}>
          {status === "speichert" ? "Speichert..." : "Notiz speichern"}
        </button>
        {status === "gespeichert" && <span className="text-sm text-smaragdhell">Gespeichert.</span>}
        {status === "fehler" && <span className="text-sm text-warn">Fehler beim Speichern.</span>}
      </div>
    </div>
  );
}
