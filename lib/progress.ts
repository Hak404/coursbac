"use client";

const KEY_VISITED = "coursbac:limites:visited:v1";
const KEY_LAST = "coursbac:limites:last:v1";
const KEY_QUIZ = "coursbac:limites:quiz:v1";

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

export function loadProgress(): ProgressStore {
  return {
    visited: read<string[]>(KEY_VISITED, []),
    last: read<string>(KEY_LAST, "intro"),
    quizBest: read<number | null>(KEY_QUIZ, null),
  };
}

export function saveVisited(visited: string[]) {
  write(KEY_VISITED, visited);
}

export function saveLast(last: string) {
  write(KEY_LAST, last);
}

export function saveQuiz(best: number) {
  const prev = read<number | null>(KEY_QUIZ, null);
  if (prev === null || best > prev) {
    write(KEY_QUIZ, best);
    return best;
  }
  return prev;
}