"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { saveQuiz, loadProgress } from "@/lib/progress";

export type QuizQ = {
  q: React.ReactNode;
  options: React.ReactNode[];
  correct: number;
  explain: React.ReactNode;
};

export default function Quiz({
  questions,
  title = "Quiz final",
}: {
  questions: QuizQ[];
  title?: string;
}) {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [best, setBest] = useState<number | null>(null);
  const doneRef = useRef(false);

  useEffect(() => {
    setBest(loadProgress().quizBest);
  }, []);

  const q = questions[idx];
  const answered = picked !== null;

  const pick = (i: number) => {
    if (answered) return;
    setPicked(i);
    const next = [...answers];
    next[idx] = i;
    setAnswers(next);
    if (i === q.correct) {
      const score = next.filter((a, j) => a === questions[j].correct).length;
      if (!doneRef.current) {
        doneRef.current = true;
        const saved = saveQuiz(((score ?? 0) / questions.length) * 100);
        setBest(saved);
      }
    }
  };

  const nextQ = () => {
    if (idx + 1 >= questions.length) {
      setDone(true);
      const score = answers.filter((a, j) => a === questions[j].correct).length;
      if (!doneRef.current) {
        doneRef.current = true;
        const saved = saveQuiz((score / questions.length) * 100);
        setBest(saved);
      }
      return;
    }
    setIdx((i) => i + 1);
    setPicked(null);
  };

  const restart = () => {
    setIdx(0);
    setAnswers([]);
    setPicked(null);
    setDone(false);
    doneRef.current = false;
  };

  if (done) {
    const score = answers.filter((a, j) => a === questions[j].correct).length;
    const pct = Math.round((score / questions.length) * 100);
    const msg =
      pct === 100
        ? "Parfait ! Tu maîtrises le chapitre. 🏆"
        : pct >= 70
          ? "Très bien ! Encore un petit effort. 👏"
          : pct >= 40
            ? "Continue à t'entraîner, tu progresses ! 💪"
            : "Relis le cours puis reviens essayer. 📘";
    return (
      <div className="my-4 rounded-2xl bg-white p-6 text-center shadow-card ring-1 ring-slate-200">
        <div className="text-5xl">{pct}%</div>
        <div className="mt-2 text-lg font-bold text-slate-800">
          {score} / {questions.length} bonnes réponses
        </div>
        <p className="mt-1 text-slate-600">{msg}</p>
        {best !== null && (
          <p className="mt-2 text-xs text-slate-400">Meilleur score enregistré : {Math.round(best)}%</p>
        )}
        <button
          type="button"
          onClick={restart}
          className="mt-4 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
        >
          ⟲ Refaire le quiz
        </button>
      </div>
    );
  }

  const progress = answers.length;

  return (
    <div className="my-4 rounded-2xl bg-white p-4 shadow-card ring-1 ring-slate-200 sm:p-6">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-bold text-primary-700">{title}</div>
        <div className="text-xs font-semibold text-slate-500">
          Question {idx + 1} / {questions.length}
        </div>
      </div>
      <div className="mb-4 flex gap-1">
        {questions.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < idx ? "bg-emerald-500" : i === idx ? "bg-primary-500" : "bg-slate-200"
            }`}
          />
        ))}
      </div>

      <motion.div key={idx} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}>
        <div className="text-[15px] leading-relaxed text-slate-800">{q.q}</div>
        <div className="mt-3 grid gap-2">
          {q.options.map((opt, i) => {
            let cls = "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50";
            if (answered) {
              if (i === q.correct) cls = "bg-emerald-50 font-semibold text-emerald-800 ring-emerald-300";
              else if (i === picked) cls = "bg-red-50 text-red-700 ring-red-300";
              else cls = "bg-white text-slate-400 ring-slate-100";
            }
            return (
              <button
                key={i}
                type="button"
                onClick={() => pick(i)}
                className={`rounded-xl px-4 py-2.5 text-left text-sm ring-1 transition ${cls}`}
              >
                <span className="mr-2 font-bold text-slate-400">{String.fromCharCode(65 + i)}.</span>
                {opt}
              </button>
            );
          })}
        </div>
      </motion.div>

      {answered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`mt-3 rounded-xl px-4 py-3 text-sm leading-relaxed ring-1 ${
            picked === q.correct
              ? "bg-emerald-50 text-emerald-900 ring-emerald-200"
              : "bg-red-50 text-red-900 ring-red-200"
          }`}
        >
          <div className="mb-1 font-bold">{picked === q.correct ? "✔ Bonne réponse !" : "✘ Mauvaise réponse."}</div>
          {picked !== q.correct && (
            <div className="mb-1">
              La bonne réponse était{" "}
              <span className="font-bold">
                {String.fromCharCode(65 + q.correct)}. {q.options[q.correct]}
              </span>
            </div>
          )}
          <div>{q.explain}</div>
        </motion.div>
      )}

      {answered && (
        <button
          type="button"
          onClick={nextQ}
          className="mt-3 rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
        >
          {idx + 1 >= questions.length ? "Voir mon résultat →" : "Question suivante →"}
        </button>
      )}

      {progress === 0 && idx === 0 && (
        <p className="mt-2 text-xs text-slate-400">Réponds à toutes les questions pour obtenir ton score final.</p>
      )}
    </div>
  );
}