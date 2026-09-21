import { describe, expect, it } from "vitest";
import { makeFunction, solveNumeric, safeRound } from "./math";

describe("makeFunction", () => {
  it("évalue une expression simple", () => {
    const f = makeFunction("x^2 - 2");
    expect(f(2)).toBe(2);
  });

  it("retourne NaN pour un résultat non numérique", () => {
    const f = makeFunction("x < 3");
    expect(Number.isNaN(f(1))).toBe(true);
  });
});

describe("solveNumeric", () => {
  it("approxime sqrt(2) par dichotomie", () => {
    const f = makeFunction("x^2 - 2");
    const root = solveNumeric(f, 1, 2);
    expect(root).not.toBeNull();
    expect(Math.abs((root as number) - Math.SQRT2)).toBeLessThan(1e-8);
  });

  it("retourne null quand les bornes ont le même signe", () => {
    const f = makeFunction("x^2 + 1");
    expect(solveNumeric(f, -1, 1)).toBeNull();
  });
});

describe("safeRound", () => {
  it("arrondit à la précision demandée", () => {
    expect(safeRound(3.14159265, 2)).toBe(3.14);
    expect(safeRound(1.234567, 3)).toBe(1.235);
  });

  it("laisse intacts les entiers et valeurs non finies", () => {
    expect(safeRound(3)).toBe(3);
    expect(safeRound(Infinity)).toBe(Infinity);
    expect(Number.isNaN(safeRound(NaN))).toBe(true);
  });
});