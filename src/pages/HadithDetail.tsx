import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ReactFlow, ReactFlowProvider, Background, Controls,
  Handle, Position, type Node, type Edge, type NodeProps,
} from "@xyflow/react";
import {
  hadithe, buchById, narratorById, BEWERTUNG_INFO, GENERATION_LABEL, GRADING_INFO,
  type Narrator,
} from "../data/hadith";
import { nodeById as siraNodeById } from "../data/sira";
import { NotizBox } from "../components/NotizBox";

interface NarratorNodeDaten extends Record<string, unknown> {
  narrator: Narrator;
  schwach?: string;
  parallelNotiz?: string;
}

function NarratorNode({ data, selected }: NodeProps) {
  const d = data as NarratorNodeDaten;
  const n = d.narrator;
  const info = BEWERTUNG_INFO[n.bewertung];
  return (
    <div
      className={`rounded-xl px-4 py-2.5 bg-flaeche min-w-56 max-w-64 text-center shadow-lg ${d.schwach ? "puls-rot" : ""}`}
      style={{ border: `2px solid ${info.farbe}`, boxShadow: selected ? "0 0 0 3px #d4af37" : undefined }}
    >
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <div className="text-sm font-semibold text-creme leading-tight">{n.name}</div>
      {n.arabisch && <div className="font-arabic text-sm text-cremedim" dir="rtl">{n.arabisch}</div>}
      <div className="text-[10px] mt-1 text-cremedim">
        {GENERATION_LABEL[n.generation]}{n.gestorben ? ` · gest. ${n.gestorben}` : ""}
      </div>
      <div className="text-[10px] font-semibold" style={{ color: info.farbe }}>{info.label}</div>
      {d.parallelNotiz && <div className="text-[10px] text-goldhell mt-0.5">{d.parallelNotiz}</div>}
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  );
}

function SammlerNode({ data }: NodeProps) {
  const d = data as { label?: string };
  return (
    <div className="rounded-xl px-4 py-2.5 bg-flaeche2 border-2 border-gold min-w-56 text-center shadow-lg">
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <div className="text-xs text-goldhell">Sammler</div>
      <div className="text-sm font-semibold text-gold">{String(d.label ?? "")}</div>
    </div>
  );
}

const nodeTypes = { narrator: NarratorNode, sammler: SammlerNode };

