"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { COURSE_SECTIONS } from "@/content/limites";
import { loadProgress, saveVisited, saveLast } from "@/lib/progress";
import { emitReplay } from "@/lib/replay";
import { PresentationProvider, usePresentationCtx } from "./presentation";

const LESSON_LABELS: Record<string, string> = {
  decouverte: "Introduction",
  limites: "Les limites",
  continuite: "La continuité",
  fonctions: "Fonctions",
  entrainement: "Entraînement",
};

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(target.closest("input, textarea, select, [contenteditable='true']"));
}

function markVisitedAndLast(id: string) {
  const { visited } = loadProgress();
  saveLast(id);
  if (!visited.includes(id)) saveVisited([...visited, id]);
}

type LessonGroup = { key: string; label: string; scenes: typeof COURSE_SECTIONS };

function buildLessons(): LessonGroup[] {
  const groups: LessonGroup[] = [];
  const index = new Map<string, LessonGroup>();
  for (const s of COURSE_SECTIONS) {
    let g = index.get(s.category);
    if (!g) {
      g = {
        key: s.category,
        label: LESSON_LABELS[s.category] ?? s.category,
        scenes: [],
      };
      index.set(s.category, g);
      groups.push(g);
    }
    g.scenes.push(s);
  }
  return groups;
}

