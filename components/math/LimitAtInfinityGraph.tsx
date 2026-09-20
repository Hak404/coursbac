"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useBoard } from "./useBoard";
import { makeFunction } from "@/lib/math";
import { fmt } from "@/lib/jxg";
import { useReplay } from "@/lib/replay";
import { TeX } from "@/components/ui/TeX";

const CURVE = "#6366f1";
const POINT = "#0ea5e9";

export default function LimitAtInfinityGraph({
  expr,
  limit,
  bbox = [-2, 3.4, 55, -3],
  height = 380,
  label = "x → +∞",
  caption,
}: {
  expr: string;
  limit: number | "inf" | "-inf";
  bbox?: [number, number, number, number];
  height?: number;
  label?: string;
  caption?: string;
}) {
  const f = makeFunction(expr);
  const [xv, setXv] = useState(6);
  const pt = useRef<any>(null);
  const tweenRef = useRef<any>(null);

  const { containerRef, ready } = useBoard(
    (JXG, board) => {
      board.create("functiongraph", [f, bbox[0], 80], {
        strokeColor: CURVE,
        strokeWidth: 3,
        name: "",
      });
      if (typeof limit === "number") {
        board.create("line", [
          [bbox[0] - 2, limit],
          [bbox[2] + 5, limit],
        ], {
          dash: 2,
          strokeColor: "#94a3b8",
          strokeWidth: 1.5,
          straightFirst: false,
          straightLast: false,
          withLabel: false,
        });
        board.create("text", [bbox[2] - 3, limit + 0.2, "y = L"], {
          fontSize: 14,
          strokeColor: "#64748b",
          fixed: true,
        });
      }
      board.create("text", [bbox[2] - 4.5, bbox[3] + 0.6, label], {
        fontSize: 14,
        strokeColor: POINT,
        fixed: true,
      });
      pt.current = board.create("point", [xv, f(xv)], {
        size: 4,
        strokeColor: POINT,
        fillColor: POINT,
        withLabel: false,
      });
    },
    bbox
  );

  useEffect(() => {
    if (pt.current) pt.current.moveTo([xv, f(xv)]);
  }, [xv, ready]);

  useEffect(() => () => tweenRef.current?.kill(), []);

  const runAuto = () => {
    tweenRef.current?.kill();
    const t = gsap.to({ v: xv }, {
      v: 45,
      duration: 2.6,
      ease: "power1.inOut",
      onUpdate: function () {
        setXv((this.targets()[0] as { v: number }).v);
      },
    });
    tweenRef.current = t;
  };

  useReplay(runAuto);

  const fy = f(xv);
  const approach =
    typeof limit === "number"
      ? Math.abs(fy - limit) < 0.05
      : limit === "inf"
        ? fy > 20
        : fy < -20;

  return (
    <figure className="my-5 rounded-2xl bg-white p-3 shadow-card ring-1 ring-slate-200 sm:p-4">
      <div
        ref={containerRef}
        style={{ height }}
        className="mx-auto w-full overflow-hidden rounded-xl"
      />
      <figcaption className="mt-3">
        <div className="mb-2 flex flex-wrap justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700">
            <TeX>{`f(x) = ${expr}`}</TeX>
          </span>
        </div>
        <label className="mb-1 flex justify-between text-xs font-semibold text-slate-500">
          <span>Fais grandir <TeX>{"x"}</TeX></span>
          <span>
            <TeX>{`x = ${fmt(xv)}`}</TeX>{" "}
            <TeX>{`\\; f(x) = ${fmt(fy, 4)}`}</TeX>
          </span>
        </label>
        <input
          type="range"
          min={0.3}
          max={48}
          step={0.2}
          value={xv}
          onChange={(e) => setXv(parseFloat(e.target.value))}
        />
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={runAuto}
            className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
          >
            ▶ Courir vers +∞
          </button>
          {approach && typeof limit === "number" && (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
              <TeX>{`x \\to +\\infty \\Rightarrow f(x) \\to ${limit}`}</TeX>
            </span>
          )}
          {approach && limit === "inf" && (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
              <TeX>{`f(x) \\to +\\infty`}</TeX>
            </span>
          )}
          {approach && limit === "-inf" && (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
              <TeX>{`f(x) \\to -\\infty`}</TeX>
            </span>
          )}
        </div>
        {caption && (
          <p className="mt-2 text-center text-xs text-slate-500">{caption}</p>
        )}
      </figcaption>
    </figure>
  );
}