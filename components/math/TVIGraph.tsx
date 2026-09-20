"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { useBoard } from "./useBoard";
import { makeFunction } from "@/lib/math";
import { fmt } from "@/lib/jxg";
import { TeX } from "@/components/ui/TeX";

const CURVE = "#6366f1";
const ACOL = "#3b82f6";
const BCOL = "#f97316";
const KCOL = "#0d9488";
const ROOT = "#16a34a";

type Preset = {
  expr: string;
  label: string;
  min: number;
  max: number;
};

const PRESETS: Preset[] = [
  { expr: "x^3 - x", label: "f(x) = x³ − x", min: -1.8, max: 1.8 },
  { expr: "x^3 + x - 1", label: "f(x) = x³ + x − 1", min: -1, max: 1.6 },
  { expr: "sqrt(x)", label: "f(x) = √x", min: 0, max: 4 },
];

function crossings(f: (x: number) => number, k: number, lo: number, hi: number): number[] {
  const out: number[] = [];
  const h = 0.004;
  let prevX = lo;
  let prevV = f(lo) - k;
  if (!Number.isFinite(prevV)) prevV = NaN;
  for (let x = lo + h; x <= hi + h; x += h) {
    let v = f(x) - k;
    if (!Number.isFinite(v)) {
      prevX = x;
      prevV = NaN;
      continue;
    }
    if (Math.abs(v) < 1e-12) {
      if (out.every((r) => Math.abs(r - x) > 1e-3)) out.push(x);
    } else if (Number.isFinite(prevV) && prevV * v < 0) {
      let lo2 = prevX;
      let hi2 = x;
      for (let i = 0; i < 40; i++) {
        const mid = (lo2 + hi2) / 2;
        const mv = f(mid) - k;
        if (!Number.isFinite(mv)) break;
        if (prevV * mv <= 0) hi2 = mid;
        else {
          lo2 = mid;
          prevV = mv;
        }
      }
      const r = (lo2 + hi2) / 2;
      if (out.every((q) => Math.abs(q - r) > 1e-3)) out.push(r);
    }
    prevX = x;
    prevV = v;
  }
  return out;
}

