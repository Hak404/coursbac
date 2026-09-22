import { describe, expect, it } from "vitest";
import {
  CHAPTERS_META,
  courseHref,
  findChapterByPath,
  getChapterMeta,
  getChapterPaths,
  presentationHref,
} from "./registry";

describe("registre académique", () => {
  it("résout le chapitre Limites et continuité par chemin", () => {
    const ch = findChapterByPath("math", "2bac", "limites-continuite");
    expect(ch).not.toBeNull();
    expect(ch?.title).toBe("Limites et continuité");
    expect(ch?.subjectLabel).toBe("Mathématiques");
    expect(ch?.progressScope).toBe("limites");
  });

  it("les catégories du chapitre sont définies pour les 5 blocs pédagogiques", () => {
    const ch = findChapterByPath("math", "2bac", "limites-continuite")!;
    expect(ch.categories.map((c) => c.label)).toEqual([
      "Découverte",
      "Les limites",
      "La continuité",
      "Fonctions fondamentales",
      "S'entraîner",
    ]);
  });

  it("résout le stub Physique-Chimie (Transformations lentes et rapides)", () => {
    const ch = findChapterByPath("physique", "2bac", "transformations-lentes-rapides");
    expect(ch).not.toBeNull();
    expect(ch?.subjectLabel).toBe("Physique-Chimie");
    expect(ch?.moduleLabel).toBe("MÉCANIQUE");
    expect(ch?.badgeLabel).toContain("Chapitre 1");
  });

  it("renvoie null pour un chemin inconnu ou un couple sujet/niveau incohérent", () => {
    expect(findChapterByPath("physique", "2bac", "limites-continuite")).toBeNull();
    expect(findChapterByPath("math", "1bac", "limites-continuite")).toBeNull();
    expect(findChapterByPath("math", "2bac", "inexistant")).toBeNull();
    expect(getChapterMeta("inexistant")).toBeNull();
  });

  it("tous les chemins générés sont résolvables", () => {
    const paths = getChapterPaths();
    expect(paths.length).toBeGreaterThanOrEqual(2);
    for (const p of paths) {
      expect(findChapterByPath(p.subject, p.level, p.slug)).not.toBeNull();
    }
  });

  it("la métadonnée n'embarque aucune référence aux composants de section", () => {
    const ch = CHAPTERS_META["limites-continuite"];
    expect(JSON.stringify(ch)).not.toContain("Component");
  });

  it("génère les URLs canoniques", () => {
    const ch = CHAPTERS_META["limites-continuite"];
    expect(courseHref(ch)).toBe("/cours/math/2bac/limites-continuite");
    expect(presentationHref(ch)).toBe("/presentation/math/2bac/limites-continuite");
  });
});