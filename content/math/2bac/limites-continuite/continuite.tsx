import type { CourseSection } from "./types";
import {
  DefinitionBox,
  ReminderBox,
  WarningBox,
  NoteBox,
  ExampleBox,
  PropertyBox,
  TheoremBox,
} from "@/components/ui/Boxes";
import { Formula, TeX } from "@/components/ui/TeX";
import { Step, TeacherNote } from "@/components/presentation/presentation";
import { ClassQuestion } from "@/components/presentation/scenes";
import ContinuityGraph from "@/components/math/ContinuityGraph";
import ProlongementGraph from "@/components/math/ProlongementGraph";
import InteractiveLimitGraph from "@/components/math/InteractiveLimitGraph";
import ExerciseCard from "@/components/exercise/ExerciseCard";
import type { ExerciseData } from "@/components/exercise/types";

function ContinuitePointSection() {
  return (
    <div className="space-y-5">
      <Step id="cq-question" className="space-y-4">
        <p className="text-[15px] leading-relaxed text-slate-800">
          <strong>Question :</strong> peut-on dessiner ces courbes <strong>sans lever le
          stylo</strong> ? Regarde les quatre cas ci-dessous et repère lequel « s'arrête ».
        </p>
        <ContinuityGraph />
        <TeacherNote>
          Laisser les élèves répondre à voix haute : « avec trou », « avec saut »… Avant de
          donner le mot <em>continu</em>, on décrit les <em>ruptures</em>.
        </TeacherNote>
      </Step>

      <Step id="cq-definition" className="space-y-4">
        <DefinitionBox>
          <p>
            Soit <TeX>{"f"}</TeX> définie sur un intervalle ouvert contenant{" "}
            <TeX>{"a"}</TeX>. On dit que <TeX>{"f"}</TeX> est{" "}
            <strong>continue en <TeX>{"a"}</TeX></strong> si la limite en{" "}
            <TeX>{"a"}</TeX> existe et est égale à la valeur en <TeX>{"a"}</TeX> :
            <Formula>{`f \\text{ continue en } a \\;\\Longleftrightarrow\\; \\lim_{x\\to a} f(x) = f(a)`}</Formula>
          </p>
        </DefinitionBox>

        <WarningBox>
          <p>
            Il faut <strong>trois vérifications</strong> pour que <TeX>{"f"}</TeX> soit
            continue en <TeX>{"a"}</TeX> :
          </p>
          <ol className="mt-1 list-decimal space-y-1 pl-5">
            <li>
              <TeX>{"f"}</TeX> est <strong>définie</strong> en <TeX>{"a"}</TeX> ;
            </li>
            <li>
              la limite <TeX>{`\\lim_{x\\to a} f(x)`}</TeX> <strong>existe</strong> ;
            </li>
            <li>
              <TeX>{`\\lim_{x\\to a} f(x) = f(a)`}</TeX>.
            </li>
          </ol>
        </WarningBox>
        <TeacherNote>
          Souligner la différence entre « la limite existe » et « la fonction est
          continue » : la continuité exige en plus que <TeX>{`\\lim f = f(a)`}</TeX>.
        </TeacherNote>
      </Step>

      <Step id="cq-laterale" className="space-y-4">
        <DefinitionBox>
          <p>
            On définit aussi la <strong>continuité à droite</strong> :{" "}
            <TeX>{`\\lim_{x\\to a^{+}} f(x) = f(a)`}</TeX>, et la{" "}
            <strong>continuité à gauche</strong> :{" "}
            <TeX>{`\\lim_{x\\to a^{-}} f(x) = f(a)`}</TeX>. Alors{" "}
            <Formula>{`f \\text{ continue en } a \\;\\Longleftrightarrow\\; \\text{continue à gauche et à droite en } a`}</Formula>
          </p>
        </DefinitionBox>

        <PropertyBox>
          <p>
            <strong>Opérations :</strong> si <TeX>{"f"}</TeX> et <TeX>{"g"}</TeX> sont
            continues en <TeX>{"a"}</TeX> et <TeX>{"k \\in \\mathbb{R}"}</TeX>, alors{" "}
            <TeX>{`f+g`}</TeX>, <TeX>{`kf`}</TeX>, <TeX>{`fg`}</TeX> sont continues en{" "}
            <TeX>{"a"}</TeX> ; <TeX>{`\\frac{f}{g}`}</TeX> est continue en <TeX>{"a"}</TeX> si{" "}
            <TeX>{`g(a) \\neq 0`}</TeX>. Et si <TeX>{"f"}</TeX> est continue en{" "}
            <TeX>{"a"}</TeX> et <TeX>{"g"}</TeX> continue en <TeX>{"f(a)"}</TeX>, alors{" "}
            <TeX>{`g \\circ f`}</TeX> est continue en <TeX>{"a"}</TeX>.
          </p>
        </PropertyBox>
      </Step>

      <Step id="cq-exemple" className="space-y-4">
        <ExampleBox>
          <p>
            <strong>Exemple — fonction avec saut.</strong> Soit{" "}
            <Formula>{`f(x) = \\begin{cases} x^2 & \\text{si } x \\leq 1 \\\\ x^2+1 & \\text{si } x > 1 \\end{cases}`}</Formula>
            En <TeX>{"1"}</TeX> : <TeX>{`\\lim_{x\\to 1^{-}} f(x) = 1`}</TeX> mais{" "}
            <TeX>{`\\lim_{x\\to 1^{+}} f(x) = 2`}</TeX>. Les limites latérales diffèrent : pas
            de limite en 1, donc <TeX>{"f"}</TeX> n'est <strong>pas continue</strong> en 1.
          </p>
        </ExampleBox>

        <InteractiveLimitGraph
          expr="x^2"
          a={1}
          approach="both"
          bbox={[-4.5, 6, 4.5, -2]}
          caption="Ici les deux limites latérales valent 1 et f(1) = 1 : la fonction est continue en 1."
        />

        <ReminderBox>
          <p>
            Fonctions toujours continues sur leur ensemble de définition (admises) : les
            polynômes, les fonctions rationnelles, <TeX>{"\\sqrt{x}"}</TeX>,{" "}
            <TeX>{"|x|"}</TeX>, <TeX>{"\\sin"}</TeX>, <TeX>{"\\cos"}</TeX>, et toute somme,
            produit, quotient (sans dénominateur nul) et composée de ces fonctions.
          </p>
        </ReminderBox>
      </Step>
    </div>
  );
}

