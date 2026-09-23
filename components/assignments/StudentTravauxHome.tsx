import Link from "next/link";
import { StudentAssignmentHistory } from "@/components/assignments/StudentAssignmentHistory";

export function StudentTravauxHome() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-16 pt-10 sm:pt-14">
      <div className="animate-fade-up">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Travaux
        </h1>
        <p className="mt-2 text-lg text-slate-600">
          Rejoignez un travail avec le code donné par votre professeur, puis consultez vos
          résultats.
        </p>
      </div>

      <div className="mt-8 animate-fade-up rounded-3xl border border-slate-200 bg-white p-7 shadow-card sm:p-9">
        <div className="text-sm font-bold uppercase tracking-wide text-primary-700">Mes travaux</div>
        <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
          Rejoindre un travail
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
          Votre professeur vous communique un code à 6 caractères pour chaque travail. Saisissez-le
          pour démarrer le travail et soumettre vos réponses.
        </p>
        <Link
          href="/etudiant/travaux/join"
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-6 py-3.5 text-base font-extrabold text-white shadow-lift transition hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-300"
        >
          Rejoindre avec un code
        </Link>
      </div>

      <StudentAssignmentHistory />
    </div>
  );
}