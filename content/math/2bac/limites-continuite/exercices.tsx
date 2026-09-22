import { useState } from "react";
import type { CourseSection } from "./types";
import { NoteBox } from "@/components/ui/Boxes";
import { Formula, TeX } from "@/components/ui/TeX";
import { Collapse } from "@/components/ui/Collapse";
import { motion } from "framer-motion";
import { Step, TeacherNote } from "@/components/presentation/presentation";
import { TeacherExercise } from "@/components/presentation/scenes";
import ExerciseCard from "@/components/exercise/ExerciseCard";
import type { ExerciseData } from "@/components/exercise/types";

const LEVELS = [
  { id: 1, label: "Niveau 1 — Comprendre", desc: "Idées de base : que dit la limite ?" },
  { id: 2, label: "Niveau 2 — Application", desc: "On applique directement les méthodes." },
  { id: 3, label: "Niveau 3 — Bac", desc: "Exercices au niveau de l'examen national." },
  { id: 4, label: "Niveau 4 — Challenge", desc: "Plusieurs méthodes combinées." },
];

const EXOS: (ExerciseData & { level: number })[] = [
  {
    id: "n1-1",
    level: 1,
    type: "numeric",
    title: "Niveau 1 — Remplacement direct",
    prompt: <>Calcule <TeX>{`\\lim_{x\\to 3} (2x - 1)`}</TeX>.</>,
    answer: 5,
    tolerance: 0.01,
    explanation: <>On remplace directement : <TeX>{`2\\times 3 - 1 = 5`}</TeX>.</>,
  },
  {
    id: "n1-2",
    level: 1,
    type: "numeric",
    title: "Niveau 1 — Comportement",
    prompt: <>Calcule <TeX>{`\\lim_{x\\to +\\infty} \\dfrac{1}{x}`}</TeX>.</>,
    answer: 0,
    tolerance: 0.01,
    explanation: (
      <>Plus <TeX>{"x"}</TeX> grand, plus <TeX>{`\\frac{1}{x}`}</TeX> se rapproche de 0.</>
    ),
  },
  {
    id: "n1-3",
    level: 1,
    type: "mcq",
    title: "Niveau 1 — Notion de limite",
    prompt: <><TeX>{`\\lim_{x\\to a} f(x) = L`}</TeX> signifie que…</>,
    options: [
      <><TeX>{`f(a) = L`}</TeX> toujours</>,
      <>
        <TeX>{"f(x)"}</TeX> se rapproche de <TeX>{"L"}</TeX> quand <TeX>{"x"}</TeX> se
        rapproche de <TeX>{"a"}</TeX> (sans que <TeX>{`x = a`}</TeX>)
      </>,
      <><TeX>{"f"}</TeX> est forcément croissante</>,
    ],
    correct: 1,
    explanation: (
      <>On étudie le comportement <em>au voisinage</em>, pas la valeur en <TeX>{"a"}</TeX>.</>
    ),
  },
  {
    id: "n2-1",
    level: 2,
    type: "numeric",
    title: "Niveau 2 — Factorisation",
    prompt: <>Calcule <TeX>{`\\lim_{x\\to -1} \\dfrac{x^2+3x+2}{x+1}`}</TeX>.</>,
    answer: 1,
    tolerance: 0.001,
    explanation: (
      <><TeX>{`x^2+3x+2 = (x+1)(x+2)`}</TeX>. On simplifie (pour <TeX>{`x \\neq -1`}</TeX>) : <TeX>{`x+2 \\to -1 + 2 = 1`}</TeX>.</>
    ),
  },
  {
    id: "n2-2",
    level: 2,
    type: "numeric",
    title: "Niveau 2 — Expression conjuguée",
    prompt: <>Calcule <TeX>{`\\lim_{x\\to 0} \\dfrac{\\sqrt{1+x}-1}{x}`}</TeX>.</>,
    answer: 0.5,
    tolerance: 0.001,
    explanation: (
      <>Par la quantité conjuguée : <TeX>{`\\dfrac{x}{x(\\sqrt{1+x}+1)} \\to \\dfrac{1}{2}`}</TeX>.</>
    ),
  },
  {
    id: "n2-3",
    level: 2,
    type: "numeric",
    title: "Niveau 2 — Terme dominant",
    prompt: <>Calcule <TeX>{`\\lim_{x\\to +\\infty} \\dfrac{3x^2+1}{x^2-2}`}</TeX>.</>,
    answer: 3,
    tolerance: 0.001,
    explanation: (
      <>Même degré : limite = rapport des coefficients dominants = <TeX>{`\\dfrac{3}{1} = 3`}</TeX>.</>
    ),
  },
  {
    id: "n2-4",
    level: 2,
    type: "numeric",
    title: "Niveau 2 — Comparaison des degrés",
    prompt: <>Calcule <TeX>{`\\lim_{x\\to +\\infty} \\dfrac{x+1}{x^2+2}`}</TeX>.</>,
    answer: 0,
    tolerance: 0.001,
    explanation: (
      <>Degré numérateur (1) &lt; degré dénominateur (2) : la limite vaut <TeX>{`0`}</TeX>.</>
    ),
  },
  {
    id: "n3-1",
    level: 3,
    type: "numeric",
    title: "Niveau 3 — Bac : factorisation (cube)",
    prompt: <>Calcule <TeX>{`\\lim_{x\\to 1} \\dfrac{x^3-1}{x-1}`}</TeX>.</>,
    answer: 3,
    tolerance: 0.001,
    explanation: (
      <><TeX>{`x^3-1 = (x-1)(x^2+x+1)`}</TeX>, d'où après simplification <TeX>{`x^2+x+1 \\to 1+1+1 = 3`}</TeX>.</>
    ),
  },
  {
    id: "n3-2",
    level: 3,
    type: "numeric",
    title: "Niveau 3 — Bac : Arctan et composition",
    prompt: (
      <>Calcule <TeX>{`\\lim_{x\\to +\\infty} \\arctan\\left(\\dfrac{x}{x+1}\\right)`}</TeX> (arrondis à 3 décimales).</>
    ),
    answer: 0.785,
    tolerance: 0.002,
    explanation: (
      <><TeX>{`\\dfrac{x}{x+1} \\to 1`}</TeX>, donc la limite vaut <TeX>{`\\arctan 1 = \\dfrac{\\pi}{4} \\approx 0,785`}</TeX>.</>
    ),
  },
  {
    id: "n3-3",
    level: 3,
    type: "mcq",
    title: "Niveau 3 — Bac : continuité et paramètre",
    prompt: (
      <>
        <TeX>{`f(x) = \\begin{cases} \\dfrac{x^2-4}{x-2} & \\text{si } x \\neq 2 \\\\ m & \\text{si } x = 2 \\end{cases}`}</TeX>{" "}
        continue en 2. Quelle valeur de <TeX>{"m"}</TeX> choisir ?
      </>
    ),
    options: [<>2</>, <>4</>, <>0</>, <>−4</>],
    correct: 1,
    explanation: (
      <><TeX>{`\\lim_{x\\to 2} \\dfrac{x^2-4}{x-2} = \\lim (x+2) = 4`}</TeX>, donc il faut <TeX>{`m = f(2) = 4`}</TeX>.</>
    ),
  },
  {
    id: "n4-1",
    level: 4,
    type: "numeric",
    title: "Niveau 4 — Challenge : racine + conjuguée",
    prompt: <>Calcule <TeX>{`\\lim_{x\\to 2} \\dfrac{\\sqrt{x+2}-2}{x-2}`}</TeX>.</>,
    answer: 0.25,
    tolerance: 0.001,
    explanation: (
      <><TeX>{`\\dfrac{(\\sqrt{x+2}-2)(\\sqrt{x+2}+2)}{(x-2)(\\sqrt{x+2}+2)} = \\dfrac{1}{\\sqrt{x+2}+2} \\to \\dfrac{1}{4}`}</TeX>.</>
    ),
  },
  {
    id: "n4-2",
    level: 4,
    type: "mcq",
    title: "Niveau 4 — Challenge : limite trigonométrique",
    prompt: (
      <>Quelle est la valeur de <TeX>{`\\lim_{x\\to +\\infty} x\\,\\sin\\left(\\dfrac{1}{x}\\right)`}</TeX> ?</>
    ),
    options: [<>0</>, <>1</>, <><TeX>{`+\\infty`}</TeX></>, <><TeX>{`\\pi`}</TeX></>],
    correct: 1,
    explanation: (
      <><TeX>{`X = \\frac{1}{x} \\to 0`}</TeX> : <TeX>{`x\\sin\\frac{1}{x} = \\dfrac{\\sin X}{X} \\to 1`}</TeX> (limite remarquable).</>
    ),
  },
  {
    id: "n4-3",
    level: 4,
    type: "guided",
    title: "Niveau 4 — Challenge : continuité en deux parties",
    prompt: (
      <>
        <TeX>{`f(x) = \\begin{cases} \\dfrac{\\sqrt{x+1}-1}{x} & \\text{si } x > 0 \\\\ x^2 + a & \\text{si } x \\leq 0 \\end{cases}`}</TeX>{" "}
        continue en 0. Trouve <TeX>{"a"}</TeX>.
      </>
    ),
    steps: [
      {
        kind: "mcq",
        instruction: <>Quand <TeX>{`x \\to 0^{+}`}</TeX>, que vaut <TeX>{`\\dfrac{\\sqrt{x+1}-1}{x}`}</TeX> ?</>,
        options: [<><TeX>{`\\frac{1}{2}`}</TeX></>, <>0</>, <>1</>, <><TeX>{`+\\infty`}</TeX></>],
        correctIndex: 0,
        explanation: (
          <>Par la quantité conjuguée : <TeX>{`\\dfrac{1}{\\sqrt{x+1}+1} \\to \\frac{1}{2}`}</TeX>.</>
        ),
      },
      {
        kind: "mcq",
        instruction: <>Quand <TeX>{`x \\to 0^{-}`}</TeX>, que vaut <TeX>{`x^2 + a`}</TeX> ?</>,
        options: [<>a</>, <>0</>, <><TeX>{`a^2`}</TeX></>, <><TeX>{`a+1`}</TeX></>],
        correctIndex: 0,
        explanation: <><TeX>{`x^2 \\to 0`}</TeX>, donc <TeX>{`x^2 + a \\to a`}</TeX>.</>,
      },
      {
        kind: "numeric",
        instruction: <>Pour être continue en 0, il faut les deux limites égales : <TeX>{`a = ?`}</TeX></>,
        answer: 0.5,
        tolerance: 0.001,
        explanation: (
          <><TeX>{`a = \\frac{1}{2}`}</TeX>. On vérifie aussi <TeX>{`f(0) = a = \\frac{1}{2}`}</TeX> : les trois conditions sont réunies.</>
        ),
      },
    ],
    explanation: <>Continuité par morceaux : égalité des limites latérales.</>,
  },
];

