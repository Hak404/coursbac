"use client";

import { useState, type ReactNode } from "react";
import { Step, usePresentationCtx } from "./presentation";

/**
 * Boutons de révélation liés au révélateur global de la présentation.
 *
 * `RevealTo` trace un bouton « Afficher … » qui avance le révélateur jusqu'à
 * ce que la cible soit visible. Il n'apparaît que quand l'étape juste avant la
 * cible est déjà visible (le bouton suit donc l'ordre du déroulé).
 * En mode « course » (tout visible), rien n'est affiché.
 */
export function RevealTo({
  target,
  label,
  className,
}: {
  target: string;
  label: ReactNode;
  className?: string;
}) {
  const ctx = usePresentationCtx();
  if (!ctx || ctx.mode === "course") return null;
  const order = ctx.orderOf(target);
  if (order < ctx.revealed || order > ctx.revealed) return null;
  return (
    <button
      type="button"
      onClick={() => ctx.revealTo(order)}
      className={`rounded-xl border-2 border-dashed border-primary-300 bg-primary-50 px-4 py-2.5 text-sm font-bold text-primary-700 transition hover:bg-primary-100 ${className ?? ""}`}
    >
      {label ?? "Afficher"}
    </button>
  );
}

export function RevealAll({
  label,
  className,
}: {
  label?: ReactNode;
  className?: string;
}) {
  const ctx = usePresentationCtx();
  if (!ctx || ctx.mode === "course") return null;
  if (ctx.revealedAll) return null;
  return (
    <button
      type="button"
      onClick={ctx.revealAll}
      className={`rounded-full px-4 py-1.5 text-xs font-bold text-slate-500 ring-1 ring-slate-200 transition hover:bg-slate-100 ${className ?? ""}`}
    >
      {label ?? "Tout afficher"}
    </button>
  );
}

type ClassOption = {
  label: ReactNode;
  correct?: boolean;
  note?: ReactNode;
};

/**
 * Question adressée à la classe, avec QCM interactif : la professeure pose la
 * question, les élèves répondent à voix haute, puis on clique sur les options
 * pour révéler la bonne réponse. Une mauvaise option se grise, la bonne passe
 * en vert et affiche l'explication.
 */
