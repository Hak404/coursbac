import { Suspense } from "react";
import { JoinQuiz } from "@/components/quiz/JoinQuiz";

export const metadata = {
  title: "Rejoindre un quiz · Ustadi",
  description:
    "Rejoignez un quiz de classe en direct avec le code de votre professeur.",
};

export default function JoinPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <div className="text-lg font-extrabold tracking-tight text-slate-900">
            Ustadi
          </div>
          <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-bold text-primary-800">
            Élève — Quiz
          </span>
        </div>
      </header>
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="mx-auto w-full max-w-xl px-5 pb-16 pt-12 text-center text-sm font-semibold text-slate-400">
              Chargement…
            </div>
          }
        >
          <JoinQuiz />
        </Suspense>
      </main>
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
        Quiz en classe · Ustadi
      </footer>
    </div>
  );
}