function NiveauSection() {
  const [level, setLevel] = useState(1);
  const list = EXOS.filter((e) => e.level === level);
  const meta = LEVELS.find((l) => l.id === level)!;
  return (
    <div className="space-y-5">
      <TeacherExercise
        id="tx-cube"
        title="Au tableau — limite avec cube"
        prompt={
          <>
            <p className="mb-2">
              Calcule <TeX>{`\\lim_{x\\to 1} \\dfrac{x^3-1}{x-1}`}</TeX>.
            </p>
            <p className="text-sm text-slate-500">
              Laisser les élèves chercher avant d'ouvrir l'indice.
            </p>
          </>
        }
        hint={
          <>
            En remplaçant <TeX>{"x"}</TeX> par 1 on obtient <TeX>{`\\frac{0}{0}`}</TeX> : une
            forme indéterminée. Factoriser <TeX>{`x^3-1`}</TeX> avec l'identité{" "}
            <TeX>{`a^3-b^3 = (a-b)(a^2+ab+b^2)`}</TeX>.
          </>
        }
        steps={[
          <>
            <strong>Substitution :</strong>{" "}
            <TeX>{`\\dfrac{1^3-1}{1-1} = \\dfrac{0}{0}`}</TeX>, forme indéterminée.
          </>,
          <>
            <strong>Factoriser :</strong>{" "}
            <TeX>{`x^3-1 = (x-1)(x^2+x+1)`}</TeX>.
          </>,
          <>
            <strong>Simplifier :</strong> pour <TeX>{`x \\neq 1`}</TeX>,{" "}
            <TeX>{`\\dfrac{(x-1)(x^2+x+1)}{x-1} = x^2+x+1`}</TeX>.
          </>,
          <>
            <strong>Calculer :</strong> <TeX>{`1^2+1+1 = 3`}</TeX>.
          </>,
          <>
            <strong>Conclusion :</strong>{" "}
            <TeX>{`\\lim_{x\\to 1} \\dfrac{x^3-1}{x-1} = 3`}</TeX>.
          </>,
        ]}
      />

      <Step id="ex-series" className="space-y-4">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {LEVELS.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => setLevel(l.id)}
            className={`rounded-2xl px-3 py-3 text-left text-sm transition ${
              l.id === level
                ? "bg-primary-600 text-white shadow-lift"
                : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            <span className="block font-bold">{l.label}</span>
            <span className={`block text-xs ${l.id === level ? "text-primary-100" : "text-slate-500"}`}>
              {l.desc}
            </span>
          </button>
        ))}
      </div>
      <div className="text-sm font-semibold text-slate-600">
        {meta.label} — {list.length} exercice{list.length > 1 ? "s" : ""}
      </div>
      <motion.div key={level} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        {list.map((ex) => (
          <ExerciseCard key={ex.id} data={ex} />
        ))}
      </motion.div>
      <NoteBox>
        <p>
          Bloqué sur un niveau ? Reviens à la fiche correspondante dans le cours :
          chaque méthode est détaillée étape par étape.
        </p>
      </NoteBox>
      </Step>
    </div>
  );
}

function BacProblem({
  title,
  enonce,
  solution,
}: {
  title: string;
  enonce: React.ReactNode;
  solution: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-slate-200">
      <div className="mb-2 text-sm font-bold text-slate-800">{title}</div>
      <div className="mb-3 space-y-1 text-[14.5px] leading-relaxed text-slate-800">{enonce}</div>
      <Collapse label="Voir la solution détaillée">{solution}</Collapse>
    </div>
  );
}

function BacSection() {
  return (
    <div className="space-y-6">
      <Step id="bac-intro" className="space-y-4">
        <p className="text-[15px] leading-relaxed text-slate-800">
          Trois problèmes complets dans le style de l'examen national. Lis l'énoncé,
          cherche la solution, puis compare avec la correction détaillée.
        </p>
        <TeacherNote>
          Projeter un problème à la fois : laisser les élèves chercher, puis déplier la
          solution étape par étape.
        </TeacherNote>
      </Step>

      <Step id="bac-1" className="space-y-4">
        <BacProblem
          title="Problème 1 — Prolongement par continuité"
          enonce={
            <>
              <p>
                Soit <TeX>{`f(x) = \\dfrac{\\sqrt{x+1}-2}{x-3}`}</TeX> pour <TeX>{`x \\geq -1`}</TeX> et{" "}
                <TeX>{`x \\neq 3`}</TeX>.
              </p>
              <ol className="mt-1 list-decimal space-y-1 pl-5">
                <li>Calcule <TeX>{`\\lim_{x\\to 3} f(x)`}</TeX>.</li>
                <li>Prolonge <TeX>{"f"}</TeX> par continuité en 3.</li>
              </ol>
            </>
          }
          solution={
            <>
              <ol className="list-decimal space-y-2 pl-5">
                <li>
                  En 3 le dénominateur s'annule : forme <TeX>{`\\frac{0}{0}`}</TeX>. On multiplie par la
                  quantité conjuguée du numérateur :
                <Formula>{`\\dfrac{(\\sqrt{x+1}-2)(\\sqrt{x+1}+2)}{(x-3)(\\sqrt{x+1}+2)} = \\dfrac{x+1-4}{(x-3)(\\sqrt{x+1}+2)} = \\dfrac{x-3}{(x-3)(\\sqrt{x+1}+2)}`}</Formula>
                  Pour <TeX>{`x \\neq 3`}</TeX> on simplifie : <TeX>{`f(x) = \\dfrac{1}{\\sqrt{x+1}+2}`}</TeX>.
                  Alors <TeX>{`\\lim_{x\\to 3} f(x) = \\dfrac{1}{\\sqrt{4}+2} = \\dfrac{1}{4}`}</TeX>.
                </li>
                <li>
                  On définit <TeX>{`g(3) = \\dfrac{1}{4}`}</TeX> et <TeX>{`g(x) = f(x)`}</TeX> sinon. La
                  fonction <TeX>{"g"}</TeX> est continue en 3 et s'appelle le prolongement par continuité.
                </li>
              </ol>
            </>
          }
        />
      </Step>

      <Step id="bac-2" className="space-y-4">
        <BacProblem
          title="Problème 2 — TVI et unicité"
          enonce={
            <>
              <p>Soit <TeX>{`f(x) = x^4 + x - 1`}</TeX> définie sur <TeX>{`\\mathbb{R}`}</TeX>.</p>
              <ol className="mt-1 list-decimal space-y-1 pl-5">
                <li>Étudie la monotonie de <TeX>{"f"}</TeX> sur <TeX>{`[0\\,;\\;1]`}</TeX>.</li>
                <li>Montre que l'équation <TeX>{`f(x) = 0`}</TeX> admet une solution unique <TeX>{`\\alpha`}</TeX> dans <TeX>{`[0\\,;\\;1]`}</TeX>.</li>
                <li>Encadre <TeX>{`\\alpha`}</TeX> entre deux décimaux consécutifs.</li>
              </ol>
            </>
          }
          solution={
            <>
              <ol className="list-decimal space-y-2 pl-5">
                <li>
                  <TeX>{`f'(x) = 4x^3 + 1 > 0`}</TeX> sur <TeX>{`[0\\,;\\;1]`}</TeX> : <TeX>{"f"}</TeX> est
                  strictement croissante (méthode : <TeX>{`f' > 0`}</TeX>).
                </li>
                <li>
                  <TeX>{"f"}</TeX> continue sur le segment <TeX>{`[0\\,;\\;1]`}</TeX>, strictement croissante, avec{" "}
                  <TeX>{`f(0) = -1 < 0`}</TeX> et <TeX>{`f(1) = 1 > 0`}</TeX>. Donc <TeX>{`0`}</TeX> est
                  entre <TeX>{`f(0)`}</TeX> et <TeX>{`f(1)`}</TeX> : le corollaire du TVI donne l'existence
                  d'une unique solution.
                </li>
                <li>
                  <TeX>{`f(0,7) \\approx -0,0599 < 0`}</TeX> et <TeX>{`f(0,75) \\approx 0,0664 > 0`}</TeX>.
                  Conclusion : <TeX>{`0,7 < \\alpha < 0,75`}</TeX>.
                </li>
              </ol>
            </>
          }
        />
      </Step>

      <Step id="bac-3" className="space-y-4">
        <BacProblem
          title="Problème 3 — Limite composée avec Arctan"
          enonce={
            <>
              <p>On considère <TeX>{`u(x) = x\\,\\arctan\\left(\\dfrac{1}{x}\\right)`}</TeX> pour <TeX>{`x > 0`}</TeX>.</p>
              <ol className="mt-1 list-decimal space-y-1 pl-5">
                <li>Calcule <TeX>{`\\lim_{x\\to +\\infty} \\dfrac{1}{x}`}</TeX>.</li>
                <li>Déduis-en <TeX>{`\\lim_{x\\to +\\infty} u(x)`}</TeX>.</li>
              </ol>
            </>
          }
          solution={
            <>
              <ol className="list-decimal space-y-2 pl-5">
                <li>
                  <TeX>{`\\lim_{x\\to +\\infty} \\dfrac{1}{x} = 0`}</TeX>.
                </li>
                <li>
                  On utilise la limite remarquable <TeX>{`\\lim_{X\\to 0} \\dfrac{\\arctan X}{X} = 1`}</TeX> :
                  <Formula>{`u(x) = x\\,\\arctan\\frac{1}{x} = \\dfrac{\\arctan\\left(\\frac{1}{x}\\right)}{\\frac{1}{x}}`}</Formula>
                  avec <TeX>{`X = \\dfrac{1}{x} \\to 0`}</TeX>. Donc <TeX>{`\\lim_{x\\to +\\infty} u(x) = 1`}</TeX>. La droite{" "}
                  <TeX>{`y = 1`}</TeX> est une asymptote horizontale à <TeX>{"u"}</TeX> en <TeX>{`+\\infty`}</TeX>.
                </li>
              </ol>
            </>
          }
        />
      </Step>
    </div>
  );
}

export const exercicesProgressifsSection: CourseSection = {
  id: "exercices",
  number: 21,
  title: "Exercices progressifs",
  category: "entrainement",
  Component: NiveauSection,
};

export const exercicesBacSection: CourseSection = {
  id: "exercices-bac",
  number: 22,
  title: "Exercices type Bac",
  category: "entrainement",
  Component: BacSection,
};