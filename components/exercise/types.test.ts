import { describe, expect, it } from "vitest";
import { coerceNumber } from "./types";

describe("coerceNumber", () => {
  it("accepte la virgule décimale française", () => {
    expect(coerceNumber("2,5")).toBe(2.5);
  });

  it("normalise le signe moins typographique", () => {
    expect(coerceNumber("−3")).toBe(-3);
  });

  it("évalue une expression arithmétique", () => {
    expect(coerceNumber("3/2")).toBe(1.5);
    expect(coerceNumber("2 + 3")).toBe(5);
  });

  it("rejette une entrée invalide", () => {
    expect(coerceNumber("abc")).toBeNull();
    expect(coerceNumber("2x")).toBeNull();
    expect(coerceNumber("")).toBeNull();
  });
});