function ContinuiteIntervalleSection() {
  return (
    <div className="space-y-5">
      <Step id="ci-intro" className="space-y-4">
        <DefinitionBox>
          <p>
            Une fonction <TeX>{"f"}</TeX> est <strong>continue sur un intervalle{" "}
            <TeX>{"I"}</TeX></strong> si elle est continue en chaque point de{" "}
            <TeX>{"I"}</TeX>.
          </p>
          <p className="mt-1">
            Sur un intervalle fermé <TeX>{`[a \\,;\\, b]`}</TeX>, on demande la continuité
            en chaque point de <TeX>{`]a\\,;\\,b[`}</TeX>, à droite en <TeX>{"a"}</TeX> et à
            gauche en <TeX>{"b"}</TeX>.
          </p>
        </DefinitionBox>

        <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-slate-200">
          <div className="mb-2 text-sm font-bold text-slate-700">
            Continuité en un point vs continuité sur un intervalle
          </div>
          <p className="text-[14px] leading-relaxed text-slate-700">
            La continuité en un point est une propriété <em>locale</em> : elle ne regarde
            qu'un voisinage de ce point. La continuité sur un intervalle est une propriété{" "}
            <em>globale</em> : elle s'intéresse à toute la région. Une fonction continue sur{" "}
            <TeX>{`[a\\,;\\,b]`}</TeX> donne une courbe d'un seul trait entre{" "}
            <TeX>{"a"}</TeX> et <TeX>{"b"}</TeX>.
          </p>
        </div>

        <TeacherNote>
          « Une fonction continue sur un segment se trace sans lever le crayon. »
          Utiliser cette image visuelle pour le théorème qui suit.
        </TeacherNote>

        <ReminderBox>
          <p>
            Le corollaire pratique : une fonction continue sur un segment y atteint son
            maximum et son minimum (théorème admis au programme).
          </p>
        </ReminderBox>
      </Step>

      <Step id="ci-segment" className="space-y-4">
        <TheoremBox>
          <p>
            <strong>Image d'un intervalle :</strong> si <TeX>{"f"}</TeX> est continue sur un
            intervalle <TeX>{"I"}</TeX>, alors <TeX>{"f(I)"}</TeX> est un{" "}
            <strong>intervalle</strong>.
          </p>
          <p className="mt-1">
            <strong>Image d'un segment :</strong> si <TeX>{"f"}</TeX> est continue sur{" "}
            <TeX>{`[a\\,;\\,b]`}</TeX>, alors{" "}
            <TeX>{`f([a\\,;\\,b]) = [m\\,;\\,M]`}</TeX> où <TeX>{"m"}</TeX> et{" "}
            <TeX>{"M"}</TeX> sont le minimum et le maximum de <TeX>{"f"}</TeX> sur ce segment.
          </p>
        </TheoremBox>

        <ExampleBox>
          <p>
            <TeX>{`f(x) = x^2`}</TeX> est continue sur <TeX>{`[0\\,;\\,2]`}</TeX>. Son image
            est <TeX>{`[0\\,;\\,4]`}</TeX> (segment). Une fonction continue « remplit » toute
            l'étendue entre sa plus petite et sa plus grande valeur : plonge-toi dans la
            section suivante pour exploiter cette idée !
          </p>
        </ExampleBox>
      </Step>
    </div>
  );
}

