"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { findChapterByPath, presentationHref } from "@/lib/content/registry";
import { loadSections } from "@/lib/content/loaders";
import { loadProgress, saveVisited, saveLast } from "@/lib/progress";
import { ProgressBar } from "./ProgressBar";
import { ChapterSidebar } from "./ChapterSidebar";

export function Course({
  subject,
  level,
  slug,
  initialId,
}: {
  subject: string;
  level: string;
  slug: string;
  initialId?: string;
}) {
  const meta = findChapterByPath(subject, level, slug);
  const sections = useMemo(() => (meta ? loadSections(meta.slug) : []), [meta]);
  const chapter = useMemo(() => (meta ? { ...meta, sections } : null), [meta, sections]);
  const scope = useMemo(() => meta?.progressScope ?? "limites", [meta]);

  const [index, setIndex] = useState(() =>
    initialId
      ? Math.max(0, sections.findIndex((s) => s.id === initialId))
      : 0,
  );
  const [visited, setVisited] = useState<string[]>([]);
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    const target = initialId ?? loadProgress(scope).last;
    const i = sections.findIndex((s) => s.id === target);
    setIndex(Math.max(0, i));
    setVisited(loadProgress(scope).visited);
  }, [initialId, scope, sections]);

  useEffect(() => {
    saveLast(sections[index]?.id ?? "intro", scope);
  }, [index, scope, sections]);

  const markVisited = useCallback(
    (id: string) => {
      setVisited((prev) => {
        if (prev.includes(id)) return prev;
        const next = [...prev, id];
        saveVisited(next, scope);
        return next;
      });
    },
    [scope],
  );

  const goTo = useCallback(
    (id: string) => {
      const i = sections.findIndex((s) => s.id === id);
      if (i < 0) return;
      markVisited(sections[index].id);
      setIndex(i);
      setDrawer(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [index, markVisited, sections],
  );

  const goNext = useCallback(() => {
    markVisited(sections[index].id);
    setIndex((i) => Math.min(sections.length - 1, i + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [index, markVisited, sections]);

  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const section = sections[index];
  const categoryLabel = useMemo(
    () =>
      chapter?.categories.find((c) => c.key === section?.category)?.label ?? "",
    [chapter, section],
  );
  const percent = sections.length
    ? (visited.length / sections.length) * 100
    : 0;

  if (!chapter) return null;

  return (
    <div className="mx-auto flex max-w-6xl gap-6 px-4 py-6">
      <aside className="sticky top-20 hidden max-h-[calc(100vh-6rem)] w-72 shrink-0 overflow-y-auto pr-1 lg:block">
        <ChapterSidebar
          sections={sections}
          categories={chapter.categories}
          currentId={section.id}
          visited={visited}
          onSelect={goTo}
        />
      </aside>

      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 -mx-4 mb-4 border-b border-slate-100 bg-slate-50/90 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDrawer(true)}
              className="rounded-lg bg-white px-2.5 py-1.5 text-slate-600 ring-1 ring-slate-200 lg:hidden"
              aria-label="Ouvrir le sommaire"
            >
              ☰
            </button>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-bold text-slate-800">
                {chapter.shortTitle} · {chapter.levelShort}
              </div>
              <ProgressBar percent={percent} />
            </div>
            <div className="hidden text-xs text-slate-500 sm:block">
              {visited.length}/{sections.length} sections lues
            </div>
            <Link
              href={presentationHref(chapter)}
              className="shrink-0 rounded-xl bg-slate-800 px-3.5 py-2 text-sm font-bold text-white shadow transition hover:bg-slate-700"
              title="Ouvrir en mode présentation (plein écran)"
            >
              ▶ Présenter
            </Link>
            <Link
              href="/"
              className="shrink-0 rounded-xl bg-white px-2.5 py-2 text-sm font-semibold text-slate-500 ring-1 ring-slate-200 transition hover:bg-slate-50"
              title="Retour au tableau de bord"
            >
              🏠
            </Link>
          </div>
        </header>

        <motion.article
          key={section.id}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="space-y-4"
        >
          <div>
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-600 px-2.5 py-0.5 text-[11px] font-bold text-white">
                {String(section.number).padStart(2, "0")}
              </span>
              <span className="inline-flex rounded-full bg-slate-200 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                {categoryLabel}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              {section.title}
            </h1>
          </div>

          <section.Component />

          <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={goPrev}
              disabled={index === 0}
              className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 ring-1 ring-slate-200 transition enabled:hover:bg-slate-50 disabled:opacity-40"
            >
              ← Précédent
            </button>
            <div className="text-xs font-medium text-slate-400">
              {index + 1} / {sections.length}
            </div>
            <button
              type="button"
              onClick={goNext}
              disabled={index === sections.length - 1}
              className="rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lift transition enabled:hover:bg-primary-700 disabled:opacity-40"
            >
              Suivant →
            </button>
          </div>
        </motion.article>
      </main>

      <AnimatePresence>
        {drawer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawer(false)}
              className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-80 overflow-y-auto bg-white p-4 shadow-2xl lg:hidden"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="text-sm font-bold text-slate-800">Sommaire</div>
                <button
                  type="button"
                  onClick={() => setDrawer(false)}
                  aria-label="Fermer"
                  className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100"
                >
                  ✕
                </button>
              </div>
              <ChapterSidebar
                sections={sections}
                categories={chapter.categories}
                currentId={section.id}
                visited={visited}
                onSelect={goTo}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}