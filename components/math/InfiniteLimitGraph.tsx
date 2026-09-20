"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useBoard } from "./useBoard";
import { makeFunction } from "@/lib/math";
import { fmt } from "@/lib/jxg";
import { useReplay } from "@/lib/replay";
import { TeX } from "@/components/ui/TeX";

const CURVE = "#6366f1";
const LEFT = "#3b82f6";
const RIGHT = "#ef4444";

export default function InfiniteLimitGraph({
  expr = "1/(x-1)",
  a = 1,
  bbox = [-4, 9, 5.5, -9],
  height = 380,
}: {
  expr?: string;
  a?: number;
  bbox?: [number, number, number, number];
  height?: number;
}) {
  const f = makeFunction(expr);
  const [xL, setXL] = useState(a - 2);
  const [xR, setXR] = useState(a + 2);
  const leftPt = useRef<any>(null);
  const rightPt = useRef<any>(null);

  const clampY = (y: number) =>
    Math.max(bbox[3] + 0.4, Math.min(bbox[2] - 0.4, y));

  const { containerRef, boardRef, ready } = useBoard(
    (JXG, board) => {
      board.create("functiongraph", [f, bbox[0], bbox[1]], {
        strokeColor: CURVE,
        strokeWidth: 3,
        name: "",
      });
      board.create("line", [
        [a, bbox[2] + 3],
        [a, bbox[3] - 3],
      ], {
        dash: 2,
        strokeColor: "#cbd5e1",
        strokeWidth: 1.5,
        straightFirst: false,
        straightLast: false,
        withLabel: false,
      });
      board.create("text", [a + 0.25, bbox[2] - 0.6, "asymptote x = a"], {
        fontSize: 13,
        strokeColor: "#94a3b8",
        fixed: true,
      });
      leftPt.current = board.create("point", [xL, clampY(f(xL))], {
        size: 4,
        strokeColor: LEFT,
        fillColor: LEFT,
        withLabel: false,
      });
      rightPt.current = board.create("point", [xR, clampY(f(xR))], {
        size: 4,
        strokeColor: RIGHT,
        fillColor: RIGHT,
        withLabel: false,
      });
      board.create("text", [a - 3.4, bbox[3] + 0.7, "x → a⁻"], {
        fontSize: 14,
        strokeColor: LEFT,
        fixed: true,
      });
      board.create("text", [a + 1.1, bbox[2] - 0.8, "x → a⁺"], {
        fontSize: 14,
        strokeColor: RIGHT,
        fixed: true,
      });
    },
    bbox
  );

  useEffect(() => {
    if (leftPt.current) leftPt.current.moveTo([xL, clampY(f(xL))]);
    if (rightPt.current) rightPt.current.moveTo([xR, clampY(f(xR))]);
  }, [xL, xR, ready]);

  useEffect(() => () => tweenRef.current?.kill(), []);
  const tweenRef = useRef<any>(null);

  const runAuto = () => {
    tweenRef.current?.kill();
    const t = gsap.timeline({ defaults: { ease: "power2.inOut", duration: 2.4 } });
    t.to({ p: 0 }, {
      duration: 2.4,
      onUpdate: function () {
        const k = this.progress();
        setXL(a - 2 + (0.005 - 2) * k);
        setXR(a + 2 + (-0.005 - 2) * k);
      },
    });
    tweenRef.current = t;
  };

  useReplay(runAuto);

  const closeL = Math.abs(xL - a) < 0.06;
  const closeR = Math.abs(xR - a) < 0.06;

  return (
    <figure className="my-5 rounded-2xl bg-white p-3 shadow-card ring-1 ring-slate-200 sm:p-4">
      <div
        ref={containerRef}
        style={{ height }}
        className="mx-auto w-full overflow-hidden rounded-xl"
      />
      <figcaption className="mt-3">
        <div className="mb-2 flex flex-wrap justify-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700">
            <TeX>{`f(x) = ${expr}`}</TeX>
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 flex justify-between text-xs font-semibold text-slate-500">
              <span>Approche par la gauche (bleu)</span>
              <span>
                <TeX>{`x = ${fmt(xL, 3)}`}</TeX>{" "}
                <TeX>{`\\; f(x) \\approx ${fmt(clampY(f(xL)), 2)}`}</TeX>
              </span>
            </label>
            <input
              type="range"
              min={a - 3}
              max={a - 0.01}
              step={0.005}
              value={Math.min(xL, a - 0.01)}
              onChange={(e) => setXL(Math.min(parseFloat(e.target.value), a - 0.005))}
            />
          </div>
          <div>
            <label className="mb-1 flex justify-between text-xs font-semibold text-slate-500">
              <span>Approche par la droite (rouge)</span>
              <span>
                <TeX>{`x = ${fmt(xR, 3)}`}</TeX>{" "}
                <TeX>{`\\; f(x) \\approx ${fmt(clampY(f(xR)), 2)}`}</TeX>
              </span>
            </label>
            <input
              type="range"
              min={a + 0.01}
              max={a + 3}
              step={0.005}
              value={Math.max(xR, a + 0.01)}
              onChange={(e) => setXR(Math.max(parseFloat(e.target.value), a + 0.005))}
            />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={runAuto}
            className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
          >
            ▶ Approche automatique
          </button>
          <div className="flex flex-wrap gap-2">
            {closeL && (
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-200">
                <TeX>{`x \\to a^- \\Rightarrow f(x) \\to -\\infty`}</TeX>
              </span>
            )}
            {closeR && (
              <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700 ring-1 ring-red-200">
                <TeX>{`x \\to a^+ \\Rightarrow f(x) \\to +\\infty`}</TeX>
              </span>
            )}
          </div>
        </div>
        <p className="mt-2 text-center text-xs text-slate-500">
          Quand <TeX>{"x"}</TeX> se rapproche de <TeX>{`${a}`}</TeX>, la courbe monte (ou descend) sans jamais toucher l'asymptote verticale.
        </p>
      </figcaption>
    </figure>
  );
}