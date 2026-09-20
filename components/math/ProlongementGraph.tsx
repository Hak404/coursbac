"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useBoard } from "./useBoard";
import { TeX } from "@/components/ui/TeX";

const CURVE = "#6366f1";
const NEW = "#10b981";

export default function ProlongementGraph({
  expr = "(x^2-1)/(x-1)",
  a = 1,
  L = 2,
  height = 380,
  bbox = [-3.5, 5.5, 4, -2],
}: {
  expr?: string;
  a?: number;
  L?: number;
  height?: number;
  bbox?: [number, number, number, number];
}) {
  const [added, setAdded] = useState(false);
  const ptRef = useRef<any>(null);
  const tweenRef = useRef<any>(null);

  const { containerRef, boardRef } = useBoard(
    (JXG, board) => {
      const fx = (x: number) => (Math.abs(x - a) < 0.02 ? NaN : (x * x - 1) / (x - 1));
      board.create("functiongraph", [fx, bbox[0], bbox[1]], {
        strokeColor: CURVE,
        strokeWidth: 3,
        name: "",
      });
      const hole = board.create("point", [a, L], {
        size: 3,
        strokeColor: "#f59e0b",
        fillColor: "none",
        face: "circle",
        withLabel: false,
      });
      board.create("circle", [hole, 0.09], {
        strokeColor: "#f59e0b",
        fillColor: "none",
        strokeWidth: 2,
      });
      board.create("text", [a + 0.18, L + 0.32, "trou en (1 ; 2)"], {
        fontSize: 13,
        strokeColor: "#b45309",
        fixed: true,
      });
      board.create("line", [
        [a, bbox[2] + 2],
        [a, bbox[3] - 2],
      ], {
        dash: 2,
        strokeColor: "#cbd5e1",
        strokeWidth: 1,
        straightFirst: false,
        straightLast: false,
        withLabel: false,
      });
      ptRef.current = board.create("point", [a, L + 1.4], {
        size: 5,
        strokeColor: NEW,
        fillColor: NEW,
        visible: false,
        withLabel: false,
      });
      board.extra = { hole };
      board.extra.pt = ptRef.current;
    },
    bbox
  );

  const applyAdded = (on: boolean) => {
    tweenRef.current?.kill();
    if (on && ptRef.current && boardRef.current) {
      ptRef.current.setProperty({ visible: true });
      ptRef.current.moveTo([a, L + 1.4]);
      tweenRef.current = gsap.to({ y: L + 1.4 }, {
        y: L,
        duration: 0.8,
        ease: "bounce.out",
        onUpdate: function () {
          ptRef.current?.moveTo([a, (this.targets()[0] as { y: number }).y]);
        },
      });
    } else if (ptRef.current) {
      ptRef.current.moveTo([a, L + 1.4]);
      ptRef.current.setProperty({ visible: false });
    }
  };

  const toggle = () => {
    const next = !added;
    setAdded(next);
    applyAdded(next);
  };

  return (
    <figure className="my-5 rounded-2xl bg-white p-3 shadow-card ring-1 ring-slate-200 sm:p-4">
      <div
        ref={containerRef}
        style={{ height }}
        className="mx-auto w-full overflow-hidden rounded-xl"
      />
      <figcaption className="mt-3 space-y-3">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700">
            <TeX>{`f(x) = ${expr} \\; \\text{ pour } x \\neq 1`}</TeX>
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={toggle}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              added
                ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
                : "bg-success-600 text-white hover:bg-success-700"
            }`}
          >
            {added ? "⟲ Retirer le point" : "● Ajouter le point manquant"}
          </button>
        </div>
        {added ? (
          <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900 ring-1 ring-emerald-200">
            On pose <TeX>{"g(1) = 2"}</TeX>, avec <TeX>{"g(x) = f(x)"}</TeX> pour{" "}
            <TeX>{"x \\neq 1"}</TeX>. Comme <TeX>{"\\lim_{x\\to 1} f(x) = 2 = g(1)"}</TeX>,
            la fonction <TeX>{"g"}</TeX> est continue en 1. On a prolongé{" "}
            <TeX>{"f"}</TeX> par continuité : plus de trou !
          </div>
        ) : (
          <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200">
            Le point <TeX>{`(${a} ; ${L})`}</TeX> manque : <TeX>{"f(1)"}</TeX> n'existe pas. Mais la limite existe et vaut{" "}
            <TeX>{`${L}`}</TeX>. Clique sur le bouton pour « boucher » le trou.
          </div>
        )}
      </figcaption>
    </figure>
  );
}