export default function HadithDetail() {
  const { buchId, hadithId } = useParams();
  const hadith = hadithe.find((h) => h.id === hadithId);
  const buch = buchId ? buchById.get(buchId) : undefined;
  const [gewählt, setGewählt] = useState<Narrator | null>(null);

  const { nodes, edges } = useMemo(() => {
    if (!hadith || !buch) return { nodes: [] as Node[], edges: [] as Edge[] };
    const ABSTAND = 150;
    const ns: Node[] = hadith.kette.map((id, i) => {
      const schwach = hadith.schwachstellen?.find((s) => s.narratorId === id)?.erklärung;
      return {
        id,
        type: "narrator",
        position: { x: 0, y: i * ABSTAND },
        data: { narrator: narratorById.get(id)!, schwach } satisfies NarratorNodeDaten,
      };
    });
    const es: Edge[] = [];
    for (let i = 0; i < hadith.kette.length - 1; i++) {
      es.push({
        id: `k${i}`,
        source: hadith.kette[i],
        target: hadith.kette[i + 1],
        label: "überliefert an",
        style: { stroke: "#2f9d77", strokeWidth: 1.8 },
        labelStyle: { fill: "#c9c2b0", fontSize: 10 },
        labelBgStyle: { fill: "#0a1812", opacity: 0.85 },
      });
    }
    if (hadith.parallel) {
      const p = hadith.parallel;
      ns.push({
        id: p.narratorId,
        type: "narrator",
        position: { x: 360, y: ((p.vonIndex + p.bisIndex) / 2) * ABSTAND },
        data: { narrator: narratorById.get(p.narratorId)!, parallelNotiz: p.notiz } satisfies NarratorNodeDaten,
      });
      es.push(
        { id: "p1", source: hadith.kette[p.vonIndex], target: p.narratorId, style: { stroke: "#e09a4f", strokeWidth: 1.5, strokeDasharray: "5 4" } },
        { id: "p2", source: p.narratorId, target: hadith.kette[p.bisIndex], style: { stroke: "#e09a4f", strokeWidth: 1.5, strokeDasharray: "5 4" } },
      );
    }
    ns.push({
      id: "sammler",
      type: "sammler",
      position: { x: 0, y: hadith.kette.length * ABSTAND },
      data: { label: buch.name },
    });
    es.push({
      id: "ks",
      source: hadith.kette[hadith.kette.length - 1],
      target: "sammler",
      label: "aufgenommen in",
      style: { stroke: "#d4af37", strokeWidth: 1.8 },
      labelStyle: { fill: "#c9c2b0", fontSize: 10 },
      labelBgStyle: { fill: "#0a1812", opacity: 0.85 },
    });
    return { nodes: ns, edges: es };
  }, [hadith?.id, buch?.id]);

  if (!hadith || !buch) {
    return <div className="p-10 text-center text-cremedim">Hadith nicht gefunden.</div>;
  }

  const g = GRADING_INFO[hadith.grading.stufe];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 w-full">
      <Link to={`/hadith/${buch.id}`} className="text-sm text-cremedim hover:text-creme">← {buch.name}</Link>
      <div className="flex items-center gap-2 flex-wrap mt-2">
        <h1 className="font-serif text-2xl text-gold">{hadith.titel}</h1>
        <span className="text-xs text-goldhell font-mono">{buch.name} Nr. {hadith.nummer}</span>
        <span className="text-xs px-1.5 py-0.5 rounded" style={{ border: `1px solid ${g.farbe}`, color: g.farbe }}>
          {g.label} · {hadith.grading.von}
        </span>
        {hadith.ketteVereinfacht && (
          <span className="text-xs px-1.5 py-0.5 rounded border border-cremedim/40 text-cremedim" title="Vollständige Tradentenfolge wird ergänzt; Text und Grading sind belegt.">
            vereinfachte Kette
          </span>
        )}
      </div>
      <p className="text-creme mt-3 karte p-4 leading-relaxed">{hadith.textDe}</p>
      <p className="text-xs text-cremedim mt-2">
        Themen: {hadith.themen.join(", ")} ·{" "}
        <a href={hadith.quelleUrl} target="_blank" rel="noopener noreferrer" className="text-goldhell underline">
          Volltext und Original auf sunnah.com nachprüfen ↗
        </a>
      </p>
      {hadith.grading.begründung && (
        <p className="text-sm text-cremedim mt-2 border-l-2 border-gold/50 pl-3">{hadith.grading.begründung}</p>
      )}

      {hadith.kontext && (
        <div className="karte border-smaragd/60 p-4 mt-4">
          <h3 className="font-semibold text-smaragdhell">Kontext</h3>
          <p className="text-sm text-cremedim mt-1 leading-relaxed">{hadith.kontext}</p>
        </div>
      )}

      {hadith.schwachstellen && (
        <div className="karte border-warn/60 p-4 mt-4">
          <h3 className="font-semibold text-warn">Woran scheitert die Kette?</h3>
          <ul className="mt-2 space-y-2 text-sm text-cremedim list-disc pl-5">
            {hadith.schwachstellen.map((s) => (
              <li key={s.narratorId}>
                <span className="text-creme font-medium">{narratorById.get(s.narratorId)?.name}: </span>
                {s.erklärung}
              </li>
            ))}
          </ul>
        </div>
      )}

      {hadith.meinungen && (
        <div className="karte p-4 mt-4">
          <h3 className="font-semibold text-gold">Stimmen der Gelehrten</h3>
          <ul className="mt-2 space-y-2">
            {hadith.meinungen.map((m, i) => (
              <li key={i} className="text-sm">
                <span className="text-creme font-medium">{m.gelehrter}</span>
                <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full border border-goldhell/50 text-goldhell">{m.richtung}</span>
                <span className="block text-cremedim mt-0.5">{m.position}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {hadith.lehrpunkt && (
        <div className="karte border-gold/60 p-4 mt-4">
          <h3 className="font-semibold text-goldhell">Lehrpunkt</h3>
          <p className="text-sm text-cremedim mt-1 leading-relaxed">{hadith.lehrpunkt}</p>
        </div>
      )}

      {hadith.siraLink && siraNodeById.get(hadith.siraLink) && (
        <Link to={`/sira?fokus=${hadith.siraLink}`} className="knopf inline-block mt-4 text-sm">
          Im Sira-Atlas zeigen: {siraNodeById.get(hadith.siraLink)!.name}
        </Link>
      )}

      <div className="grid lg:grid-cols-[1fr_340px] gap-4 mt-6">
        <div className="karte" style={{ height: Math.max(480, (hadith.kette.length + 1) * 150) }}>
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodeClick={(_e, node) => {
                const d = node.data as Partial<NarratorNodeDaten>;
                if (d.narrator) setGewählt(d.narrator);
              }}
              fitView
              minZoom={0.3}
              maxZoom={1.8}
              nodesDraggable={false}
              nodesConnectable={false}
              proOptions={{ hideAttribution: true }}
            >
              <Background color="#1f3a2e" gap={24} />
              <Controls position="bottom-left" showInteractive={false} />
            </ReactFlow>
          </ReactFlowProvider>
        </div>

        <div className="space-y-4">
          <div className="karte p-4">
            <h3 className="font-semibold text-gold text-sm">Tradent im Detail</h3>
            {gewählt ? (
              <div className="mt-2 space-y-1 text-sm">
                <p className="text-creme font-medium">{gewählt.name}</p>
                {gewählt.arabisch && <p className="font-arabic text-cremedim" dir="rtl">{gewählt.arabisch}</p>}
                <p className="text-cremedim">{GENERATION_LABEL[gewählt.generation]}</p>
                {gewählt.gestorben && <p className="text-goldhell font-mono text-xs">gest. {gewählt.gestorben}</p>}
                <p style={{ color: BEWERTUNG_INFO[gewählt.bewertung].farbe }}>
                  Bewertung: {BEWERTUNG_INFO[gewählt.bewertung].label}
                </p>
                {gewählt.anmerkung && <p className="text-cremedim">{gewählt.anmerkung}</p>}
                <p className="text-xs text-cremedim pt-1 border-t border-gold/10">
                  Bewertungsquellen: Ibn Hajar (Taqrib at-Tahdhib); adh-Dhahabi (Mizan al-Itidal)
                </p>
              </div>
            ) : (
              <p className="text-sm text-cremedim mt-2">Klicke in der Kette auf einen Tradenten.</p>
            )}
          </div>

          <div className="karte p-4">
            <h3 className="font-semibold text-gold text-sm mb-1">Meine Notiz zu diesem Hadith</h3>
            <NotizBox nodeId={hadith.id} section="hadith" />
          </div>
        </div>
      </div>
    </div>
  );
}
