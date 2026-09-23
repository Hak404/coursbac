"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { signOut } from "next-auth/react";
import { CHAPTERS_META, courseHref, presentationHref, levelLabel } from "@/lib/content/registry";
import { visibleChapters } from "@/lib/auth/session";
import type { Session } from "@/lib/auth/session";

export function StudentDashboard({ session }: { session: Session }) {
  const studentLevel =
    session.kind === "user" ? (session.user.studentLevelSlug ?? null) : null;

  const chapters = visibleChapters(Object.values(CHAPTERS_META), session);

  const shown = studentLevel
    ? chapters.filter((c) => c.levelSlug === studentLevel)
    : chapters;

  const title =
    session.kind === "user" ? session.user.name : "Élève";

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div>
            <div className="text-lg font-extrabold tracking-tight text-slate-900">
              {title}
            </div>
            <div className="text-sm font-medium text-slate-500">
              {studentLevel ? levelLabel(studentLevel) : "Espace élève"}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-800">
              Élève
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
            Mes cours <span aria-hidden>📚</span>
          </h1>
          <p className="mt-2 text-lg text-slate-600">
            {studentLevel
              ? `Chapitres du programme ${levelLabel(studentLevel)}.`
              : "Parcourir les cours disponibles."}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.04 }}
        >
          <Link
            href="/etudiant/travaux"
            className="mt-8 flex max-w-3xl flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-card transition hover:border-primary-300 hover:bg-primary-50/40"
          >
            <div>
              <div className="text-sm font-extrabold uppercase tracking-wide text-primary-700">
                Mes travaux
              </div>
              <div className="mt-1 text-lg font-extrabold text-slate-900">
                Rejoindre un travail avec un code
              </div>
            </div>
            <span className="inline-flex items-center rounded-2xl bg-primary-600 px-5 py-3 text-sm font-extrabold text-white shadow-lift transition hover:bg-primary-700">
              Voir les travaux
            </span>
          </Link>
        </motion.div>

        <div className="mt-10 grid max-w-3xl gap-6">
          {shown.map((chapter, i) => (
            <motion.section
              key={chapter.slug}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.08 + i * 0.08 }}
            >
              <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-card sm:p-9">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-primary-600 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white">
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
                    href={courseHref(chapter)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-6 py-3.5 text-base font-extrabold text-white shadow-lift transition hover:bg-primary-700"
                  >
                    COMMENCER LE COURS
                  </Link>
                  <Link
                    href={presentationHref(chapter)}
                    className="inline-flex items-center rounded-2xl bg-white px-5 py-3.5 text-base font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
                  >
                    MODE PRÉSENTATION
                  </Link>
                </div>
              </div>
            </motion.section>
          ))}

          {shown.length === 0 && (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm font-medium text-slate-400">
              Aucun chapitre publié pour ce niveau pour le moment.
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
        Programme officiel marocain · 2ème Baccalauréat Sciences Physiques
      </footer>
    </div>
  );
}