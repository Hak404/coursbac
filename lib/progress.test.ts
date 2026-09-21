import { afterEach, describe, expect, it } from "vitest";
import { loadProgress, saveQuiz, saveVisited, saveLast } from "./progress";

const store = new Map<string, string>();

function installWindow() {
  (globalThis as Record<string, unknown>).window = {
    localStorage: {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
      key: (i: number) => Array.from(store.keys())[i] ?? null,
      length: store.size,
      clear: () => store.clear(),
    },
  };
}

afterEach(() => {
  store.clear();
  delete (globalThis as Record<string, unknown>).window;
});

describe("progress de visite (SSR-safe)", () => {
  it("sans window, loadProgress rend les valeurs par défaut", () => {
    expect(loadProgress()).toEqual({ visited: [], last: "intro", quizBest: null });
  });

  it("sauve et recharge la liste des sections visitées", () => {
    installWindow();
    saveVisited(["intro", "proprietes"]);
    saveLast("pieges");
    const p = loadProgress();
    expect(p.visited).toEqual(["intro", "proprietes"]);
    expect(p.last).toBe("pieges");
  });
});

describe("saveQuiz ne conserve que le meilleur score", () => {
  it("améliore le record", () => {
    installWindow();
    expect(saveQuiz(5)).toBe(5);
    expect(saveQuiz(8)).toBe(8);
    expect(loadProgress().quizBest).toBe(8);
  });

  it("ne régresse pas vers un score plus faible", () => {
    installWindow();
    saveQuiz(8);
    expect(saveQuiz(3)).toBe(8);
    expect(loadProgress().quizBest).toBe(8);
  });
});