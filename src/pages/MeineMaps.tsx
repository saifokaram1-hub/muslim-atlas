import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ReactFlow, ReactFlowProvider, Background, Controls, MiniMap, addEdge,
  useNodesState, useEdgesState, type Node, type Edge, type Connection,
} from "@xyflow/react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { FavStern } from "../components/FavStern";

// Eigene Mindmaps: erstellen, bearbeiten (ziehen, verbinden, löschen), speichern
// und favorisieren. Gespeichert pro Konto (Tabelle eigene_maps, RLS).

interface MapMeta { id: string; name: string; daten: GespeicherteDaten; updated_at: string }
interface GespeicherteDaten {
  nodes: { id: string; x: number; y: number; name: string; farbe: string }[];
  edges: { id: string; von: string; nach: string }[];
}

const FARBEN = ["#d4af37", "#2f9d77", "#4f8fd1", "#c98bc9", "#e09a4f", "#b5483d"];

function zuFlow(daten: GespeicherteDaten): { nodes: Node[]; edges: Edge[] } {
  return {
    nodes: daten.nodes.map((n) => ({
      id: n.id,
      position: { x: n.x, y: n.y },
      data: { label: n.name },
      style: {
        background: n.farbe, color: "#10120a", fontWeight: 600,
        borderRadius: 12, border: "2px solid rgba(0,0,0,0.25)", padding: 8,
      },
    })),
    edges: daten.edges.map((e) => ({
      id: e.id, source: e.von, target: e.nach,
      style: { stroke: "#d4af37", strokeWidth: 1.8 }, animated: true,
    })),
  };
}

function zuDaten(nodes: Node[], edges: Edge[]): GespeicherteDaten {
  return {
    nodes: nodes.map((n) => ({
      id: n.id, x: n.position.x, y: n.position.y,
      name: String((n.data as { label?: unknown }).label ?? ""),
      farbe: String((n.style as { background?: unknown })?.background ?? "#d4af37"),
    })),
    edges: edges.map((e) => ({ id: e.id, von: e.source, nach: e.target })),
  };
}

function Editor({ map, zurück }: { map: MapMeta; zurück: () => void }) {
  const start = zuFlow(map.daten);
  const [nodes, setNodes, onNodesChange] = useNodesState(start.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(start.edges);
  const [name, setName] = useState(map.name);
  const [neuName, setNeuName] = useState("");
  const [neuFarbe, setNeuFarbe] = useState(FARBEN[0]);
  const [status, setStatus] = useState("");

  const onConnect = useCallback(
    (c: Connection) => setEdges((alt) => addEdge({ ...c, animated: true, style: { stroke: "#d4af37", strokeWidth: 1.8 } }, alt)),
    [setEdges],
  );

  const knotenHinzufügen = () => {
    if (neuName.trim().length < 1) return;
    setNodes((alt) => [
      ...alt,
      {
        id: `k${Date.now()}`,
        position: { x: 80 + Math.random() * 240, y: 60 + Math.random() * 200 },
        data: { label: neuName.trim() },
        style: {
          background: neuFarbe, color: "#10120a", fontWeight: 600,
          borderRadius: 12, border: "2px solid rgba(0,0,0,0.25)", padding: 8,
        },
      },
    ]);
    setNeuName("");
  };

  const speichern = async () => {
    setStatus("speichert…");
    const { error } = await supabase
      .from("eigene_maps")
      .update({ name, daten: zuDaten(nodes, edges), updated_at: new Date().toISOString() })
      .eq("id", map.id);
    setStatus(error ? "Fehler beim Speichern" : "Gespeichert ✓");
    setTimeout(() => setStatus(""), 2000);
  };

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 3.5rem)" }}>
      <div className="flex flex-wrap items-center gap-2 p-3 border-b border-gold/20">
        <button className="knopf text-sm" onClick={zurück}>← Meine Maps</button>
        <input className="eingabe max-w-56" value={name} onChange={(e) => setName(e.target.value)} />
        <input
          className="eingabe max-w-48"
          placeholder="Neuer Knoten…"
          value={neuName}
          onChange={(e) => setNeuName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && knotenHinzufügen()}
        />
        <div className="flex gap-1">
          {FARBEN.map((f) => (
            <button
              key={f}
              className="h-6 w-6 rounded-full border-2"
              style={{ background: f, borderColor: neuFarbe === f ? "#f4efe3" : "transparent" }}
              onClick={() => setNeuFarbe(f)}
            />
          ))}
        </div>
        <button className="knopf text-sm" onClick={knotenHinzufügen}>+ Knoten</button>
        <button className="knopf knopf-gold text-sm" onClick={speichern}>Speichern</button>
        {status && <span className="text-xs text-smaragdhell">{status}</span>}
        <span className="text-[11px] text-cremedim ml-auto hidden md:block">
          Ziehen = verschieben · vom Rand eines Knotens ziehen = verbinden · Auswahl + Entf = löschen
        </span>
      </div>
      <div className="flex-1">
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            deleteKeyCode={["Delete", "Backspace"]}
            fitView
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#1f3a2e" gap={28} />
            <Controls position="bottom-left" showInteractive={false} />
            <MiniMap position="bottom-right" pannable zoomable maskColor="rgba(10,24,18,0.7)" />
          </ReactFlow>
        </ReactFlowProvider>
      </div>
    </div>
  );
}

