import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import type { Patch } from "../lib/overrides";

// Visuelles Bearbeiten eines Knotens — nur fuer Admins sichtbar.
// Aenderungen werden als Patch gespeichert und sofort ueber die Daten gelegt.

export interface Feld {
  key: string;
  label: string;
  mehrzeilig?: boolean;
  liste?: boolean; // Werte mit ";" trennen (z. B. Quellen)
}

export function AdminEdit({
  node,
  felder,
  patch,
  speichern,
  zuruecksetzen,
}: {
  node: Record<string, unknown>;
  felder: Feld[];
  patch?: Patch;
  speichern: (p: Patch) => Promise<boolean>;
  zuruecksetzen: () => void;
}) {
  const { profil } = useAuth();
  const [offen, setOffen] = useState(false);
  const [werte, setWerte] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("");

  useEffect(() => {
    const init: Record<string, string> = {};
    for (const f of felder) {
      const v = (node as Record<string, unknown>)[f.key];
      init[f.key] = Array.isArray(v) ? v.join("; ") : v == null ? "" : String(v);
    }
    setWerte(init);
  }, [node, felder]);

  if (profil?.role !== "admin") return null;

  const sichern = async () => {
    setStatus("speichert…");
    const p: Patch = { ...patch };
    for (const f of felder) {
      const roh = werte[f.key] ?? "";
      p[f.key] = f.liste ? roh.split(";").map((s) => s.trim()).filter(Boolean) : roh;
    }
    const ok = await speichern(p);
    setStatus(ok ? "Gespeichert ✓ (für alle sichtbar)" : "Fehler");
    setTimeout(() => setStatus(""), 2500);
  };

  return (
    <div className="rounded-lg border border-gold/40 bg-gold/5 p-3">
      <button
        className="flex items-center gap-2 text-sm font-semibold text-gold w-full"
        onClick={() => setOffen(!offen)}
      >
        <span>⚙ Admin: diesen Knoten bearbeiten</span>
        <span className="ml-auto">{offen ? "▲" : "▼"}</span>
      </button>
      {offen && (
        <div className="mt-3 space-y-2">
          {felder.map((f) => (
            <label key={f.key} className="block">
              <span className="text-xs text-cremedim">{f.label}{f.liste ? " (mit ; trennen)" : ""}</span>
              {f.mehrzeilig ? (
                <textarea
                  className="eingabe text-sm mt-0.5 min-h-20"
                  value={werte[f.key] ?? ""}
                  onChange={(e) => setWerte({ ...werte, [f.key]: e.target.value })}
                />
              ) : (
                <input
                  className="eingabe text-sm mt-0.5"
                  value={werte[f.key] ?? ""}
                  onChange={(e) => setWerte({ ...werte, [f.key]: e.target.value })}
                />
              )}
            </label>
          ))}
          <div className="flex items-center gap-2 pt-1">
            <button className="knopf knopf-gold text-sm" onClick={sichern}>Speichern</button>
            {patch && (
              <button className="knopf text-sm" onClick={zuruecksetzen}>Auf Original zurücksetzen</button>
            )}
            {status && <span className="text-xs text-smaragdhell">{status}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
