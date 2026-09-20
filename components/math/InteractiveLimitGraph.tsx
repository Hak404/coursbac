"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useBoard } from "./useBoard";
import { fmt } from "@/lib/jxg";
import { makeFunction } from "@/lib/math";
import { useReplay } from "@/lib/replay";
import { TeX } from "@/components/ui/TeX";

const CURVE = "#6366f1";
const LEFT = "#3b82f6";
const RIGHT = "#10b981";
const TARGET = "#f59e0b";
const GRID2 = "#e2e8f0";

export function LimitReadout({
  label,
  x,
  fx,
  color,
  approaching,
}: {
  label: string;
  x: number | null;
  fx: number | null;
  color: string;
  approaching?: number | null;
}) {
  const val = (n: number | null) => (n === null ? "—" : fmt(n, 3));
  return (
    <div
      className="rounded-xl px-3 py-2 text-center text-sm ring-1 ring-slate-200"
      style={{ borderTop: `3px solid ${color}` }}
    >
      <div className="font-bold" style={{ color }}>
        {label}
      </div>
      <div className="mt-0.5 text-slate-700">
        <TeX>{`x = ${val(x)}`}</TeX>
      </div>
      <div className="text-slate-700">
        <TeX>{`f(x) = ${val(fx)}`}</TeX>
      </div>
      {approaching !== undefined && approaching !== null && x !== null && (
        <div className="mt-1 text-xs font-semibold text-slate-500">
          <TeX>{`\\to\\ ${val(approaching)}`}</TeX>
        </div>
      )}
    </div>
  );
}

type Props = {
  expr: string;
  a: number;
  approach?: "left" | "right" | "both";
  bbox?: [number, number, number, number];
  caption?: string;
  height?: number;
  leftStart?: number;
  rightStart?: number;
  limitValue?: number | null;
  auto?: boolean;
};

