"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { ExerciseData, GuidedStep } from "./types";
import { coerceNumber } from "./types";
import MiniCurve from "./MiniCurve";
import { TeX } from "@/components/ui/TeX";

function SolutionBox({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="rounded-lg bg-indigo-100 px-3 py-1.5 text-xs font-bold text-indigo-700 transition hover:bg-indigo-200"
      >
        {open ? "Masquer la solution détaillée" : "Voir la solution détaillée"}
      </button>
      {open && (
        <div className="mt-2 rounded-lg bg-indigo-50 px-3 py-2.5 text-sm leading-relaxed text-indigo-900 ring-1 ring-indigo-200">
          {children}
        </div>
      )}
    </div>
  );
}

function Feedback({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mt-3 rounded-xl px-4 py-3 text-sm leading-relaxed ring-1 ${
        ok ? "bg-emerald-50 text-emerald-900 ring-emerald-200" : "bg-red-50 text-red-900 ring-red-200"
      }`}
    >
      <div className="mb-1 font-bold">
        {ok ? "✔ Correct !" : "✘ Ce n'est pas ça."}
      </div>
      {children}
    </motion.div>
  );
}

function McqControl({
  options,
  correct,
  onAnswered,
  disabled,
}: {
  options: React.ReactNode[];
  correct: number;
  onAnswered: (idx: number) => void;
  disabled: boolean;
}) {
  const [chosen, setChosen] = useState<number | null>(null);
  const select = (i: number) => {
    if (disabled) return;
    setChosen(i);
    onAnswered(i);
  };
  return (
    <div className="mt-3 grid gap-2 sm:grid-cols-2">
      {options.map((opt, i) => {
        let cls = "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50";
        if (chosen !== null) {
          if (i === correct) cls = "bg-emerald-50 text-emerald-800 ring-emerald-300 font-semibold";
          else if (i === chosen) cls = "bg-red-50 text-red-700 ring-red-300";
          else cls = "bg-white text-slate-400 ring-slate-100";
        }
        return (
          <button
            key={i}
            type="button"
            onClick={() => select(i)}
            className={`rounded-xl px-4 py-2.5 text-left text-sm ring-1 transition ${cls}`}
          >
            <span className="mr-2 font-bold text-slate-400">{String.fromCharCode(65 + i)}.</span>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function NumericControl({
  answer,
  tolerance = 0.02,
  onAnswered,
  placeholder,
}: {
  answer: number;
  tolerance?: number;
  onAnswered: (text: string) => void;
  placeholder?: string;
}) {
  const [val, setVal] = useState("");
  const [wrong, setWrong] = useState<string | null>(null);
  const submit = () => {
    const v = coerceNumber(val);
    if (v === null) {
      setWrong("Écris un nombre valide, par exemple 2,5 ou 3/2.");
      return;
    }
    if (Math.abs(v - answer) <= tolerance) onAnswered(val);
    else setWrong(val);
  };
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <input
        type="text"
        value={val}
        onChange={(e) => {
          setVal(e.target.value);
          setWrong(null);
        }}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder={placeholder ?? "ta réponse…"}
        className="w-40 rounded-xl border-0 bg-white px-4 py-2.5 text-sm ring-1 ring-slate-300 focus:ring-2 focus:ring-primary-500"
      />
      <button
        type="button"
        onClick={submit}
        className="rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
      >
        Valider
      </button>
      {wrong !== null && (
        <span className="text-xs font-semibold text-red-600">
          {wrong} n'est pas la bonne valeur. Réessaie.
        </span>
      )}
    </div>
  );
}

export default function ExerciseCard({
  data,
  onSolved,
}: {
  data: ExerciseData;
  onSolved?: (id: string) => void;
}) {
  const [state, setState] = useState<
    | { status: "idle" }
    | { status: "correct" }
    | { status: "wrong"; detail?: string; chosen?: number }
  >({ status: "idle" });

  const [stepIdx, setStepIdx] = useState(0);
  const [stepFb, setStepFb] = useState<{ ok: boolean; msg: React.ReactNode } | null>(null);

  const answered = state.status !== "idle";

  const correctAnswer = (data: ExerciseData) =>
    data.options ? data.options[data.correct ?? 0] : String(data.answer);

  const handleMcq = (i: number) => {
    const ok = i === data.correct;
    setState({ status: ok ? "correct" : "wrong", chosen: i });
    if (ok) onSolved?.(data.id);
  };

  const handleNumeric = (text: string) => {
    const ok = Math.abs((coerceNumber(text) ?? Infinity) - (data.answer ?? 0)) <= (data.tolerance ?? 0.02);
    setState({ status: ok ? "correct" : "wrong", detail: text });
    if (ok) onSolved?.(data.id);
  };

  const currentStep: GuidedStep | undefined =
    data.type === "guided" ? data.steps?.[stepIdx] : undefined;

  const submitStep = (ok: boolean, msg: React.ReactNode) => {
    setStepFb({ ok, msg });
    if (ok) onSolved?.(data.id);
  };

  return (
    <div className="my-4 rounded-2xl bg-white p-4 shadow-card ring-1 ring-slate-200 sm:p-5">
      {data.title && (
        <div className="mb-2 text-xs font-bold uppercase tracking-wide text-primary-600">
          {data.title}
        </div>
      )}
      <div className="text-[15px] leading-relaxed text-slate-800">{data.prompt}</div>

      {data.miniGraph && (
        <div className="mt-3 flex justify-center">
          <MiniCurve
            expr={data.miniGraph.expr}
            holeX={data.miniGraph.holeX}
            holeY={data.miniGraph.holeY}
          />
        </div>
      )}

      {data.type === "mcq" && (
        <McqControl
          options={data.options ?? []}
          correct={data.correct ?? 0}
          onAnswered={handleMcq}
          disabled={answered}
        />
      )}

      {data.type === "numeric" && (
        <NumericControl
          answer={data.answer ?? 0}
          tolerance={data.tolerance}
          onAnswered={handleNumeric}
        />
      )}

      {data.type === "guided" && currentStep && (
        <div className="mt-3 rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
          <div className="mb-2 text-xs font-bold text-slate-500">
            Étape {stepIdx + 1} / {data.steps?.length}
          </div>
          <div className="text-[15px] text-slate-800">{currentStep.instruction}</div>
          {currentStep.kind === "mcq" && (
            <McqControl
              options={currentStep.options ?? []}
              correct={currentStep.correctIndex ?? 0}
              disabled={stepFb !== null}
              onAnswered={(i) =>
                submitStep(
                  i === currentStep.correctIndex,
                  i === currentStep.correctIndex
                    ? currentStep.explanation
                    : <>
                        Pas tout à fait. La bonne réponse est{" "}
                        <span className="font-bold">{(currentStep.options ?? [])[currentStep.correctIndex ?? 0]}</span>.{" "}
                        {currentStep.explanation}
                      </>
                )
              }
            />
          )}
          {currentStep.kind === "numeric" && (
            <NumericControl
              answer={currentStep.answer ?? 0}
              tolerance={currentStep.tolerance}
              onAnswered={(t) =>
                submitStep(
                  Math.abs((coerceNumber(t) ?? Infinity) - (currentStep.answer ?? 0)) <= (currentStep.tolerance ?? 0.02),
                  <span>
                    {currentStep.explanation} (Tu as répondu <TeX>{t}</TeX>, la bonne réponse est{" "}
                    <TeX>{String(currentStep.answer)}</TeX>.)
                  </span>
                )
              }
            />
          )}
          {stepFb && (
            <div className="mt-2">
              <Feedback ok={stepFb.ok}>{stepFb.msg}</Feedback>
            </div>
          )}
        </div>
      )}

      {state.status !== "idle" && data.type !== "guided" && (
        <Feedback ok={state.status === "correct"}>
          {state.status === "correct" ? (
            data.explanation
          ) : (
            <>
              La bonne réponse était{" "}
              <span className="font-bold">
                {data.options ? (
                  <>
                    {String.fromCharCode(65 + (data.correct ?? 0))}. {correctAnswer(data)}
                  </>
                ) : (
                  <TeX>{String(data.answer)}</TeX>
                )}
              </span>
              . {data.explanation}
            </>
          )}
        </Feedback>
      )}

      {data.type !== "guided" && state.status === "correct" && data.solution && (
        <SolutionBox>{data.solution}</SolutionBox>
      )}

      {data.type === "guided" && stepFb?.ok && stepIdx < (data.steps?.length ?? 0) - 1 && (
        <button
          type="button"
          onClick={() => {
            setStepIdx((i) => i + 1);
            setStepFb(null);
          }}
          className="mt-3 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
        >
          Étape suivante →
        </button>
      )}

      {data.type === "guided" && stepFb?.ok && stepIdx === (data.steps?.length ?? 0) - 1 && (
        <div className="mt-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 ring-1 ring-emerald-200">
          ✔ Exercice guidé terminé ! Relis les étapes ci-dessus.
        </div>
      )}
    </div>
  );
}