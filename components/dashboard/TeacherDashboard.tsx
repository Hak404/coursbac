"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const COMING_SOON = [
  "Dérivation et étude des fonctions",
  "Suites numériques",
  "Fonctions primitives",
  "Fonctions logarithmiques",
  "Nombres complexes",
];

export function TeacherDashboard() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4">
          <div>
            <div className="text-lg font-extrabold tracking-tight text-slate-900">
              Mathématiques
            </div>
            <div className="text-sm font-medium text-slate-500">
              2BAC Sciences Physiques · Analyse
            </div>
          </div>
          <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500 sm:inline">
            Assistant de l'enseignant
          </span>
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

        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08 }}
          className="mt-10 max-w-3xl"
        >
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-card sm:p-9">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-primary-600 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white">
                Chapitre 1 · Analyse
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Prêt
              </span>
            </div>

            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              LIMITES ET CONTINUITÉ
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
              Une séance interactive pour comprendre les limites, visualiser les
              comportements des fonctions et guider les élèves étape par étape.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/presentation/limites-continuite"
                className="inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-6 py-3.5 text-base font-extrabold text-white shadow-lift transition hover:bg-primary-700"
              >
                ▶ COMMENCER LA SÉANCE
              </Link>
              <Link
                href="/chapitre/limites-continuite"
                className="inline-flex items-center rounded-2xl bg-white px-5 py-3.5 text-base font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
              >
                VOIR LE DÉROULÉ
              </Link>
            </div>
          </div>
        </motion.section>

        <div className="mt-10 max-w-3xl text-xs font-medium leading-relaxed text-slate-400">
          Autres chapitres à venir : {COMING_SOON.join(" · ")}
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
        Programme officiel marocain · 2ème Baccalauréat Sciences Physiques · Mathématiques
      </footer>
    </div>
  );
}