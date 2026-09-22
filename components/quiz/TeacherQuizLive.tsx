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

type Difficulty = "EASY" | "MEDIUM" | "HARD";

type DraftQuestion = {
  key: string;
  id?: string;
  title: string;
  formula: string;
  options: string[];
  correctOptionIndex: number;
  difficulty: Difficulty;
  selected: boolean;
};

type BankQuestion = {
  id: string;
  chapterSlug: string;
  title: string;
  formula: string;
  options: string[];
  correctOptionIndex: number;
  difficulty: Difficulty;
  isTemplate: boolean;
};

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

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  EASY: "Facile",
  MEDIUM: "Moyen",
  HARD: "Difficile",
};

const DIFFICULTY_CLASS: Record<Difficulty, string> = {
  EASY: "bg-green-100 text-green-800",
  MEDIUM: "bg-amber-100 text-amber-800",
  HARD: "bg-red-100 text-red-800",
};

let localKey = 0;
function nextKey(): string {
  localKey += 1;
  return `d-${Date.now()}-${localKey}`;
}

function pickDifficulty(value: unknown): Difficulty {
  return value === "EASY" || value === "MEDIUM" || value === "HARD"
    ? value
    : "MEDIUM";
}

export function TeacherQuizLive({ session }: { session: Session }) {
  const chapters = useMemo(
    () =>
      visibleChapters(Object.values(CHAPTERS_META), session).filter((c) =>
        supportsQuiz(c.slug)
      ),
    [session]
  );

  const [chapterSlug, setChapterSlug] = useState<string>("");
  const [drafts, setDrafts] = useState<DraftQuestion[]>([]);
  const [loadingBank, setLoadingBank] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [savingBank, setSavingBank] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [launching, setLaunching] = useState(false);
  const [live, setLive] = useState<MonitorSession | null>(null);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (chapters.length > 0 && chapters[0].slug !== chapterSlug) {
      setChapterSlug(chapters[0].slug);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapters]);

  useEffect(() => {
    if (!chapterSlug) return;
    let active = true;
    setLoadingBank(true);
    setDrafts([]);
    setEditingKey(null);
    fetch(`/api/quiz/questions?chapterSlug=${encodeURIComponent(chapterSlug)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!active) return;
        if (data.ok && Array.isArray(data.questions)) {
          setDrafts(
            (data.questions as BankQuestion[]).map((q) => ({
              key: nextKey(),
              id: q.id,
              title: q.title,
              formula: q.formula,
              options: q.options,
              correctOptionIndex: q.correctOptionIndex,
              difficulty: q.difficulty,
              selected: true,
            }))
          );
        } else if (active) {
          setError(data.error ?? "Impossible de charger la banque.");
        }
      })
      .catch(() => {
        if (active) setError("Erreur réseau lors du chargement de la banque.");
      })
      .finally(() => {
        if (active) setLoadingBank(false);
      });
    return () => {
      active = false;
    };
  }, [chapterSlug]);

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

  function openEditor(key: string) {
    setError(null);
    setEditingKey(key);
  }

  function closeEditor() {
    setEditingKey(null);
  }

  function updateDraft(key: string, patch: Partial<DraftQuestion>) {
    setDrafts((prev) =>
      prev.map((d) => (d.key === key ? { ...d, ...patch } : d))
    );
  }

  function addBlankQuestion() {
    const key = nextKey();
    setDrafts((prev) => [
      ...prev,
      {
        key,
        title: "",
        formula: "",
        options: ["", "", "", ""],
        correctOptionIndex: 0,
        difficulty: "MEDIUM",
        selected: true,
      },
    ]);
    setEditingKey(key);
  }

  async function saveToBank(key: string) {
    const d = drafts.find((x) => x.key === key);
    if (!d) return;
    if (d.title.trim().length < 3) {
      setError("Le titre doit contenir au moins 3 caractères.");
      return;
    }
    if (d.options.length < 2 || d.options.some((o) => o.trim().length === 0)) {
      setError("Renseignez au moins 2 propositions non vides.");
      return;
    }
    if (
      d.correctOptionIndex < 0 ||
      d.correctOptionIndex >= d.options.length
    ) {
      setError("Choisissez une bonne réponse valide.");
      return;
    }
    setSavingBank(true);
    setError(null);
    try {
      const res = await fetch("/api/quiz/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: d.id,
          chapterSlug,
          title: d.title.trim(),
          formula: d.formula.trim(),
          options: d.options.map((o) => o.trim()),
          correctOptionIndex: d.correctOptionIndex,
          difficulty: d.difficulty,
          isTemplate: true,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Impossible de sauvegarder dans la banque.");
        return;
      }
      setDrafts((prev) =>
        prev.map((x) =>
          x.key === key
            ? {
                ...x,
                id: data.question.id,
                title: data.question.title,
              }
            : x
        )
      );
    } catch {
      setError("Erreur réseau.");
    } finally {
      setSavingBank(false);
    }
  }

  async function launch() {
    setError(null);
    const selected = drafts.filter((d) => d.selected);
    if (selected.length === 0) {
      setError("Sélectionnez au moins une question avant de lancer.");
      return;
    }
    const malformed = selected.some(
      (d) =>
        d.title.trim().length === 0 ||
        d.options.length < 2 ||
        d.options.some((o) => o.trim().length === 0) ||
        d.correctOptionIndex < 0 ||
        d.correctOptionIndex >= d.options.length
    );
    if (malformed) {
      setError(
        "Certaines questions sélectionnées sont incomplètes. Vérifiez l'éditeur."
      );
      return;
    }
    setLaunching(true);
    try {
      const res = await fetch("/api/quiz/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapterSlug,
          questions: selected.map((d) => ({
            title: d.title.trim(),
            formula: d.formula.trim(),
            options: d.options.map((o) => o.trim()),
            correctOptionIndex: d.correctOptionIndex,
            difficulty: d.difficulty,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Impossible de lancer la session.");
        return;
      }
      const chapter = CHAPTERS_META[chapterSlug];
      setLive({
        id: data.session.id,
        code: data.session.code,
        status: data.session.status,
        chapterSlug,
        chapterTitle: chapter?.title ?? chapterSlug,
        totalQuestions: selected.length,
        createdAt: new Date().toISOString(),
        participants: [],
      });
    } catch {
      setError("Erreur réseau. Réessayez.");
    } finally {
      setLaunching(false);
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

  const editing = drafts.find((d) => d.key === editingKey) ?? null;
  const enabledCount = drafts.filter((d) => d.selected).length;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div>
            <div className="text-lg font-extrabold tracking-tight text-slate-900">
              Quiz en classe
            </div>
            <div className="text-sm font-medium text-slate-500">
              Banque de QCM, personnalisation et suivi en direct
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
          <>
            <section className="max-w-3xl rounded-3xl border border-slate-200 bg-white p-7 shadow-card sm:p-9">
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
                Lancer un Quiz en classe
              </h2>
              <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
                Choisissez un chapitre, sélectionnez des QCM de la banque
                prédéfinie (ou personnalisez-les), puis lancez la session : un
                code à 6 chiffres sera généré pour vos élèves.
              </p>
              <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <label
                    className="text-sm font-bold text-slate-600"
                    htmlFor="quiz-chapter"
                  >
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
              </div>
              {chapters.length === 0 && (
                <p className="mt-4 text-sm font-medium text-slate-500">
                  Aucun chapitre compatible avec la banque de quiz pour
                  l'instant.
                </p>
              )}
            </section>

            <section className="mt-8 max-w-3xl">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-extrabold tracking-tight text-slate-900">
                    Banque de QCM
                  </h3>
                  <p className="text-sm font-medium text-slate-500">
                    {enabledCount} question(s) sélectionnée(s) pour le lancement
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addBlankQuestion}
                  disabled={loadingBank}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-extrabold text-white transition hover:bg-slate-800 disabled:opacity-50"
                >
                  + Ajouter une question
                </button>
              </div>

              {loadingBank ? (
                <p className="mt-6 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm font-semibold text-slate-400">
                  Chargement de la banque…
                </p>
              ) : drafts.length === 0 ? (
                <p className="mt-6 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm font-semibold text-slate-400">
                  Aucune question dans la banque pour ce chapitre.
                </p>
              ) : (
                <div className="mt-4 flex flex-col gap-4">
                  {drafts.map((d) => (
                    <div
                      key={d.key}
                      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={d.selected}
                            onChange={(e) =>
                              updateDraft(d.key, { selected: e.target.checked })
                            }
                            aria-label="Inclure la question"
                            className="mt-1 h-4 w-4 accent-primary-600"
                          />
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider ${DIFFICULTY_CLASS[d.difficulty]}`}
                              >
                                {DIFFICULTY_LABEL[d.difficulty]}
                              </span>
                              {d.id && (
                                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                  Banque
                                </span>
                              )}
                            </div>
                            <p className="mt-1.5 font-extrabold text-slate-900">
                              {d.title || "— Question sans titre —"}
                            </p>
                            {d.formula.trim() && (
                              <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-[13px] italic text-slate-700">
                                {d.formula}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditor(d.key)}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                          >
                            Modifier / Complexifier
                          </button>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {d.options.map((opt, oi) => (
                          <span
                            key={oi}
                            className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${
                              oi === d.correctOptionIndex
                                ? "border-green-300 bg-green-50 text-green-800"
                                : "border-slate-200 bg-white text-slate-600"
                            }`}
                          >
                            {oi === d.correctOptionIndex ? "✓ " : ""}
                            {opt === "" ? "(vide)" : opt}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={launch}
                disabled={launching || enabledCount === 0}
                className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-7 py-4 text-base font-extrabold text-white shadow-lift transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {launching ? "Lancement…" : "Lancer la session Live"}
              </button>
            </section>
          </>
        )}

        {editing && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 px-4 py-6">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-7 shadow-2xl">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xl font-extrabold tracking-tight text-slate-900">
                  Modifier la question
                </h3>
                <button
                  type="button"
                  onClick={closeEditor}
                  className="rounded-xl bg-slate-100 px-3 py-1.5 text-sm font-bold text-slate-600 hover:bg-slate-200"
                >
                  Fermer
                </button>
              </div>

              <div className="mt-5 flex flex-col gap-4">
                <div>
                  <label className="text-sm font-bold text-slate-600" htmlFor="edit-title">
                    Titre de la question
                  </label>
                  <input
                    id="edit-title"
                    value={editing.title}
                    onChange={(e) =>
                      updateDraft(editing.key, { title: e.target.value })
                    }
                    placeholder="Ex. : Limite d'un quotient"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm outline-none transition focus:border-primary-400"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-600" htmlFor="edit-formula">
                    Formule (LaTeX)
                  </label>
                  <textarea
                    id="edit-formula"
                    value={editing.formula}
                    onChange={(e) =>
                      updateDraft(editing.key, { formula: e.target.value })
                    }
                    rows={2}
                    placeholder="Ex. : \lim_{x \to 2} \frac{x^2 - 4}{x - 2}"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-mono text-sm text-slate-700 shadow-sm outline-none transition focus:border-primary-400"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-slate-600">
                      Propositions
                    </label>
                    {editing.options.length < 6 && (
                      <button
                        type="button"
                        onClick={() =>
                          updateDraft(editing.key, {
                            options: [...editing.options, ""],
                          })
                        }
                        className="text-xs font-bold text-primary-600 hover:underline"
                      >
                        + Ajouter une proposition
                      </button>
                    )}
                  </div>
                  <div className="mt-2 flex flex-col gap-2">
                    {editing.options.map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-2">
                        <label className="flex cursor-pointer items-center gap-2 whitespace-nowrap text-xs font-bold text-slate-500">
                          <input
                            type="radio"
                            name={`correct-${editing.key}`}
                            checked={editing.correctOptionIndex === oi}
                            onChange={() =>
                              updateDraft(editing.key, { correctOptionIndex: oi })
                            }
                            className="h-3.5 w-3.5 accent-green-600"
                          />
                          Bonne
                        </label>
                        <input
                          value={opt}
                          onChange={(e) =>
                            updateDraft(editing.key, {
                              options: editing.options.map((o, i) =>
                                i === oi ? e.target.value : o
                              ),
                            })
                          }
                          placeholder={`Proposition ${oi + 1}`}
                          className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-primary-400"
                        />
                        {editing.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() =>
                              updateDraft(editing.key, {
                                options: editing.options.filter(
                                  (_, i) => i !== oi
                                ),
                                correctOptionIndex:
                                  editing.correctOptionIndex === oi
                                    ? 0
                                    : editing.correctOptionIndex > oi
                                    ? editing.correctOptionIndex - 1
                                    : editing.correctOptionIndex,
                              })
                            }
                            aria-label="Retirer la proposition"
                            className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-500 hover:bg-red-50 hover:text-red-600"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-600" htmlFor="edit-difficulty">
                    Difficulté
                  </label>
                  <select
                    id="edit-difficulty"
                    value={editing.difficulty}
                    onChange={(e) =>
                      updateDraft(editing.key, {
                        difficulty: pickDifficulty(e.target.value),
                      })
                    }
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm outline-none transition focus:border-primary-400"
                  >
                    <option value="EASY">Facile</option>
                    <option value="MEDIUM">Moyen</option>
                    <option value="HARD">Difficile</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => saveToBank(editing.key)}
                  disabled={savingBank}
                  className="rounded-2xl border border-primary-200 bg-primary-50 px-5 py-2.5 text-sm font-extrabold text-primary-800 transition hover:bg-primary-100 disabled:opacity-50"
                >
                  {savingBank
                    ? "Sauvegarde…"
                    : editing.id
                    ? "Sauvegarder dans la banque"
                    : "Publier dans la banque"}
                </button>
                {editing.id && (
                  <button
                    type="button"
                    onClick={() => {
                      const copy: DraftQuestion = {
                        ...editing,
                        key: nextKey(),
                        id: undefined,
                        selected: true,
                      };
                      setDrafts((prev) => [...prev, copy]);
                      setEditingKey(copy.key);
                    }}
                    className="rounded-2xl bg-white px-5 py-2.5 text-sm font-bold text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50"
                  >
                    Dupliquer
                  </button>
                )}
                <button
                  type="button"
                  onClick={closeEditor}
                  className="rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-slate-800"
                >
                  Terminé
                </button>
              </div>
            </div>
          </div>
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