export function ClassQuestion({
  children,
  options,
  title = "Question à la classe",
}: {
  children: ReactNode;
  options?: ClassOption[];
  title?: string;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const [wrong, setWrong] = useState<readonly number[]>([]);

  const pick = (i: number) => {
    if (picked !== null) return;
    if (options?.[i].correct) setPicked(i);
    else setWrong((w) => [...w, i]);
  };

  return (
    <div className="my-5 overflow-hidden rounded-2xl bg-indigo-50/70 ring-1 ring-indigo-200">
      <div className="flex items-center gap-2 border-b border-indigo-100 bg-indigo-600 px-4 py-2 text-white">
        <span aria-hidden className="text-lg">🗣️</span>
        <span className="text-sm font-extrabold uppercase tracking-wider">
          {title}
        </span>
      </div>
      <div className="space-y-3 px-4 py-4">
        <div className="text-[15px] leading-relaxed text-slate-900">{children}</div>

        {options && options.length > 0 && (
          <div className="grid gap-2 sm:grid-cols-2">
            {options.map((o, i) => {
              const isPicked = picked === i;
              const isWrong = wrong.includes(i);
              let cls = "bg-white text-slate-800 ring-slate-200 hover:bg-indigo-50";
              if (isPicked) cls = "bg-emerald-600 text-white ring-emerald-600";
              else if (isWrong) cls = "bg-white text-slate-300 ring-slate-200";
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => pick(i)}
                  disabled={isWrong}
                  className={`rounded-xl px-4 py-3 text-left text-[15px] font-semibold ring-1 transition ${cls}`}
                >
                  <span className="mr-2 font-mono text-sm text-slate-400">
                    {String.fromCharCode(65 + i)}.
                  </span>
                  {o.label}
                  {isPicked && <span className="ml-2">✓</span>}
                </button>
              );
            })}
          </div>
        )}

        {picked !== null && options?.[picked].note && (
          <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm leading-relaxed text-emerald-900 ring-1 ring-emerald-200">
            {options[picked].note}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Exemple corrigé progressivement : chaque étape est un bloc révélé à tour de
 * rôle. La professeure avance avec « Étape suivante » (bouton local ou bouton
 * global de la barre de contrôle).
 */
export function GuidedExample({
  id,
  title,
  steps,
}: {
  id: string;
  title: string;
  steps: { tag: string; body: ReactNode }[];
}) {
  return (
    <div className="my-5 rounded-2xl bg-white p-4 shadow-card ring-1 ring-slate-200 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-base font-extrabold text-slate-900">{title}</div>
        <RevealAll label="Afficher toute la correction" />
      </div>
      <div className="space-y-2">
        {steps.map((s, i) => (
          <Step key={i} id={`${id}-${i}`} className="space-y-2">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex shrink-0 items-center gap-1.5 rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-white">
                <span className="text-slate-300">{String(i + 1).padStart(2, "0")}</span>
                {s.tag}
              </span>
              <div className="min-w-0 flex-1 pt-0.5 text-[15px] leading-relaxed text-slate-800">
                {s.body}
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className="flex items-center gap-3 pl-1">
                <RevealTo
                  target={`${id}-${i + 1}`}
                  label={`Afficher l'étape suivante →`}
                />
                <span className="text-xs font-medium text-slate-400">
                  {s.tag === "Substitution"
                    ? "On remplace x par a"
                    : "La professeure avance à son rythme"}
                </span>
              </div>
            )}
          </Step>
        ))}
      </div>
    </div>
  );
}

/**
 * Petit bandeau « réponse » apparaissant à la révélation d'une étape.
 */
export function AnswerBox({ children }: { children: ReactNode }) {
  return (
    <div className="my-3 overflow-hidden rounded-xl bg-emerald-50 ring-1 ring-emerald-200">
      <div className="bg-emerald-600 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-white">
        Réponse
      </div>
      <div className="px-4 py-3 text-[15px] leading-relaxed text-emerald-900">
        {children}
      </div>
    </div>
  );
}

/**
 * Exercice préparé pour le tableau : la professeure révèle successivement
 * l'énoncé, l'indice, puis la correction étape par étape (ou d'un coup avec
 * « Afficher la correction complète »).
 */
export function TeacherExercise({
  id,
  title,
  prompt,
  hint,
  steps,
}: {
  id: string;
  title?: string;
  prompt: ReactNode;
  hint?: ReactNode;
  steps: ReactNode[];
}) {
  const first = hint ? `${id}-indice` : `${id}-corr-0`;
  return (
    <div className="my-5 overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-slate-200">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-4 py-2">
        {title ? (
          <span className="text-sm font-extrabold text-slate-800">{title}</span>
        ) : (
          <span className="text-sm font-extrabold text-slate-800">Exercice au tableau</span>
        )}
        <RevealAll label="Correction complète" />
      </div>

      <div className="space-y-3 p-4 sm:p-5">
        <Step id={`${id}-enonce`} className="space-y-3">
          <div className="rounded-xl bg-indigo-50/60 px-4 py-3 text-[15px] leading-relaxed text-slate-900 ring-1 ring-indigo-100">
            {prompt}
          </div>
          <RevealTo target={first} label="Afficher l'indice" />
        </Step>

        {hint && (
          <Step id={`${id}-indice`} className="space-y-3">
            <div className="rounded-xl bg-amber-50 px-4 py-3 text-[15px] leading-relaxed text-amber-900 ring-1 ring-amber-200">
              <span className="mb-0.5 block text-xs font-extrabold uppercase tracking-wider text-amber-600">
                Indice
              </span>
              {hint}
            </div>
            <RevealTo target={`${id}-corr-0`} label="Commencer la correction" />
          </Step>
        )}

        {steps.map((line, i) => (
          <Step key={i} id={`${id}-corr-${i}`} className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white">
                <span className="text-emerald-200">{String(i + 1).padStart(2, "0")}</span>
                Correction
              </span>
              <div className="min-w-0 flex-1 pt-0.5 text-[15px] leading-relaxed text-slate-800">
                {line}
              </div>
            </div>
            {i < steps.length - 1 && (
              <RevealTo
                target={`${id}-corr-${i + 1}`}
                label="Afficher l'étape suivante"
              />
            )}
          </Step>
        ))}
      </div>
    </div>
  );
}