"use client";

import { useMemo } from "react";
import { makeFunction } from "@/lib/math";

function buildPathPoints(
  fn: (x: number) => number,
  x0: number,
  x1: number,
  steps = 220
): string {
  const pt: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const x = x0 + ((x1 - x0) * i) / steps;
    const y = fn(x);
    if (!Number.isFinite(y) || Math.abs(y) > 200) {
      pt.push("skip");
      continue;
    }
    const px = ((x - x0) / (x1 - x0)) * 320;
    const py = 190 - ((y + 5) / 10) * 190;
    pt.push(`${px.toFixed(1)},${py.toFixed(1)}`);
  }
  return pt.join(" ");
}

export default function MiniCurve({
  expr,
  holeX,
  holeY,
  width = "100%",
}: {
  expr: string;
  holeX?: number;
  holeY?: number;
  width?: string;
}) {
  const fn = useMemo(() => makeFunction(expr), [expr]);
  const pts = useMemo(() => buildPathPoints(fn, -5, 5), [fn]);

  return (
    <svg
      viewBox="-20 -12 360 214"
      width={width}
      height={90}
      className="rounded-lg bg-white ring-1 ring-slate-200"
    >
      <line x1="0" y1="190" x2="320" y2="190" stroke="#cbd5e1" strokeWidth="1.5" />
      <line x1="160" y1="0" x2="160" y2="190" stroke="#cbd5e1" strokeWidth="1.5" />
      <g stroke="#6366f1" strokeWidth="3" fill="none" strokeLinecap="round">
        {pts
          .split(" skip ")
          .filter(Boolean)
          .map((seg, i) => (
            <polyline key={i} points={seg} />
          ))}
      </g>
      {holeX !== undefined && holeY !== undefined && (
        <>
          <circle
            cx={160 + (holeX / 5) * 160}
            cy={190 - ((holeY + 5) / 10) * 190}
            r={0}
            fill="none"
          />
          <circle
            cx={160 + (holeX / 5) * 160}
            cy={190 - ((holeY + 5) / 10) * 190}
            r={5}
            fill="none"
            stroke="#f59e0b"
            strokeWidth={2.5}
          />
        </>
      )}
    </svg>
  );
}