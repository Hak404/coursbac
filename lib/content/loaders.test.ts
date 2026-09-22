import { describe, expect, it } from "vitest";
import { loadSections } from "./loaders";

describe("chargeurs de sections", () => {
  it("charge les 23 sections de Limites et continuité sans altération", () => {
    const sections = loadSections("limites-continuite");
    expect(sections).toHaveLength(23);
  });

  it("toutes les sections du chapitre Math sont uniques, numérotées et classées", () => {
    const sections = loadSections("limites-continuite");
    const ids = sections.map((s) => s.id);
    expect(new Set(ids).size).toBe(23);
    const numbers = sections.map((s) => s.number).sort((a, b) => a - b);
    expect(numbers).toEqual(Array.from({ length: 23 }, (_, i) => i + 1));
    const keys = ["decouverte", "limites", "continuite", "fonctions", "entrainement"];
    for (const s of sections) {
      expect(keys).toContain(s.category);
    }
  });

  it("chaque section expose bien son composant de rendu", () => {
    const sections = loadSections("limites-continuite");
    for (const s of sections) {
      expect(typeof s.Component).toBe("function");
    }
  });

  it("charge le stub Physique-Chimie (1 section)", () => {
    const sections = loadSections("transformations-lentes-rapides");
    expect(sections).toHaveLength(1);
    expect(sections[0].category).toBe("mecanique");
    expect(typeof sections[0].Component).toBe("function");
  });

  it("renvoie une liste vide pour un slug inconnu", () => {
    expect(loadSections("inexistant")).toEqual([]);
  });
});