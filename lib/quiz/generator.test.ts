import { describe, expect, it } from "vitest";
import {
  generateQuestions,
  QUIZ_CHAPTER_SLUGS,
  randomQuizCode,
  supportsQuiz,
} from "./generator";

describe("générateur dynamique de QCM", () => {
  it("génère le nombre demandé de questions pour les chapitres supportés", () => {
    for (const slug of QUIZ_CHAPTER_SLUGS) {
      const qs = generateQuestions(slug, 5);
      expect(qs).toHaveLength(5);
      for (const q of qs) {
        expect(q.chapterSlug).toBe(slug);
        expect(q.questionText.length).toBeGreaterThan(5);
        expect(q.options.length).toBeGreaterThanOrEqual(2);
        expect(q.correctOptionIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctOptionIndex).toBeLessThan(q.options.length);
        expect(q.variableParams).toBeTruthy();
      }
    }
  });

  it("génère des valeurs numériques distinctes entre deux tirages", () => {
    const a = generateQuestions("transformations-lentes-rapides", 10);
    const b = generateQuestions("transformations-lentes-rapides", 10);
    const paramsA = a.map((q) => JSON.stringify(q.variableParams));
    const paramsB = b.map((q) => JSON.stringify(q.variableParams));
    // statistiquement, un doublon complet de 10 paramétrisations est quasi impossible
    expect(paramsA).not.toEqual(paramsB);
  });

  it("borne le nombre de questions à [1, 10]", () => {
    expect(generateQuestions("limites-continuite", 0)).toHaveLength(1);
    expect(generateQuestions("limites-continuite", 99)).toHaveLength(10);
  });

  it("retombe sur un modèle générique pour un chapitre inconnu", () => {
    const qs = generateQuestions("chapitre-inexistant", 2);
    expect(qs).toHaveLength(2);
    expect(qs[0].options).toContain(qs[0].correctOptionIndex !== undefined ? qs[0].options[qs[0].correctOptionIndex] : "");
  });

  it("supportsQuiz est vrai pour les chapitres connus", () => {
    expect(supportsQuiz("limites-continuite")).toBe(true);
    expect(supportsQuiz("transformations-lentes-rapides")).toBe(true);
    expect(supportsQuiz("quelquechose")).toBe(false);
  });

  it("génère des codes à 6 chiffres uniques", () => {
    const used = new Set<string>();
    for (let i = 0; i < 20; i++) {
      const code = randomQuizCode(used);
      expect(/^\d{6}$/.test(code)).toBe(true);
      used.add(code);
    }
    expect(used.size).toBe(20);
  });
});