export default function InteractiveLimitGraph({
  expr,
  a,
  approach = "both",
  bbox = [-4.5, 11, 4.5, -2],
  caption,
  height = 380,
  leftStart = 3,
  rightStart = 3,
  limitValue = null,
  auto = false,
}: Props) {
  const f = makeFunction(expr);
  const L = limitValue !== null ? limitValue : f(a);

  const near = 0.02;
  const lo = a - 3.5;
  const hi = a + 3.5;

  const [leftX, setLeftX] = useState<number>(a - leftStart);
  const [rightX, setRightX] = useState<number>(a + rightStart);

  useEffect(() => {
    setLeftX(a - leftStart);
    setRightX(a + rightStart);
  }, [a, leftStart, rightStart]);

  const leftPt = useRef<any>(null);
  const rightPt = useRef<any>(null);
  const tweenRef = useRef<any>(null);

  const { containerRef, boardRef, jxgRef, ready } = useBoard(
    (JXG, board) => {
      const curve = board.create("functiongraph", [f, bbox[0], bbox[1]], {
        strokeColor: CURVE,
        strokeWidth: 3,
        name: "",
      });
      board.create("text", [bbox[0] + 0.4, bbox[2] - 0.5, "C_f"], {
        fontSize: 16,
        strokeColor: CURVE,
        highlightStrokeColor: CURVE,
        fixed: true,
      });

      board.create("line", [
        [a, bbox[2] + 3],
        [a, bbox[3] - 3],
      ], {
        dash: 2,
        strokeColor: GRID2,
        strokeWidth: 1,
        straightFirst: false,
        straightLast: false,
        withLabel: false,
      });

      if (Number.isFinite(L)) {
        const hole = board.create("point", [a, L], {
          size: 4,
          face: "circle",
          strokeColor: TARGET,
          fillColor: "none",
          withLabel: false,
          fixed: true,
        });
        board.create("circle", [hole, 0.08], {
          strokeColor: TARGET,
          fillColor: "none",
          strokeWidth: 2,
        });
        board.create("line", [
          [bbox[0] - 3, L],
          [bbox[1] + 3, L],
        ], {
          dash: 2,
          strokeColor: GRID2,
          strokeWidth: 1,
          straightFirst: false,
          straightLast: false,
          withLabel: false,
        });
      }

      leftPt.current = board.create("point", [leftX, f(leftX)], {
        size: 4,
        face: "circle",
        strokeColor: LEFT,
        fillColor: LEFT,
        name: "",
        withLabel: false,
      });
      rightPt.current = board.create("point", [rightX, f(rightX)], {
        size: 4,
        face: "circle",
        strokeColor: RIGHT,
        fillColor: RIGHT,
        name: "",
        withLabel: false,
      });

      const tt = board.create("text", [a - 0.15, bbox[2] - 0.7, "x = a"], {
        fontSize: 15,
        strokeColor: "#475569",
        fixed: true,
      });
      boardRef.current!.extra = { curve, tt };
    },
    bbox
  );

  useEffect(() => {
    const b = boardRef.current;
    if (b?.extra?.curve) b.extra.curve.updateCurve();
    if (leftPt.current) leftPt.current.moveTo([leftX, f(leftX)]);
    if (rightPt.current) rightPt.current.moveTo([rightX, f(rightX)]);
  }, [leftX, rightX, ready]);

  useEffect(() => () => { tweenRef.current?.kill(); }, []);

  const runAuto = () => {
    tweenRef.current?.kill();
    const targets: { start: number; end: number; set: (v: number) => void }[] = [];
    if (approach !== "right") targets.push({ start: lo, end: a - near, set: setLeftX });
    if (approach !== "left") targets.push({ start: hi, end: a + near, set: setRightX });
    const tl = gsap.timeline({ defaults: { ease: "power2.inOut", duration: 2.2 } });
    tl.to({}, {
      duration: 2.2,
      onUpdate: function () {
        const p = this.progress();
        targets.forEach((t) => t.set(t.start + (t.end - t.start) * p));
      },
    });
    tweenRef.current = tl;
  };

  useReplay(runAuto);

  const label = approach === "both" ? "à gauche" : approach === "left" ? "à gauche" : "à droite";
  const side =
    approach === "right"
      ? { x: rightX, setX: setRightX, color: RIGHT, active: true }
      : approach === "left"
        ? { x: leftX, setX: setLeftX, color: LEFT, active: true }
        : null;

  const showBoth = approach === "both";
  const read =
    approach === "right"
      ? { label: "Approche à droite", x: rightX, color: RIGHT }
      : approach === "left"
        ? { label: "Approche à gauche", x: leftX, color: LEFT }
        : null;

  const close = (x: number) => Math.abs(x - a) < near;

  return (
    <figure className="my-5 rounded-2xl bg-white p-3 shadow-card ring-1 ring-slate-200 sm:p-4">
      <div
        ref={containerRef}
        style={{ height }}
        className="mx-auto w-full overflow-hidden rounded-xl"
      />
      <figcaption className="mt-3">
        <div className="mb-3 flex flex-wrap items-center justify-center gap-2 text-sm">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 font-semibold text-indigo-700">
            <TexChip color={CURVE} /> <TeX>{`f(x) = ${expr}`}</TeX>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-slate-600">
            Cible : <TeX>{`x \\to ${a}`}</TeX>
          </span>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {(showBoth || approach === "left") && (
            <LimitReadout
              label="x à gauche"
              x={leftX}
              fx={Number.isFinite(f(leftX)) ? f(leftX) : null}
              color={LEFT}
              approaching={close(leftX) ? L : null}
            />
          )}
          {(showBoth || approach === "right") && (
            <LimitReadout
              label="x à droite"
              x={rightX}
              fx={Number.isFinite(f(rightX)) ? f(rightX) : null}
              color={RIGHT}
              approaching={close(rightX) ? L : null}
            />
          )}
        </div>

        {side && (
          <div className="mt-3">
            <label className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>
                Déplace <TeX>{`x`}</TeX> avec le curseur
              </span>
              <span>
                {close(side.x) ? (
                  <span className="text-emerald-600">
                    <TeX>{`x \\to ${a} \\Rightarrow f(x) \\to ${fmt(L)}`}</TeX>
                  </span>
                ) : (
                  <span>rapproche <TeX>{`x`}</TeX> de <TeX>{`${a}`}</TeX></span>
                )}
              </span>
            </label>
            <input
              type="range"
              min={lo}
              max={hi}
              step={0.01}
              value={side.x}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                if (Math.abs(v - a) < near) side.setX(a + (approach === "right" ? near : -near));
                else side.setX(v);
              }}
            />
            <div className="mt-1 flex justify-between text-xs text-slate-400">
              <span>{lo}</span>
              <span className="font-bold text-slate-500">{a}</span>
              <span>{hi}</span>
            </div>
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {auto && (
            <button
              type="button"
              onClick={runAuto}
              className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
            >
              ▶ Approche automatique ({label})
            </button>
          )}
          {close(showBoth ? leftX : side?.x ?? 0) &&
            (showBoth ? close(rightX) : true) && (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                f(x) se rapproche de <TeX>{`${fmt(L)}`}</TeX>
              </span>
            )}
        </div>

        <ApproachTable
          a={a}
          f={f}
          approach={approach}
          sideColor={approach === "right" ? RIGHT : LEFT}
          target={L}
        />

        {caption && (
          <p className="mt-2 text-center text-xs text-slate-500">{caption}</p>
        )}
      </figcaption>
    </figure>
  );
}