const quickContinuite: ExerciseData = {
  id: "quick-continuite",
  type: "mcq",
  title: "Vérification rapide",
  prompt: (
    <>
      Soit <TeX>{`f(x) = \\dfrac{x^2-1}{x-1}`}</TeX> pour{" "}
      <TeX>{`x \\neq 1`}</TeX>. Peut-on prolonger <TeX>{"f"}</TeX> par continuité en 1 ?
    </>
  ),
  options: [
    <>
      Oui, en posant <TeX>{`f(1) = 2`}</TeX>
    </>,
    <>
      Non, car <TeX>{`f(1)`}</TeX> n'existe pas
    </>,
    <>
      Oui, en posant <TeX>{`f(1) = 0`}</TeX>
    </>,
    <>
      Impossible, la limite n'existe pas
    </>,
  ],
  correct: 0,
  explanation: (
    <>
      <TeX>{`\\lim_{x\\to 1} f(x) = 2`}</TeX> (après factorisation). La limite existe
      donc : on ajoute le point manquant <TeX>{`(1 \\,;\\, 2)`}</TeX> et la fonction devient
      continue.
    </>
  ),
};

function ProlongementSection() {
  return (
    <div className="space-y-5">
      <Step id="pr-situation" className="space-y-4">
        <p className="text-[15px] leading-relaxed text-slate-800">
          Quand une fonction a un « trou » en <TeX>{"a"}</TeX> (non définie) mais que la
          limite en <TeX>{"a"}</TeX> existe, on peut <strong>boucher le trou</strong>.
        </p>
        <TeacherNote>
          Montrer la courbe <TeX>{`\\frac{x^2-1}{x-1}`}</TeX> (un point manquant en (1;2))
          et laisser les élèves dire ce qu'il faut ajouter pour « recoller » le graphe.
        </TeacherNote>
      </Step>

      <Step id="pr-definition" className="space-y-4">
        <DefinitionBox>
          <p>
            Soit <TeX>{"f"}</TeX> non définie en <TeX>{"a"}</TeX> mais telle que{" "}
            <TeX>{`\\lim_{x\\to a} f(x) = L`}</TeX> (finie). On définit une nouvelle
            fonction <TeX>{"g"}</TeX> par :
            <Formula>{`g(x) = \\begin{cases} f(x) & \\text{si } x \\neq a \\\\ L & \\text{si } x = a \\end{cases}`}</Formula>
          </p>
          <p>
            Alors <TeX>{"g"}</TeX> est continue en <TeX>{"a"}</TeX>. On dit que{" "}
            <TeX>{"g"}</TeX> est le <strong>prolongement par continuité</strong> de{" "}
            <TeX>{"f"}</TeX> en <TeX>{"a"}</TeX>. À ce moment <TeX>{`\\lim g = g(a) = L`}</TeX>.
          </p>
        </DefinitionBox>
      </Step>

      <Step id="pr-exemple" className="space-y-4">
        <ExampleBox>
          <p>
            Pour <TeX>{`f(x) = \\dfrac{x^2-1}{x-1}`}</TeX>, le point <TeX>{`x=1`}</TeX> est un
            trou : <TeX>{`f(1)`}</TeX> n'existe pas. Mais la limite vaut 2. Regarde :
          </p>
        </ExampleBox>

        <ProlongementGraph />

        <ClassQuestion
          title="Question à la classe"
          options={[
            { label: <TeX>{"0"}</TeX> },
            { label: <TeX>{"1"}</TeX> },
            {
              label: <TeX>{"2"}</TeX>,
              correct: true,
              note: (
                <>
                  <TeX>{`\\lim_{x\\to 1} \\dfrac{x^2-1}{x-1} = 2`}</TeX>. On pose{" "}
                  <TeX>{`g(1) = 2`}</TeX> : le point <TeX>{`(1\\,;\\,2)`}</TeX> bouche le
                  trou et <TeX>{"g"}</TeX> devient continue en 1.
                </>
              ),
            },
            { label: "Aucune, la limite est infinie" },
          ]}
        >
          <p>
            Quelle valeur faut-il donner à la fonction en <TeX>{`x = 1`}</TeX> pour
            prolonger par continuité ?
          </p>
        </ClassQuestion>
      </Step>

      <Step id="pr-autre-exemple" className="space-y-4">
        <ExampleBox>
          <p>
            Autre exemple, en 0 :{" "}
            <TeX>{`f(x) = \\dfrac{\\sqrt{x+1}-1}{x}`}</TeX>. On utilise l'expression
            conjuguée :
            <Formula>{`\\lim_{x\\to 0} \\dfrac{\\sqrt{x+1}-1}{x} = \\lim \\dfrac{(\\sqrt{x+1}-1)(\\sqrt{x+1}+1)}{x(\\sqrt{x+1}+1)} = \\lim \\dfrac{x}{x(\\sqrt{x+1}+1)} = \\dfrac{1}{2}`}</Formula>
            Donc on prolonge par continuité avec <TeX>{`g(0) = \\frac{1}{2}`}</TeX>.
          </p>
        </ExampleBox>
      </Step>

      <Step id="pr-avertissement" className="space-y-4">
        <WarningBox>
          <p>
            Un prolongement par continuité n'est possible que si la limite en{" "}
            <TeX>{"a"}</TeX> est <strong>finie</strong>. Si la limite est infinie (comme
            pour <TeX>{`\\frac{1}{x}`}</TeX> en 0) ou n'existe pas, il n'existe aucun
            prolongement par continuité.
          </p>
        </WarningBox>

        <ExerciseCard data={quickContinuite} />
      </Step>
    </div>
  );
}

export const continuitePointSection: CourseSection = {
  id: "continuite-point",
  number: 10,
  title: "Continuité en un point",
  category: "continuite",
  Component: ContinuitePointSection,
};

export const continuiteIntervalleSection: CourseSection = {
  id: "continuite-intervalle",
  number: 11,
  title: "Continuité sur un intervalle",
  category: "continuite",
  Component: ContinuiteIntervalleSection,
};

export const prolongementSection: CourseSection = {
  id: "prolongement",
  number: 12,
  title: "Prolongement par continuité",
  category: "continuite",
  Component: ProlongementSection,
};