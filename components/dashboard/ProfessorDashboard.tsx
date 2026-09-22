"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { signOut } from "next-auth/react";
import {
  CHAPTERS_META,
  courseHref,
  presentationHref,
  subjectTitle,
  levelLabel,
} from "@/lib/content/registry";
import type { ChapterMeta } from "@/lib/content/types";
import {
  visibleChapters,
  availableSubjectSlugs,
  availableLevelSlugs,
} from "@/lib/auth/session";
import type { Session } from "@/lib/auth/session";

const COMING_SOON = [
  "Dérivation et étude des fonctions",
  "Suites numériques",
  "Fonctions primitives",
  "Fonctions logarithmiques",
  "Nombres complexes",
];

function allChapters(): ChapterMeta[] {
  return Object.values(CHAPTERS_META);
}

function distinctSubjects(): string[] {
  return Array.from(new Set(allChapters().map((c) => c.subjectSlug)));
}

function distinctLevels(): string[] {
  return Array.from(new Set(allChapters().map((c) => c.levelSlug)));
}

function subjectOptions(session: Session): string[] {
  const scoped = availableSubjectSlugs(session);
  return scoped.length > 0 ? scoped : distinctSubjects();
}

function levelOptions(session: Session): string[] {
  const scoped = availableLevelSlugs(session);
  return scoped.length > 0 ? scoped : distinctLevels();
}

export function ProfessorDashboard({ session }: { session: Session }) {
  const [subject, setSubject] = useState<string>("all");
  const [level, setLevel] = useState<string>("all");

  const subjects = useMemo(() => subjectOptions(session), [session]);
  const levels = useMemo(() => levelOptions(session), [session]);

  useEffect(() => {
    setSubject(subjects.length === 1 ? subjects[0] : "all");
    setLevel(levels.length === 1 ? levels[0] : "all");
  }, [subjects, levels]);

  const scopedChapters = useMemo(() => {
    let list = visibleChapters(allChapters(), session);
    if (subject !== "all") list = list.filter((c) => c.subjectSlug === subject);
    if (level !== "all") list = list.filter((c) => c.levelSlug === level);
    return list;
  }, [session, subject, level]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div>
            <div className="text-lg font-extrabold tracking-tight text-slate-900">
              {session.kind === "user" ? session.user.name : "Professeur"}
            </div>
            <div className="text-sm font-medium text-slate-500">
              {session.kind === "user"
                ? `${session.user.email} · ${subjects.map(subjectTitle).join(", ")} · ${levels.map(levelLabel).join(", ")}`
                : "Espace enseignant"}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/professeur/quiz"
              className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-3 py-1.5 text-sm font-bold text-white transition hover:bg-primary-700"
            >
              ⚡ Lancer un Quiz en classe
            </Link>
            <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-bold text-primary-800">
              Professeur
            </span>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10 sm:py-14">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Bonjour Professeur <span aria-hidden>👋</span>
          </h1>
          <p className="mt-2 text-lg text-slate-600">
            Qu'allez-vous enseigner aujourd'hui ?
          </p>
        </motion.div>

        <div className="mt-8 flex max-w-3xl flex-wrap items-center gap-3">
          <label className="text-sm font-bold text-slate-600">Matière</label>
          <select
            aria-label="Filtrer par matière"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm outline-none transition focus:border-primary-400"
          >
            {subjects.length > 1 && <option value="all">Toutes</option>}
            {subjects.map((s) => (
              <option key={s} value={s}>
                {subjectTitle(s)}
              </option>
            ))}
          </select>

          <label className="ml-2 text-sm font-bold text-slate-600">Niveau</label>
          <select
            aria-label="Filtrer par niveau"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm outline-none transition focus:border-primary-400"
          >
            {levels.length > 1 && <option value="all">Tous</option>}
            {levels.map((l) => (
              <option key={l} value={l}>
                {levelLabel(l)}
              </option>
            ))}
          </select>
        </div>

        {scopedChapters.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="mt-10 max-w-3xl"
          >
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm font-medium text-slate-400">
              {level !== "all"
                ? `Aucun chapitre publié pour ${levelLabel(level)} pour le moment · Chapitres à venir : ${COMING_SOON.join(" · ")}`
                : "Aucun chapitre ne correspond à cette sélection."}
            </div>
          </motion.div>
        )}

        <div className="mt-10 grid max-w-3xl gap-6">
          {scopedChapters.map((chapter, i) => (
            <motion.section
              key={chapter.slug}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.08 + i * 0.08 }}
            >
              <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-card sm:p-9">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white ${
                      chapter.subjectSlug === "physique" ? "bg-sky-600" : "bg-primary-600"
                    }`}
                  >
                    {chapter.badgeLabel}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    {chapter.subjectLabel} · {chapter.levelShort}
                  </span>
                </div>

                <h2 className="text-2xl font-extrabold uppercase tracking-tight text-slate-900 sm:text-3xl">
                  {chapter.title}
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
                  {chapter.description}
                </p>

                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <Link
                    href={presentationHref(chapter)}
                    className={`inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-base font-extrabold text-white shadow-lift transition ${
                      chapter.subjectSlug === "physique"
                        ? "bg-sky-700 hover:bg-sky-800"
                        : "bg-primary-600 hover:bg-primary-700"
                    }`}
                  >
                    ▶ COMMENCER LA SÉANCE
                  </Link>
                  <Link
                    href={courseHref(chapter)}
                    className="inline-flex items-center rounded-2xl bg-white px-5 py-3.5 text-base font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
                  >
                    VOIR LE DÉROULÉ
                  </Link>
                </div>
              </div>
            </motion.section>
          ))}
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
        Programme officiel marocain · 2ème Baccalauréat Sciences Physiques
      </footer>
    </div>
  );
}