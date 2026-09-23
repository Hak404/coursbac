import { describe, expect, it } from "vitest";
import { CHAPTERS_META } from "@/lib/content/registry";
import {
  EMPTY_FORM,
  allChapterOptions,
  buildAssignmentPayload,
  chapterOptionTitle,
  chaptersForSelection,
  countSelected,
  difficultyLabel,
  distinctLevels,
  distinctSubjects,
  draftHasChanges,
  draftToForm,
  draftToSelected,
  dueDateToInputValue,
  filterQuestionsByDifficulty,
  formatDueDate,
  inputValueToDueDate,
  isQuestionSelected,
  isAssignmentStatus,
  levelsForSubject,
  moveSelected,
  removeSelected,
  setSelectedPoints,
  statusIcon,
  statusLabel,
  subjectOptionTitle,
  toggleQuestion,
  validateForm,
} from "./professor-ui";
import type { Assignment, BankQuestion } from "./professor-ui";

const QUESTION: BankQuestion = {
  id: "q1",
  chapterSlug: "limites-continuite",
  title: "Limite d'une somme",
  formula: null,
  options: ["a", "b", "c"],
  correctOptionIndex: 1,
  difficulty: "MEDIUM",
  isTemplate: false,
};

const QUESTION_2: BankQuestion = {
  id: "q2",
  chapterSlug: "limites-continuite",
  title: "Continuité",
  formula: "f(x)=x^2",
  options: ["oui", "non"],
  correctOptionIndex: 0,
  difficulty: "HARD",
  isTemplate: false,
};

function draft(): Assignment {
  return {
    id: "ass-1",
    accessCode: "ABC234",
    title: "Devoir sur les limites",
    instructions: "À rendre avant dimanche.",
    subjectSlug: "math",
    levelSlug: "2bac",
    chapterSlug: "limites-continuite",
    status: "DRAFT",
    createdById: "prof-1",
    dueDate: "2026-06-01T12:00:00.000Z",
    attemptLimit: 2,
    showFeedback: true,
    createdAt: "2026-05-01T00:00:00.000Z",
    updatedAt: "2026-05-01T00:00:00.000Z",
    questions: [
      {
        id: "aq1",
        index: 0,
        title: "Limite d'une somme",
        formula: null,
        options: ["a", "b", "c"],
        correctOptionIndex: 1,
        difficulty: "MEDIUM",
        points: 1,
        sourceQuestionId: "q1",
      },
      {
        id: "aq2",
        index: 1,
        title: "Continuité",
        formula: "f(x)=x^2",
        options: ["oui", "non"],
        correctOptionIndex: 0,
        difficulty: "HARD",
        points: 2,
        sourceQuestionId: "q2",
      },
    ],
  };
}

describe("status helpers", () => {
  it("labels and icons for known statuses", () => {
    expect(statusLabel("DRAFT")).toBe("Brouillon");
    expect(statusLabel("PUBLISHED")).toBe("Publié");
    expect(statusLabel("CLOSED")).toBe("Fermé");
    expect(statusIcon("DRAFT")).toBe("◦");
    expect(statusIcon("PUBLISHED")).toBe("✓");
  });
  it("falls back for unknown status", () => {
    expect(statusLabel("WEIRD")).toBe("WEIRD");
    expect(statusIcon("WEIRD")).toBe("•");
    expect(isAssignmentStatus("DRAFT")).toBe(true);
    expect(isAssignmentStatus("OTHER")).toBe(false);
  });
});

describe("difficulty labels", () => {
  it("maps EASY/MEDIUM/HARD", () => {
    expect(difficultyLabel("EASY")).toBe("Facile");
    expect(difficultyLabel("MEDIUM")).toBe("Moyenne");
    expect(difficultyLabel("HARD")).toBe("Difficile");
    expect(difficultyLabel("OTHER")).toBe("OTHER");
  });
});

