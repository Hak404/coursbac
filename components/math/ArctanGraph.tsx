"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useBoard } from "./useBoard";
import { fmt } from "@/lib/jxg";
import { useReplay } from "@/lib/replay";
import { TeX } from "@/components/ui/TeX";

const CURVE = "#6366f1";
const TAN = "#cbd5e1";
const ASY = "#94a3b8";
const POINT = "#0ea5e9";
const PI = Math.PI;

export default function ArctanGraph({
  height = 400,
  bbox = [-9, 3.4, 9, -3.4],
}: {
  height?: number;
  bbox?: [number, number, number, number];
}) {
  const [xv, setXv] = useState(3);
  const pt = useRef<any>(null);
  const tweenRef = useRef<any>(null);

  const { containerRef, ready } = useBoard(
    (JXG, board) => {
      const tanFn = (x: number) =>
        Math.abs(x) > PI / 2 - 0.02 ? NaN : Math.tan(x);
      board.create("functiongraph", [tanFn, bbox[0], bbox[1]], {
        strokeColor: TAN,
        strokeWidth: 2.5,
        dash: 2,
        strokeOpacity: 0.6,
        name: "",
      });
      board.create("functiongraph", [Math.atan, bbox[0], bbox[1]], {
        strokeColor: CURVE,
        strokeWidth: 3.5,
        name: "",
      });
      [-PI / 2, PI / 2].forEach((g) => {
        board.create("line", [
          [bbox[0] - 2, g],
          [bbox[1] + 2, g],
        ], {
          dash: 1,
          strokeColor: ASY,
          strokeWidth: 1.5,
          straightFirst: false,
          straightLast: false,
          withLabel: false,
        });
      });
      board.create("text", [bbox[0] + 0.4, PI / 2 + 0.2, "y = π/2"], {
        fontSize: 13,
        strokeColor: ASY,
        fixed: true,
      });
      board.create("text", [bbox[0] + 0.4, -PI / 2 - 0.45, "y = −π/2"], {
        fontSize: 13,
        strokeColor: ASY,
        fixed: true,
      });
      board.create("text", [bbox[1] - 1.6, bbox[2] - 0.5, "Arctan"], {
        fontSize: 17,
        strokeColor: CURVE,
        fixed: true,
      });
      board.create("text", [bbox[1] - 3.4, bbox[3] + 0.6, "tan sur ]−π/2; π/2["], {
        fontSize: 12,
        strokeColor: TAN,
        fixed: true,
      });
      pt.current = board.create("point", [xv, Math.atan(xv)], {
        size: 4,
        strokeColor: POINT,
        fillColor: POINT,
        withLabel: false,
      });
    },
    bbox
  );

  useEffect(() => {
    if (pt.current) pt.current.moveTo([xv, Math.atan(xv)]);
  }, [xv, ready]);

  useEffect(() => () => tweenRef.current?.kill(), []);

  const runTo = (target: number) => {
    tweenRef.current?.kill();
    tweenRef.current = gsap.to({ v: xv }, {
      v: target,
      duration: 2.2,
      ease: "power1.inOut",
      onUpdate: function () {
        setXv((this.targets()[0] as { v: number }).v);
      },
    });
  };

  useReplay(() => {
    runTo(xv < 0 ? -9 : 9);
  });

  const closePlus = xv > 6;
  const closeMinus = xv < -6;

  return (
    <figure className="my-5 rounded-2xl bg-white p-3 shadow-card ring-1 ring-slate-200 sm:p-4">
      <div
        ref={containerRef}
        style={{ height }}
        className="mx-auto w-full overflow-hidden rounded-xl"
      />
      <figcaption className="mt-3 space-y-3">
        <div className="flex flex-wrap justify-center gap-2 text-sm">
          <span className="rounded-full bg-indigo-50 px-3 py-1 font-semibold text-indigo-700">
            <TeX>{"x \\mapsto \\arctan x"}</TeX>
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
            Définie sur <TeX>{"\\mathbb{R}"}</TeX>, valeurs dans <TeX>{"]-\\frac{\\pi}{2} ; \\frac{\\pi}{2}[ "}</TeX>
          </span>
        </div>
        <label className="mb-1 flex justify-between text-xs font-semibold text-slate-500">
          <span>Déplace <TeX>{"x"}</TeX> sur la courbe d'Arctan</span>
          <span>
            <TeX>{`x = ${fmt(xv, 2)}`}</TeX>{" "}
            <TeX>{`\\; \\arctan x = ${fmt(Math.atan(xv), 4)}`}</TeX>
          </span>
        </label>
        <input
          type="range"
          min={-8.5}
          max={8.5}
          step={0.05}
          value={xv}
          onChange={(e) => setXv(parseFloat(e.target.value))}
        />
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => runTo(-8.4)}
            className="rounded-xl bg-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            ← Vers −∞
          </button>
          <button
            type="button"
            onClick={() => runTo(8.4)}
            className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
          >
            Vers +∞ →
          </button>
          {closePlus && (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
              <TeX>{`\\lim_{x \\to +\\infty} \\arctan x = \\frac{\\pi}{2} \\approx ${fmt(
                PI / 2,
                3
              )}`}</TeX>
            </span>
          )}
          {closeMinus && (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
              <TeX>{`\\lim_{x \\to -\\infty} \\arctan x = -\\frac{\\pi}{2}`}</TeX>
            </span>
          )}
        </div>
      </figcaption>
    </figure>
  );
}