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
import ReciprocalGraph from "@/components/math/ReciprocalGraph";
import RootNGraph from "@/components/math/RootNGraph";
import ArctanGraph from "@/components/math/ArctanGraph";

function BijectionSection() {
  return (
    <div className="space-y-5">
      <Step id="bj-theoreme" className="space-y-4">
        <TheoremBox>
          <p>
            <strong>Théorème de la bijection :</strong> soit <TeX>{"f"}</TeX> continue et
            strictement monotone sur un intervalle <TeX>{"I"}</TeX>. Alors{" "}
            <TeX>{"f"}</TeX> réalise une <strong>bijection</strong> de <TeX>{"I"}</TeX> sur{" "}
            <TeX>{`J = f(I)`}</TeX> :
          </p>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            <li>
              <TeX>{"J"}</TeX> est un intervalle de même nature que <TeX>{"I"}</TeX> ;
            </li>
            <li>
              pour tout <TeX>{`y \\in J`}</TeX>, l'équation <TeX>{`f(x) = y`}</TeX> admet une{" "}
              <strong>solution unique</strong> <TeX>{`x \\in I`}</TeX> ;
            </li>
            <li>
              la fonction réciproque <TeX>{`f^{-1} : J \\to I`}</TeX> est continue, de même
              sens de monotonie que <TeX>{"f"}</TeX> ;
            </li>
            <li>
              les courbes <TeX>{`C_f`}</TeX> et <TeX>{`C_{f^{-1}}`}</TeX> sont{" "}
              <strong>symétriques</strong> par rapport à la droite <TeX>{"y = x"}</TeX>.
            </li>
          </ul>
        </TheoremBox>

        <TeacherNote>
          Insister sur « solution unique » : c'est la nouveauté par rapport au TVI (qui ne
          garantissait que l'existence). La stricte monotonie apporte l'unicité.
        </TeacherNote>
      </Step>

      <Step id="bj-observation" className="space-y-4">
        <ReciprocalGraph />

        <PropertyBox>
          <p>
            Pour tout <TeX>{`x \\in I`}</TeX> et <TeX>{`y \\in J`}</TeX> :
            <Formula>{`y = f(x) \\;\\Longleftrightarrow\\; x = f^{-1}(y)`}</Formula>
            <Formula>{`(f^{-1} \\circ f)(x) = x \\quad \\text{et} \\quad (f \\circ f^{-1})(y) = y`}</Formula>
          </p>
        </PropertyBox>

        <NoteBox>
          <p>
            Un point <TeX>{`(x\\,;\\, y)`}</TeX> de <TeX>{`C_f`}</TeX> a son symétrique{" "}
            <TeX>{`(y\\,;\\, x)`}</TeX> sur <TeX>{`C_{f^{-1}}`}</TeX> : on échange abscisse
            et ordonnée.
          </p>
        </NoteBox>

        <ClassQuestion
          title="Question à la classe"
          options={[
            { label: <TeX>{"y = 0"}</TeX> },
            { label: <TeX>{"y = x"}</TeX>, correct: true, note: <>Le symétrique de <TeX>{`(x\\,;\\,y)`}</TeX> est <TeX>{`(y\\,;\\,x)`}</TeX> : c'est exactement la symétrie par rapport à la droite <TeX>{`y = x`}</TeX>.</> },
            { label: <TeX>{"y = -x"}</TeX> },
            { label: "L'axe des ordonnées" },
          ]}
        >
          <p>
            Les courbes <TeX>{`C_f`}</TeX> et <TeX>{`C_{f^{-1}}`}</TeX> sont symétriques
            par rapport à quelle droite ?
          </p>
        </ClassQuestion>
      </Step>

      <Step id="bj-definition" className="space-y-4">
        <DefinitionBox>
          <p>
            On dit alors que <TeX>{"f"}</TeX> est une <strong>bijection</strong> de{" "}
            <TeX>{"I"}</TeX> sur <TeX>{"J"}</TeX>. Montrer qu'une fonction est bijective,
            c'est montrer qu'elle est continue et strictement monotone sur{" "}
            <TeX>{"I"}</TeX> (et préciser <TeX>{`J = f(I)`}</TeX>).
          </p>
        </DefinitionBox>

        <WarningBox>
          <p>
            Ne pas confondre « strictement monotone » et « monotone » : l'unicité de la
            solution exige la <strong>stricte</strong> monotonie. Une fonction constante
            est monotone mais pas bijective !
          </p>
        </WarningBox>
      </Step>
    </div>
  );
}

function RacineNSection() {
  return (
    <div className="space-y-5">
      <Step id="rn-intro" className="space-y-4">
        <p className="text-[15px] leading-relaxed text-slate-800">
          La première grande application du théorème de la bijection : la fonction racine{" "}
          <TeX>{"n"}</TeX>-ième.
        </p>

        <DefinitionBox>
          <p>
            Pour <TeX>{`n \\in \\mathbb{N}^*`}</TeX>, la fonction{" "}
            <TeX>{`g : x \\mapsto x^n`}</TeX> est continue et strictement croissante sur{" "}
            <TeX>{`\\mathbb{R}^+`}</TeX>, d'image <TeX>{`\\mathbb{R}^+`}</TeX>. Sa
            réciproque s'appelle <strong>fonction racine <TeX>{"n"}</TeX>-ième</strong>,
            notée <TeX>{`x \\mapsto \\sqrt[n]{x}`}</TeX>.
          </p>
        </DefinitionBox>

        <RootNGraph />
      </Step>

      <Step id="rn-proprietes" className="space-y-4">
        <PropertyBox>
          <p>
            <strong>Propriétés</strong> (pour <TeX>{`x, y \\geq 0`}</TeX>) :
          </p>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            <li>
              <TeX>{`\\sqrt[n]{x} = y \\;\\Longleftrightarrow\\; y^n = x`}</TeX> et{" "}
              <TeX>{`\\sqrt[n]{x^n} = \\left(\\sqrt[n]{x}\\right)^n = x`}</TeX>;
            </li>
            <li>
              <TeX>{`\\sqrt[n]{x} = \\sqrt[n]{y} \\;\\Longleftrightarrow\\; x = y`}</TeX>;
            </li>
            <li>
              <TeX>{`\\sqrt[n]{x} \\leq \\sqrt[n]{y} \\;\\Longleftrightarrow\\; x \\leq y`}</TeX>;
            </li>
            <li>
              <TeX>{`\\sqrt[n]{xy} = \\sqrt[n]{x}\\,\\sqrt[n]{y}`}</TeX> et{" "}
              <TeX>{`\\sqrt[n]{\\dfrac{x}{y}} = \\dfrac{\\sqrt[n]{x}}{\\sqrt[n]{y}}`}</TeX>;
            </li>
            <li>
              <TeX>{`\\sqrt[n]{x} \\times \\sqrt[m]{x} = x^{\\frac{1}{n}+\\frac{1}{m}}`}</TeX>{" "}
              (puissances rationnelles).
            </li>
          </ul>
        </PropertyBox>
      </Step>

      <Step id="rn-continuite" className="space-y-4">
        <PropertyBox>
          <p>
            <strong>Continuité et limites :</strong> <TeX>{`x \\mapsto \\sqrt[n]{x}`}</TeX>{" "}
            est continue et strictement croissante sur <TeX>{`\\mathbb{R}^+`}</TeX>, et{" "}
            <TeX>{`\\lim_{x\\to +\\infty} \\sqrt[n]{x} = +\\infty`}</TeX>.
          </p>
          <p className="mt-1">
            Si <TeX>{`\\lim u(x) = L \\geq 0`}</TeX>, alors{" "}
            <TeX>{`\\lim \\sqrt[n]{u(x)} = \\sqrt[n]{L}`}</TeX>. Si{" "}
            <TeX>{`\\lim u(x) = +\\infty`}</TeX>, alors{" "}
            <TeX>{`\\lim \\sqrt[n]{u(x)} = +\\infty`}</TeX>.
          </p>
        </PropertyBox>

        <NoteBox title="Cas du produit des indices">
          <p>
            Indice remarquable : <TeX>{`\\sqrt[n]{\\sqrt[m]{x}} = \\sqrt[n\\times m]{x}`}</TeX>.
          </p>
        </NoteBox>
      </Step>

      <Step id="rn-exemples" className="space-y-4">
        <ExampleBox>
          <p>
            Résoudre <TeX>{`x^5 = 3`}</TeX> : unique solution positive{" "}
            <TeX>{`x = \\sqrt[5]{3}`}</TeX>. Résoudre <TeX>{`x^4 = 16`}</TeX> :{" "}
            <TeX>{`x = \\pm 2`}</TeX> (le cas pair admet deux solutions).
          </p>
        </ExampleBox>

        <ClassQuestion
          title="Question à la classe"
          options={[
            { label: <TeX>{"x = 2"}</TeX> },
            { label: <TeX>{`x = \\pm 2`}</TeX>, correct: true, note: <>Une équation du type <TeX>{`x^n = a`}</TeX> avec <TeX>{"n"}</TeX> pair et <TeX>{`a > 0`}</TeX> admet deux solutions opposées.</> },
            { label: <TeX>{"x = -2"}</TeX> },
            { label: "Aucune solution réelle" },
          ]}
        >
          <p>
            Résoudre dans <TeX>{"\\mathbb{R}"}</TeX> l'équation{" "}
            <TeX>{`x^4 = 16`}</TeX> :
          </p>
        </ClassQuestion>

        <WarningBox>
          <p>
            Pour <TeX>{"n"}</TeX> <strong>pair</strong>, <TeX>{`\\sqrt[n]{x}`}</TeX> n'est
            défini que pour <TeX>{`x \\geq 0`}</TeX>. Pour <TeX>{"n"}</TeX> impair,{" "}
            <TeX>{`\\sqrt[n]{x}`}</TeX> est défini pour tout <TeX>{`x \\in \\mathbb{R}`}</TeX>{" "}
            (par exemple <TeX>{`\\sqrt[3]{-8} = -2`}</TeX>). Attention à ne pas écrire{" "}
            <TeX>{`\\sqrt[4]{-1}`}</TeX>, qui n'existe pas dans{" "}
            <TeX>{"\\mathbb{R}"}</TeX> !
          </p>
        </WarningBox>
      </Step>
    </div>
  );
}

function ArctanSection() {
  return (
    <div className="space-y-5">
      <Step id="at-intro" className="space-y-4">
        <p className="text-[15px] leading-relaxed text-slate-800">
          La fonction tangente restreinte à <TeX>{`\\left]-\\frac{\\pi}{2}\\,;\\, \\frac{\\pi}{2}\\right[`}</TeX>{" "}
          est continue et strictement croissante : elle réalise donc une bijection sur{" "}
          <TeX>{"\\mathbb{R}"}</TeX>. Sa réciproque est la fonction{" "}
          <strong>Arctangente</strong>.
        </p>

        <DefinitionBox>
          <p>
            <TeX>{`\\arctan`}</TeX> est la réciproque de <TeX>{`\\tan`}</TeX> sur{" "}
            <TeX>{`\\left]-\\frac{\\pi}{2}\\,;\\, \\frac{\\pi}{2}\\right[`}</TeX> :
            <Formula>{`y = \\arctan x \\;\\Longleftrightarrow\\; x = \\tan y, \\quad y \\in \\left]-\\frac{\\pi}{2}\\,;\\, \\frac{\\pi}{2}\\right[`}</Formula>
          </p>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            <li>
              domaine : <TeX>{"\\mathbb{R}"}</TeX> ; ensemble image :{" "}
              <TeX>{`\\left]-\\frac{\\pi}{2}\\,;\\, \\frac{\\pi}{2}\\right[`}</TeX>
            </li>
            <li>
              continue et strictement croissante sur <TeX>{"\\mathbb{R}"}</TeX>
            </li>
            <li>
              impaire : <TeX>{`\\arctan(-x) = -\\arctan x`}</TeX>
            </li>
          </ul>
        </DefinitionBox>
      </Step>

      <Step id="at-observation" className="space-y-4">
        <ArctanGraph />

        <ClassQuestion
          title="Question à la classe"
          options={[
            { label: <TeX>{"\\pi"}</TeX> },
            { label: <TeX>{`\\frac{\\pi}{2}`}</TeX>, correct: true, note: <>La courbe <TeX>{`y = \\arctan x`}</TeX> se rapproche de la droite <TeX>{`y = \\frac{\\pi}{2}`}</TeX> quand <TeX>{"x"}</TeX> devient très grand : c'est une asymptote horizontale.</> },
            { label: <TeX>{"0"}</TeX> },
            { label: <TeX>{"-\\frac{\\pi}{2}"}</TeX> },
          ]}
        >
          <p>
            Que vaut <TeX>{`\\lim_{x \\to +\\infty} \\arctan x`}</TeX> ?
          </p>
        </ClassQuestion>

        <PropertyBox>
          <p>
            <strong>Limites essentielles :</strong>
            <Formula>{`\\lim_{x \\to +\\infty} \\arctan x = \\frac{\\pi}{2} \\qquad \\lim_{x \\to -\\infty} \\arctan x = -\\frac{\\pi}{2}`}</Formula>
          </p>
          <p className="mt-1">
            Les droites <TeX>{`y = \\pm \\frac{\\pi}{2}`}</TeX> sont des asymptotes
            horizontales. Autre limite utile :
            <Formula>{`\\lim_{x \\to 0} \\dfrac{\\arctan x}{x} = 1`}</Formula>
          </p>
        </PropertyBox>
      </Step>

      <Step id="at-programme" className="space-y-4">
        <NoteBox>
          <p>
            La fonction <TeX>{`\\arctan`}</TeX> figure bien au programme de 2BAC PC (option
            française) comme fonction réciproque de la fonction tangente. Les fonctions{" "}
            <TeX>{`\\arcsin`}</TeX> et <TeX>{`\\arccos`}</TeX> sont{" "}
            <strong>hors programme</strong>.
          </p>
        </NoteBox>
      </Step>

      <Step id="at-exemples" className="space-y-4">
        <ExampleBox>
          <p>
            Calculer <TeX>{`\\lim_{x\\to +\\infty} \\arctan\\left(\\dfrac{x+1}{x}\\right)`}</TeX>. On pose{" "}
            <TeX>{`u(x) = \\frac{x+1}{x} \\to 1`}</TeX>, donc par composition :{" "}
            <TeX>{`\\lim = \\arctan 1 = \\frac{\\pi}{4}`}</TeX>.
          </p>
        </ExampleBox>

        <ReminderBox>
          <p>
            Réflexe : dès qu'une limite contient <TeX>{`\\arctan`}</TeX>, demander vers quoi
            tend l'« intérieur » : <TeX>{`\\pm\\infty`}</TeX> donne{" "}
            <TeX>{`\\pm\\frac{\\pi}{2}`}</TeX>.
          </p>
        </ReminderBox>
      </Step>
    </div>
  );
}

export const bijectionSection: CourseSection = {
  id: "bijection",
  number: 16,
  title: "Bijection et fonction réciproque",
  category: "fonctions",
  Component: BijectionSection,
};

export const racineNSection: CourseSection = {
  id: "racine-n",
  number: 17,
  title: "Fonction racine n-ième",
  category: "fonctions",
  Component: RacineNSection,
};

export const arctanSection: CourseSection = {
  id: "arctan",
  number: 18,
  title: "Fonction Arctan",
  category: "fonctions",
  Component: ArctanSection,
};