describe("filterQuestionsByDifficulty", () => {
  it("returns everything when no difficulty is requested", () => {
    expect(filterQuestionsByDifficulty([QUESTION, QUESTION_2], "")).toHaveLength(2);
  });
  it("keeps only matching questions", () => {
    const filtered = filterQuestionsByDifficulty([QUESTION, QUESTION_2], "HARD");
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe("q2");
  });
  it("returns an empty list when nothing matches", () => {
    expect(filterQuestionsByDifficulty([QUESTION, QUESTION_2], "EASY")).toEqual([]);
  });
});

describe("validateForm", () => {
  it("flags missing required fields", () => {
    const errors = validateForm(EMPTY_FORM);
    expect(errors.title).toBe("Le titre est obligatoire.");
    expect(errors.subject).toBeTruthy();
    expect(errors.level).toBeTruthy();
    expect(errors.chapter).toBeTruthy();
  });
  it("rejects attemptLimit below 1", () => {
    const errors = validateForm({
      ...EMPTY_FORM,
      title: "T",
      subjectSlug: "math",
      levelSlug: "2bac",
      chapterSlug: "limites-continuite",
      attemptLimit: 0,
    });
    expect(errors.attemptLimit).toBeTruthy();
  });
  it("accepts a complete valid form", () => {
    const errors = validateForm({
      ...EMPTY_FORM,
      title: "Devoir",
      subjectSlug: "math",
      levelSlug: "2bac",
      chapterSlug: "limites-continuite",
      attemptLimit: 1,
    });
    expect(errors).toEqual({});
  });
});

describe("question selection", () => {
  it("adds a question once and deduplicates on second toggle", () => {
    const once = toggleQuestion([], QUESTION);
    expect(once).toHaveLength(1);
    expect(once[0]).toEqual({ bankQuestionId: "q1", title: "Limite d'une somme", points: 1 });
    expect(isQuestionSelected(once, "q1")).toBe(true);
    const twice = toggleQuestion(once, QUESTION);
    expect(twice).toHaveLength(0);
  });
  it("keeps list order and appends", () => {
    const first = toggleQuestion([], QUESTION);
    const second = toggleQuestion(first, QUESTION_2);
    expect(second.map((s) => s.bankQuestionId)).toEqual(["q1", "q2"]);
    expect(countSelected(second)).toBe(2);
  });
  it("removes a question", () => {
    const first = toggleQuestion([], QUESTION);
    const second = toggleQuestion(first, QUESTION_2);
    const reduced = removeSelected(second, "q1");
    expect(reduced.map((s) => s.bankQuestionId)).toEqual(["q2"]);
  });
  it("moves questions up and down", () => {
    const selected: ReturnType<typeof toggleQuestion> = [];
    const with2 = toggleQuestion(toggleQuestion(selected, QUESTION), QUESTION_2);
    const down = moveSelected(with2, 0, 1);
    expect(down.map((s) => s.bankQuestionId)).toEqual(["q2", "q1"]);
    const up = moveSelected(down, 1, -1);
    expect(up.map((s) => s.bankQuestionId)).toEqual(["q1", "q2"]);
  });
  it("does not move beyond bounds", () => {
    const selected = toggleQuestion([], QUESTION);
    expect(moveSelected(selected, 0, -1)).toEqual(selected);
    expect(moveSelected(selected, 9, 1)).toEqual(selected);
  });
  it("updates points only for a valid value", () => {
    const selected = toggleQuestion([], QUESTION);
    const updated = setSelectedPoints(selected, "q1", 3);
    expect(updated[0].points).toBe(3);
    const invalid = setSelectedPoints(selected, "q1", 0);
    expect(invalid[0].points).toBe(1);
  });
});

