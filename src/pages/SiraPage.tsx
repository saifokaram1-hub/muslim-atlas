import { useMemo, useState, useCallback, useEffect, useRef, lazy, Suspense } from "react";
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
import { useAuth } from "../context/AuthContext";
import { setzeStufe, stufeLokal, ladeStufen, type Wissensstufe } from "../lib/stufe";
import { knotenform } from "../lib/design";
import { FavStern } from "../components/FavStern";

const Graph3D = lazy(() => import("../components/Graph3D"));

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
  const d = data as unknown as SiraNode & { skala?: number };
  const farbe = KATEGORIE_INFO[d.kategorie].farbe;
  return (
    <div style={{ transform: `scale(${d.skala ?? 1})` }}>
    <div
      className={`knoten3d ${knotenform() === "eckig" ? "rounded-md" : "rounded-xl"} px-3 py-2 bg-flaeche min-w-44 max-w-52 text-center shadow-lg`}
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
    </div>
  );
}

function EreignisNode({ data, selected }: NodeProps) {
  const d = data as unknown as SiraNode & { skala?: number };
  const istKorrektur = d.kategorie === "korrektur";
  const farbe = KATEGORIE_INFO[d.kategorie].farbe;
  return (
    <div style={{ transform: `scale(${d.skala ?? 1})` }}>
    <div
      className="knoten3d px-3 py-2 min-w-48 max-w-56 text-center shadow-lg"
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
  1: "Basics — die zentralen Personen und Ereignisse",
  2: "Fortgeschritten — auch die bekannten Gefährten",
  3: "Experte — alle erfassten Personen",
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
  // Auf dem Handy startet das Filter-Panel zugeklappt
  const [filterOffen, setFilterOffen] = useState(() => typeof window === "undefined" || window.innerWidth >= 768);
  const [legendeOffen, setLegendeOffen] = useState(false);
  const [ausgewählt, setAusgewählt] = useState<string | null>(null);
  // Umfang = Wissensstufe (1 Anfänger, 2 Fortgeschritten, 3 Experte)
  const [umfang, setUmfang] = useState<number>(() => stufeLokal("sira"));
  const [vollbild, setVollbild] = useState(false);
  const [modus3d, setModus3d] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { setCenter } = useReactFlow();

  useEffect(() => {
    const h = () => setVollbild(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", h);
    return () => document.removeEventListener("fullscreenchange", h);
  }, []);
  useEffect(() => {
    if (user?.id) ladeStufen(user.id).then(() => setUmfang(stufeLokal("sira")));
  }, [user?.id]);

  // Ego-Modus: die Mindmap EINER Person mit all ihren Verbindungen
  const [ego, setEgo] = useState<string | null>(() => searchParams.get("ego"));
  const egoNachbarn = useMemo(() => {
    if (!ego) return null;
    const s = new Set<string>([ego]);
    for (const e of siraEdges) {
      if (e.von === ego) s.add(e.nach);
      if (e.nach === ego) s.add(e.von);
    }
    return s;
  }, [ego]);

  // Kanten-Tooltip, Kontext-Popup und Navigations-Verlauf
  const [kantenTipp, setKantenTipp] = useState<{ x: number; y: number; text: string } | null>(null);
  const [kontext, setKontext] = useState<{ id: string; x: number; y: number } | null>(null);
  const [verlauf, setVerlauf] = useState<string[]>([]);
  const [vPos, setVPos] = useState(-1);

  const sichtbar = useCallback(
    (n: SiraNode) => {
      if (egoNachbarn) return egoNachbarn.has(n.id);
      if (!kats.has(n.kategorie) || !eras.has(n.era) || n.jahr < jahrVon || n.jahr > jahrBis) return false;
      if (NAEHE_KATS.has(n.kategorie) && (n.nähe ?? 2) > umfang) return false;
      return true;
    },
    [kats, eras, jahrVon, jahrBis, umfang, egoNachbarn],
  );

  // Radiales Layout im Ego-Modus: die Person in der Mitte, Verbindungen im Kreis
  const egoPos = useMemo(() => {
    if (!ego || !egoNachbarn) return null;
    const m = new Map<string, { x: number; y: number }>();
    m.set(ego, { x: 0, y: 0 });
    const andere = [...egoNachbarn].filter((i) => i !== ego);
    const radius = Math.max(380, andere.length * 34);
    andere.forEach((id, i) => {
      const w = (2 * Math.PI * i) / Math.max(1, andere.length);
      m.set(id, { x: Math.cos(w) * radius, y: Math.sin(w) * radius * 0.72 });
    });
    return m;
  }, [ego, egoNachbarn]);
  const posFür = useCallback(
    (id: string) => egoPos?.get(id) ?? POSITIONEN.get(id)!,
    [egoPos],
  );

  // Verbindungsgrad: je mehr Verbindungen, desto größer der Knoten
  const grad = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of siraEdges) {
      m.set(e.von, (m.get(e.von) ?? 0) + 1);
      m.set(e.nach, (m.get(e.nach) ?? 0) + 1);
    }
    return m;
  }, []);
  const skalaFür = useCallback(
    (id: string) => {
      const g = grad.get(id) ?? 0;
      return g <= 1 ? 0.8 : g <= 3 ? 0.95 : g <= 7 ? 1.1 : g <= 15 ? 1.28 : 1.5;
    },
    [grad],
  );

  const wähle = useCallback(
    (id: string, ausVerlauf = false) => {
      setAusgewählt(id);
      if (!ausVerlauf) {
        setVerlauf((alt) => [...alt.slice(0, vPos + 1), id]);
        setVPos((p) => p + 1);
      }
      if (!modus3d) {
        const p = posFür(id);
        setCenter(p.x + 100, p.y, { zoom: 1.1, duration: 500 });
      }
    },
    [vPos, modus3d, posFür, setCenter],
  );
  const zurück = () => { if (vPos > 0) { setVPos(vPos - 1); wähle(verlauf[vPos - 1], true); } };
  const vor = () => { if (vPos < verlauf.length - 1) { setVPos(vPos + 1); wähle(verlauf[vPos + 1], true); } };

  const nodes: Node[] = useMemo(
    () =>
      siraNodes.map((n) => ({
        id: n.id,
        type: n.kategorie === "ereignis" || n.kategorie === "korrektur" ? "ereignis" : "person",
        position: posFür(n.id),
        data: { ...n, skala: skalaFür(n.id) } as unknown as Record<string, unknown>,
        hidden: !sichtbar(n),
        selected: n.id === ausgewählt,
      })),
    [sichtbar, ausgewählt, posFür, skalaFür],
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
          animated: !info.gestrichelt,
          data: {
            tipp: `${info.label}: ${nodeById.get(e.von)?.name ?? e.von} → ${nodeById.get(e.nach)?.name ?? e.nach}${e.notiz ? ` (${e.notiz})` : ""}`,
          },
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
    wähle(n.id);
    setSuche("");
    logEvent("search", { query: n.name.toLowerCase(), section: "sira", gewählt: true });
  };

  const toggle = <T,>(set: Set<T>, wert: T, setter: (s: Set<T>) => void) => {
    const neu = new Set(set);
    if (neu.has(wert)) neu.delete(wert);
    else neu.add(wert);
    setter(neu);
  };

  // Daten für die 3D-Ansicht: dieselbe Ordnung wie 2D (Zeit → X, Kategorie → Y),
  // Epochen (vorislamisch/Mekka/Medina) als Tiefenebenen (Z); Positionen fixiert.
  const d3Nodes = useMemo(() => {
    const sichtbare = siraNodes.filter(sichtbar);
    if (sichtbare.length === 0) return [];
    const xs = sichtbare.map((n) => posFür(n.id).x);
    const minX = Math.min(...xs);
    const spanne = Math.max(1, Math.max(...xs) - minX);
    return sichtbare.map((n) => {
      const p = posFür(n.id);
      const px = ((p.x - minX) / spanne) * 1700 - 850;
      const py = -p.y * 0.85;
      const pz = ego ? 0 : (ALLE_ERAS.indexOf(n.era) - 1) * 240;
      return {
        id: n.id,
        name: n.name,
        color: KATEGORIE_INFO[n.kategorie].farbe,
        val: Math.min(3 + (grad.get(n.id) ?? 0) * 0.9, 24),
        x: px, y: py, z: pz,
        fx: px, fy: py, fz: pz,
      };
    });
  }, [sichtbar, posFür, ego, grad]);
  const d3Links = useMemo(() => {
    const ids = new Set(d3Nodes.map((n) => n.id));
    return siraEdges
      .filter((e) => typs.has(e.typ) && ids.has(e.von) && ids.has(e.nach))
      .map((e) => ({ source: e.von, target: e.nach, color: EDGE_INFO[e.typ].farbe }));
  }, [d3Nodes, typs]);

  const knoten = ausgewählt ? nodeById.get(ausgewählt) : null;
  const verbindungen = ausgewählt
    ? siraEdges.filter((e) => e.von === ausgewählt || e.nach === ausgewählt)
    : [];

  return (
    <div
      ref={wrapperRef}
      className="flex-1 flex flex-col"
      style={{ height: vollbild ? "100vh" : "calc(100vh - 3.5rem)", background: "var(--color-grund)" }}
    >
    <div className="relative flex-1 min-h-0">
      {modus3d ? (
        <Suspense fallback={<p className="absolute inset-0 flex items-center justify-center text-cremedim">Lade 3D-Ansicht…</p>}>
          <Graph3D nodes={d3Nodes} links={d3Links} onKnoten={(id) => setAusgewählt(id)} />
        </Suspense>
      ) : (
      <div className="absolute inset-0">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={(_e, node) => { setKontext(null); wähle(node.id); }}
        onPaneClick={() => { setAusgewählt(null); setKontext(null); setKantenTipp(null); }}
        onNodeContextMenu={(ev, node) => {
          ev.preventDefault();
          setKontext({ id: node.id, x: Math.min(ev.clientX, window.innerWidth - 290), y: Math.min(ev.clientY, window.innerHeight - 320) });
        }}
        onEdgeMouseEnter={(ev, edge) =>
          setKantenTipp({ x: ev.clientX, y: ev.clientY, text: (edge.data as { tipp?: string } | undefined)?.tipp ?? "" })
        }
        onEdgeMouseLeave={() => setKantenTipp(null)}
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
      )}

      {/* Ego-Banner: Mindmap einer einzelnen Person */}
      {ego && nodeById.get(ego) && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-10 karte px-4 py-1.5 flex items-center gap-3 text-sm shadow-xl">
          <span className="text-gold font-semibold">Mindmap: {nodeById.get(ego)!.name}</span>
          <button className="text-cremedim underline hover:text-creme" onClick={() => { setEgo(null); setAusgewählt(null); }}>
            Zur großen Karte
          </button>
        </div>
      )}

      {/* Ansicht-Schalter + Verlauf */}
      <div className="absolute top-16 right-3 z-10 flex flex-col gap-2 md:top-3 md:flex-row">
        <div className="flex gap-1">
          <button className="knopf text-sm shadow-xl px-2.5 disabled:opacity-40" disabled={vPos <= 0} title="Zur vorherigen Person zurück" onClick={zurück}>←</button>
          <button className="knopf text-sm shadow-xl px-2.5 disabled:opacity-40" disabled={vPos >= verlauf.length - 1} title="Wieder vor" onClick={vor}>→</button>
        </div>
        <button className="knopf text-sm shadow-xl" onClick={() => setModus3d(!modus3d)}>
          {modus3d ? "2D-Karte" : "3D-Ansicht"}
        </button>
        <button
          className="knopf text-sm shadow-xl"
          onClick={() => {
            if (document.fullscreenElement) document.exitFullscreen();
            else wrapperRef.current?.requestFullscreen();
          }}
        >
          {vollbild ? "Vollbild verlassen" : "Vollbild"}
        </button>
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
              <p className="font-semibold text-gold mb-1">Deine Wissensstufe (Sahaba-Umfang)</p>
              <input
                type="range" min={1} max={3} step={1} value={umfang} className="w-full"
                onChange={(e) => {
                  const w = Number(e.target.value);
                  setUmfang(w);
                  setzeStufe("sira", w as Wissensstufe, user?.id);
                }}
              />
              <p className="text-xs text-cremedim">{UMFANG_LABEL[umfang]} — stufe dich jederzeit hoch.</p>
              <p className="text-[11px] text-goldhell mt-1 border-l-2 border-gold/40 pl-2">
                Die Stufen ordnen nur nach Bekanntheit für den Lerneinstieg. Im Rang sind die
                Sahaba allesamt die beste Generation (radiyallahu anhum) — das ist keine Wertung.
              </p>
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

      {/* Kanten-Tooltip: zeigt, wohin eine Verbindung führt */}
      {kantenTipp && kantenTipp.text && (
        <div
          className="fixed z-50 pointer-events-none karte px-3 py-1.5 text-xs text-creme shadow-2xl"
          style={{ left: kantenTipp.x + 12, top: kantenTipp.y + 12, maxWidth: 320 }}
        >
          {kantenTipp.text}
        </div>
      )}

      {/* Verbindungs-Popup (Rechtsklick bzw. langes Drücken auf einen Knoten) */}
      {kontext && (() => {
        const kn = nodeById.get(kontext.id);
        if (!kn) return null;
        const verb = siraEdges.filter((e) => e.von === kontext.id || e.nach === kontext.id).slice(0, 14);
        return (
          <div className="fixed z-50 karte p-3 shadow-2xl w-72" style={{ left: kontext.x, top: kontext.y }}>
            <div className="flex justify-between items-start gap-2">
              <p className="text-sm font-semibold text-gold">{kn.name} — Verbindungen</p>
              <button className="text-cremedim hover:text-creme text-lg leading-none" onClick={() => setKontext(null)}>×</button>
            </div>
            <ul className="mt-1 max-h-60 overflow-y-auto divide-y divide-gold/10">
              {verb.map((v) => {
                const andererId = v.von === kontext.id ? v.nach : v.von;
                const anderer = nodeById.get(andererId);
                if (!anderer) return null;
                const info = EDGE_INFO[v.typ];
                return (
                  <li key={v.id}>
                    <button
                      className="w-full text-left text-sm py-1.5 hover:bg-flaeche2 rounded px-1"
                      onClick={() => { setKontext(null); fokussiere(anderer); }}
                    >
                      <span style={{ color: info.farbe }}>{info.label}</span>{" "}
                      <span className="text-creme">{anderer.name}</span>
                    </button>
                  </li>
                );
              })}
              {verb.length === 0 && <li className="text-xs text-cremedim py-1">Keine Verbindungen erfasst.</li>}
            </ul>
          </div>
        );
      })()}

      {/* Side-Panel */}
      {knoten && (
        <aside className="absolute top-0 right-0 h-full w-[min(380px,95vw)] z-20 karte rounded-none border-l border-gold/30 overflow-y-auto p-4 space-y-4 bg-flaeche/95 backdrop-blur">
          <div className="flex justify-between items-start gap-2">
            <div>
              <h2 className="font-serif text-xl text-gold leading-tight">{knoten.name}</h2>
              {knoten.arabisch && <p className="font-arabic text-lg text-cremedim" dir="rtl">{knoten.arabisch}</p>}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <FavStern art="sira" refId={knoten.id} name={knoten.name} />
              <button className="text-cremedim hover:text-creme text-xl px-1" onClick={() => setAusgewählt(null)}>×</button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-2 py-0.5 rounded-full border" style={{ borderColor: KATEGORIE_INFO[knoten.kategorie].farbe, color: KATEGORIE_INFO[knoten.kategorie].farbe }}>
              {KATEGORIE_INFO[knoten.kategorie].label}
            </span>
            <span className="px-2 py-0.5 rounded-full border border-cremedim/40 text-cremedim">{ERA_INFO[knoten.era]}</span>
          </div>

          {knoten.daten && <p className="text-sm text-goldhell font-mono">{knoten.daten}</p>}
          <p className="text-sm text-creme leading-relaxed">{knoten.zusammenfassung}</p>

          {!["ereignis", "korrektur"].includes(knoten.kategorie) && ego !== knoten.id && (
            <button
              className="knopf text-sm w-full"
              onClick={() => {
                setEgo(knoten.id);
                setTimeout(() => setCenter(0, 0, { zoom: 0.8, duration: 500 }), 80);
              }}
            >
              Eigene Mindmap dieser Person öffnen
            </button>
          )}

          {knoten.wirkungsort && (
            <div>
              <h3 className="font-semibold text-gold text-sm mb-1">Wirkungsorte & Reisen</h3>
              <p className="text-sm text-cremedim leading-relaxed">{knoten.wirkungsort}</p>
            </div>
          )}

          {knoten.überliefert !== undefined && (
            <div>
              <h3 className="font-semibold text-gold text-sm mb-1">Überlieferungen</h3>
              <p className="text-sm text-cremedim leading-relaxed">
                ca. <span className="text-goldhell font-semibold">{knoten.überliefert}</span> Hadithe
                (klassische Zählung nach Baqi ibn Makhlad; Zählungen variieren je Ausgabe)
              </p>
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
    </div>
  );
}

export default function SiraPage() {
  return (
    <ReactFlowProvider>
      <SiraGraphInnen />
    </ReactFlowProvider>
  );
}
