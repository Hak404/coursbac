"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Formula } from "@/components/ui/TeX";
import type { AnswerMap, SafeQuestion } from "@/lib/assignments/student-ui";
import {
  answerQuestion,
  buildSubmitPayload,
  clearAttemptAnswers,
  countAnswered,
  countUnanswered,
  EMPTY_ANSWERS,
  friendlyApiError,
  loadAttemptAnswers,
  loadCurrentAttempt,
  optionLetter,
  saveAttemptAnswers,
} from "@/lib/assignments/student-ui";

export function AssignmentAttemptPage({
  assignmentId,
  attemptId,
}: {
  assignmentId: string;
  attemptId: string;
}) {
  const router = useRouter();
  const [questions, setQuestions] = useState<SafeQuestion[] | null>(null);
  const [title, setTitle] = useState("Travail");
  const [answers, setAnswers] = useState<AnswerMap>(EMPTY_ANSWERS);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const stored = loadCurrentAttempt();
    if (stored?.attemptId === attemptId) setTitle(stored.title);

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/assignments/${assignmentId}/attempts/${attemptId}`
        );
        const data = await res.json().catch(() => null);
        if (cancelled) return;
        if (!res.ok || !data?.ok) {
          setLoadError(friendlyApiError(res.status, data?.error));
          return;
        }
        if (data.attempt.status !== "IN_PROGRESS") {
          clearAttemptAnswers(attemptId);
          router.replace(`/etudiant/travaux/${assignmentId}/attempt/${attemptId}/results`);
          return;
        }
        const sorted = [...data.questions].sort(
          (a: SafeQuestion, b: SafeQuestion) => a.index - b.index
        );
        setQuestions(sorted);
        const allowed = new Set(sorted.map((q) => q.id));
        setAnswers(loadAttemptAnswers(attemptId, allowed));
      } catch {
        if (!cancelled) setLoadError("Erreur réseau. Veuillez réessayer.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [assignmentId, attemptId, router]);

  async function confirmSubmit() {
    if (!questions) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = buildSubmitPayload(answers);
      const res = await fetch(
        `/api/assignments/${assignmentId}/attempts/${attemptId}/submit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json().catch(() => null);
      if (res.status === 409) {
        clearAttemptAnswers(attemptId);
        router.replace(`/etudiant/travaux/${assignmentId}/attempt/${attemptId}/results`);
        return;
      }
      if (!res.ok || !data?.ok) {
        setSubmitError(
          friendlyApiError(res.status, data?.error, {
            notFound: "Tentative introuvable.",
          })
        );
        setSubmitting(false);
        return;
      }
      clearAttemptAnswers(attemptId);
      setConfirmOpen(false);
      router.replace(`/etudiant/travaux/${assignmentId}/attempt/${attemptId}/results`);
    } catch {
      setSubmitError("Erreur réseau. Veuillez réessayer.");
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-3xl px-5 pb-16 pt-10 sm:pt-14">
        <div className="h-6 w-56 animate-pulse-soft rounded-full bg-slate-200" />
        <div className="mt-6 h-72 animate-pulse-soft rounded-3xl bg-white shadow-card" />
      </div>
    );
  }

  if (loadError || !questions) {
    return (
      <div className="mx-auto w-full max-w-3xl px-5 pb-16 pt-10 sm:pt-14">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-card sm:p-10">
          <div className="text-lg font-extrabold text-slate-900">
            {loadError ?? "Tentative introuvable."}
          </div>
          <button
            type="button"
            onClick={() => router.refresh()}
            className="mt-6 rounded-2xl bg-primary-600 px-6 py-3.5 text-base font-extrabold text-white shadow-lift transition hover:bg-primary-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const total = questions.length;
  const answered = countAnswered(answers);
  const unanswered = countUnanswered(total, answered);
  const question = questions[current];
  const progress = total === 0 ? 100 : Math.round((answered / total) * 100);

  function chooseOption(optionIndex: number) {
    setConfirmOpen(false);
    setSubmitError(null);
    setAnswers((prev) => {
      const next = answerQuestion(prev, question.id, optionIndex);
      saveAttemptAnswers(attemptId, next);
      return next;
    });
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-16 pt-8 sm:pt-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-wide text-primary-700">
            Travail en cours
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            {title}
          </h1>
        </div>
        <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-extrabold text-slate-700">
          {answered} / {total} répondues
        </div>
      </header>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-primary-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <nav aria-label="Questions" className="mt-6 flex flex-wrap gap-2">
        {questions.map((q, index) => {
          const isCurrent = index === current;
          const isDone = answers[q.id] !== undefined;
          const classes = isCurrent
            ? "bg-primary-600 text-white shadow-lift ring-4 ring-primary-200"
            : isDone
              ? "bg-primary-50 text-primary-700 ring-1 ring-primary-200"
              : "bg-white text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50";
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => setCurrent(index)}
              aria-current={isCurrent ? "step" : undefined}
              className={`h-11 w-11 rounded-2xl text-sm font-extrabold transition ${classes}`}
            >
              {q.index}
            </button>
          );
        })}
      </nav>

      <motion.div
        key={question.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mt-6 rounded-3xl border border-slate-200 bg-white p-7 shadow-card sm:p-9"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-sm font-extrabold uppercase tracking-wide text-slate-400">
            Question {question.index} / {total}
          </span>
          <span className="text-sm font-bold text-slate-500">{question.points} point(s)</span>
        </div>

        <h2 className="mt-3 text-xl font-extrabold leading-snug text-slate-900">
          {question.title}
        </h2>
        {question.formula ? (
          <div className="mt-3 overflow-x-auto rounded-2xl bg-slate-50 px-4 py-3">
            <Formula className="text-slate-900">{question.formula}</Formula>
          </div>
        ) : null}

        <fieldset className="mt-6">
          <legend className="sr-only">Choisissez une réponse</legend>
          <div className="space-y-3">
            {question.options.map((option, optionIndex) => {
              const selected = answers[question.id] === optionIndex;
              const inputId = `q-${question.id}-o-${optionIndex}`;
              return (
                <label
                  key={inputId}
                  htmlFor={inputId}
                  className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3.5 transition ${
                    selected
                      ? "border-primary-500 bg-primary-50 ring-4 ring-primary-100"
                      : "border-slate-200 bg-white hover:border-primary-300 hover:bg-primary-50/40"
                  }`}
                >
                  <input
                    id={inputId}
                    type="radio"
                    name={`question-${question.id}`}
                    checked={selected}
                    onChange={() => chooseOption(optionIndex)}
                    disabled={submitting}
                    className="mt-1 h-4 w-4 accent-primary-600"
                  />
                  <span className="flex-1">
                    <span
                      className={`mr-2 inline-flex h-6 w-6 items-center justify-center rounded-lg text-xs font-extrabold ${
                        selected ? "bg-primary-600 text-white" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {optionLetter(optionIndex)}
                    </span>
                    <span className="text-[15px] font-semibold leading-relaxed text-slate-700">
                      {option}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-7 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setCurrent(Math.max(0, current - 1))}
            disabled={current === 0 || submitting}
            className="rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-40"
          >
            Précédent
          </button>
          {current < total - 1 ? (
            <button
              type="button"
              onClick={() => setCurrent(Math.min(total - 1, current + 1))}
              disabled={submitting}
              className="rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-primary-700 ring-1 ring-primary-200 transition hover:bg-primary-50 disabled:opacity-40"
            >
              Suivant
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              disabled={submitting}
              className="rounded-2xl bg-primary-600 px-6 py-3 text-sm font-extrabold text-white shadow-lift transition hover:bg-primary-700 disabled:opacity-40"
            >
              Terminer
            </button>
          )}
        </div>
      </motion.div>

      {confirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-card"
          >
            <h2 id="confirm-title" className="text-xl font-extrabold text-slate-900">
              Terminer le travail ?
            </h2>
            <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600">
              Vous avez répondu à <strong className="text-slate-900">{answered}</strong> question
              {answered > 1 ? "s" : ""} sur{" "}
              <strong className="text-slate-900">{total}</strong>.
              {unanswered > 0 ? (
                <>
                  {" "}
                  <strong className="text-danger-600">{unanswered}</strong> question
                  {unanswered > 1 ? "s" : ""} rest{unanswered > 1 ? "ent" : "e"} sans réponse.
                </>
              ) : null}
            </p>
            <p className="mt-1 text-sm font-medium text-slate-600">
              Une fois envoyées, vos réponses ne peuvent plus être modifiées.
            </p>
            {submitError ? (
              <p role="alert" className="mt-3 rounded-2xl bg-danger-50 px-4 py-3 text-sm font-bold text-danger-600">
                {submitError}
              </p>
            ) : null}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                disabled={submitting}
                className="rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-40"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={confirmSubmit}
                disabled={submitting}
                className="rounded-2xl bg-primary-600 px-6 py-3 text-sm font-extrabold text-white shadow-lift transition hover:bg-primary-700 disabled:opacity-40"
              >
                {submitting ? "Envoi en cours…" : "Envoyer mes réponses"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}