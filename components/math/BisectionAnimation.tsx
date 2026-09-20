"use client";

import { useEffect, useRef, useState } from "react";
import { useBoard } from "./useBoard";
import { fmt } from "@/lib/jxg";
import { useReplay } from "@/lib/replay";
import { TeX } from "@/components/ui/TeX";

const f = (x: number) => x * x - 2;
const LO = 1;
const HI = 2;
const TOL = 1e-4;
const MAX_ITER = 60;

type Iv = { lo: number; hi: number; iter: number };

function nextStep(iv: Iv): Iv {
  const m = (iv.lo + iv.hi) / 2;
  const fm = f(m);
  if (f(iv.lo) * fm <= 0) return { ...iv, hi: m, iter: iv.iter + 1 };
  return { ...iv, lo: m, iter: iv.iter + 1 };
}

export default function BisectionAnimation({
  height = 400,
  bbox = [-1.2, 3.6, 4.6, -4.4],
}: {
  height?: number;
  bbox?: [number, number, number, number];
}) {
  const [iv, setIv] = useState<Iv>({ lo: LO, hi: HI, iter: 0 });
  const [auto, setAuto] = useState(false);
  const timerRef = useRef<any>(null);

  const { containerRef, boardRef, ready } = useBoard(
    (JXG, board) => {
      board.create("functiongraph", [f, bbox[0], bbox[1]], {
        strokeColor: "#6366f1",
        strokeWidth: 3,
        name: "",
      });
      board.create("text", [bbox[0] + 0.3, bbox[2] - 0.5, "C_f"], {
        fontSize: 16,
        strokeColor: "#6366f1",
        fixed: true,
      });
      const loPt = board.create("point", [LO, f(LO)], {
        size: 4,
        strokeColor: "#3b82f6",
        fillColor: "#3b82f6",
        withLabel: false,
      });
      const hiPt = board.create("point", [HI, f(HI)], {
        size: 4,
        strokeColor: "#f97316",
        fillColor: "#f97316",
        withLabel: false,
      });
      const midPt = board.create("point", [(LO + HI) / 2, f((LO + HI) / 2)], {
        size: 4,
        strokeColor: "#0d9488",
        fillColor: "#0d9488",
        withLabel: false,
      });
      const band = board.create("segment", [
        [LO, bbox[3] + 0.6],
        [HI, bbox[3] + 0.6],
      ], {
        strokeColor: "#059669",
        strokeWidth: 6,
        straightLast: false,
        straightFirst: false,
        withLabel: false,
      });
      board.extra = { loPt, hiPt, midPt, band };
    },
    bbox
  );

  const updateGraph = (next: Iv) => {
    const b = boardRef.current;
    if (!b) return;
    b.extra.loPt.moveTo([next.lo, f(next.lo)]);
    b.extra.hiPt.moveTo([next.hi, f(next.hi)]);
    const m = (next.lo + next.hi) / 2;
    b.extra.midPt.moveTo([m, f(m)]);
    b.extra.band.setPoint(0, [1, next.lo, bbox[3] + 0.6]);
    b.extra.band.setPoint(1, [1, next.hi, bbox[3] + 0.6]);
  };

  useEffect(() => {
    if (ready) updateGraph(iv);
  }, [iv, ready]);

  const step = () => {
    setIv((prev) => {
      const nxt = nextStep(prev);
      updateGraph(nxt);
      return nxt;
    });
  };

  useReplay(step);

  const reset = () => {
    setAuto(false);
    const init: Iv = { lo: LO, hi: HI, iter: 0 };
    setIv(init);
    updateGraph(init);
  };

  useEffect(() => {
    if (!auto) return;
    timerRef.current = window.setInterval(() => {
      setIv((prev) => {
        if (Math.abs(prev.hi - prev.lo) < TOL || prev.iter >= MAX_ITER) {
          window.clearInterval(timerRef.current);
          setAuto(false);
          return prev;
        }
        const nxt = nextStep(prev);
        updateGraph(nxt);
        return nxt;
      });
    }, 320);
    return () => window.clearInterval(timerRef.current);
  }, [auto]);

  const stop = Math.abs(iv.hi - iv.lo) < TOL || iv.iter >= MAX_ITER;
  const mid = (iv.lo + iv.hi) / 2;

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
            <TeX>{"f(x) = x^2 - 2"}</TeX>
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
            On cherche <TeX>{"\\sqrt{2}"}</TeX> dans <TeX>{"[1 ; 2]"}</TeX>
          </span>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="rounded-xl bg-blue-50 px-3 py-2 text-center text-sm ring-1 ring-blue-200">
            <div className="text-xs font-semibold text-blue-700">a</div>
            <TeX>{`a = ${fmt(iv.lo, 6)}`}</TeX>
          </div>
          <div className="rounded-xl bg-orange-50 px-3 py-2 text-center text-sm ring-1 ring-orange-200">
            <div className="text-xs font-semibold text-orange-700">b</div>
            <TeX>{`b = ${fmt(iv.hi, 6)}`}</TeX>
          </div>
          <div className="rounded-xl bg-teal-50 px-3 py-2 text-center text-sm ring-1 ring-teal-200">
            <div className="text-xs font-semibold text-teal-700">milieu m</div>
            <TeX>{`m = ${fmt(mid, 6)}`}</TeX>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={step}
            disabled={stop}
            className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-40"
          >
            ▶ Étape suivante
          </button>
          <button
            type="button"
            onClick={() => setAuto(!auto)}
            disabled={stop}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-40"
          >
            {auto ? "⏸ Pause" : "⏩ Lecture automatique"}
          </button>
          <button
            type="button"
            onClick={reset}
            className="rounded-xl bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-300"
          >
            ⟲ Réinitialiser
          </button>
          <span className="rounded-full bg-violet-100 px-3 py-1 text-sm font-bold text-violet-700">
            Itérations : {iv.iter}
          </span>
        </div>
        {stop && (
          <div className="rounded-xl bg-emerald-50 px-4 py-2 text-sm text-emerald-900 ring-1 ring-emerald-200">
            L'intervalle est très petit (<TeX>{`< ${fmt(TOL)}`}</TeX>). On obtient{" "}
            <TeX>{`\\alpha \\approx ${fmt(mid, 4)}`}</TeX>, à comparer à{" "}
            <TeX>{`\\sqrt{2} \\approx ${fmt(Math.sqrt(2), 4)}`}</TeX>. ✔
          </div>
        )}
        {!stop && iv.iter > 0 && (
          <p className="text-center text-xs text-slate-500">
            À chaque étape on garde la moitié où <TeX>{"f"}</TeX> change de signe : la largeur de l'intervalle est divisée par 2.
          </p>
        )}
      </figcaption>
    </figure>
  );
}