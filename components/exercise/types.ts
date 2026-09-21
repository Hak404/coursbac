import type { ReactNode } from "react";
import { evaluate } from "mathjs";

export type MiniGraphSpec = {
  expr: string;
  holeX?: number;
  holeY?: number;
};

export type GuidedStep = {
  instruction: ReactNode;
  kind: "mcq" | "numeric";
  options?: ReactNode[];
  correctIndex?: number;
  answer?: number;
  tolerance?: number;
  explanation: ReactNode;
};

export type ExerciseData = {
  id: string;
  type: "mcq" | "numeric" | "guided";
  title?: string;
  prompt: ReactNode;
  options?: ReactNode[];
  correct?: number;
  answer?: number;
  tolerance?: number;
  explanation: ReactNode;
  solution?: ReactNode;
  miniGraph?: MiniGraphSpec;
  steps?: GuidedStep[];
};

export type AnswerState =
  | { status: "idle" }
  | { status: "correct"; chosen: number }
  | { status: "incorrect"; chosen: number }
  | { status: "numeric-wrong"; submitted: string };

export function coerceNumber(input: string): number | null {
  const s = input.trim().replace(/,/g, ".").replace(/−/g, "-");
  if (!s) return null;
  const m = s.match(/^[-+0-9./()eE\s*]+$/);
  if (!m) return null;
  try {
    const v = evaluate(s);
    return typeof v === "number" && Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}