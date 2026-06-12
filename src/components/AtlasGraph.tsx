import { useMemo, useState, useCallback, useEffect, useRef, lazy, Suspense } from "react";
import {
  ReactFlow, ReactFlowProvider, Background, Controls, MiniMap,
  Handle, Position, useReactFlow, type Node, type Edge, type NodeProps,
} from "@xyflow/react";
import { QuellenListe } from "../lib/quellen";
import { NotizBox } from "../components/NotizBox";
import { logSearchDebounced, logEvent } from "../lib/analytics";
import { useAuth } from "../context/AuthContext";
import { STUFEN_LABEL, setzeStufe, stufeLokal, ladeStufen, type Wissensstufe } from "../lib/stufe";

const Graph3D = lazy(() => import("./Graph3D"));

// Generische Mindmap-Engine: jeder Wissensbereich (Propheten, Quran, Gelehrte, ...)
// liefert nur Daten + Konfiguration und bekommt Suche, Filter, Side-Panel und Notizen.

export interface AtlasNode {
  id: string;
  name: string;
  arabisch?: string;
  kategorie: string;
  era: string;
  daten?: string;
  jahr: number;
  zusammenfassung: string;
  quellen: string[];
  url?: string;
  eckig?: boolean;
  // Freie Zusatz-Dimensionen (z. B. aqida: ["ashari"], madhhab: ["shafii"]),
  // gefiltert über AtlasConfig.extraFilter. Knoten ohne Tag bleiben immer sichtbar.
  tags?: Record<string, string[]>;
}

export interface AtlasEdge {
  id: string;
  von: string;
  nach: string;
  typ: string;
  notiz?: string;
  datum?: string;
}

export interface AtlasConfig {
  section: "sira" | "hadith" | "propheten" | "quran" | "gelehrte";
  nodes: AtlasNode[];
  edges: AtlasEdge[];
  kategorien: Record<string, { label: string; farbe: string }>;
  edgeTypen: Record<string, { label: string; farbe: string; gestrichelt?: boolean }>;
  eras: Record<string, string>;
  eraLabel: string;
  bandY: Record<string, number>;
  xProEinheit: number;
  minAbstand: number;
  jahrMin: number;
  jahrMax: number;
  jahrLabel: string;
  jahrAnzeigen: boolean;
  suchPlatzhalter: string;
  hinweis?: string;
  extraFilter?: { feld: string; label: string; werte: Record<string, string> }[];
  // Ab welcher Wissensstufe eine Kategorie sichtbar wird (Standard: 1 = immer)
  stufeProKategorie?: Record<string, Wissensstufe>;
}

function berechnePositionen(cfg: AtlasConfig): Map<string, { x: number; y: number }> {
  const pos = new Map<string, { x: number; y: number }>();
  const proBand = new Map<string, AtlasNode[]>();
  for (const n of cfg.nodes) {
    const liste = proBand.get(n.kategorie) ?? [];
    liste.push(n);
    proBand.set(n.kategorie, liste);
  }
  for (const [kat, liste] of proBand) {
    liste.sort((a, b) => a.jahr - b.jahr || a.name.localeCompare(b.name));
    let lastX = -Infinity;
    for (const n of liste) {
      const x = Math.max((n.jahr - cfg.jahrMin) * cfg.xProEinheit, lastX + cfg.minAbstand);
      lastX = x;
      pos.set(n.id, { x, y: cfg.bandY[kat] ?? 0 });
    }
  }
  return pos;
}

function AtlasNodeBox({ data, selected }: NodeProps) {
  const { node: d, farbe, label, jahrAnzeigen } = data as unknown as {
    node: AtlasNode; farbe: string; label: string; jahrAnzeigen: boolean;
  };
  return (
    <div
      className={`knoten3d px-3 py-2 min-w-44 max-w-56 text-center shadow-lg bg-flaeche ${d.eckig ? "" : "rounded-xl"}`}
      style={{
        border: `2px solid ${farbe}`,
        borderRadius: d.eckig ? 6 : undefined,
        background: d.eckig ? "#1a2c1a" : undefined,
        boxShadow: selected ? "0 0 0 3px #d4af37" : undefined,
      }}
    >
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <div className="text-[13px] font-semibold text-creme leading-tight">{d.name}</div>
      {d.arabisch && <div className="font-arabic text-[13px] text-cremedim leading-tight" dir="rtl">{d.arabisch}</div>}
      <div className="text-[10px] mt-0.5" style={{ color: farbe }}>
        {label}
        {jahrAnzeigen ? ` · ${d.jahr}` : ""}
      </div>
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  );
}

