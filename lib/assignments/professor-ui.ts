import { CHAPTERS_META, levelLabel, subjectTitle } from "@/lib/content/registry";

export type AssignmentStatus = "DRAFT" | "PUBLISHED" | "CLOSED";

export type Difficulty = "EASY" | "MEDIUM" | "HARD";

export type AssignmentQuestion = {
  id: string;
  index: number;
  title: string;
  formula: string | null;
  options: string[];
  correctOptionIndex: number;
  difficulty: string;
  points: number;
  sourceQuestionId: string | null;
};

export type Assignment = {
  id: string;
  accessCode: string;
  title: string;
  instructions: string | null;
  subjectSlug: string;
  levelSlug: string;
  chapterSlug: string;
  status: AssignmentStatus;
  createdById: string;
  dueDate: string | null;
  attemptLimit: number;
  showFeedback: boolean;
  createdAt: string;
  updatedAt: string;
  questions: AssignmentQuestion[];
};

export type BankQuestion = {
  id: string;
  chapterSlug: string;
  title: string;
  formula: string | null;
  options: string[];
  correctOptionIndex: number;
  difficulty: string;
  isTemplate: boolean;
};

export type AssignmentFormState = {
  title: string;
  instructions: string;
  subjectSlug: string;
  levelSlug: string;
  chapterSlug: string;
  dueDate: string;
  attemptLimit: number;
  showFeedback: boolean;
};

export type SelectedQuestionEntry = {
  bankQuestionId: string;
  title: string;
  points: number;
};

export const EMPTY_FORM: AssignmentFormState = {
  title: "",
  instructions: "",
  subjectSlug: "",
  levelSlug: "",
  chapterSlug: "",
  dueDate: "",
  attemptLimit: 1,
  showFeedback: true,
};

export const STATUS_META: Record<
  AssignmentStatus,
  { label: string; icon: string }
> = {
  DRAFT: { label: "Brouillon", icon: "◦" },
  PUBLISHED: { label: "Publié", icon: "✓" },
  CLOSED: { label: "Fermé", icon: "✕" },
};

export function isAssignmentStatus(value: string): value is AssignmentStatus {
  return value === "DRAFT" || value === "PUBLISHED" || value === "CLOSED";
}

export function statusLabel(status: string): string {
  return isAssignmentStatus(status) ? STATUS_META[status].label : status;
}

export function statusIcon(status: string): string {
  return isAssignmentStatus(status) ? STATUS_META[status].icon : "•";
}

export const DIFFICULTY_LABELS: Record<string, string> = {
  EASY: "Facile",
  MEDIUM: "Moyenne",
  HARD: "Difficile",
};

export function difficultyLabel(difficulty: string): string {
  return DIFFICULTY_LABELS[difficulty] ?? difficulty;
}

export type FormErrors = Partial<
  Record<"title" | "subject" | "level" | "chapter" | "attemptLimit", string>
>;

export function validateForm(state: AssignmentFormState): FormErrors {
  const errors: FormErrors = {};
  if (!state.title.trim()) {
    errors.title = "Le titre est obligatoire.";
  }
  if (!state.subjectSlug) {
    errors.subject = "Choisissez une matière.";
  }
  if (!state.levelSlug) {
    errors.level = "Choisissez un niveau.";
  }
  if (!state.chapterSlug) {
    errors.chapter = "Choisissez un chapitre.";
  } else if (
    !Number.isInteger(state.attemptLimit) ||
    state.attemptLimit < 1
  ) {
    errors.attemptLimit = "Le nombre de tentatives doit être au moins 1.";
  }
  return errors;
}

export function formIsValid(errors: FormErrors): boolean {
  return Object.keys(errors).length === 0;
}

export function isQuestionSelected(
  selected: SelectedQuestionEntry[],
  bankQuestionId: string
): boolean {
  return selected.some((s) => s.bankQuestionId === bankQuestionId);
}

export function toggleQuestion(
  selected: SelectedQuestionEntry[],
  question: BankQuestion
): SelectedQuestionEntry[] {
  if (isQuestionSelected(selected, question.id)) {
    return removeSelected(selected, question.id);
  }
  return [...selected, { bankQuestionId: question.id, title: question.title, points: 1 }];
}

export function removeSelected(
  selected: SelectedQuestionEntry[],
  bankQuestionId: string
): SelectedQuestionEntry[] {
  return selected.filter((s) => s.bankQuestionId !== bankQuestionId);
}

export function moveSelected(
  selected: SelectedQuestionEntry[],
  index: number,
  delta: number
): SelectedQuestionEntry[] {
  const target = index + delta;
  if (index < 0 || index >= selected.length) return selected;
  if (target < 0 || target >= selected.length) return selected;
  const next = [...selected];
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item);
  return next;
}

export function setSelectedPoints(
  selected: SelectedQuestionEntry[],
  bankQuestionId: string,
  points: number
): SelectedQuestionEntry[] {
  if (!Number.isFinite(points) || points <= 0) return selected;
  return selected.map((s) =>
    s.bankQuestionId === bankQuestionId ? { ...s, points } : s
  );
}

