// 3D-Ansicht der Mindmaps (three.js via react-force-graph-3d).
// Wird lazy geladen, damit das Haupt-Bundle klein bleibt.
import { useEffect, useRef, useState } from "react";
import ForceGraph3D from "react-force-graph-3d";

export interface K3D { id: string; name: string; color: string; val: number }
export interface V3D { source: string; target: string; color: string }

export default function Graph3D({
  nodes, links, onKnoten,
}: {
  nodes: K3D[];
  links: V3D[];
  onKnoten: (id: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [groesse, setGroesse] = useState<{ b: number; h: number } | null>(null);

  useEffect(() => {
    const messen = () => {
      if (ref.current) setGroesse({ b: ref.current.clientWidth, h: ref.current.clientHeight });
    };
    messen();
    const beobachter = new ResizeObserver(messen);
    if (ref.current) beobachter.observe(ref.current);
    return () => beobachter.disconnect();
  }, []);

  return (
    <div ref={ref} className="absolute inset-0">
      {groesse && (
        <ForceGraph3D
          width={groesse.b}
          height={groesse.h}
          graphData={{ nodes: nodes as object[], links: links as object[] }}
          backgroundColor="#0a1812"
          nodeLabel={(n) => `<div style="color:#f4efe3;background:#102b22;border:1px solid #d4af37;border-radius:8px;padding:4px 10px;font-family:Inter,sans-serif;font-size:13px">${(n as K3D).name}</div>`}
          nodeColor={(n) => (n as K3D).color}
          nodeVal={(n) => (n as K3D).val}
          nodeOpacity={0.92}
          linkColor={(l) => (l as V3D).color}
          linkOpacity={0.45}
          linkWidth={0.6}
          onNodeClick={(n) => onKnoten((n as K3D).id)}
          showNavInfo={false}
        />
      )}
      <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[11px] text-cremedim bg-grund/80 rounded px-2 py-0.5 pointer-events-none">
        Ziehen = drehen · Scrollen = zoomen · Klick = Details
      </p>
    </div>
  );
}
