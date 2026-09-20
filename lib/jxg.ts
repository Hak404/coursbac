export type Jxg = any;
export type Board = any;

let cached: Promise<Jxg> | null = null;

export function loadJXG(): Promise<Jxg> {
  if (!cached) {
    cached = import("jsxgraph").then((m) => (m.default as Jxg) ?? m);
  }
  return cached;
}

export const fmt = (n: number, digits = 3): string => {
  if (!Number.isFinite(n)) return n > 0 ? "+∞" : n < 0 ? "-∞" : "∞";
  if (Number.isInteger(n)) return String(n);
  const r = Math.round(n * 10 ** digits) / 10 ** digits;
  return String(r);
};

export const closeEnough = (a: number, b: number, eps = 1e-9): boolean =>
  Math.abs(a - b) < eps;