import type { CourseSection } from "./types";
import { TeX } from "@/components/ui/TeX";
import { Step, TeacherNote } from "@/components/presentation/presentation";
import Quiz from "@/components/exercise/Quiz";
import type { QuizQ } from "@/components/exercise/Quiz";

const QUIZ: QuizQ[] = [
  {
    q: <>Calcule <TeX>{`\\lim_{x\\to 2} \\dfrac{x^2-4}{x-2}`}</TeX>.</>,
    options: [<>0</>, <>2</>, <>4</>, <>n'existe pas</>],
    correct: 2,
    explain: (
      <>
        En 2 le dénominateur s'annule (FI <TeX>{`\\frac{0}{0}`}</TeX>). On factorise :{" "}
        <TeX>{`\\dfrac{(x-2)(x+2)}{x-2} = x+2 \\to 4`}</TeX>.
      </>
    ),
  },
  {
    q: <>Laquelle de ces limites est une forme indéterminée ?</>,
    options: [
      <><TeX>{`\\lim_{x\\to 2} (3x+1)`}</TeX></>,
      <><TeX>{`\\lim_{x\\to 1} \\dfrac{\\sqrt{x}-1}{x-1}`}</TeX></>,
      <><TeX>{`\\lim_{x\\to +\\infty} \\dfrac{2}{x}`}</TeX></>,
      <><TeX>{`\\lim_{x\\to 0} (x^2+5)`}</TeX></>,
    ],
    correct: 1,
    explain: (
      <>
        En 1 : <TeX>{`\\sqrt{1}-1 = 0`}</TeX> et <TeX>{`1-1 = 0`}</TeX> : forme{" "}
        <TeX>{`\\frac{0}{0}`}</TeX>, il faut transformer.
      </>
    ),
  },
  {
    q: <>Calcule <TeX>{`\\lim_{x\\to +\\infty} \\dfrac{3x+2}{x-1}`}</TeX>.</>,
    options: [<>3</>, <>2</>, <>1</>, <><TeX>{`+\\infty`}</TeX></>],
    correct: 0,
    explain: (
      <>
        Même degré : limite = rapport des coefficients dominants = <TeX>{`\\dfrac{3}{1} = 3`}</TeX>.
      </>
    ),
  },
  {
    q: <>Une fonction <TeX>{"f"}</TeX> est continue en <TeX>{"a"}</TeX> si et seulement si…</>,
    options: [
      <><TeX>{"f"}</TeX> est définie en <TeX>{"a"}</TeX></>,
      <>
        <TeX>{`\\lim_{x\\to a} f(x)`}</TeX> existe
      </>,
      <>
        <TeX>{`\\lim_{x\\to a} f(x) = f(a)`}</TeX>
      </>,
      <><TeX>{"f"}</TeX> est dérivable en <TeX>{"a"}</TeX></>,
    ],
    correct: 2,
    explain: (
      <>
        La continuité exige les trois conditions réunies : définie en <TeX>{"a"}</TeX>,
        limite existante, et égalité <TeX>{`\\lim f = f(a)`}</TeX>.
      </>
    ),
  },
  {
    q: (
      <>
        <TeX>{"f"}</TeX> continue sur <TeX>{`[0\\,;\\;1]`}</TeX>,{" "}
        <TeX>{`f(0) = -2`}</TeX> et <TeX>{`f(1) = 3`}</TeX>. Combien de solutions l'équation{" "}
        <TeX>{`f(x) = 0`}</TeX> admet-elle au moins ?
      </>
    ),
    options: [<>0</>, <>1</>, <>2</>, <>impossible à dire</>],
    correct: 1,
    explain: (
      <>Par le TVI, puisque 0 est entre <TeX>{`f(0) = -2`}</TeX> et <TeX>{`f(1) = 3`}</TeX>, il existe au moins une solution.</>
    ),
  },
  {
    q: <>Quelle est la valeur de <TeX>{`\\lim_{x\\to 0} \\dfrac{\\sin x}{x}`}</TeX> ?</>,
    options: [<>0</>, <>1</>, <><TeX>{`+\\infty`}</TeX></>, <>indéterminée</>],
    correct: 1,
    explain: (
      <>
        C'est la limite remarquable du programme : <TeX>{`\\lim_{x\\to 0} \\dfrac{\\sin x}{x} = 1`}</TeX>.
      </>
    ),
  },
  {
    q: <>Laquelle de ces fonctions est une bijection de <TeX>{`\\mathbb{R}`}</TeX> sur un intervalle ?</>,
    options: [
      <><TeX>{`x \\mapsto x^2`}</TeX></>,
      <><TeX>{`x \\mapsto \\arctan x`}</TeX></>,
      <><TeX>{`x \\mapsto |x|`}</TeX></>,
      <><TeX>{`x \\mapsto \\cos x`}</TeX></>,
    ],
    correct: 1,
    explain: (
      <>
        <TeX>{`\\arctan`}</TeX> est continue et strictement croissante sur{" "}
        <TeX>{`\\mathbb{R}`}</TeX>, donc bijective de <TeX>{`\\mathbb{R}`}</TeX> sur{" "}
        <TeX>{`\\left]-\\frac{\\pi}{2}\\,;\\,\\frac{\\pi}{2}\\right[`}</TeX>.
      </>
    ),
  },
  {
    q: <>Calcule <TeX>{`\\sqrt[3]{-27}`}</TeX>.</>,
    options: [<>−9</>, <>3</>, <>−3</>, <>pas définie</>],
    correct: 2,
    explain: (
      <>
        La racine cubique est définie pour tout réel : <TeX>{`(-3)^3 = -27`}</TeX>, donc{" "}
        <TeX>{`\\sqrt[3]{-27} = -3`}</TeX>.
      </>
    ),
  },
];

function QuizSection() {
  return (
    <div className="space-y-5">
      <Step id="qz-intro" className="space-y-4">
        <p className="text-[15px] leading-relaxed text-slate-800">
          Huit questions pour vérifier la maîtrise du chapitre. Réponds sans regarder la
          correction, puis compare.
        </p>
        <TeacherNote>
          Faire passer le quiz en mode classe : chaque question peut être votée à main
          levée avant révélation de la bonne réponse.
        </TeacherNote>
      </Step>
      <Step id="qz-questions" className="space-y-4">
        <Quiz questions={QUIZ} />
      </Step>
    </div>
  );
}

export const quizSection: CourseSection = {
  id: "quiz",
  number: 23,
  title: "Quiz de fin de chapitre",
  category: "entrainement",
  Component: QuizSection,
};