describe("payload construction", () => {
  it("builds a create payload with ordered indices and default points", () => {
    const selected = toggleQuestion(toggleQuestion([], QUESTION), QUESTION_2);
    const payload = buildAssignmentPayload(
      {
        ...EMPTY_FORM,
        title: "  Devoir  ",
        instructions: "  Consigne  ",
        subjectSlug: "math",
        levelSlug: "2bac",
        chapterSlug: "limites-continuite",
        attemptLimit: 2,
      },
      selected
    );
    expect(payload.title).toBe("Devoir");
    expect(payload.instructions).toBe("Consigne");
    expect(payload.subjectSlug).toBe("math");
    expect(payload.attemptLimit).toBe(2);
    expect(payload.showFeedback).toBe(true);
    expect(payload.questions).toEqual([
      { sourceQuestionId: "q1", index: 0, points: 1 },
      { sourceQuestionId: "q2", index: 1, points: 1 },
    ]);
  });
  it("turns an empty instructions into null and empty dueDate into null", () => {
    const payload = buildAssignmentPayload(
      { ...EMPTY_FORM, title: "T", subjectSlug: "math", levelSlug: "2bac", chapterSlug: "x" },
      []
    );
    expect(payload.instructions).toBeNull();
    expect(payload.dueDate).toBeNull();
    expect(payload.questions).toEqual([]);
  });
  it("honours configured points", () => {
    const selected = setSelectedPoints(toggleQuestion([], QUESTION), "q1", 2.5);
    const payload = buildAssignmentPayload(
      { ...EMPTY_FORM, title: "T", subjectSlug: "math", levelSlug: "2bac", chapterSlug: "x" },
      selected
    );
    expect(payload.questions[0].points).toBe(2.5);
  });
});

describe("date helpers", () => {
  it("converts ISO to datetime-local input and back", () => {
    const input = dueDateToInputValue("2026-06-01T12:00:00.000Z");
    expect(input).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    const iso = inputValueToDueDate(input);
    expect(iso).toBeTruthy();
    expect(new Date(iso!).getTime()).toBe(new Date(input).getTime());
  });
  it("handles empty values", () => {
    expect(dueDateToInputValue(null)).toBe("");
    expect(inputValueToDueDate("")).toBeNull();
    expect(inputValueToDueDate("pas-une-date")).toBeNull();
  });
  it("formats due dates for display", () => {
    expect(formatDueDate(null)).toBe("Aucune date limite");
    expect(formatDueDate("2026-06-01T12:00:00.000Z")).toContain("juin");
  });
});

describe("draft mapping", () => {
  it("maps a draft to form values", () => {
    const form = draftToForm(draft());
    expect(form.title).toBe("Devoir sur les limites");
    expect(form.instructions).toBe("À rendre avant dimanche.");
    expect(form.subjectSlug).toBe("math");
    expect(form.chapterSlug).toBe("limites-continuite");
    expect(form.attemptLimit).toBe(2);
    expect(form.dueDate).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
  it("maps a draft to ordered selected questions", () => {
    const selected = draftToSelected(draft());
    expect(selected).toEqual([
      { bankQuestionId: "q1", title: "Limite d'une somme", points: 1 },
      { bankQuestionId: "q2", title: "Continuité", points: 2 },
    ]);
  });
  it("detects changes", () => {
    const initial = draft();
    const form = draftToForm(initial);
    const selected = draftToSelected(initial);
    expect(draftHasChanges(initial, form, selected)).toBe(false);
    expect(
      draftHasChanges(initial, { ...form, title: "Autre titre" }, selected)
    ).toBe(true);
    expect(
      draftHasChanges(
        initial,
        form,
        setSelectedPoints(selected, "q1", 5)
      )
    ).toBe(true);
  });
});

describe("registry-derived options", () => {
  it("derives subjects, levels and chapters from the real registry", () => {
    const options = allChapterOptions();
    expect(options.length).toBe(Object.keys(CHAPTERS_META).length);
    expect(distinctSubjects(options)).toContain("math");
    expect(distinctLevels(options)).toContain("2bac");
    const mathLevels = levelsForSubject(options, "math");
    expect(mathLevels).toContain("2bac");
    const chapter = chapterOptionTitle("limites-continuite");
    expect(chapter).toBe("Limites et continuité");
    expect(
      chaptersForSelection(options, "math", "2bac").some((c) => c.slug === "limites-continuite")
    ).toBe(true);
    expect(subjectOptionTitle("math")).toBe("Mathématiques");
  });
});