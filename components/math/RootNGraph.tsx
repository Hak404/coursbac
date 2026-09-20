"use client";

import { useEffect, useRef, useState } from "react";
import { useBoard } from "./useBoard";
import { TeX } from "@/components/ui/TeX";

const CURVE = "#6366f1";
const ROOT = "#10b981";
const AXIS = "#94a3b8";

export default function RootNGraph({
  height = 400,
  bbox = [-3.2, 4.8, 3.4, -3.2],
}: {
  height?: number;
  bbox?: [number, number, number, number];
}) {
  const [n, setN] = useState(3);

  const { containerRef, boardRef, ready } = useBoard(
    (JXG, board) => {
      const fn = (p: number) => (x: number) => Math.pow(x, p);
      const rootFn = (p: number) => (x: number) =>
        x < 0 ? (p % 2 === 1 ? -Math.pow(-x, 1 / p) : NaN) : Math.pow(x, 1 / p);
      const c1 = board.create("functiongraph", [fn(n), bbox[0], bbox[1]], {
        strokeColor: CURVE,
        strokeWidth: 3,
        name: "",
      });
      const c2 = board.create("functiongraph", [rootFn(n), bbox[0], bbox[1]], {
        strokeColor: ROOT,
        strokeWidth: 3,
        dash: 1,
        name: "",
      });
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
      board.create("text", [bbox[0] + 0.4, bbox[2] - 0.6, "xⁿ"], {
        fontSize: 17,
        strokeColor: CURVE,
        fixed: true,
      });
      board.create("text", [bbox[1] - 1.9, bbox[3] + 1, "√[x]ⁿ"], {
        fontSize: 17,
        strokeColor: ROOT,
        fixed: true,
      });
      board.extra = { c1, c2 };
    },
    bbox
  );

  useEffect(() => {
    const b = boardRef.current;
    if (!b) return;
    const param = n;
    b.extra.c1.setFunction((x: number) => Math.pow(x, param));
    b.extra.c1.updateCurve();
    b.extra.c2.setFunction((x: number) =>
      x < 0 ? (param % 2 === 1 ? -Math.pow(-x, 1 / param) : NaN) : Math.pow(x, 1 / param)
    );
    b.extra.c2.updateCurve();
  }, [n, ready]);

  return (
    <figure className="my-5 rounded-2xl bg-white p-3 shadow-card ring-1 ring-slate-200 sm:p-4">
      <div
        ref={containerRef}
        style={{ height }}
        className="mx-auto w-full overflow-hidden rounded-xl"
      />
      <figcaption className="mt-3 space-y-3">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="mr-1 text-sm font-semibold text-slate-600">Choisis n :</span>
          {[2, 3, 4, 5, 6].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setN(v)}
              className={`h-9 w-9 rounded-xl text-sm font-bold transition ${
                v === n
                  ? "bg-primary-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <TeX>{`${v}`}</TeX>
            </button>
          ))}
        </div>
        <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700 ring-1 ring-slate-200">
          <span className="font-bold text-indigo-700">
            <TeX>{`g : x \\mapsto x^${n}`}</TeX>
          </span>{" "}
          est continue et strictement croissante sur <TeX>{"\\mathbb{R}^+"}</TeX>, d'image{" "}
          <TeX>{"\\mathbb{R}^+"}</TeX>. Sa réciproque est la fonction racine{"  "}
          <TeX>{`${n}`}</TeX>-ième : <TeX>{`\\sqrt[${n}]{y} = x \\iff y = x^${n}`}</TeX>.
          <span className="mt-1 block">
            Les deux courbes sont symétriques par rapport à <TeX>{"y = x"}</TeX>.
          </span>
        </div>
      </figcaption>
    </figure>
  );
}