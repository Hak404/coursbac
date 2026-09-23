"use client";

import { useEffect, useState } from "react";
import { Formula } from "@/components/ui/TeX";
import type { BankQuestion, SelectedQuestionEntry } from "@/lib/assignments/professor-ui";
import {
  difficultyLabel,
  filterQuestionsByDifficulty,
  isQuestionSelected,
} from "@/lib/assignments/professor-ui";
import { friendlyApiError, optionLetter } from "@/lib/assignments/student-ui";

export function QuestionBank({
  chapterSlug,
  selected,
  onToggle,
}: {
  chapterSlug: string;
  selected: SelectedQuestionEntry[];
  onToggle: (question: BankQuestion) => void;
}) {
  const [questions, setQuestions] = useState<BankQuestion[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    if (!chapterSlug) {
      setQuestions(null);
      setError(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    setExpanded(null);
    (async () => {
      try {
        const res = await fetch(
          `/api/quiz/questions?chapterSlug=${encodeURIComponent(chapterSlug)}`
        );
        const data = await res.json().catch(() => null);
        if (cancelled) return;
        if (!res.ok || !data?.ok) {
          setError(friendlyApiError(res.status, data?.error));
          setQuestions(null);
          return;
        }
        setQuestions(data.questions);
      } catch {
        if (!cancelled) {
          setError("Erreur réseau. Veuillez réessayer.");
          setQuestions(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [chapterSlug, reload]);

  if (!chapterSlug) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm font-medium text-slate-400">
        Sélectionnez une matière, un niveau et un chapitre pour afficher la banque de questions.
      </div>
    );
  }

  const visible = filterQuestionsByDifficulty(questions ?? [], difficulty);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-extrabold text-slate-900">Banque de questions</h3>
        <div className="flex items-center gap-2">
          <label htmlFor="bank-difficulty" className="text-sm font-bold text-slate-600">
            Difficulté
          </label>
          <select
            id="bank-difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm outline-none transition focus:border-primary-400"
          >
            <option value="">Toutes</option>
            <option value="EASY">Facile</option>
            <option value="MEDIUM">Moyenne</option>
            <option value="HARD">Difficile</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="mt-4 space-y-3">
          <div className="h-24 animate-pulse-soft rounded-3xl bg-white shadow-card" />
          <div className="h-24 animate-pulse-soft rounded-3xl bg-white shadow-card" />
        </div>
      ) : error ? (
        <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-6 text-center">
          <p className="text-sm font-bold text-danger-600">{error}</p>
          <button
            type="button"
            onClick={() => setReload((n) => n + 1)}
            className="mt-4 rounded-2xl bg-primary-600 px-5 py-2.5 text-sm font-extrabold text-white shadow-lift transition hover:bg-primary-700"
          >
            Réessayer
          </button>
        </div>
      ) : questions === null ? null : visible.length === 0 ? (
        <div className="mt-4 rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm font-medium text-slate-400">
          {difficulty
            ? "Aucune question à cette difficulté pour ce chapitre."
            : "Aucune question dans la banque pour ce chapitre."}
        </div>
      ) : (
        <>
          <p className="mt-3 text-sm font-semibold text-slate-500">
            {visible.length} question{visible.length > 1 ? "s" : ""} disponible
            {visible.length > 1 ? "s" : ""}
          </p>
          <ul className="mt-4 space-y-3">
            {visible.map((q) => {
              const checked = isQuestionSelected(selected, q.id);
              const isOpen = expanded === q.id;
              return (
                <li
                  key={q.id}
                  className={`rounded-3xl border bg-white p-5 shadow-card transition ${
                    checked ? "border-primary-300 ring-2 ring-primary-100" : "border-slate-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      id={`bank-q-${q.id}`}
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggle(q)}
                      aria-label={`Sélectionner : ${q.title}`}
                      className="mt-1.5 h-5 w-5 accent-primary-600"
                    />
                    <div className="flex-1">
                      <label htmlFor={`bank-q-${q.id}`} className="cursor-pointer">
                        <span className="text-base font-extrabold leading-snug text-slate-900">
                          {q.title}
                        </span>
                      </label>
                      {q.formula ? (
                        <div className="mt-2 overflow-x-auto rounded-2xl bg-slate-50 px-3 py-2">
                          <Formula className="text-slate-900">{q.formula}</Formula>
                        </div>
                      ) : null}
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-extrabold uppercase tracking-wide text-slate-600">
                          {difficultyLabel(q.difficulty)}
                        </span>
                        {q.isTemplate ? (
                          <span className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-extrabold uppercase tracking-wide text-primary-700">
                            Modèle
                          </span>
                        ) : null}
                        {checked ? (
                          <span className="rounded-full bg-success-50 px-2.5 py-1 text-xs font-extrabold uppercase tracking-wide text-success-700">
                            Sélectionnée ✓
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setExpanded(isOpen ? null : q.id)}
                      aria-expanded={isOpen}
                      className="rounded-xl bg-white px-3 py-1.5 text-xs font-extrabold text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50"
                    >
                      {isOpen ? "Masquer" : "Voir la question"}
                    </button>
                  </div>

                  {isOpen ? (
                    <div className="mt-4 border-t border-slate-100 pt-4">
                      <ol className="space-y-2">
                        {q.options.map((option, i) => {
                          const isCorrect = i === q.correctOptionIndex;
                          return (
                            <li
                              key={i}
                              className={`flex items-start gap-2 rounded-2xl px-3 py-2 text-sm font-semibold text-slate-700 ${
                                isCorrect ? "bg-success-50 text-success-800" : "bg-slate-50"
                              }`}
                            >
                              <span className="font-extrabold">{optionLetter(i)}</span>
                              <span className="flex-1">{option}</span>
                              {isCorrect ? (
                                <span className="text-xs font-extrabold uppercase text-success-700">
                                  Bonne réponse
                                </span>
                              ) : null}
                            </li>
                          );
                        })}
                      </ol>
                      <p className="mt-3 text-xs font-medium text-slate-400">
                        Les points sont configurés dans la liste des questions sélectionnées.
                      </p>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}