export default function MeineMaps() {
  const { user } = useAuth();
  const [maps, setMaps] = useState<MapMeta[]>([]);
  const [offen, setOffen] = useState<MapMeta | null>(null);

  const laden = useCallback(() => {
    supabase.from("eigene_maps").select("id, name, daten, updated_at").order("updated_at", { ascending: false })
      .then(({ data }) => setMaps((data as MapMeta[]) ?? []));
  }, []);
  useEffect(() => { if (user) laden(); }, [user?.id, laden]);

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="font-serif text-3xl text-gold">Meine Mindmaps</h1>
        <p className="text-cremedim mt-3">
          Eigene Mindmaps brauchen ein Konto.{" "}
          <Link to="/login" className="text-goldhell underline">Anmelden</Link> oder{" "}
          <Link to="/registrieren" className="text-goldhell underline">registrieren</Link>.
        </p>
      </div>
    );
  }

  if (offen) return <Editor map={offen} zurück={() => { setOffen(null); laden(); }} />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 w-full">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="font-serif text-4xl text-gold">Meine Mindmaps</h1>
        <button
          className="knopf knopf-gold"
          onClick={async () => {
            const { data } = await supabase
              .from("eigene_maps")
              .insert({ user_id: user.id })
              .select("id, name, daten, updated_at")
              .single();
            if (data) setOffen(data as MapMeta);
          }}
        >
          + Neue Mindmap
        </button>
      </div>
      <p className="text-cremedim mt-2 text-sm">
        Baue deine eigenen Wissenskarten: Knoten anlegen, ziehen, verbinden — und mit ★ favorisieren.
      </p>

      {maps.length === 0 && <p className="text-cremedim mt-8">Noch keine eigene Mindmap — leg oben die erste an.</p>}
      <div className="grid md:grid-cols-2 gap-4 mt-6">
        {maps.map((m) => (
          <div key={m.id} className="karte karte-aktiv p-5">
            <div className="flex justify-between items-start gap-2">
              <h2 className="font-serif text-xl text-gold">{m.name}</h2>
              <FavStern art="eigene" refId={m.id} name={m.name} />
            </div>
            <p className="text-xs text-cremedim mt-1">
              {m.daten.nodes.length} Knoten · {m.daten.edges.length} Verbindungen ·
              zuletzt {new Date(m.updated_at).toLocaleDateString("de-DE")}
            </p>
            <div className="flex gap-2 mt-4">
              <button className="knopf text-sm" onClick={() => setOffen(m)}>Öffnen & bearbeiten</button>
              <button
                className="text-warn text-sm hover:underline"
                onClick={async () => {
                  await supabase.from("eigene_maps").delete().eq("id", m.id);
                  laden();
                }}
              >
                Löschen
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