function LessonSidebar({
  idx,
  visited,
  onSelect,
  onExit,
}: {
  idx: number;
  visited: ReadonlySet<string>;
  onSelect: (i: number) => void;
  onExit: () => void;
}) {
  const groups = useMemo(buildLessons, []);
  return (
    <aside className="flex w-72 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
        <div className="min-w-0">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            2BAC Sciences Physiques
          </div>
          <div className="truncate text-base font-extrabold text-slate-900">
            Mathématiques · Analyse
          </div>
        </div>
        <button
          type="button"
          onClick={onExit}
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          title="Quitter la séance (Échap)"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {groups.map((g) => (
          <div key={g.key} className="mb-3">
            <div className="px-4 py-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              {g.label}
            </div>
            <div className="space-y-0.5">
              {g.scenes.map((s) => {
                const gi = COURSE_SECTIONS.indexOf(s);
                const active = gi === idx;
                const done = visited.has(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onSelect(gi)}
                    className={`flex w-full items-center gap-2.5 border-l-[3px] px-4 py-2 text-left text-sm transition ${
                      active
                        ? "border-primary-600 bg-primary-50 font-bold text-primary-800"
                        : "border-transparent font-medium text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                        active
                          ? "bg-primary-600 text-white"
                          : done
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {done && !active ? "✓" : String(s.number).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{s.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-100 px-4 py-3 text-[11px] leading-relaxed text-slate-400">
        <span className="font-bold text-slate-500">Navigation :</span>
        <br />→ / Espace avance · ← recule · R relance · N notes prof · F plein écran
      </div>
    </aside>
  );
}

function SceneControls({
  idx,
  hasNext,
  hasPrev,
  onNextScene,
  onPrevScene,
  onExit,
  onToggleFullscreen,
  isFullscreen,
  onSceneTop,
}: {
  idx: number;
  hasNext: boolean;
  hasPrev: boolean;
  onNextScene: () => void;
  onPrevScene: () => void;
  onExit: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  onSceneTop: () => void;
}) {
  const ctx = usePresentationCtx();
  const section = COURSE_SECTIONS[idx];
  const steps = (ctx?.totalSteps ?? 0) > 0;
  const allRevealed = !steps || Boolean(ctx?.revealedAll);

  const goForward = () => {
    if (!allRevealed) ctx?.revealMore();
    else if (hasNext) onNextScene();
  };

  const restart = () => {
    ctx?.resetSteps();
    onSceneTop();
    emitReplay();
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-3">
      <div className="pointer-events-auto mx-auto flex max-w-6xl items-center gap-2 rounded-2xl bg-white/95 px-3 py-2.5 shadow-2xl ring-1 ring-slate-200 backdrop-blur-sm">
        <button
          type="button"
          onClick={onPrevScene}
          disabled={!hasPrev}
          className="rounded-xl px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-40"
          title="Scène précédente (←)"
        >
          ← PRÉCÉDENT
        </button>

        <div className="mx-1 h-6 w-px bg-slate-200" aria-hidden />

        <button
          type="button"
          onClick={() => emitReplay()}
          className="rounded-xl bg-slate-800 px-3.5 py-2 text-sm font-bold text-white transition hover:bg-slate-700"
          title="Lancer l'animation de la scène (R)"
        >
          ▶ LANCER
        </button>

        <button
          type="button"
          onClick={restart}
          className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100"
          title="Recommencer la scène depuis le début"
        >
          ↻ RECOMMENCER
        </button>

        <div className="min-w-0 flex-1 px-2 text-center">
          <span className="inline-flex items-center gap-2">
            <span className="rounded-full bg-primary-600 px-2.5 py-0.5 text-xs font-extrabold text-white">
              Scène {String(idx + 1).padStart(2, "0")} / {String(COURSE_SECTIONS.length).padStart(2, "0")}
            </span>
            {steps && (
              <span className="hidden rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-500 sm:inline">
                Étape {Math.min(ctx!.revealed, ctx!.totalSteps)} / {ctx!.totalSteps}
              </span>
            )}
          </span>
          <div className="mt-0.5 hidden truncate text-xs font-semibold text-slate-400 md:block">
            {section.title}
          </div>
        </div>

        <button
          type="button"
          onClick={ctx?.toggleNotes}
          className={`rounded-xl px-2.5 py-2 text-sm font-semibold transition ${
            ctx?.notesVisible ? "bg-amber-100 text-amber-800" : "text-amber-600 hover:bg-amber-50"
          }`}
          title="Notes du professeur (N)"
        >
          📝
        </button>
        <button
          type="button"
          onClick={onToggleFullscreen}
          className="rounded-xl px-2.5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
          title="Plein écran (F)"
        >
          {isFullscreen ? "⤢" : "⛶"}
        </button>
        <button
          type="button"
          onClick={onExit}
          className="rounded-xl px-2.5 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100"
          title="Quitter la séance (Échap)"
        >
          ✕
        </button>

        <button
          type="button"
          onClick={goForward}
          disabled={!hasNext && allRevealed}
          className="rounded-xl bg-primary-600 px-5 py-2 text-sm font-extrabold uppercase tracking-wide text-white shadow transition hover:bg-primary-700 disabled:opacity-40"
        >
          {!allRevealed ? "Étape suivante →" : hasNext ? "Scène suivante →" : "Fin ✓"}
        </button>
      </div>
    </div>
  );
}

function GlobalKeys({
  onForward,
  onBackward,
  onExit,
  onToggleFullscreen,
  onReplay,
}: {
  onForward: () => void;
  onBackward: () => void;
  onExit: () => void;
  onToggleFullscreen: () => void;
  onReplay: () => void;
}) {
  const ctx = usePresentationCtx();

  const stateRef = useRef({ revealed: 1, totalSteps: 0 });
  stateRef.current = {
    revealed: ctx?.revealed ?? 1,
    totalSteps: ctx?.totalSteps ?? 0,
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      if (isEditableTarget(e.target)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const state = stateRef.current;
      const allRevealed = state.totalSteps === 0 || state.revealed >= state.totalSteps;

      switch (e.key) {
        case "ArrowRight":
        case "Enter":
        case " ":
          e.preventDefault();
          if (!allRevealed && state.totalSteps > 0) ctx?.revealMore();
          else onForward();
          break;
        case "ArrowLeft":
        case "Backspace":
          e.preventDefault();
          if (state.revealed > 1) ctx?.revealBack();
          else onBackward();
          break;
        case "Escape":
          onExit();
          break;
        case "f":
        case "F":
          onToggleFullscreen();
          break;
        case "r":
        case "R":
          e.preventDefault();
          onReplay();
          break;
        case "n":
        case "N":
          ctx?.toggleNotes();
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [ctx, onForward, onBackward, onExit, onToggleFullscreen, onReplay]);

  return null;
}

export function PresentationView() {
  const router = useRouter();
  const [idx, setIdx] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const idxRef = useRef(0);
  idxRef.current = idx;
  const mainRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const progress = loadProgress();
    const start = Math.max(0, COURSE_SECTIONS.findIndex((s) => s.id === progress.last));
    idxRef.current = start;
    setIdx(start);
  }, []);

  const goToIdx = useCallback((i: number) => {
    const clamped = Math.max(0, Math.min(COURSE_SECTIONS.length - 1, i));
    if (clamped !== idxRef.current) {
      idxRef.current = clamped;
      markVisitedAndLast(COURSE_SECTIONS[clamped].id);
      setIdx(clamped);
      mainRef.current?.scrollTo({ top: 0 });
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen().catch(() => undefined);
  }, []);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const exit = useCallback(() => {
    router.push(`/chapitre/limites-continuite?section=${COURSE_SECTIONS[idxRef.current].id}`);
  }, [router]);

  const section = COURSE_SECTIONS[idx];
  const lesson = LESSON_LABELS[section.category] ?? section.category;
  const hasNext = idx < COURSE_SECTIONS.length - 1;
  const hasPrev = idx > 0;
  const visited = useMemo(() => new Set(loadProgress().visited), [idx]);

  return (
    <div className="presentation-root flex h-screen overflow-hidden bg-slate-50 text-slate-900">
      <PresentationProvider key={section.id} mode="presentation">
        <LessonSidebar idx={idx} visited={visited} onSelect={goToIdx} onExit={exit} />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-2.5">
            <div className="min-w-0 truncate text-sm font-extrabold uppercase tracking-wider text-slate-800">
              Limites et continuité
              <span className="ml-2 hidden font-medium normal-case text-slate-400 lg:inline">
                · 2BAC Sciences Physiques
              </span>
            </div>
            <span className="hidden shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500 sm:inline">
              Scène {String(idx + 1).padStart(2, "0")} / {String(COURSE_SECTIONS.length).padStart(2, "0")}
            </span>
          </header>

          <main
            ref={(el) => {
              mainRef.current = el;
            }}
            className="flex-1 overflow-y-auto px-5 pb-40 pt-5 sm:px-8"
          >
            <div className="mx-auto max-w-5xl">
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-2 text-xs font-extrabold uppercase tracking-widest text-primary-600">
                  {lesson} · Scène {String(section.number).padStart(2, "0")}
                </div>
                <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                  {String(section.number).padStart(2, "0")} — {section.title}
                </h1>
                <section.Component />
              </motion.div>
            </div>
          </main>
        </div>

        <SceneControls
          idx={idx}
          hasNext={hasNext}
          hasPrev={hasPrev}
          onNextScene={() => goToIdx(idx + 1)}
          onPrevScene={() => goToIdx(idx - 1)}
          onExit={exit}
          onToggleFullscreen={toggleFullscreen}
          isFullscreen={isFullscreen}
          onSceneTop={() => mainRef.current?.scrollTo({ top: 0 })}
        />

        <GlobalKeys
          onForward={() => goToIdx(idxRef.current + 1)}
          onBackward={() => goToIdx(idxRef.current - 1)}
          onExit={() => {
            if (document.fullscreenElement) void document.exitFullscreen();
            else exit();
          }}
          onToggleFullscreen={toggleFullscreen}
          onReplay={() => emitReplay()}
        />
      </PresentationProvider>
    </div>
  );
}