const nodeTypes = { atlas: AtlasNodeBox };

function AtlasGraphInnen({ cfg }: { cfg: AtlasConfig }) {
  const ALLE_KATS = useMemo(() => Object.keys(cfg.kategorien), [cfg]);
  const ALLE_TYPS = useMemo(() => Object.keys(cfg.edgeTypen), [cfg]);
  const ALLE_ERAS = useMemo(() => Object.keys(cfg.eras), [cfg]);
  const nodeById = useMemo(() => new Map(cfg.nodes.map((n) => [n.id, n])), [cfg]);
  const POSITIONEN = useMemo(() => berechnePositionen(cfg), [cfg]);

  const [kats, setKats] = useState<Set<string>>(new Set(ALLE_KATS));
  const [eras, setEras] = useState<Set<string>>(new Set(ALLE_ERAS));
  const [typs, setTyps] = useState<Set<string>>(new Set(ALLE_TYPS));
  const [jahrVon, setJahrVon] = useState(cfg.jahrMin);
  const [jahrBis, setJahrBis] = useState(cfg.jahrMax);
  const [suche, setSuche] = useState("");
  // Auf dem Handy startet das Filter-Panel zugeklappt
  const [filterOffen, setFilterOffen] = useState(() => typeof window === "undefined" || window.innerWidth >= 768);
  const [ausgewählt, setAusgewählt] = useState<string | null>(null);
  const [extraSel, setExtraSel] = useState<Record<string, Set<string>>>(() =>
    Object.fromEntries((cfg.extraFilter ?? []).map((f) => [f.feld, new Set(Object.keys(f.werte))])),
  );
  const [stufe, setStufeState] = useState<Wissensstufe>(() => stufeLokal(cfg.section));
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
    if (user?.id) ladeStufen(user.id).then(() => setStufeState(stufeLokal(cfg.section)));
  }, [user?.id, cfg.section]);

  const sichtbar = useCallback(
    (n: AtlasNode) => {
      if ((cfg.stufeProKategorie?.[n.kategorie] ?? 1) > stufe) return false;
      if (!kats.has(n.kategorie) || !eras.has(n.era) || n.jahr < jahrVon || n.jahr > jahrBis) return false;
      for (const f of cfg.extraFilter ?? []) {
        const werte = n.tags?.[f.feld];
        if (werte && werte.length > 0 && !werte.some((w) => extraSel[f.feld]?.has(w))) return false;
      }
      return true;
    },
    [kats, eras, jahrVon, jahrBis, extraSel, cfg, stufe],
  );

  // Daten für die 3D-Ansicht: dieselbe Ordnung wie 2D (Zeit → X, Kategorie → Y),
  // Epochen als Tiefenebenen (Z); Positionen sind fixiert, nichts verstreut sich.
  const d3Nodes = useMemo(() => {
    const sichtbare = cfg.nodes.filter(sichtbar);
    if (sichtbare.length === 0) return [];
    const xs = sichtbare.map((n) => POSITIONEN.get(n.id)!.x);
    const minX = Math.min(...xs);
    const spanne = Math.max(1, Math.max(...xs) - minX);
    const eraMitte = (ALLE_ERAS.length - 1) / 2;
    return sichtbare.map((n) => {
      const p = POSITIONEN.get(n.id)!;
      const px = ((p.x - minX) / spanne) * 1700 - 850;
      const py = -p.y * 0.85;
      const pz = (Math.max(0, ALLE_ERAS.indexOf(n.era)) - eraMitte) * 240;
      return {
        id: n.id,
        name: n.name,
        color: cfg.kategorien[n.kategorie]?.farbe ?? "#888",
        val: n.kategorie === "prophet" || n.kategorie === "ulul_azm" ? 9 : 3.5,
        x: px, y: py, z: pz,
        fx: px, fy: py, fz: pz,
      };
    });
  }, [cfg, sichtbar, POSITIONEN, ALLE_ERAS]);
  const d3Links = useMemo(() => {
    const ids = new Set(d3Nodes.map((n) => n.id));
    return cfg.edges
      .filter((e) => typs.has(e.typ) && ids.has(e.von) && ids.has(e.nach))
      .map((e) => ({ source: e.von, target: e.nach, color: cfg.edgeTypen[e.typ]?.farbe ?? "#777" }));
  }, [cfg, d3Nodes, typs]);

  const nodes: Node[] = useMemo(
    () =>
      cfg.nodes.map((n) => ({
        id: n.id,
        type: "atlas",
        position: POSITIONEN.get(n.id)!,
        data: {
          node: n,
          farbe: cfg.kategorien[n.kategorie]?.farbe ?? "#888",
          label: cfg.kategorien[n.kategorie]?.label ?? n.kategorie,
          jahrAnzeigen: cfg.jahrAnzeigen,
        } as unknown as Record<string, unknown>,
        hidden: !sichtbar(n),
        selected: n.id === ausgewählt,
      })),
    [cfg, POSITIONEN, sichtbar, ausgewählt],
  );

  const edges: Edge[] = useMemo(
    () =>
      cfg.edges.map((e) => {
        const info = cfg.edgeTypen[e.typ] ?? { label: e.typ, farbe: "#777" };
        const vonOk = sichtbar(nodeById.get(e.von)!);
        const nachOk = sichtbar(nodeById.get(e.nach)!);
        return {
          id: e.id,
          source: e.von,
          target: e.nach,
          label: info.label.length <= 18 ? info.label : undefined,
          hidden: !typs.has(e.typ) || !vonOk || !nachOk,
          animated: !info.gestrichelt,
          style: { stroke: info.farbe, strokeWidth: 1.6, strokeDasharray: info.gestrichelt ? "6 4" : undefined },
          labelStyle: { fill: "#c9c2b0", fontSize: 10 },
          labelBgStyle: { fill: "#0a1812", opacity: 0.85 },
        };
      }),
    [cfg, typs, sichtbar, nodeById],
  );

  const treffer = useMemo(() => {
    const q = suche.trim().toLowerCase();
    if (q.length < 2) return [];
    return cfg.nodes
      .filter(
        (n) =>
          n.name.toLowerCase().includes(q) ||
          (n.arabisch ?? "").includes(suche.trim()) ||
          n.zusammenfassung.toLowerCase().includes(q) ||
          String(n.jahr).includes(q),
      )
      .slice(0, 12);
  }, [cfg, suche]);

  const fokussiere = (n: AtlasNode) => {
    if (!sichtbar(n)) {
      setKats(new Set(ALLE_KATS));
      setEras(new Set(ALLE_ERAS));
      setJahrVon(cfg.jahrMin);
      setJahrBis(cfg.jahrMax);
      setStufeState(3);
    }
    setAusgewählt(n.id);
    setSuche("");
    if (!modus3d) {
      const p = POSITIONEN.get(n.id)!;
      setCenter(p.x + 100, p.y, { zoom: 1.1, duration: 600 });
    }
    logEvent("search", { query: n.name.toLowerCase(), section: cfg.section, gewählt: true });
  };

  const toggle = (set: Set<string>, wert: string, setter: (s: Set<string>) => void) => {
    const neu = new Set(set);
    if (neu.has(wert)) neu.delete(wert);
    else neu.add(wert);
    setter(neu);
  };

  const knoten = ausgewählt ? nodeById.get(ausgewählt) : null;
  const verbindungen = ausgewählt
    ? cfg.edges.filter((e) => e.von === ausgewählt || e.nach === ausgewählt)
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
          onNodeClick={(_e, node) => setAusgewählt(node.id)}
          onPaneClick={() => setAusgewählt(null)}
          fitView
          minZoom={0.05}
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
            nodeColor={(n) => (n.data as { farbe?: string }).farbe ?? "#555"}
            maskColor="rgba(10,24,18,0.7)"
          />
        </ReactFlow>
      </div>
      )}

      {/* Ansicht-Schalter */}
      <div className="absolute top-16 right-3 z-10 flex flex-col gap-2 md:top-3 md:flex-row">
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

      {/* Suche */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[min(480px,90vw)] z-10">
        <input
          className="eingabe shadow-xl"
          placeholder={cfg.suchPlatzhalter}
          value={suche}
          onChange={(e) => {
            setSuche(e.target.value);
            logSearchDebounced(e.target.value, cfg.section);
          }}
        />
        {treffer.length > 0 && (
          <div className="karte mt-1 max-h-72 overflow-y-auto divide-y divide-gold/10">
            {treffer.map((t) => (
              <button key={t.id} className="block w-full text-left px-3 py-2 hover:bg-flaeche2" onClick={() => fokussiere(t)}>
                <span className="text-sm text-creme">{t.name}</span>
                <span className="ml-2 text-xs" style={{ color: cfg.kategorien[t.kategorie]?.farbe }}>
                  {cfg.kategorien[t.kategorie]?.label}
                  {cfg.jahrAnzeigen && ` · ${t.jahr}`}
                  {!sichtbar(t) && " · derzeit ausgefiltert"}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filter */}
      <div className="absolute top-3 left-3 z-10 max-h-[calc(100%-1.5rem)] flex flex-col">
        <button className="knopf text-sm self-start" onClick={() => setFilterOffen(!filterOffen)}>
          {filterOffen ? "Filter ausblenden" : "Filter"}
        </button>
        {filterOffen && (
          <div className="karte mt-2 p-3 w-64 overflow-y-auto text-sm space-y-3">
            {cfg.hinweis && <p className="text-xs text-goldhell border border-gold/30 rounded p-2">{cfg.hinweis}</p>}
            <div>
              <p className="font-semibold text-gold mb-1">Deine Wissensstufe</p>
              <select
                className="eingabe text-sm"
                value={stufe}
                onChange={(e) => {
                  const w = Number(e.target.value) as Wissensstufe;
                  setStufeState(w);
                  setzeStufe(cfg.section, w, user?.id);
                }}
              >
                {([1, 2, 3] as Wissensstufe[]).map((w) => (
                  <option key={w} value={w}>{STUFEN_LABEL[w]}</option>
                ))}
              </select>
              <p className="text-[11px] text-cremedim mt-1">
                Passt die Karte an dein Wissen an — stufe dich jederzeit hoch.
              </p>
            </div>
            <div>
              <p className="font-semibold text-gold mb-1">Kategorien</p>
              {ALLE_KATS.map((k) => (
                <label key={k} className="flex items-center gap-2 py-0.5 cursor-pointer">
                  <input type="checkbox" checked={kats.has(k)} onChange={() => toggle(kats, k, setKats)} />
                  <span className="h-2.5 w-2.5 rounded-full inline-block" style={{ background: cfg.kategorien[k].farbe }} />
                  <span className="text-cremedim">{cfg.kategorien[k].label}</span>
                </label>
              ))}
            </div>
            <div>
              <p className="font-semibold text-gold mb-1">{cfg.eraLabel}</p>
              {ALLE_ERAS.map((e) => (
                <label key={e} className="flex items-center gap-2 py-0.5 cursor-pointer">
                  <input type="checkbox" checked={eras.has(e)} onChange={() => toggle(eras, e, setEras)} />
                  <span className="text-cremedim">{cfg.eras[e]}</span>
                </label>
              ))}
            </div>
            <div>
              <p className="font-semibold text-gold mb-1">{cfg.jahrLabel}: {jahrVon} bis {jahrBis}</p>
              <input type="range" min={cfg.jahrMin} max={cfg.jahrMax} value={jahrVon} className="w-full"
                onChange={(e) => setJahrVon(Math.min(Number(e.target.value), jahrBis))} />
              <input type="range" min={cfg.jahrMin} max={cfg.jahrMax} value={jahrBis} className="w-full"
                onChange={(e) => setJahrBis(Math.max(Number(e.target.value), jahrVon))} />
            </div>
            {(cfg.extraFilter ?? []).map((f) => (
              <div key={f.feld}>
                <p className="font-semibold text-gold mb-1">{f.label}</p>
                {Object.entries(f.werte).map(([wert, label]) => (
                  <label key={wert} className="flex items-center gap-2 py-0.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={extraSel[f.feld]?.has(wert) ?? false}
                      onChange={() =>
                        setExtraSel((alt) => {
                          const neu = new Set(alt[f.feld]);
                          if (neu.has(wert)) neu.delete(wert);
                          else neu.add(wert);
                          return { ...alt, [f.feld]: neu };
                        })
                      }
                    />
                    <span className="text-cremedim">{label}</span>
                  </label>
                ))}
              </div>
            ))}
            <div>
              <p className="font-semibold text-gold mb-1">Beziehungen</p>
              {ALLE_TYPS.map((t) => (
                <label key={t} className="flex items-center gap-2 py-0.5 cursor-pointer">
                  <input type="checkbox" checked={typs.has(t)} onChange={() => toggle(typs, t, setTyps)} />
                  <span className="h-0.5 w-4 inline-block" style={{ background: cfg.edgeTypen[t].farbe }} />
                  <span className="text-cremedim">{cfg.edgeTypen[t].label}</span>
                </label>
              ))}
            </div>
            <button
              className="knopf w-full text-sm"
              onClick={() => {
                setKats(new Set(ALLE_KATS));
                setEras(new Set(ALLE_ERAS));
                setTyps(new Set(ALLE_TYPS));
                setJahrVon(cfg.jahrMin);
                setJahrBis(cfg.jahrMax);
                setExtraSel(Object.fromEntries((cfg.extraFilter ?? []).map((f) => [f.feld, new Set(Object.keys(f.werte))])));
              }}
            >
              Alle Filter zurücksetzen
            </button>
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
            <span className="px-2 py-0.5 rounded-full border" style={{ borderColor: cfg.kategorien[knoten.kategorie].farbe, color: cfg.kategorien[knoten.kategorie].farbe }}>
              {cfg.kategorien[knoten.kategorie].label}
            </span>
            <span className="px-2 py-0.5 rounded-full border border-cremedim/40 text-cremedim">{cfg.eras[knoten.era]}</span>
            {(cfg.extraFilter ?? []).flatMap((f) =>
              (knoten.tags?.[f.feld] ?? []).map((w) => (
                <span key={`${f.feld}-${w}`} className="px-2 py-0.5 rounded-full border border-goldhell/50 text-goldhell">
                  {f.werte[w] ?? w}
                </span>
              )),
            )}
          </div>

          {knoten.daten && <p className="text-sm text-goldhell font-mono">{knoten.daten}</p>}
          <p className="text-sm text-creme leading-relaxed">{knoten.zusammenfassung}</p>

          {knoten.url && (
            <a href={knoten.url} target="_blank" rel="noopener noreferrer" className="inline-block text-sm text-goldhell underline">
              Im Original nachlesen ↗
            </a>
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
                  const info = cfg.edgeTypen[v.typ];
                  return (
                    <li key={v.id}>
                      <button className="text-left w-full text-sm hover:bg-flaeche2 rounded px-1.5 py-1" onClick={() => fokussiere(anderer)}>
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
            <NotizBox nodeId={knoten.id} section={cfg.section} />
          </div>
        </aside>
      )}
    </div>
    </div>
  );
}

export function AtlasGraph({ cfg }: { cfg: AtlasConfig }) {
  return (
    <ReactFlowProvider>
      <AtlasGraphInnen cfg={cfg} />
    </ReactFlowProvider>
  );
}
