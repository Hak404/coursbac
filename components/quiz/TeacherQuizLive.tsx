"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CHAPTERS_META,
  subjectTitle,
  levelLabel,
} from "@/lib/content/registry";
import { visibleChapters } from "@/lib/auth/session";
import { supportsQuiz } from "@/lib/quiz/generator";
import type { Session } from "@/lib/auth/session";

type Participant = {
  id: string;
  studentName: string;
  score: number;
  totalQuestions: number;
  submittedAt: string;
};

type MonitorSession = {
  id: string;
  code: string;
  status: "ACTIVE" | "CLOSED";
  chapterSlug: string;
  chapterTitle: string;
  totalQuestions: number;
  createdAt: string;
  participants: Participant[];
};

export function TeacherQuizLive({ session }: { session: Session }) {
  const chapters = useMemo(
    () =>
      visibleChapters(Object.values(CHAPTERS_META), session).filter((c) =>
        supportsQuiz(c.slug)
      ),
    [session]
  );

  const [chapterSlug, setChapterSlug] = useState<string>("");
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [live, setLive] = useState<MonitorSession | null>(null);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (chapters.length > 0 && chapters[0].slug !== chapterSlug) {
      setChapterSlug(chapters[0].slug);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapters]);

  useEffect(() => {
    const current = live;
    if (!current) return;
    const code = current.code;
    const status = current.status;
    let active = true;
    async function refresh() {
      try {
        const res = await fetch(`/api/quiz/sessions/${code}`);
        if (!res.ok) return;
        const data = await res.json();
        if (active && data.ok) setLive(data.session);
      } catch {
        // silencieux pendant le polling
      }
    }
    refresh();
    if (status !== "ACTIVE") return;
    const timer = setInterval(refresh, 2500);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [live]);

  async function launch() {
    setError(null);
    if (!chapterSlug) {
      setError("Sélectionnez d'abord un chapitre.");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/quiz/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapterSlug, questionCount }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Impossible de lancer le quiz.");
        return;
      }
      const boot = data.session as { code: string; chapterSlug: string; status: "ACTIVE" | "CLOSED" };
      const chapter = CHAPTERS_META[boot.chapterSlug];
      setLive({
        id: data.session.id,
        code: boot.code,
        status: boot.status,
        chapterSlug: boot.chapterSlug,
        chapterTitle: chapter?.title ?? boot.chapterSlug,
        totalQuestions: questionCount,
        createdAt: new Date().toISOString(),
        participants: [],
      });
    } catch {
      setError("Erreur réseau. Réessayez.");
    } finally {
      setCreating(false);
    }
  }

  async function closeQuiz() {
    if (!live) return;
    setClosing(true);
    setError(null);
    try {
      const res = await fetch(`/api/quiz/sessions/${live.code}/close`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setLive((prev) => (prev ? { ...prev, status: "CLOSED" } : prev));
      } else {
        setError(data.error ?? "Impossible de fermer le quiz.");
      }
    } catch {
      setError("Erreur réseau.");
    } finally {
      setClosing(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div>
            <div className="text-lg font-extrabold tracking-tight text-slate-900">
              Quiz en classe
            </div>
            <div className="text-sm font-medium text-slate-500">
              Lancez un QCM interactif et suivez les résultats en direct
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/professeur"
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              ← Tableau de bord
            </Link>
            <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-bold text-primary-800">
              {session.kind === "user" && session.user.role === "ADMIN"
                ? "Admin"
                : "Professeur"}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10">
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {!live && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl rounded-3xl border border-slate-200 bg-white p-7 shadow-card sm:p-9"
          >
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Lancer un Quiz en classe
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
              Choisissez un chapitre et le nombre de questions. Le système
              génère un QCM dynamique (valeurs aléatoires à chaque lancement)
              et un code à 6 chiffres à projeter en classe.
            </p>

            <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label className="text-sm font-bold text-slate-600" htmlFor="quiz-chapter">
                  Chapitre
                </label>
                <select
                  id="quiz-chapter"
                  value={chapterSlug}
                  onChange={(e) => setChapterSlug(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm outline-none transition focus:border-primary-400"
                >
                  {chapters.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.badgeLabel} · {c.title} ({subjectTitle(c.subjectSlug)} ·{" "}
                      {levelLabel(c.levelSlug)})
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-full sm:w-32">
                <label className="text-sm font-bold text-slate-600" htmlFor="quiz-count">
                  Questions
                </label>
                <input
                  id="quiz-count"
                  type="number"
                  min={1}
                  max={10}
                  value={questionCount}
                  onChange={(e) =>
                    setQuestionCount(
                      Math.max(1, Math.min(10, Number(e.target.value) || 5))
                    )
                  }
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm outline-none transition focus:border-primary-400"
                />
              </div>
              <button
                type="button"
                onClick={launch}
                disabled={creating || chapters.length === 0}
                className="inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-6 py-3.5 text-base font-extrabold text-white shadow-lift transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creating ? "Lancement…" : "Lancer le Quiz"}
              </button>
            </div>

            {chapters.length === 0 && (
              <p className="mt-4 text-sm font-medium text-slate-500">
                Aucun chapitre compatible avec le générateur de quiz pour
                l'instant.
              </p>
            )}
          </motion.section>
        )}

        {live && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-slate-200 bg-white p-7 shadow-card sm:p-9"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-primary-100 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-primary-800">
                    {live.chapterTitle}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white ${
                      live.status === "ACTIVE" ? "bg-green-600" : "bg-slate-500"
                    }`}
                  >
                    {live.status === "ACTIVE" ? "En cours" : "Fermé"}
                  </span>
                </div>
                <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900">
                  Quiz en direct
                </h2>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  {live.totalQuestions} questions ·{" "}
                  {live.participants.length} participant(s)
                </p>
              </div>
              <div className="text-center">
                <div className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Code à projeter
                </div>
                <div className="mt-1 rounded-2xl bg-slate-900 px-5 py-2.5 text-3xl font-black tracking-[0.3em] text-white">
                  {live.code}
                </div>
                <Link
                  href={`/join?code=${live.code}`}
                  className="mt-2 inline-block text-xs font-semibold text-primary-600 underline"
                >
                  Lien élève : /join?code={live.code}
                </Link>
              </div>
            </div>

            {live.status === "ACTIVE" && (
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={closeQuiz}
                  disabled={closing}
                  className="inline-flex items-center rounded-2xl bg-red-600 px-5 py-3 text-sm font-extrabold text-white shadow-lift transition hover:bg-red-700 disabled:opacity-50"
                >
                  {closing ? "Fermeture…" : "Fermer le quiz"}
                </button>
              </div>
            )}

            <div className="mt-8">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500">
                Résultats en direct
              </h3>
              {live.participants.length === 0 ? (
                <p className="mt-3 rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm font-medium text-slate-400">
                  En attente des élèves… Partagez le code{" "}
                  <span className="font-black text-slate-600">{live.code}</span>{" "}
                  ou le lien ci-dessus.
                </p>
              ) : (
                <div className="mt-3 overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full min-w-[480px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-extrabold uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Élève</th>
                        <th className="px-4 py-3">Score</th>
                        <th className="px-4 py-3">Progression</th>
                        <th className="px-4 py-3">Soumission</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {live.participants.map((p) => {
                        const pct =
                          p.totalQuestions > 0
                            ? Math.round((p.score / p.totalQuestions) * 100)
                            : 0;
                        return (
                          <tr key={p.id}>
                            <td className="px-4 py-3 font-bold text-slate-800">
                              {p.studentName}
                            </td>
                            <td className="px-4 py-3 font-extrabold text-primary-700">
                              {p.score}/{p.totalQuestions}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-100">
                                  <div
                                    className={`h-full rounded-full ${
                                      pct >= 50 ? "bg-green-500" : "bg-amber-500"
                                    }`}
                                    style={{ width: `${Math.max(4, pct)}%` }}
                                  />
                                </div>
                                <span className="text-xs font-bold text-slate-500">
                                  {pct}%
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-xs font-medium text-slate-500">
                              {new Date(p.submittedAt).toLocaleTimeString(
                                "fr-MA",
                                { hour: "2-digit", minute: "2-digit" }
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {live.status === "CLOSED" && (
              <button
                type="button"
                onClick={() => setLive(null)}
                className="mt-6 rounded-2xl bg-primary-600 px-5 py-3 text-sm font-extrabold text-white shadow-lift transition hover:bg-primary-700"
              >
                Lancer un nouveau quiz
              </button>
            )}
          </motion.section>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
        Quiz en classe · Ustadi
      </footer>
    </div>
  );
}