export default function TVIGraph({
  height = 380,
  bbox = [-2.4, 2.6, 2.4, -2.6],
}: {
  height?: number;
  bbox?: [number, number, number, number];
}) {
  const [presetIdx, setPresetIdx] = useState(0);
  const preset = PRESETS[presetIdx];
  const f = makeFunction(preset.expr);

  const [a, setA] = useState(-1.2);
  const [b, setB] = useState(1.2);
  const [k, setK] = useState(0);

  const dynamicRef = useRef<any[]>([]);
  const rootPts = useRef<any[]>([]);

  const { containerRef, boardRef, ready } = useBoard(
    (JXG, board) => {
      board.create("functiongraph", [f, bbox[0], bbox[1]], {
        strokeColor: CURVE,
        strokeWidth: 3,
        name: "",
      });
      board.create("text", [bbox[0] + 0.3, bbox[2] - 0.45, "C_f"], {
        fontSize: 16,
        strokeColor: CURVE,
        highlightStrokeColor: CURVE,
        fixed: true,
      });
      board.create("line", [
        [bbox[0] - 2, 0],
        [bbox[1] + 2, 0],
      ], {
        dash: 1,
        strokeColor: "#cbd5e1",
        strokeWidth: 1,
        straightFirst: false,
        straightLast: false,
        withLabel: false,
      });
      board.create("text", [bbox[1] + 0.4, bbox[3] + 0.5, "y = k"], {
        fontSize: 14,
        strokeColor: KCOL,
        fixed: true,
      });
    },
    bbox
  );

  const clearDynamic = () => {
    const b = boardRef.current;
    if (!b) return;
    b.extra ??= {};
    [...(b.extra.dynamic ?? [])].forEach((el) => b.removeObject(el));
    (b.extra.dynamic as any[]) = [];
  };

  const fa = f(a);
  const fb = f(b);
  const ok =
    typeof k === "number" &&
    ((fa <= k && k <= fb) || (fb <= k && k <= fa));

  useEffect(() => {
    const b = boardRef.current;
    if (!b) return;
    b.extra ??= {};
    clearDynamic();

    const dyn = b.extra.dynamic as any[];
    dyn.push(
      b.create("point", [a, fa], {
        size: 4,
        strokeColor: ACOL,
        fillColor: ACOL,
        withLabel: false,
      }),
      b.create("point", [b, fb], {
        size: 4,
        strokeColor: BCOL,
        fillColor: BCOL,
        withLabel: false,
      }),
      b.create("line", [
        [bbox[0] - 1, k],
        [bbox[1] + 1, k],
      ], {
        dash: 2,
        strokeColor: KCOL,
        strokeWidth: 2,
        straightFirst: false,
        straightLast: false,
        withLabel: false,
      })
    );

    if (ok) {
      const roots = crossings(f, k, a, b);
      rootPts.current.forEach((p) => {
        try {
          b.removeObject(p);
        } catch {
          /* ignore */
        }
      });
      rootPts.current = roots.map((r) =>
        b.create("point", [r, k], {
          size: 5,
          face: "circle",
          strokeColor: ROOT,
          fillColor: ROOT,
          name: "",
          withLabel: false,
        })
      );
      if (roots.length > 0) {
        dyn.push(
          b.create("text", [roots[0] - 0.5, k - 0.35, "c"], {
            fontSize: 15,
            strokeColor: ROOT,
            fixed: true,
          })
        );
      }
    }
  }, [a, b, k, presetIdx, ready]);

  const presetChange = (i: number) => {
    setPresetIdx(i);
    const p = PRESETS[i];
    setA(-(p.max - p.min) / 4);
    setB((p.max - p.min) / 4);
    setK(0);
  };

  const kmin = Math.min(fa, fb);
  const kmax = Math.max(fa, fb);

  return (
    <figure className="my-5 rounded-2xl bg-white p-3 shadow-card ring-1 ring-slate-200 sm:p-4">
      <div
        ref={containerRef}
        style={{ height }}
        className="mx-auto w-full overflow-hidden rounded-xl"
      />
      <figcaption className="mt-3 space-y-3">
        <div className="flex flex-wrap justify-center gap-1.5">
          {PRESETS.map((p, i) => (
            <button
              key={p.expr}
              type="button"
              onClick={() => presetChange(i)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                i === presetIdx
                  ? "bg-primary-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <TeX>{p.label}</TeX>
            </button>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {(
            [
              { label: "a", val: a, set: setA },
              { label: "b", val: b, set: setB },
              { label: "k", val: k, set: setK },
            ] as const
          ).map(({ label, val, set }) => (
            <div key={label}>
              <label className="mb-1 flex justify-between text-xs font-semibold text-slate-500">
                <span>
                  <TeX>{label}</TeX>
                </span>
                <span>
                  <TeX>{`${label} = ${fmt(val, 3)}`}</TeX>
                  {label === "k" && (
                    <span className="text-slate-400"> (entre f(a) et f(b))</span>
                  )}
                </span>
              </label>
              <input
                type="range"
                min={label === "k" ? kmin : preset.min}
                max={label === "k" ? kmax : preset.max}
                step={0.02}
                value={val}
                onChange={(e) => set(parseFloat(e.target.value))}
              />
            </div>
          ))}
        </div>

        <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700 ring-1 ring-slate-200">
          <div className="mb-1 flex flex-wrap gap-2 text-xs font-bold">
            <span className="text-blue-600">
              <TeX>{`A(a, f(a)) = (${fmt(a, 2)}, ${fmt(fa, 2)})`}</TeX>
            </span>
            <span className="text-orange-600">
              <TeX>{`B(b, f(b)) = (${fmt(b, 2)}, ${fmt(fb, 2)})`}</TeX>
            </span>
          </div>
          {ok ? (
            <p>
              Comme <TeX>{"f"}</TeX> est continue sur{" "}
              <TeX>{`[${fmt(a, 2)}; ${fmt(b, 2)}]`}</TeX> et que{" "}
              <TeX>{`k = ${fmt(k, 2)}`}</TeX> est compris entre{" "}
              <TeX>{`f(a) = ${fmt(fa, 2)}`}</TeX> et{" "}
              <TeX>{`f(b) = ${fmt(fb, 2)}`}</TeX>, le TVI garantit qu'il existe au
              moins un réel <TeX>{"c"}</TeX> dans{" "}
              <TeX>{`[${fmt(a, 2)}; ${fmt(b, 2)}]`}</TeX> tel que{" "}
              <TeX>{`f(c) = ${fmt(k, 2)}`}</TeX>. La droite{" "}
              <TeX>{"y = k"}</TeX> coupe bien la courbe.
            </p>
          ) : (
            <p className="font-semibold text-amber-700">
              ⚠ <TeX>{`k = ${fmt(k, 2)}`}</TeX> n'est pas compris entre{" "}
              <TeX>{`f(a) = ${fmt(fa, 2)}`}</TeX> et{" "}
              <TeX>{`f(b) = ${fmt(fb, 2)}`}</TeX> : le TVI ne s'applique pas. Déplace{" "}
              <TeX>{"k"}</TeX> à l'intérieur de cet intervalle.
            </p>
          )}
        </div>
      </figcaption>
    </figure>
  );
}