"use client";

import { useEffect, useRef, useState } from "react";
import { useBoard } from "./useBoard";
import { fmt } from "@/lib/jxg";
import { TeX } from "@/components/ui/TeX";

const CURVE = "#6366f1";
const INVERSE = "#10b981";
const AXIS = "#94a3b8";
const ACOL = "#3b82f6";
const BCOL = "#f59e0b";

const f = (x: number) => x * x * x;

export default function ReciprocalGraph({
  expr = "x^3",
  height = 400,
  bbox = [-3, 4.5, 3, -3],
}: {
  expr?: string;
  height?: number;
  bbox?: [number, number, number, number];
}) {
  const [a, setA] = useState(1.1);
  const aRef = useRef(a);
  aRef.current = a;
  const aPt = useRef<any>(null);
  const bPt = useRef<any>(null);

  const { containerRef, boardRef, ready } = useBoard(
    (JXG, board) => {
      const curve = board.create("functiongraph", [f, bbox[0], bbox[1]], {
        strokeColor: CURVE,
        strokeWidth: 3,
        name: "",
      });
      let inv: any = null;
      try {
        inv = board.create("inverse", [
          curve,
          board.defaultAxes.x,
          board.defaultAxes.y,
        ], {
          strokeColor: INVERSE,
          strokeWidth: 3,
          dash: 1,
          name: "",
        });
      } catch {
        inv = board.create("functiongraph", [
          (x: number) => (x < 0 ? -Math.pow(-x, 1 / 3) : Math.pow(x, 1 / 3)),
          bbox[0],
          bbox[1],
        ], { strokeColor: INVERSE, strokeWidth: 3, dash: 1, name: "" });
      }
      board.create("line", [
        [bbox[0] - 2, bbox[3] - 2],
        [bbox[1] + 2, bbox[2] + 2],
      ], {
        dash: 2,
        strokeColor: AXIS,
        strokeWidth: 1.5,
        strokeOpacity: 0.9,
        straightFirst: false,
        straightLast: false,
        withLabel: false,
      });

      const A = board.create("glider", [a, f(a), curve], {
        size: 4,
        strokeColor: ACOL,
        fillColor: ACOL,
        name: "",
        withLabel: false,
      });
      const B = board.create("point", [f(a), a], {
        size: 4,
        strokeColor: BCOL,
        fillColor: BCOL,
        name: "",
        withLabel: false,
      });
      aPt.current = A;
      bPt.current = B;
      A.on("drag", () => {
        const [x] = A.coords.usrCoords.slice(1);
        A.moveTo([x, f(x)]);
        B.moveTo([f(x), x]);
        setA(x);
      });
      board.extra = { A, B };
      board.create("text", [bbox[0] + 0.5, bbox[2] - 0.6, "f"], {
        fontSize: 17,
        strokeColor: CURVE,
        fixed: true,
      });
      board.create("text", [bbox[1] - 1.6, bbox[3] + 0.9, "f⁻¹"], {
        fontSize: 17,
        strokeColor: INVERSE,
        fixed: true,
      });
      board.create("text", [bbox[1] - 1.2, bbox[2] - 0.9, "y = x"], {
        fontSize: 13,
        strokeColor: AXIS,
        fixed: true,
      });
    },
    bbox
  );

  useEffect(() => {
    const b = boardRef.current;
    if (!b) return;
    const F = f;
    b.extra.A.moveTo([a, F(a)]);
    b.extra.B.moveTo([F(a), a]);
  }, [a, ready]);

  return (
    <figure className="my-5 rounded-2xl bg-white p-3 shadow-card ring-1 ring-slate-200 sm:p-4">
      <div
        ref={containerRef}
        style={{ height }}
        className="mx-auto w-full overflow-hidden rounded-xl"
      />
      <figcaption className="mt-3 space-y-3">
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
          <span className="rounded-full bg-indigo-50 px-3 py-1 font-semibold text-indigo-700">
            <TeX>{`f(x) = ${expr}`}</TeX>
          </span>
          <span className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700">
            <TeX>{"f^{-1}"}</TeX> symétrique
          </span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-xl bg-blue-50 px-3 py-2 text-center text-sm ring-1 ring-blue-200">
            <div className="text-xs font-semibold text-blue-700">Point bleu sur C_f</div>
            <TeX>{`A(${fmt(a, 3)} ; ${fmt(f(a), 3)})`}</TeX>
          </div>
          <div className="rounded-xl bg-amber-50 px-3 py-2 text-center text-sm ring-1 ring-amber-200">
            <div className="text-xs font-semibold text-amber-700">Point jaune sur la courbe de f⁻¹</div>
            <TeX>{`B(${fmt(f(a), 3)} ; ${fmt(a, 3)})`}</TeX>
          </div>
        </div>
        <label className="block">
          <span className="mb-1 flex justify-between text-xs font-semibold text-slate-500">
            <span>Déplace <TeX>{"x = a"}</TeX> (ou glisse le point bleu sur la courbe)</span>
            <span className="font-bold text-blue-600">a = {fmt(a, 3)}</span>
          </span>
          <input
            type="range"
            min={-2.6}
            max={2.6}
            step={0.02}
            value={a}
            onChange={(e) => setA(parseFloat(e.target.value))}
          />
        </label>
        <p className="text-center text-xs text-slate-500">
          Le point jaune est l'image du point bleu par la symétrie d'axe <TeX>{"y = x"}</TeX>.
          Puisque <TeX>{"f"}</TeX> est bijective, chaque valeur possède un antécédent unique.
        </p>
      </figcaption>
    </figure>
  );
}