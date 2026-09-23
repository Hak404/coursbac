"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Formula } from "@/components/ui/TeX";
import { AttemptStatusBadge } from "@/components/assignments/AttemptStatusBadge";
import { formatDateTime } from "@/lib/assignments/professor-ui";
import {
  formatPercentage,
  formatScore,
  type QuestionResult,
} from "@/lib/assignments/professor-results";
import { friendlyApiError, optionLetter } from "@/lib/assignments/student-ui";

type AttemptDetailPayload = {
  assignment: {
    id: string;
    title: string;
    accessCode: string;
    status: string;
    showFeedback: boolean;
  };
  attempt: {
    id: string;
    attemptNumber: number;
    status: string;
    score: number | null;
    percentage: number | null;
    startedAt: string;
    submittedAt: string | null;
    student: { id: string; name: string; email: string };
  };
  summary: { earnedPoints: number; totalPoints: number; percentage: number };
  questions: QuestionResult[];
};

function optionsOf(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string");
}

export function ProfessorAttemptResult({
  id,
  attemptId,
}: {
  id: string;
  attemptId: string;
}) {
  const [data, setData] = useState<AttemptDetailPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError(null);
      try {
        const res = await fetch(
          `/api/assignments/${id}/results/${attemptId}`
        );
        const json = await res.json().catch(() => null);
        if (cancelled) return;
        if (!res.ok || !json?.ok) {
          setError(
            friendlyApiError(res.status, json?.error, {
              notFound: "Tentative introuvable.",
            })
          );
          return;
        }
        setData(json as AttemptDetailPayload);
      } catch {
        if (!cancelled) setError("Erreur réseau. Veuillez réessayer.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, attemptId, reload]);

  if (error) {
    return (
      <div className="mx-auto w-full max-w-5xl px-5 pb-16 pt-10 sm:pt-14">
        <Link
          href={`/professeur/travaux/${id}/resultats`}
          className="text-sm font-bold text-primary-700 transition hover:text-primary-800"
        >
          ← Retour aux résultats
        </Link>
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-card">
          <p className="text-sm font-bold text-danger-600">{error}</p>
          <button
            type="button"
            onClick={() => setReload((n) => n + 1)}
            className="mt-4 rounded-2xl bg-primary-600 px-5 py-2.5 text-sm font-extrabold text-white shadow-lift transition hover:bg-primary-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto w-full max-w-5xl px-5 pb-16 pt-10 sm:pt-14">
        <div className="h-6 w-56 animate-pulse-soft rounded-full bg-slate-200" />
        <div className="mt-6 space-y-4">
          <div className="h-40 animate-pulse-soft rounded-3xl bg-white shadow-card" />
          <div className="h-64 animate-pulse-soft rounded-3xl bg-white shadow-card" />
        </div>
      </div>
    );
  }

  const { attempt, summary, assignment } = data;

  return (
    <div className="mx-auto w-full max-w-5xl px-5 pb-16 pt-10 sm:pt-14">
      <Link
        href={`/professeur/travaux/${id}/resultats`}
        className="text-sm font-bold text-primary-700 transition hover:text-primary-800"
      >
        ← Retour aux résultats
      </Link>

      <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-7 shadow-card sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-sm font-bold uppercase tracking-wide text-slate-400">
              {assignment.title}
            </div>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              {attempt.student.name}
            </h1>
            <div className="mt-1 text-sm font-semibold text-slate-500">
              {attempt.student.email}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-extrabold text-slate-500">
              Tentative #{attempt.attemptNumber}
            </span>
            <AttemptStatusBadge status={attempt.status} />
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 px-5 py-4">
            <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Score
            </div>
            <div className="mt-1 text-3xl font-extrabold text-slate-900">
              {attempt.score !== null
                ? `${formatScore(attempt.score)} / ${formatScore(summary.totalPoints)}`
                : "—"}
            </div>
          </div>
          <div className="rounded-2xl bg-slate-50 px-5 py-4">
            <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Pourcentage
            </div>
            <div className="mt-1 text-3xl font-extrabold text-success-700">
              {attempt.percentage !== null ? formatPercentage(attempt.percentage) : "—"}
            </div>
          </div>
          <div className="rounded-2xl bg-slate-50 px-5 py-4">
            <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Rendu le
            </div>
            <div className="mt-1 text-sm font-extrabold text-slate-900">
              {formatDateTime(attempt.submittedAt ?? attempt.startedAt)}
            </div>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mt-6 space-y-4"
      >
        {data.questions.map((q) => {
          const options = optionsOf(q.options);
          const selected =
            q.selectedIndex !== null && q.selectedIndex >= 0 &&
            q.selectedIndex < options.length
              ? options[q.selectedIndex]
              : null;
          const correct = options[q.correctOptionIndex] ?? null;
          return (
            <section
              key={q.questionId}
              className="rounded-3xl border border-slate-200 bg-white p-7 shadow-card sm:p-8"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-extrabold text-slate-400">
                    Question {q.index + 1}
                  </span>
                  <h2 className="text-base font-extrabold leading-snug text-slate-900">
                    {q.title}
                  </h2>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-extrabold ring-1 ${
                    q.isCorrect
                      ? "bg-success-50 text-success-700 ring-success-200"
                      : q.isCorrect === null
                      ? "bg-slate-100 text-slate-500 ring-slate-200"
                      : "bg-danger-50 text-danger-600 ring-danger-200"
                  }`}
                >
                  {formatScore(q.earnedPoints)} / {formatScore(q.points)} pt
                </span>
              </div>

              {q.formula ? (
                <div className="mt-3 overflow-x-auto rounded-2xl bg-slate-50 px-4 py-3">
                  <Formula className="text-slate-900">{q.formula}</Formula>
                </div>
              ) : null}

              <ol className="mt-4 space-y-1.5">
                {options.map((option, i) => {
                  const isCorrect = i === q.correctOptionIndex;
                  const isSelected = i === q.selectedIndex;
                  return (
                    <li
                      key={i}
                      className={`flex items-start gap-2 rounded-xl px-3 py-1.5 text-sm font-semibold ${
                        isCorrect
                          ? "bg-success-100 text-success-800"
                          : isSelected
                          ? "bg-danger-50 text-danger-700"
                          : "bg-white text-slate-600"
                      }`}
                    >
                      <span className="font-extrabold">{optionLetter(i)}</span>
                      <span className="flex-1">{option}</span>
                      {isCorrect ? (
                        <span className="text-xs font-extrabold uppercase text-success-700">
                          Bonne réponse
                        </span>
                      ) : null}
                      {isSelected && !isCorrect ? (
                        <span className="text-xs font-extrabold uppercase text-danger-600">
                          Choisie
                        </span>
                      ) : null}
                    </li>
                  );
                })}
              </ol>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-xl bg-danger-50 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-danger-600 ring-1 ring-danger-200">
                  Réponse de l'étudiant
                </span>
                {selected !== null ? (
                  <span className="font-bold text-slate-700">
                    {optionLetter(q.selectedIndex as number)} — {selected}
                  </span>
                ) : (
                  <span className="font-bold text-slate-700">Non répondue</span>
                )}
                <span className="text-sm font-semibold text-slate-400">·</span>
                <span className="inline-flex items-center rounded-xl bg-success-100 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-success-700 ring-1 ring-success-200">
                  Bonne réponse
                </span>
                <span className="font-bold text-slate-700">
                  {correct !== null
                    ? `${optionLetter(q.correctOptionIndex)} — ${correct}`
                    : "—"}
                </span>
              </div>
            </section>
          );
        })}
      </motion.div>
    </div>
  );
}