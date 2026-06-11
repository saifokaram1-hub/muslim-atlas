import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

interface Stats {
  users_total: number;
  users_7d: number;
  notes_total: number;
  views_7d: number;
  searches_7d: number;
}
interface NutzerZeile {
  id: string;
  username: string | null;
  email: string | null;
  role: string;
  created_at: string;
  note_count: number;
}
interface SuchZeile { query: string; anzahl: number }
interface TagZeile { tag: string; views: number; searches: number; registrierungen: number }

export default function Admin() {
  const { user, profil, laden } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [nutzer, setNutzer] = useState<NutzerZeile[]>([]);
  const [suchen, setSuchen] = useState<SuchZeile[]>([]);
  const [tage, setTage] = useState<TagZeile[]>([]);
  const [filter, setFilter] = useState("");
  const [seite, setSeite] = useState(0);
  const PRO_SEITE = 10;

  useEffect(() => {
    if (laden) return;
    if (!user) { navigate("/login"); return; }
    if (profil && profil.role !== "admin") navigate("/");
  }, [laden, user, profil, navigate]);

  useEffect(() => {
    if (profil?.role !== "admin") return;
    supabase.rpc("admin_stats").then(({ data }) => setStats(data as Stats));
    supabase.rpc("admin_user_overview").then(({ data }) => setNutzer((data as NutzerZeile[]) ?? []));
    supabase.rpc("admin_top_searches", { p_limit: 12 }).then(({ data }) => setSuchen((data as SuchZeile[]) ?? []));
    supabase.rpc("admin_activity_daily", { p_days: 14 }).then(({ data }) => setTage((data as TagZeile[]) ?? []));
  }, [profil?.role]);

  const gefiltert = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return nutzer.filter(
      (n) => !q || (n.email ?? "").toLowerCase().includes(q) || (n.username ?? "").toLowerCase().includes(q),
    );
  }, [nutzer, filter]);
  const seitenAnzahl = Math.max(1, Math.ceil(gefiltert.length / PRO_SEITE));
  const sichtbar = gefiltert.slice(seite * PRO_SEITE, (seite + 1) * PRO_SEITE);

  const rolleÄndern = async (id: string, neueRolle: string) => {
    if (!confirm(`Rolle wirklich auf "${neueRolle}" ändern?`)) return;
    const { error } = await supabase.from("profiles").update({ role: neueRolle }).eq("id", id);
    if (!error) setNutzer((alt) => alt.map((n) => (n.id === id ? { ...n, role: neueRolle } : n)));
  };

  if (profil?.role !== "admin") {
    return <div className="p-10 text-center text-cremedim">Prüfe Berechtigung...</div>;
  }

  const maxAktivität = Math.max(1, ...tage.map((t) => t.views + t.searches));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 w-full">
      <h1 className="font-serif text-3xl text-gold">Adminportal</h1>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mt-6">
        {[
          { label: "Nutzer gesamt", wert: stats?.users_total },
          { label: "Neue Nutzer (7 Tage)", wert: stats?.users_7d },
          { label: "Notizen gesamt", wert: stats?.notes_total },
          { label: "Seitenaufrufe (7 Tage)", wert: stats?.views_7d },
          { label: "Suchanfragen (7 Tage)", wert: stats?.searches_7d },
        ].map((k) => (
          <div key={k.label} className="karte p-4 text-center">
            <p className="text-3xl font-serif text-gold">{k.wert ?? "..."}</p>
            <p className="text-xs text-cremedim mt-1">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mt-6">
        <div className="karte p-5">
          <h2 className="font-semibold text-goldhell">Aktivität der letzten 14 Tage</h2>
          <p className="text-xs text-cremedim">Seitenaufrufe (grün) und Suchanfragen (gold) pro Tag</p>
          <div className="flex items-end gap-1.5 h-36 mt-4">
            {tage.map((t) => (
              <div key={t.tag} className="flex-1 flex flex-col justify-end gap-0.5" title={`${t.tag}: ${t.views} Aufrufe, ${t.searches} Suchen, ${t.registrierungen} Registrierungen`}>
                <div className="bg-gold/80 rounded-t" style={{ height: `${(t.searches / maxAktivität) * 100}%` }} />
                <div className="bg-smaragd rounded-t" style={{ height: `${(t.views / maxAktivität) * 100}%` }} />
              </div>
            ))}
            {tage.length === 0 && <p className="text-sm text-cremedim">Noch keine Daten.</p>}
          </div>
        </div>

        <div className="karte p-5">
          <h2 className="font-semibold text-goldhell">Häufigste Suchanfragen</h2>
          <p className="text-xs text-cremedim">Was die Besucher am meisten suchen</p>
          <ul className="mt-3 space-y-1.5">
            {suchen.map((s, i) => (
              <li key={s.query} className="flex justify-between text-sm">
                <span className="text-creme">{i + 1}. {s.query}</span>
                <span className="text-cremedim">{s.anzahl}×</span>
              </li>
            ))}
            {suchen.length === 0 && <li className="text-sm text-cremedim">Noch keine Suchanfragen.</li>}
          </ul>
        </div>
      </div>

      <div className="karte p-5 mt-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h2 className="font-semibold text-goldhell">Registrierungen ({gefiltert.length})</h2>
          <input
            className="eingabe md:w-72"
            placeholder="Suche nach E-Mail oder Username..."
            value={filter}
            onChange={(e) => { setFilter(e.target.value); setSeite(0); }}
          />
        </div>
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-cremedim border-b border-gold/20">
                <th className="py-2 pr-3">Username</th>
                <th className="py-2 pr-3">E-Mail</th>
                <th className="py-2 pr-3">Rolle</th>
                <th className="py-2 pr-3">Registriert am</th>
                <th className="py-2 pr-3">Notizen</th>
              </tr>
            </thead>
            <tbody>
              {sichtbar.map((n) => (
                <tr key={n.id} className="border-b border-gold/10">
                  <td className="py-2 pr-3 text-creme">{n.username ?? "-"}</td>
                  <td className="py-2 pr-3 text-cremedim">{n.email ?? "-"}</td>
                  <td className="py-2 pr-3">
                    <select
                      className="eingabe py-1 text-xs w-24"
                      value={n.role}
                      onChange={(e) => rolleÄndern(n.id, e.target.value)}
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="py-2 pr-3 text-cremedim">{new Date(n.created_at).toLocaleDateString("de-DE")}</td>
                  <td className="py-2 pr-3 text-cremedim">{n.note_count}</td>
                </tr>
              ))}
              {sichtbar.length === 0 && (
                <tr><td colSpan={5} className="py-4 text-cremedim">Keine Registrierungen gefunden.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {seitenAnzahl > 1 && (
          <div className="flex gap-2 mt-3 items-center">
            <button className="knopf text-xs py-1" disabled={seite === 0} onClick={() => setSeite(seite - 1)}>Zurück</button>
            <span className="text-xs text-cremedim">Seite {seite + 1} von {seitenAnzahl}</span>
            <button className="knopf text-xs py-1" disabled={seite >= seitenAnzahl - 1} onClick={() => setSeite(seite + 1)}>Weiter</button>
          </div>
        )}
      </div>
    </div>
  );
}
