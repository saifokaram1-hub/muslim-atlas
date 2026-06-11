import { useMemo, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ReactFlow, ReactFlowProvider, Background, Controls, MiniMap,
  Handle, Position, useReactFlow, type Node, type Edge, type NodeProps,
} from "@xyflow/react";
import {
  siraNodes, siraEdges, nodeById, KATEGORIE_INFO, EDGE_INFO, ERA_INFO,
  type SiraNode, type NodeKategorie, type EdgeTyp, type Era,
} from "../data/sira";
import { QuellenListe } from "../lib/quellen";
import { NotizBox } from "../components/NotizBox";
import { logSearchDebounced, logEvent } from "../lib/analytics";

// ---- Layout: Ereignisse als Zeitachse, Personen in Kategorie-Bändern ----
const BAND_Y: Record<NodeKategorie, number> = {
  verbündeter: -820, familie: -660, ehefrau: -500, kind: -340, prophet: -170,
  ereignis: 0, korrektur: 170, gefährte: 340, ansar: 510, später_konvertit: 680, gegner: 850,
};
const scaleX = (jahr: number) => (jahr - 570) * 95;

function berechnePositionen(): Map<string, { x: number; y: number }> {
  const pos = new Map<string, { x: number; y: number }>();
  const proBand = new Map<NodeKategorie, SiraNode[]>();
  for (const n of siraNodes) {
    const liste = proBand.get(n.kategorie) ?? [];
    liste.push(n);
    proBand.set(n.kategorie, liste);
  }
  for (const [kat, liste] of proBand) {
    liste.sort((a, b) => a.jahr - b.jahr || a.name.localeCompare(b.name));
    let lastX = -Infinity;
    for (const n of liste) {
      const x = Math.max(scaleX(n.jahr), lastX + 250);
      lastX = x;
      pos.set(n.id, { x, y: BAND_Y[kat] });
    }
  }
  // Prophet ﷺ mittig über der Zeitachse
  pos.set("muhammad", { x: scaleX(601), y: BAND_Y.prophet });
  return pos;
}
const POSITIONEN = berechnePositionen();

// ---- Custom Nodes ----
function PersonNode({ data, selected }: NodeProps) {
  const d = data as unknown as SiraNode;
  const farbe = KATEGORIE_INFO[d.kategorie].farbe;
  return (
    <div
      className="rounded-xl px-3 py-2 bg-flaeche min-w-44 max-w-52 text-center shadow-lg"
      style={{ border: `2px solid ${farbe}`, boxShadow: selected ? `0 0 0 3px #d4af37` : undefined }}
    >
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <div className="text-[13px] font-semibold text-creme leading-tight">{d.name}</div>
      {d.arabisch && <div className="font-arabic text-[13px] text-cremedim leading-tight" dir="rtl">{d.arabisch}</div>}
      <div className="text-[10px] mt-0.5" style={{ color: farbe }}>
        {KATEGORIE_INFO[d.kategorie].label} · {d.jahr}
      </div>
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  );
}

function EreignisNode({ data, selected }: NodeProps) {
  const d = data as unknown as SiraNode;
  const istKorrektur = d.kategorie === "korrektur";
  const farbe = KATEGORIE_INFO[d.kategorie].farbe;
  return (
    <div
      className="px-3 py-2 min-w-48 max-w-56 text-center shadow-lg"
      style={{
        background: istKorrektur ? "#241a10" : "#1a2c1a",
        border: `2px solid ${farbe}`,
        borderRadius: 6,
        boxShadow: selected ? `0 0 0 3px #d4af37` : undefined,
      }}
    >
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <div className="text-[13px] font-semibold text-creme leading-tight">{d.name}</div>
      <div className="text-[11px] mt-0.5 font-mono" style={{ color: farbe }}>{d.daten ?? d.jahr}</div>
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  );
}

const nodeTypes = { person: PersonNode, ereignis: EreignisNode };

// ---- Filterzustand ----
const ALLE_KATS = Object.keys(KATEGORIE_INFO) as NodeKategorie[];
const ALLE_TYPS = Object.keys(EDGE_INFO) as EdgeTyp[];
const ALLE_ERAS = Object.keys(ERA_INFO) as Era[];

const SAHABA_KATS: NodeKategorie[] = ["prophet", "ehefrau", "gefährte", "ansar", "später_konvertit"];
// Auf diese Kategorien wirkt der Nähe-/Umfangs-Regler
const NAEHE_KATS = new Set<NodeKategorie>(["gefährte", "ansar", "später_konvertit"]);
const UMFANG_LABEL: Record<number, string> = {
  1: "Engster Kreis",
  2: "+ bekannte Gefährten",
  3: "Alle erfassten Sahaba",
};