function TexChip({ color }: { color: string }) {
  return (
    <span
      className="inline-block h-3 w-5 rounded-full"
      style={{ background: color }}
    />
  );
}

function ApproachTable({
  a,
  f,
  approach,
  sideColor,
  target,
}: {
  a: number;
  f: (x: number) => number;
  approach: "left" | "right" | "both";
  sideColor: string;
  target: number;
}) {
  const steps = [2, 1, 0.5, 0.25, 0.1];
  const leftRows =
    approach !== "right"
      ? steps.map((d) => ({ label: `x \\to ${a}^{-}`, x: a - d }))
      : [];
  const rightRows =
    approach !== "left"
      ? steps.map((d) => ({ label: `x \\to ${a}^{+}`, x: a + d }))
      : [];

  const all = [...leftRows, ...rightRows];
  const [lim, setLim] = useState(1);

  useReplay(() => setLim(1));

  if (all.length === 0) return null;
  const rows = all.slice(0, Math.min(lim, all.length));
  const allDone = lim >= all.length;

  return (
    <div className="mt-4 overflow-hidden rounded-xl ring-1 ring-slate-200">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-3 py-1.5">
        <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
          Tableau de valeurs
        </span>
        <span className="text-[11px] font-medium text-slate-400">
          {lim} / {all.length} lignes
        </span>
      </div>
      <table className="w-full text-sm tabular-nums">
        <thead>
          <tr className="bg-white text-xs text-slate-400">
            <th className="px-2 py-1 text-left font-semibold">
              <TeX>{approach === "right" ? "x → a⁺" : "x → a⁻"}</TeX>
            </th>
            <th className="px-2 py-1 text-right font-semibold">f(x)</th>
            {approach === "both" && (
              <>
                <th className="px-1 py-1 text-right text-slate-300">|</th>
                <th className="px-2 py-1 text-right font-semibold">
                  <TeX>{"x → a⁺"}</TeX>
                </th>
                <th className="px-2 py-1 text-right font-semibold">f(x)</th>
              </>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {rows.map((r, i) => {
            const v = f(r.x);
            const fx = Number.isFinite(v) ? v : null;
            const nearish = Math.abs(r.x - a) < 0.6;
            const isLeft = approach !== "right";
            const xCell = (over: string) => (
              <td className="px-2 py-1 text-left text-slate-600">
                <TeX>{`${over} ${fmt(r.x, 3)}`}</TeX>
              </td>
            );
            const fxCell = (extra: string) => (
              <td className={`px-2 py-1 text-right font-medium ${nearish ? "text-primary-700" : "text-slate-700"}`}>
                <TeX>{`${extra}${fx === null ? "—" : fmt(fx, 4)}`}</TeX>
              </td>
            );
            return (
              <tr key={`${r.x}-${i}`} className={nearish ? "bg-indigo-50/60" : "bg-white"}>
                {approach === "both" ? (
                  <>
                    {xCell(isLeft ? "… " : "")}
                    {fxCell(isLeft ? "" : "")}
                    <td className="px-1 py-1 text-right text-slate-300">|</td>
                    {xCell(isLeft ? "" : "… ")}
                    {fxCell("")}
                  </>
                ) : (
                  <>
                    {xCell("… ")}
                    {fxCell("")}
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="flex items-center justify-between gap-2 border-t border-slate-100 bg-slate-50 px-3 py-1.5">
        <button
          type="button"
          onClick={() => setLim((l) => Math.min(all.length, l + 1))}
          disabled={allDone}
          className="rounded-lg bg-primary-600 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-primary-700 disabled:opacity-40"
        >
          + Afficher la ligne suivante
        </button>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400">
            en haut de tableau : <TeX>{`x ${leftRows.length && rightRows.length ? "des deux côtés" : leftRows.length ? "à gauche" : "à droite"}`}</TeX>
          </span>
          <button
            type="button"
            onClick={() => setLim(all.length)}
            disabled={allDone}
            className="rounded-lg px-2 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-200 disabled:opacity-40"
          >
            Tout afficher
          </button>
        </div>
      </div>
      <div className="border-t border-slate-50 bg-slate-50/60 px-3 py-1.5 text-center text-[11px] text-slate-400" style={{ borderTopColor: `${sideColor}33` }}>
        <TeX>{`${fmt(all[all.length - 1].x, 3)}\\;\\to\\; ${a} \\;\\Rightarrow\\; f(x)\\;\\to\\; ${fmt(target, 3)}`}</TeX>
      </div>
    </div>
  );
}