export function countSelected(selected: SelectedQuestionEntry[]): number {
  return selected.length;
}

export function filterQuestionsByDifficulty(
  questions: BankQuestion[],
  difficulty: string
): BankQuestion[] {
  if (!difficulty) return questions;
  return questions.filter((q) => q.difficulty === difficulty);
}

export function dueDateToInputValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export function inputValueToDueDate(value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export type AssignmentPayload = {
  title: string;
  instructions: string | null;
  subjectSlug: string;
  levelSlug: string;
  chapterSlug: string;
  dueDate: string | null;
  attemptLimit: number;
  showFeedback: boolean;
  questions: { sourceQuestionId: string; index: number; points: number }[];
};

export function buildAssignmentPayload(
  form: AssignmentFormState,
  selected: SelectedQuestionEntry[]
): AssignmentPayload {
  return {
    title: form.title.trim(),
    instructions: form.instructions.trim() || null,
    subjectSlug: form.subjectSlug,
    levelSlug: form.levelSlug,
    chapterSlug: form.chapterSlug,
    dueDate: inputValueToDueDate(form.dueDate),
    attemptLimit: form.attemptLimit,
    showFeedback: form.showFeedback,
    questions: selected.map((s, index) => ({
      sourceQuestionId: s.bankQuestionId,
      index,
      points: s.points,
    })),
  };
}

export function draftToForm(initial: Assignment): AssignmentFormState {
  return {
    title: initial.title,
    instructions: initial.instructions ?? "",
    subjectSlug: initial.subjectSlug,
    levelSlug: initial.levelSlug,
    chapterSlug: initial.chapterSlug,
    dueDate: dueDateToInputValue(initial.dueDate),
    attemptLimit: initial.attemptLimit,
    showFeedback: initial.showFeedback,
  };
}

export function draftToSelected(initial: Assignment): SelectedQuestionEntry[] {
  return [...initial.questions]
    .sort((a, b) => a.index - b.index)
    .map((q) => ({
      bankQuestionId: q.sourceQuestionId ?? q.id,
      title: q.title,
      points: q.points,
    }));
}

function formEqual(a: AssignmentFormState, b: AssignmentFormState): boolean {
  return (
    a.title === b.title &&
    a.instructions === b.instructions &&
    a.subjectSlug === b.subjectSlug &&
    a.levelSlug === b.levelSlug &&
    a.chapterSlug === b.chapterSlug &&
    a.dueDate === b.dueDate &&
    a.attemptLimit === b.attemptLimit &&
    a.showFeedback === b.showFeedback
  );
}

function selectedEqual(
  a: SelectedQuestionEntry[],
  b: SelectedQuestionEntry[]
): boolean {
  if (a.length !== b.length) return false;
  return a.every(
    (entry, i) =>
      b[i]?.bankQuestionId === entry.bankQuestionId &&
      b[i]?.title === entry.title &&
      b[i]?.points === entry.points
  );
}

export function draftHasChanges(
  initial: Assignment,
  form: AssignmentFormState,
  selected: SelectedQuestionEntry[]
): boolean {
  const baseForm = draftToForm(initial);
  const baseSelected = draftToSelected(initial);
  return !formEqual(baseForm, form) || !selectedEqual(baseSelected, selected);
}

export type ChapterOption = {
  subjectSlug: string;
  levelSlug: string;
  slug: string;
  title: string;
};

export function allChapterOptions(): ChapterOption[] {
  return Object.values(CHAPTERS_META).map((c) => ({
    subjectSlug: c.subjectSlug,
    levelSlug: c.levelSlug,
    slug: c.slug,
    title: c.title,
  }));
}

export function distinctSubjects(options: ChapterOption[]): string[] {
  return [...new Set(options.map((o) => o.subjectSlug))];
}

export function distinctLevels(options: ChapterOption[]): string[] {
  return [...new Set(options.map((o) => o.levelSlug))];
}

export function levelsForSubject(
  options: ChapterOption[],
  subjectSlug: string
): string[] {
  return [
    ...new Set(
      options.filter((o) => o.subjectSlug === subjectSlug).map((o) => o.levelSlug)
    ),
  ];
}

export function chaptersForSelection(
  options: ChapterOption[],
  subjectSlug: string,
  levelSlug: string
): ChapterOption[] {
  return options.filter(
    (o) => o.subjectSlug === subjectSlug && o.levelSlug === levelSlug
  );
}

export function chapterOptionTitle(chapterSlug: string): string {
  return CHAPTERS_META[chapterSlug]?.title ?? chapterSlug;
}

export function subjectOptionTitle(slug: string): string {
  return subjectTitle(slug);
}

export function levelOptionTitle(slug: string): string {
  return levelLabel(slug);
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(d);
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(d);
}

export function formatDueDate(iso: string | null | undefined): string {
  return iso ? formatDateTime(iso) : "Aucune date limite";
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof navigator === "undefined") return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    if (typeof document === "undefined") return false;
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(textarea);
      return ok;
    } catch {
      return false;
    }
  }
}