import { useEffect, useState, useCallback } from "react";
import { supabase } from "./supabase";

// Admin-Overrides: Aenderungen, die der Admin visuell in den Karten vornimmt,
// liegen als JSON-Patch pro Knoten in der Tabelle knoten_overrides und werden
// ueber die statischen Daten gelegt — sofort sichtbar fuer alle Besucher.

export type Patch = Record<string, unknown>;

export function useOverrides(section: string) {
  const [overrides, setOverrides] = useState<Record<string, Patch>>({});

  const laden = useCallback(() => {
    supabase
      .from("knoten_overrides")
      .select("node_id, patch")
      .eq("section", section)
      .then(({ data }) => {
        const m: Record<string, Patch> = {};
        for (const z of (data as { node_id: string; patch: Patch }[]) ?? []) m[z.node_id] = z.patch;
        setOverrides(m);
      });
  }, [section]);

  useEffect(() => { laden(); }, [laden]);

  const speichern = useCallback(
    async (nodeId: string, patch: Patch) => {
      const { error } = await supabase
        .from("knoten_overrides")
        .upsert({ section, node_id: nodeId, patch, updated_at: new Date().toISOString() });
      if (!error) setOverrides((alt) => ({ ...alt, [nodeId]: patch }));
      return !error;
    },
    [section],
  );

  const zuruecksetzen = useCallback(
    async (nodeId: string) => {
      await supabase.from("knoten_overrides").delete().eq("section", section).eq("node_id", nodeId);
      setOverrides((alt) => {
        const neu = { ...alt };
        delete neu[nodeId];
        return neu;
      });
    },
    [section],
  );

  return { overrides, speichern, zuruecksetzen };
}

// Wendet einen Patch auf einen Knoten an (nur gesetzte Felder ueberschreiben)
export function mitPatch<T extends object>(node: T, patch?: Patch): T {
  if (!patch) return node;
  return { ...node, ...patch };
}
