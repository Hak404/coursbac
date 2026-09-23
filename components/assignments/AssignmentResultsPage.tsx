"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { ResultsPayload } from "@/lib/assignments/student-ui";
import {
  clearAttemptAnswers,
  clearCurrentAttempt,
  friendlyApiError,
  optionLetter,
  saveCurrentAttempt,
} from "@/lib/assignments/student-ui";

export function AssignmentResultsPage({
  assignmentId,
  attemptId,
}: {
  assignmentId: string;
  attemptId: string;
}) {
  const router = useRouter();
  const [result, setResult] = useState<ResultsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [notSubmitted, setNotSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  const [redoing, setRedoing] = useState(false);
  const [redoError, setRedoError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      setNotSubmitted(false);
      clearCurrentAttempt();
      clearAttemptAnswers(attemptId);
      try {
        const res = await fetch(
          `/api/assignments/${assignmentId}/attempts/${attemptId}/results`
        );
        const data = await res.json().catch(() => null);
        if (cancelled) return;
        if (res.status === 409) {
          setNotSubmitted(true);
          return;
        }
        if (!res.ok || !data?.ok) {
          setError(
            friendlyApiError(res.status, data?.error, {
              notFound: "Résultat introuvable.",
            })
          );
          return;
        }
        setResult(data);
      } catch {
        if (!cancelled) setError("Erreur réseau. Veuillez réessayer.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [assignmentId, attemptId, reload]);

  async function redoAttempt() {
    setRedoError(null);
    setRedoing(true);
    try {
      const res = await fetch(`/api/assignments/${assignmentId}/attempts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        setRedoError(
          friendlyApiError(res.status, data?.error, {
            notFound: "Ce travail n'est plus disponible.",
          })
        );
        return;
      }
      saveCurrentAttempt({
        assignmentId,
        attemptId: data.attempt.id,
        title: result?.assignment.title ?? "Travail",
      });
      router.push(`/etudiant/travaux/${assignmentId}/attempt/${data.attempt.id}`);
    } catch {
      setRedoError("Erreur réseau. Veuillez réessayer.");
    } finally {
      setRedoing(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-3xl px-5 pb-16 pt-10 sm:pt-14">
        <div className="h-6 w-56 animate-pulse-soft rounded-full bg-slate-200" />
        <div className="mt-6 h-64 animate-pulse-soft rounded-3xl bg-white shadow-card" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-3xl px-5 pb-16 pt-10 sm:pt-14">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-card sm:p-10">
          <div className="text-lg font-extrabold text-slate-900">{error}</div>
          <button
            type="button"
            onClick={() => setReload((n) => n + 1)}
            className="mt-6 rounded-2xl bg-primary-600 px-6 py-3.5 text-base font-extrabold text-white shadow-lift transition hover:bg-primary-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (notSubmitted) {
    return (
      <div className="mx-auto w-full max-w-3xl px-5 pb-16 pt-10 sm:pt-14">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-card sm:p-10">
          <div className="text-lg font-extrabold text-slate-900">
            Cette tentative n'est pas encore terminée
          </div>
          <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">
            Envoyez vos réponses depuis la page du travail pour voir vos résultats.
          </p>
          <button
            type="button"
            onClick={() =>
              router.push(`/etudiant/travaux/${assignmentId}/attempt/${attemptId}`)
            }
            className="mt-6 rounded-2xl bg-primary-600 px-6 py-3.5 text-base font-extrabold text-white shadow-lift transition hover:bg-primary-700"
          >
            Reprendre la tentative
          </button>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const { assignment, attempt, summary, questions } = result;
  const answeredCount = questions.filter((q) => q.selectedIndex !== null).length;
  const correctCount = assignment.showFeedback
    ? questions.filter((q) => q.isCorrect === true).length
    : 0;
  const incorrectCount = assignment.showFeedback ? answeredCount - correctCount : 0;

  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-16 pt-10 sm:pt-14">
      <div className="text-xs font-bold uppercase tracking-wide text-primary-700">
        Résultat · Tentative {attempt.attemptNumber}
      </div>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        {assignment.title}
      </h1>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card"
      >
        <div className="flex flex-col items-center gap-6 px-7 py-8 sm:flex-row sm:justify-between sm:px-9">
          <div className="text-center sm:text-left">
            <div className="text-sm font-extrabold uppercase tracking-wide text-slate-400">
              Votre score
            </div>
            <div className="mt-2 text-6xl font-extrabold tracking-tight text-slate-900">
              {summary.earnedPoints}
              <span className="text-3xl font-extrabold text-slate-400">
                {" "}
                / {summary.totalPoints}
              </span>
            </div>
            <div className="mt-2 text-sm font-bold text-slate-500">
              {summary.percentage} % de la note maximale
            </div>
          </div>

          <div className="grid w-full grid-cols-3 gap-4 sm:w-auto">
            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-center">
              <div className="text-2xl font-extrabold text-slate-900">{answeredCount}</div>
              <div className="mt-0.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                Répondues
              </div>
            </div>
            {assignment.showFeedback ? (
              <>
                <div className="rounded-2xl bg-success-50 px-4 py-3 text-center">
                  <div className="text-2xl font-extrabold text-success-600">{correctCount}</div>
                  <div className="mt-0.5 text-[11px] font-bold uppercase tracking-wide text-success-700">
                    Correctes
                  </div>
                </div>
                <div className="rounded-2xl bg-danger-50 px-4 py-3 text-center">
                  <div className="text-2xl font-extrabold text-danger-600">{incorrectCount}</div>
                  <div className="mt-0.5 text-[11px] font-bold uppercase tracking-wide text-danger-700">
                    Incorrectes
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>

        {!assignment.showFeedback ? (
          <div className="border-t border-slate-100 px-7 py-4 sm:px-9">
            <p className="text-xs font-semibold text-slate-400">
              Le professeur n'a pas activé l'affichage du détail des réponses pour ce travail.
            </p>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 border-t border-slate-100 px-7 py-6 sm:flex-row sm:justify-end sm:px-9">
          <Link
            href="/etudiant/travaux"
            className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50"
          >
            Retour aux travaux
          </Link>
          {assignment.showFeedback ? (
            <button
              type="button"
              onClick={redoAttempt}
              disabled={redoing}
              className="inline-flex items-center justify-center rounded-2xl bg-primary-600 px-5 py-3 text-sm font-extrabold text-white shadow-lift transition hover:bg-primary-700 disabled:opacity-60"
            >
              {redoing ? "Préparation du travail…" : "Refaire le travail"}
            </button>
          ) : null}
        </div>
      </motion.div>

      {redoError ? (
        <p
          role="alert"
          className="mt-4 rounded-2xl bg-danger-50 px-4 py-3 text-sm font-bold text-danger-600"
        >
          {redoError}
        </p>
      ) : null}

      {assignment.showFeedback ? (
        <div className="mt-6 space-y-4">
          <div className="text-sm font-extrabold uppercase tracking-wide text-slate-400">
            Détail des réponses
          </div>
          {questions.map((q) => {
            const answeredNow = q.selectedIndex !== null;
            const isCorrect = q.isCorrect === true;
            return (
              <div
                key={q.id}
                className={`rounded-3xl border bg-white p-6 shadow-card ${
                  answeredNow && isCorrect
                    ? "border-success-200"
                    : answeredNow
                      ? "border-danger-200"
                      : "border-slate-200"
                }`}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wide text-slate-400">
                    Question {q.index}
                  </span>
                  <span
                    className={`text-sm font-extrabold ${
                      answeredNow && isCorrect
                        ? "text-success-600"
                        : answeredNow
                          ? "text-danger-600"
                          : "text-slate-400"
                    }`}
                  >
                    {answeredNow && isCorrect
                      ? `+${q.points} point(s)`
                      : answeredNow
                        ? "0 point"
                        : "Sans réponse"}
                  </span>
                </div>
                <h3 className="mt-1 text-lg font-bold leading-snug text-slate-900">{q.title}</h3>
                <dl className="mt-4 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Votre réponse
                    </dt>
                    <dd className="mt-1 font-extrabold text-slate-900">
                      {answeredNow ? optionLetter(q.selectedIndex) : "Aucune"}
                    </dd>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Bonne réponse
                    </dt>
                    <dd className="mt-1 font-extrabold text-success-700">
                      {optionLetter(q.correctOptionIndex)}
                    </dd>
                  </div>
                </dl>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}