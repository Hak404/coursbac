"use client";

function keys(scope: string) {
  return {
    visited: `coursbac:${scope}:visited:v1`,
    last: `coursbac:${scope}:last:v1`,
    quiz: `coursbac:${scope}:quiz:v1`,
  };
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota errors */
  }
}

export type ProgressStore = {
  visited: string[];
  last: string;
  quizBest: number | null;
};

export function loadProgress(scope = "limites"): ProgressStore {
  const k = keys(scope);
  return {
    visited: read<string[]>(k.visited, []),
    last: read<string>(k.last, "intro"),
    quizBest: read<number | null>(k.quiz, null),
  };
}

export function saveVisited(visited: string[], scope = "limites") {
  write(keys(scope).visited, visited);
}

export function saveLast(last: string, scope = "limites") {
  write(keys(scope).last, last);
}

export function saveQuiz(best: number, scope = "limites") {
  const k = keys(scope);
  const prev = read<number | null>(k.quiz, null);
  if (prev === null || best > prev) {
    write(k.quiz, best);
    return best;
  }
  return prev;
}