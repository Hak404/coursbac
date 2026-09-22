"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

type JoinQuestion = {
  id: string;
  questionText: string;
  options: string[];
};

type AnswerDetail = {
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  userAnswer: number;
  isCorrect: boolean;
};

type Step = "join" | "quiz" | "results";

export function JoinQuiz() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefilledCode = searchParams.get("code") ?? "";

  const [step, setStep] = useState<Step>("join");
  const [code, setCode] = useState<string>(prefilledCode);
  const [studentName, setStudentName] = useState<string>("");
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [chapterTitle, setChapterTitle] = useState<string>("");
  const [questions, setQuestions] = useState<JoinQuestion[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    total: number;
    details: AnswerDetail[];
  } | null>(null);

  async function joinQuiz() {
    setError(null);
    const cleanCode = code.trim();
    const name = studentName.trim();
    if (!/^\d{6}$/.test(cleanCode)) {
      setError("Le code doit contenir exactement 6 chiffres.");
      return;
    }
    if (name.length < 2) {
      setError("Veuillez saisir votre nom et prénom.");
      return;
    }
    setJoining(true);
    try {
      const res = await fetch(`/api/quiz/sessions/${cleanCode}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentName: name }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Impossible de rejoindre le quiz.");
        return;
      }
      setChapterTitle(data.chapterTitle);
      setQuestions(data.questions);
      setAnswers(data.questions.map(() => null));
      setStep("quiz");
    } catch {
      setError("Erreur réseau. Réessayez.");
    } finally {
      setJoining(false);
    }
  }

  async function submitAnswers() {
    setError(null);
    const cleanCode = code.trim();
    const name = studentName.trim();
    if (answers.some((a) => a === null)) {
      setError("Répondez à toutes les questions avant d'envoyer.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/quiz/sessions/${cleanCode}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentName: name, answers }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Impossible d'envoyer vos réponses.");
        return;
      }
      setResult({ score: data.score, total: data.total, details: data.details });
      setStep("results");
    } catch {
      setError("Erreur réseau. Réessayez.");
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "quiz") {
    return (
      <div className="mx-auto w-full max-w-3xl px-5 pb-16 pt-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-bold text-primary-700">
              Quiz · {chapterTitle}
            </div>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
              Répondez aux questions
            </h1>
          </div>
          <div className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold tracking-widest text-white">
            Code {code}
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-5">
          {questions.map((q, qi) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: qi * 0.05 }}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card"
            >
              <div className="text-sm font-extrabold text-primary-600">
                Question {qi + 1}
              </div>
              <p className="mt-1.5 text-[15px] font-semibold leading-relaxed text-slate-800">
                {q.questionText}
              </p>
              <div className="mt-4 flex flex-col gap-2">
                {q.options.map((opt, oi) => {
                  const selected = answers[qi] === oi;
                  return (
                    <label
                      key={oi}
                      className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                        selected
                          ? "border-primary-400 bg-primary-50 text-primary-800"
                          : "border-slate-200 bg-white text-slate-700 hover:border-primary-300 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q-${qi}`}
                        checked={selected}
                        onChange={() =>
                          setAnswers((prev) =>
                            prev.map((v, i) => (i === qi ? oi : v))
                          )
                        }
                        className="h-4 w-4 accent-primary-600"
                      />
                      {opt}
                    </label>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={submitAnswers}
            disabled={submitting}
            className="inline-flex items-center rounded-2xl bg-primary-600 px-8 py-4 text-base font-extrabold text-white shadow-lift transition hover:bg-primary-700 disabled:opacity-50"
          >
            {submitting ? "Envoi…" : "Envoyer mes réponses"}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep("join");
              setQuestions([]);
              setResult(null);
            }}
            className="rounded-2xl bg-white px-5 py-4 text-sm font-bold text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50"
          >
            ← Annuler
          </button>
        </div>
      </div>
    );
  }

  if (step === "results" && result) {
    const pct = result.total > 0 ? Math.round((result.score / result.total) * 100) : 0;
    return (
      <div className="mx-auto w-full max-w-3xl px-5 pb-16 pt-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-card"
        >
          <div className="text-sm font-bold text-primary-700">
            Quiz terminé · {chapterTitle}
          </div>
          <div className="mt-4 text-5xl font-black tracking-tight text-slate-900">
            {result.score}
            <span className="text-3xl text-slate-400">/{result.total}</span>
          </div>
          <div className="mt-2 text-lg font-extrabold text-primary-700">
            {pct} %
          </div>
          <p className="mt-3 text-sm font-medium text-slate-500">
            {pct >= 70
              ? "Excellent travail ! 🎉"
              : pct >= 50
              ? "Pas mal, continuez vos efforts."
              : "Courage, revoyez le chapitre et réessayez."}
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center rounded-2xl bg-primary-600 px-6 py-3 text-sm font-extrabold text-white shadow-lift transition hover:bg-primary-700"
            >
              Retour à l'accueil
            </Link>
          </div>
        </motion.div>

        <h2 className="mt-10 text-lg font-extrabold tracking-tight text-slate-900">
          Correction détaillée
        </h2>
        <div className="mt-4 flex flex-col gap-4">
          {result.details.map((d, qi) => (
            <div
              key={qi}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card"
            >
              <div
                className={`text-xs font-extrabold uppercase tracking-wider ${
                  d.isCorrect ? "text-green-600" : "text-red-600"
                }`}
              >
                {d.isCorrect ? "Bonne réponse ✓" : "Mauvaise réponse ✗"}
              </div>
              <p className="mt-1.5 text-[15px] font-semibold leading-relaxed text-slate-800">
                {d.questionText}
              </p>
              <div className="mt-3 flex flex-col gap-1.5">
                {d.options.map((opt, oi) => {
                  const isCorrectOpt = oi === d.correctOptionIndex;
                  const isUserWrong = oi === d.userAnswer && !d.isCorrect;
                  return (
                    <div
                      key={oi}
                      className={`rounded-xl border px-4 py-2 text-sm font-semibold ${
                        isCorrectOpt
                          ? "border-green-300 bg-green-50 text-green-800"
                          : isUserWrong
                          ? "border-red-300 bg-red-50 text-red-700"
                          : "border-slate-200 bg-white text-slate-600"
                      }`}
                    >
                      {opt}
                      {isCorrectOpt && " ✓"}
                      {isUserWrong && " ✗"}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl px-5 pb-16 pt-12">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-slate-200 bg-white p-7 shadow-card sm:p-9"
      >
        <div className="text-sm font-bold text-primary-700">
          Quiz en classe · Ustadi
        </div>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
          Rejoindre un quiz
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
          Entrez le code à 6 chiffres affiché par votre professeur, puis votre
          nom et prénom. Aucun compte n'est nécessaire.
        </p>

        {error && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-4">
          <div>
            <label className="text-sm font-bold text-slate-600" htmlFor="join-code">
              Code du quiz
            </label>
            <input
              id="join-code"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))
              }
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-2xl font-black tracking-[0.4em] text-slate-900 shadow-sm outline-none transition focus:border-primary-400"
            />
          </div>
          <div>
            <label
              className="text-sm font-bold text-slate-600"
              htmlFor="join-name"
            >
              Nom et prénom
            </label>
            <input
              id="join-name"
              value={studentName}
              maxLength={60}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Ex. : Yassine Alaoui"
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm outline-none transition focus:border-primary-400"
            />
          </div>
          <button
            type="button"
            onClick={joinQuiz}
            disabled={joining}
            className="mt-1 inline-flex items-center justify-center rounded-2xl bg-primary-600 px-6 py-4 text-base font-extrabold text-white shadow-lift transition hover:bg-primary-700 disabled:opacity-50"
          >
            {joining ? "Connexion…" : "Rejoindre et démarrer"}
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="text-xs font-semibold text-slate-400 underline hover:text-slate-600"
          >
            Retour à l'accueil
          </button>
        </div>
      </motion.section>
    </div>
  );
}