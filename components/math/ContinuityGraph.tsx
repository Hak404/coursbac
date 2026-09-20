"use client";

import { useBoard } from "./useBoard";
import { TeX } from "@/components/ui/TeX";
import type { ReactNode } from "react";

const CURVE = "#6366f1";
const HOLE = "#f59e0b";
const LEFT = "#3b82f6";
const RIGHT = "#10b981";
const GRAY = "#cbd5e1";

function ContCard({
  title,
  verdict,
  ok,
  bbox,
  height,
  build,
}: {
  title: string;
  verdict: ReactNode;
  ok: boolean;
  bbox: [number, number, number, number];
  height: number;
  build: (JXG: any, board: any, bbox: [number, number, number, number]) => void;
}) {
  const { containerRef } = useBoard(
    (JXG, board) => build(JXG, board, bbox),
    bbox
  );
  return (
    <div className="rounded-2xl bg-white p-2 shadow-card ring-1 ring-slate-200">
      <div className="mb-1 px-1 text-sm font-bold text-slate-700">{title}</div>
      <div
        ref={containerRef}
        style={{ height }}
        className="w-full overflow-hidden rounded-lg"
      />
      <div
        className={`mt-2 rounded-lg px-2 py-1.5 text-center text-xs font-bold ${
          ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
        }`}
      >
        {ok ? "✓ Continue" : "✕ Pas continue"}
        <span className="mt-0.5 block font-medium text-slate-600">{verdict}</span>
      </div>
    </div>
  );
}

export default function ContinuityGraph() {
  return (
    <div className="my-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <ContCard
        title="① Fonction continue"
        ok
        verdict={
          <span>
            La courbe se trace « sans lever le stylo ». <TeX>{"\\lim_{x\\to a} f(x) = f(a)"}</TeX>
          </span>
        }
        bbox={[-3.5, 5.5, 3.5, -3]}
        height={220}
        build={(JXG, board, b) => {
          board.create("functiongraph", [
            (x: number) => x * x,
            b[0],
            b[1],
          ], { strokeColor: CURVE, strokeWidth: 3 });
          board.create("point", [1, 1], {
            size: 4,
            strokeColor: HOLE,
            fillColor: HOLE,
            withLabel: false,
          });
        }}
      />
      <ContCard
        title="② Fonction avec « trou »"
        ok={false}
        verdict={
          <span>
            Non définie en <TeX>{"x=1"}</TeX> mais <TeX>{"\\lim_{x\\to 1} f(x) = 2"}</TeX> (point jaune) : tout se passe comme si on pouvait « boucher » le trou.
          </span>
        }
        bbox={[-3.5, 5.5, 3.5, -3]}
        height={220}
        build={(JXG, board, b) => {
          const fx = (x: number) => (Math.abs(x - 1) < 0.02 ? NaN : (x * x - 1) / (x - 1));
          board.create("functiongraph", [fx, b[0], b[1]], {
            strokeColor: CURVE,
            strokeWidth: 3,
            name: "",
          });
          const hole = board.create("point", [1, 2], {
            size: 3,
            strokeColor: HOLE,
            fillColor: "none",
            face: "circle",
            withLabel: false,
          });
          board.create("circle", [hole, 0.07], {
            strokeColor: HOLE,
            fillColor: "none",
            strokeWidth: 2,
          });
        }}
      />
      <ContCard
        title="③ Fonction avec saut"
        ok={false}
        verdict={
          <span>
            En <TeX>{"x=1"}</TeX> : limite à gauche = 1 (bleu), limite à droite = 2 (vert). Elles diffèrent : pas de limite, saut.
          </span>
        }
        bbox={[-3.5, 5.5, 3.5, -3]}
        height={220}
        build={(JXG, board, b) => {
          const leftFn = (x: number) => (x >= 0.99 ? NaN : x * x);
          const rightFn = (x: number) => (x <= 1.01 ? NaN : x * x + 1);
          board.create("functiongraph", [leftFn, b[0], b[1]], {
            strokeColor: LEFT,
            strokeWidth: 3,
            name: "",
          });
          board.create("functiongraph", [rightFn, b[0], b[1]], {
            strokeColor: RIGHT,
            strokeWidth: 3,
            name: "",
          });
          const lp = board.create("point", [1, 1], {
            size: 3,
            strokeColor: LEFT,
            fillColor: "none",
            face: "circle",
            withLabel: false,
          });
          board.create("circle", [lp, 0.07], {
            strokeColor: LEFT,
            fillColor: "none",
            strokeWidth: 2,
          });
          board.create("point", [1, 2], {
            size: 4,
            strokeColor: RIGHT,
            fillColor: RIGHT,
            withLabel: false,
          });
        }}
      />
      <ContCard
        title="④ Asymptote verticale"
        ok={false}
        verdict={
          <span>
            Pour <TeX>{"f(x) = \\dfrac{1}{x}"}</TeX>, la limite en 0 est infinie : la fonction n'est ni continue ni prolongeable en 0.
          </span>
        }
        bbox={[-3.5, 5.5, 3.5, -3]}
        height={220}
        build={(JXG, board, b) => {
          board.create("functiongraph", [
            (x: number) => (Math.abs(x) < 0.05 ? NaN : 1 / x),
            b[0],
            b[1],
          ], { strokeColor: CURVE, strokeWidth: 3, name: "" });
          board.create("line", [
            [0, b[2] + 2],
            [0, b[3] - 2],
          ], {
            dash: 2,
            strokeColor: GRAY,
            strokeWidth: 1.5,
            straightFirst: false,
            straightLast: false,
            withLabel: false,
          });
        }}
      />
    </div>
  );
}