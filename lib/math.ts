import { evaluate } from "mathjs";

export type Fu = (x: number) => number;

export function makeFunction(
  expr: string
): (x: number) => number {
  return (x: number) => {
    const r = evaluate(expr, { x });
    return typeof r === "number" ? r : NaN;
  };
}

export function solveNumeric(
  f: Fu,
  a: number,
  b: number,
  maxIter = 100
): number | null {
  let lo = a;
  let hi = b;
  let fLo = f(lo);
  const fHi = f(hi);
  if (Math.sign(fLo) === Math.sign(fHi) || !Number.isFinite(fHi)) return null;
  for (let i = 0; i < maxIter; i++) {
    const mid = (lo + hi) / 2;
    const fMid = f(mid);
    if (!Number.isFinite(fMid)) {
      lo = mid;
      continue;
    }
    if (Math.sign(fLo) * Math.sign(fMid) <= 0) {
      hi = mid;
    } else {
      lo = mid;
      fLo = fMid;
    }
    if (Math.abs(hi - lo) < 1e-9) break;
  }
  return (lo + hi) / 2;
}

export function safeRound(v: number, digits = 4): number {
  if (!Number.isFinite(v)) return v;
  const p = 10 ** digits;
  return Math.round(v * p) / p;
}