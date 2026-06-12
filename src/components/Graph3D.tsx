// Strukturierte 3D-Ansicht: KEINE zufällige Wolke, sondern dieselbe Ordnung wie
// die 2D-Karte — Zeit von links nach rechts (X), Kategorien als Ebenen (Y),
// Epochen als Tiefe (Z). Jeder Knoten trägt sein Namensschild, man weiß also
// vor dem Klick, wen man vor sich hat. (three.js via react-force-graph-3d)
import { useEffect, useRef, useState } from "react";
import ForceGraph3D from "react-force-graph-3d";
import SpriteText from "three-spritetext";

export interface K3D {
  id: string;
  name: string;
  color: string;
  val: number;
  x: number;
  y: number;
  z: number;
  fx: number;
  fy: number;
  fz: number;
}
export interface V3D { source: string; target: string; color: string }

export default function Graph3D({
  nodes, links, onKnoten,
}: {
  nodes: K3D[];
  links: V3D[];
  onKnoten: (id: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fgRef = useRef<any>(null);
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

  // Kamera passend ausrichten (nach Engine-Start und bei Datenwechsel)
  useEffect(() => {
    const t1 = setTimeout(() => fgRef.current?.zoomToFit(700, 80), 600);
    const t2 = setTimeout(() => fgRef.current?.zoomToFit(700, 80), 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [nodes.length, groesse?.b]);

  return (
    <div ref={ref} className="absolute inset-0">
      {groesse && (
        <ForceGraph3D
          ref={fgRef}
          width={groesse.b}
          height={groesse.h}
          graphData={{ nodes: nodes as object[], links: links as object[] }}
          backgroundColor="#0a1812"
          enableNodeDrag={false}
          cooldownTicks={30}
          onEngineStop={() => fgRef.current?.zoomToFit(700, 80)}
          nodeColor={(n) => (n as K3D).color}
          nodeVal={(n) => (n as K3D).val}
          nodeOpacity={0.95}
          nodeThreeObjectExtend={true}
          nodeThreeObject={(n: object) => {
            const k = n as K3D;
            const schild = new SpriteText(k.name);
            schild.color = "#f4efe3";
            schild.textHeight = 6.5;
            schild.backgroundColor = "rgba(16,43,34,0.82)";
            schild.borderColor = k.color;
            schild.borderWidth = 0.4;
            schild.borderRadius = 3;
            schild.padding = 2;
            // Schild leicht ueber den Knoten setzen (center ist eine THREE.Sprite-Eigenschaft)
            (schild as unknown as { center: { set: (x: number, y: number) => void } }).center.set(0.5, -0.7);
            return schild;
          }}
          linkColor={(l) => (l as V3D).color}
          linkOpacity={0.4}
          linkWidth={0.8}
          onNodeClick={(n) => onKnoten((n as K3D).id)}
          showNavInfo={false}
        />
      )}
      <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[11px] text-cremedim bg-grund/80 rounded px-2 py-0.5 pointer-events-none whitespace-nowrap">
        Ziehen = drehen · Scrollen = zoomen · Rechtsklick-Ziehen = verschieben · Klick = Details
      </p>
    </div>
  );
}