function SiraGraphInnen() {
  const [searchParams] = useSearchParams();
  const sahabaModus = searchParams.get("bereich") === "sahaba";
  const [kats, setKats] = useState<Set<NodeKategorie>>(
    () => new Set(sahabaModus ? SAHABA_KATS : ALLE_KATS),
  );
  const [eras, setEras] = useState<Set<Era>>(new Set(ALLE_ERAS));
  const [typs, setTyps] = useState<Set<EdgeTyp>>(new Set(ALLE_TYPS));
  const [jahrVon, setJahrVon] = useState(570);
  const [jahrBis, setJahrBis] = useState(632);
  const [suche, setSuche] = useState("");
  const [filterOffen, setFilterOffen] = useState(true);
  const [legendeOffen, setLegendeOffen] = useState(false);
  const [ausgewählt, setAusgewählt] = useState<string | null>(null);
  const [umfang, setUmfang] = useState(3);
  const { setCenter } = useReactFlow();

  const sichtbar = useCallback(
    (n: SiraNode) => {
      if (!kats.has(n.kategorie) || !eras.has(n.era) || n.jahr < jahrVon || n.jahr > jahrBis) return false;
      if (NAEHE_KATS.has(n.kategorie) && (n.nähe ?? 2) > umfang) return false;
      return true;
    },
    [kats, eras, jahrVon, jahrBis, umfang],
  );

  const nodes: Node[] = useMemo(
    () =>
      siraNodes.map((n) => ({
        id: n.id,
        type: n.kategorie === "ereignis" || n.kategorie === "korrektur" ? "ereignis" : "person",
        position: POSITIONEN.get(n.id)!,
        data: n as unknown as Record<string, unknown>,
        hidden: !sichtbar(n),
        selected: n.id === ausgewählt,
      })),
    [sichtbar, ausgewählt],
  );

  const edges: Edge[] = useMemo(
    () =>
      siraEdges.map((e) => {
        const info = EDGE_INFO[e.typ];
        const vonOk = sichtbar(nodeById.get(e.von)!);
        const nachOk = sichtbar(nodeById.get(e.nach)!);
        return {
          id: e.id,
          source: e.von,
          target: e.nach,
          label: e.typ === "teilnahme" ? undefined : info.label,
          hidden: !typs.has(e.typ) || !vonOk || !nachOk,
          style: { stroke: info.farbe, strokeWidth: 1.6, strokeDasharray: info.gestrichelt ? "6 4" : undefined },
          labelStyle: { fill: "#c9c2b0", fontSize: 10 },
          labelBgStyle: { fill: "#0a1812", opacity: 0.85 },
        };
      }),
    [typs, sichtbar],
  );

  const treffer = useMemo(() => {
    const q = suche.trim().toLowerCase();
    if (q.length < 2) return [];
    return siraNodes
      .filter(
        (n) =>
          n.name.toLowerCase().includes(q) ||
          (n.arabisch ?? "").includes(suche.trim()) ||
          n.zusammenfassung.toLowerCase().includes(q) ||
          (n.wirkungsort ?? "").toLowerCase().includes(q) ||
          String(n.jahr).includes(q),
      )
      .slice(0, 12);
  }, [suche]);

  const fokussiere = (n: SiraNode) => {
    if (!sichtbar(n)) {
      setKats(new Set(ALLE_KATS));
      setEras(new Set(ALLE_ERAS));
      setJahrVon(570);
      setJahrBis(632);
      setUmfang(3);
    }
    setAusgewählt(n.id);
    setSuche("");
    const p = POSITIONEN.get(n.id)!;
    setCenter(p.x + 100, p.y, { zoom: 1.1, duration: 600 });
    logEvent("search", { query: n.name.toLowerCase(), section: "sira", gewählt: true });
  };

  const toggle = <T,>(set: Set<T>, wert: T, setter: (s: Set<T>) => void) => {
    const neu = new Set(set);
    if (neu.has(wert)) neu.delete(wert);
    else neu.add(wert);
    setter(neu);
  };

  const knoten = ausgewählt ? nodeById.get(ausgewählt) : null;
  const verbindungen = ausgewählt
    ? siraEdges.filter((e) => e.von === ausgewählt || e.nach === ausgewählt)
    : [];

  return (
    <div className="relative flex-1 min-h-0">
      <div className="absolute inset-0">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={(_e, node) => setAusgewählt(node.id)}
        onPaneClick={() => setAusgewählt(null)}
        onInit={() => {
          const fokus = searchParams.get("fokus");
          if (fokus) {
            const n = nodeById.get(fokus);
            if (n) setTimeout(() => fokussiere(n), 80);
          }
        }}
        fitView
        minZoom={0.08}
        maxZoom={2.5}
        nodesDraggable={false}
        nodesConnectable={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#1f3a2e" gap={28} />
        <Controls position="bottom-left" showInteractive={false} />
        <MiniMap
          position="bottom-right"
          pannable
          zoomable
          nodeColor={(n) => KATEGORIE_INFO[(n.data as unknown as SiraNode).kategorie]?.farbe ?? "#555"}
          maskColor="rgba(10,24,18,0.7)"
        />
      </ReactFlow>
      </div>

      {/* Suchleiste */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[min(480px,90vw)] z-10">
        <input
          className="eingabe shadow-xl"
          placeholder="Suche: Person, Ereignis, Jahr (z. B. Hamza, Badr, 624)..."
          value={suche}
          onChange={(e) => {
            setSuche(e.target.value);
            logSearchDebounced(e.target.value, "sira");
          }}
        />
        {treffer.length > 0 && (
          <div className="karte mt-1 max-h-72 overflow-y-auto divide-y divide-gold/10">
            {treffer.map((t) => (
              <button
                key={t.id}
                className="block w-full text-left px-3 py-2 hover:bg-flaeche2"
                onClick={() => fokussiere(t)}
              >
                <span className="text-sm text-creme">{t.name}</span>
                <span className="ml-2 text-xs" style={{ color: KATEGORIE_INFO[t.kategorie].farbe }}>
                  {KATEGORIE_INFO[t.kategorie].label} · {t.jahr}
                  {!sichtbar(t) && " · derzeit ausgefiltert"}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filter-Panel */}
      <div className="absolute top-3 left-3 z-10 max-h-[calc(100%-1.5rem)] flex flex-col">
        <button className="knopf text-sm self-start" onClick={() => setFilterOffen(!filterOffen)}>
          {filterOffen ? "Filter ausblenden" : "Filter"}
        </button>
        {filterOffen && (
          <div className="karte mt-2 p-3 w-64 overflow-y-auto text-sm space-y-3">
            <div>
              <p className="font-semibold text-gold mb-1">Kategorien</p>
              {ALLE_KATS.map((k) => (
                <label key={k} className="flex items-center gap-2 py-0.5 cursor-pointer">
                  <input type="checkbox" checked={kats.has(k)} onChange={() => toggle(kats, k, setKats)} />
                  <span className="h-2.5 w-2.5 rounded-full inline-block" style={{ background: KATEGORIE_INFO[k].farbe }} />
                  <span className="text-cremedim">{KATEGORIE_INFO[k].label}</span>
                </label>
              ))}
            </div>
            <div>
              <p className="font-semibold text-gold mb-1">Epoche</p>
              {ALLE_ERAS.map((e) => (
                <label key={e} className="flex items-center gap-2 py-0.5 cursor-pointer">
                  <input type="checkbox" checked={eras.has(e)} onChange={() => toggle(eras, e, setEras)} />
                  <span className="text-cremedim">{ERA_INFO[e]}</span>
                </label>
              ))}
            </div>
            <div>
              <p className="font-semibold text-gold mb-1">Sahaba-Umfang (Nähe zum Propheten ﷺ)</p>
              <input
                type="range" min={1} max={3} step={1} value={umfang} className="w-full"
                onChange={(e) => setUmfang(Number(e.target.value))}
              />
              <p className="text-xs text-cremedim">{UMFANG_LABEL[umfang]}</p>
            </div>
            <div>
              <p className="font-semibold text-gold mb-1">Zeitraum: {jahrVon} bis {jahrBis}</p>
              <input type="range" min={570} max={632} value={jahrVon} className="w-full"
                onChange={(e) => setJahrVon(Math.min(Number(e.target.value), jahrBis))} />
              <input type="range" min={570} max={632} value={jahrBis} className="w-full"
                onChange={(e) => setJahrBis(Math.max(Number(e.target.value), jahrVon))} />
            </div>
            <div>
              <p className="font-semibold text-gold mb-1">Beziehungen</p>
              {ALLE_TYPS.map((t) => (
                <label key={t} className="flex items-center gap-2 py-0.5 cursor-pointer">
                  <input type="checkbox" checked={typs.has(t)} onChange={() => toggle(typs, t, setTyps)} />
                  <span className="h-0.5 w-4 inline-block" style={{ background: EDGE_INFO[t].farbe }} />
                  <span className="text-cremedim">{EDGE_INFO[t].label}</span>
                </label>
              ))}
            </div>
            <button
              className="knopf w-full text-sm"
              onClick={() => {
                setKats(new Set(ALLE_KATS));
                setEras(new Set(ALLE_ERAS));
                setTyps(new Set(ALLE_TYPS));
                setJahrVon(570);
                setJahrBis(632);
                setUmfang(3);
              }}
            >
              Alle Filter zurücksetzen
            </button>
          </div>
        )}
      </div>

      {/* Legende */}
      <div className="absolute bottom-3 right-3 z-10 hidden md:block">
        <button className="knopf text-xs" onClick={() => setLegendeOffen(!legendeOffen)}>
          {legendeOffen ? "Legende schließen" : "Legende"}
        </button>
        {legendeOffen && (
          <div className="karte mt-1 p-3 text-xs space-y-1 max-h-80 overflow-y-auto w-56">
            {ALLE_KATS.map((k) => (
              <div key={k} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: KATEGORIE_INFO[k].farbe }} />
                <span className="text-cremedim">{KATEGORIE_INFO[k].label}</span>
              </div>
            ))}
            <hr className="border-gold/20 my-1" />
            {ALLE_TYPS.map((t) => (
              <div key={t} className="flex items-center gap-2">
                <span className="h-0.5 w-5" style={{ background: EDGE_INFO[t].farbe }} />
                <span className="text-cremedim">{EDGE_INFO[t].label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Side-Panel */}
      {knoten && (
        <aside className="absolute top-0 right-0 h-full w-[min(380px,95vw)] z-20 karte rounded-none border-l border-gold/30 overflow-y-auto p-4 space-y-4 bg-flaeche/95 backdrop-blur">
          <div className="flex justify-between items-start gap-2">
            <div>
              <h2 className="font-serif text-xl text-gold leading-tight">{knoten.name}</h2>
              {knoten.arabisch && <p className="font-arabic text-lg text-cremedim" dir="rtl">{knoten.arabisch}</p>}
            </div>
            <button className="text-cremedim hover:text-creme text-xl px-1" onClick={() => setAusgewählt(null)}>×</button>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-2 py-0.5 rounded-full border" style={{ borderColor: KATEGORIE_INFO[knoten.kategorie].farbe, color: KATEGORIE_INFO[knoten.kategorie].farbe }}>
              {KATEGORIE_INFO[knoten.kategorie].label}
            </span>
            <span className="px-2 py-0.5 rounded-full border border-cremedim/40 text-cremedim">{ERA_INFO[knoten.era]}</span>
          </div>

          {knoten.daten && <p className="text-sm text-goldhell font-mono">{knoten.daten}</p>}
          <p className="text-sm text-creme leading-relaxed">{knoten.zusammenfassung}</p>

          {knoten.wirkungsort && (
            <div>
              <h3 className="font-semibold text-gold text-sm mb-1">Wirkungsorte & Reisen</h3>
              <p className="text-sm text-cremedim leading-relaxed">{knoten.wirkungsort}</p>
            </div>
          )}

          <div>
            <h3 className="font-semibold text-gold text-sm mb-1">Quellen (extern nachprüfbar)</h3>
            <QuellenListe quellen={knoten.quellen} />
          </div>

          {verbindungen.length > 0 && (
            <div>
              <h3 className="font-semibold text-gold text-sm mb-1">Verbindungen ({verbindungen.length})</h3>
              <ul className="space-y-1">
                {verbindungen.map((v) => {
                  const andererId = v.von === knoten.id ? v.nach : v.von;
                  const anderer = nodeById.get(andererId)!;
                  const info = EDGE_INFO[v.typ];
                  return (
                    <li key={v.id}>
                      <button
                        className="text-left w-full text-sm hover:bg-flaeche2 rounded px-1.5 py-1"
                        onClick={() => fokussiere(anderer)}
                      >
                        <span style={{ color: info.farbe }}>{info.label}</span>{" "}
                        <span className="text-creme">{anderer.name}</span>
                        {v.datum && <span className="text-cremedim"> · {v.datum}</span>}
                        {v.notiz && <span className="block text-xs text-cremedim">{v.notiz}</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div>
            <h3 className="font-semibold text-gold text-sm mb-1">Meine Notiz</h3>
            <NotizBox nodeId={knoten.id} section="sira" />
          </div>
        </aside>
      )}
    </div>
  );
}

export default function SiraPage() {
  return (
    <div className="flex-1 flex flex-col" style={{ height: "calc(100vh - 3.5rem)" }}>
      <ReactFlowProvider>
        <SiraGraphInnen />
      </ReactFlowProvider>
    </div>
  );
}
