import type { CourseSection } from "./types";
import {
  DefinitionBox,
  ReminderBox,
  WarningBox,
  NoteBox,
  ExampleBox,
  PropertyBox,
  TheoremBox,
  MethodBox,
} from "@/components/ui/Boxes";
import { Formula, TeX } from "@/components/ui/TeX";
import { Collapse } from "@/components/ui/Collapse";
import { Step, TeacherNote } from "@/components/presentation/presentation";
import { ClassQuestion } from "@/components/presentation/scenes";
import TVIGraph from "@/components/math/TVIGraph";
import BisectionAnimation from "@/components/math/BisectionAnimation";
import ExerciseCard from "@/components/exercise/ExerciseCard";
import type { ExerciseData } from "@/components/exercise/types";

function TviSection() {
  return (
    <div className="space-y-5">
      <Step id="tvi-intro" className="space-y-4">
        <p className="text-[15px] leading-relaxed text-slate-800">
          Le TVI est le résultat le plus puissant de la continuité : une fonction continue
          qui passe de <TeX>{`f(a)`}</TeX> à <TeX>{`f(b)`}</TeX> doit « passer par » toutes
          les valeurs intermédiaires.
        </p>

        <TheoremBox>
          <p>
            <strong>Théorème des valeurs intermédiaires (TVI) :</strong> soit{" "}
            <TeX>{"f"}</TeX> continue sur <TeX>{`[a\\,;\\,b]`}</TeX>. Pour tout réel{" "}
            <TeX>{"k"}</TeX> compris entre <TeX>{`f(a)`}</TeX> et <TeX>{`f(b)`}</TeX>, il
            existe au moins un réel <TeX>{"c \\in [a\\,;\\,b]"}</TeX> tel que{" "}
            <TeX>{`f(c) = k`}</TeX>.
          </p>
        </TheoremBox>

        <TeacherNote>
          Faire lire le théorème avec les élèves, puis reformuler : « pour monter de f(a)
          à f(b) sans lever le crayon, la courbe doit couper y = k ».
        </TeacherNote>
      </Step>

      <Step id="tvi-observe" className="space-y-4">
        <TVIGraph />

        <p className="text-[15px] leading-relaxed text-slate-800">
          Amuse-toi à déplacer <TeX>{"a"}</TeX>, <TeX>{"b"}</TeX> et <TeX>{"k"}</TeX> : tant
          que <TeX>{"k"}</TeX> reste entre <TeX>{`f(a)`}</TeX> et <TeX>{`f(b)`}</TeX>, la
          droite <TeX>{"y=k"}</TeX> coupe obligatoirement la courbe.
        </p>
      </Step>

      <Step id="tvi-conditions" className="space-y-4">
        <WarningBox>
          <p>
            Ne jamais utiliser le TVI sans vérifier :
          </p>
          <ol className="mt-1 list-decimal space-y-1 pl-5">
            <li>
              la <strong>continuité</strong> de <TeX>{"f"}</TeX> (à justifier !) ;
            </li>
            <li>
              que <TeX>{"k"}</TeX> est bien <strong>entre</strong>{" "}
              <TeX>{`f(a)`}</TeX> et <TeX>{`f(b)`}</TeX> (ou que{" "}
              <TeX>{`f(a)\\cdot f(b) < 0`}</TeX> pour <TeX>{`k=0`}</TeX>).
            </li>
          </ol>
        </WarningBox>
      </Step>

      <Step id="tvi-corollaire" className="space-y-4">
        <ClassQuestion
          title="Question à la classe"
          options={[
            { label: "Oui, toujours" },
            { label: <TeX>{"Seulement si k = 0"}</TeX> },
            {
              label: "Non, sauf si la fonction est strictement monotone",
              correct: true,
              note: (
                <>
                  Le TVI garantit l'<strong>existence</strong>. L'unicité demande en plus
                  la <strong>stricte monotonie</strong> : c'est le corollaire.
                </>
              ),
            },
          ]}
        >
          <p>
            Une fois que le TVI garantit une solution <TeX>{"c"}</TeX>, peut-on affirmer
            qu'elle est <strong>unique</strong> ?
          </p>
        </ClassQuestion>

        <Corollaire />

        <ExerciseCard data={tviQuick} />
      </Step>
    </div>
  );
}

function Corollaire() {
  return (
    <TheoremBox title="Corollaire : unicité par stricte monotonie">
      <p>
        Si de plus <TeX>{"f"}</TeX> est <strong>strictement monotone</strong> sur{" "}
        <TeX>{`[a\\,;\\,b]`}</TeX>, alors la solution <TeX>{"c"}</TeX> est{" "}
        <strong>unique</strong>.
      </p>
      <p className="mt-1">
        En particulier, si <TeX>{"f"}</TeX> est continue, strictement monotone sur{" "}
        <TeX>{`[a\\,;\\,b]`}</TeX> et que <TeX>{`f(a) \\cdot f(b) < 0`}</TeX>, l'équation{" "}
        <TeX>{`f(x) = 0`}</TeX> admet une <strong>solution unique</strong> dans{" "}
        <TeX>{`[a\\,;\\,b]`}</TeX>.
      </p>
    </TheoremBox>
  );
}

const tviQuick: ExerciseData = {
  id: "quick-tvi",
  type: "mcq",
  title: "Vérification rapide",
  prompt: (
    <>
      <TeX>{`f`}</TeX> est continue sur <TeX>{`[0\\,;\\,2]`}</TeX>, avec{" "}
      <TeX>{`f(0) = -3`}</TeX> et <TeX>{`f(2) = 5`}</TeX>. Que peux-tu affirmer ?
    </>
  ),
  options: [
    <>
      L'équation <TeX>{`f(x) = 0`}</TeX> admet au moins une solution dans{" "}
      <TeX>{`[0\\,;\\,2]`}</TeX>
    </>,
    <>
      L'équation <TeX>{`f(x) = 0`}</TeX> admet exactement une solution dans{" "}
      <TeX>{`[0\\,;\\,2]`}</TeX>
    </>,
    <>
      <TeX>{`f(x) = 0`}</TeX> n'a pas de solution
    </>,
    <>
      On ne peut rien dire
    </>,
  ],
  correct: 0,
  explanation: (
    <>
      <TeX>{`0`}</TeX> est entre <TeX>{`-3`}</TeX> et <TeX>{`5`}</TeX>, et{" "}
      <TeX>{"f"}</TeX> est continue : le TVI garantit au moins une solution. Sans
      monotonie, on ne peut pas affirmer l'unicité.
    </>
  ),
};

function ApplicationsSection() {
  return (
    <div className="space-y-5">
      <Step id="app-canevas" className="space-y-4">
        <p className="text-[15px] leading-relaxed text-slate-800">
          Le TVI sert surtout à prouver que des équations ont des solutions, et à les
          encadrer. Voici le canevas à toujours suivre.
        </p>

        <MethodBox title="Méthode — montrer que f(x) = 0 a une solution">
          <ol className="list-decimal space-y-1.5 pl-5">
            <li>
              <strong>Continuité :</strong> justifier que <TeX>{"f"}</TeX> est continue sur{" "}
              <TeX>{`[a\\,;\\,b]`}</TeX> (fonction usuelle, somme/produit/composée…).
            </li>
            <li>
              <strong>Calculs :</strong> calculer <TeX>{`f(a)`}</TeX> et <TeX>{`f(b)`}</TeX>.
            </li>
            <li>
              <strong>Signe :</strong> vérifier <TeX>{`f(a) \\cdot f(b) < 0`}</TeX> (ou que 0
              est entre <TeX>{`f(a)`}</TeX> et <TeX>{`f(b)`}</TeX>).
            </li>
            <li>
              <strong>Conclusion :</strong> d'après le TVI, il existe au moins un{" "}
              <TeX>{`c \\in [a\\,;\\,b]`}</TeX> tel que <TeX>{`f(c) = 0`}</TeX>.
            </li>
            <li>
              <strong>Unicité (si demandé) :</strong> prouver que <TeX>{"f"}</TeX> est
              strictement monotone sur <TeX>{`[a\\,;\\,b]`}</TeX>, puis appliquer le
              corollaire.
            </li>
          </ol>
        </MethodBox>

        <TeacherNote>
          Afficher le canevas et piocher un exercice d'entraînement : les élèves doivent
          pouvoir réciter l'ordre des 5 étapes.
        </TeacherNote>
      </Step>

      <Step id="app-demo" className="space-y-4">
        <ExampleBox>
          <p>
            <strong>Exemple :</strong> montrer que l'équation{" "}
            <TeX>{`x^3 + x - 1 = 0`}</TeX> admet une solution <strong>unique</strong> dans{" "}
            <TeX>{`[0\\,;\\,1]`}</TeX>.
          </p>
        </ExampleBox>

        <Collapse label="Voir la démonstration étape par étape" defaultOpen>
          <ol className="space-y-3">
            {[
              {
                t: "Étape 1 — Continuité",
                c: (
                  <>
                    <TeX>{`f(x) = x^3 + x - 1`}</TeX> est un polynôme, donc continue sur{" "}
                    <TeX>{`\\mathbb{R}`}</TeX>, en particulier sur <TeX>{`[0\\,;\\,1]`}</TeX>.
                  </>
                ),
              },
              {
                t: "Étape 2 — Calculs",
                c: (
                  <>
                    <TeX>{`f(0) = 0^3 + 0 - 1 = -1`}</TeX> et{" "}
                    <TeX>{`f(1) = 1^3 + 1 - 1 = 1`}</TeX>.
                  </>
                ),
              },
              {
                t: "Étape 3 — Changement de signe",
                c: (
                  <>
                    <TeX>{`f(0) \\cdot f(1) = -1 \\times 1 = -1 < 0`}</TeX> : la fonction
                    change de signe.
                  </>
                ),
              },
              {
                t: "Étape 4 — Existence (TVI)",
                c: (
                  <>
                    Comme <TeX>{"f"}</TeX> est continue et <TeX>{`0`}</TeX> est entre{" "}
                    <TeX>{`f(0)`}</TeX> et <TeX>{`f(1)`}</TeX>, le TVI affirme qu'il existe
                    au moins un <TeX>{`c \\in [0\\,;\\,1]`}</TeX> avec{" "}
                    <TeX>{`f(c) = 0`}</TeX>.
                  </>
                ),
              },
              {
                t: "Étape 5 — Unicité",
                c: (
                  <>
                    <TeX>{`x \\mapsto x^3`}</TeX> et <TeX>{`x \\mapsto x`}</TeX> sont
                    strictement croissantes sur <TeX>{"\\mathbb{R}"}</TeX>, donc{" "}
                    <TeX>{"f"}</TeX>, somme de fonctions strictement croissantes, est
                    strictement croissante sur <TeX>{`[0\\,;\\,1]`}</TeX>. Par le corollaire,
                    la solution est <strong>unique</strong>.
                  </>
                ),
              },
            ].map((s) => (
              <li key={s.t} className="rounded-xl border-l-4 border-indigo-300 bg-indigo-50/60 px-4 py-3">
                <div className="mb-1 text-sm font-bold text-indigo-700">{s.t}</div>
                <div className="text-[14px] text-slate-700">{s.c}</div>
              </li>
            ))}
          </ol>
        </Collapse>
      </Step>

      <Step id="app-encadrement" className="space-y-4">
        <ExampleBox>
          <p>
            <strong>Exemple — valeur approchée :</strong> on vient de montrer que{" "}
            <TeX>{`x^3 + x - 1 = 0`}</TeX> a une unique solution <TeX>{"\\alpha \\in [0\\,;\\,1]"}</TeX>{" "}
            avec <TeX>{`f(1) = 1 > 0`}</TeX>. Comme <TeX>{`f(0,6) = 0,216+0,6-1 = -0,184 < 0`}</TeX>, on
            resserre : <TeX>{`\\alpha \\in [0,6\\,;\\,1]`}</TeX>. On encadre ainsi la solution
            de plus en plus précisément — c'est l'idée de la dichotomie !
          </p>
        </ExampleBox>
      </Step>

      <Step id="app-check" className="space-y-4">
        <ExerciseCard data={guidedTVI} />
      </Step>
    </div>
  );
}

const guidedTVI: ExerciseData = {
  id: "guided-tvi",
  type: "guided",
  title: "Exercice guidé — TVI",
  prompt: (
    <>
      Montre que l'équation <TeX>{`x^5 + x - 3 = 0`}</TeX> admet une solution dans{" "}
      <TeX>{`[1\\,;\\,2]`}</TeX>.
    </>
  ),
  steps: [
    {
      kind: "mcq",
      instruction: (
        <>
          Étape 1 — Quelle propriété de <TeX>{`f(x) = x^5 + x - 3`}</TeX> dois-tu citer en
          premier ?
        </>
      ),
      options: [
        <>Elle est polynôme, donc continue sur <TeX>{"\\mathbb{R}"}</TeX></>,
        <>Elle a un changement de signe</>,
        <>Elle est paire</>,
      ],
      correctIndex: 0,
      explanation: (
        <>
          Un polynôme est continu sur <TeX>{"\\mathbb{R}"}</TeX> : c'est la condition
          indispensable pour appliquer le TVI.
        </>
      ),
    },
    {
      kind: "mcq",
      instruction: (
        <>
          Étape 2 — Que vaut <TeX>{`f(1)`}</TeX> ?
        </>
      ),
      options: [<>−1</>, <>3</>, <>−3</>, <>5</>],
      correctIndex: 0,
      explanation: (
        <>
          <TeX>{`f(1) = 1^5 + 1 - 3 = 1 + 1 - 3 = -1`}</TeX>.
        </>
      ),
    },
    {
      kind: "mcq",
      instruction: (
        <>
          Étape 3 — Que vaut <TeX>{`f(2)`}</TeX> ?
        </>
      ),
      options: [<>31</>, <>27</>, <>32</>, <>−31</>],
      correctIndex: 0,
      explanation: (
        <>
          <TeX>{`f(2) = 2^5 + 2 - 3 = 32 + 2 - 3 = 31`}</TeX>.
        </>
      ),
    },
    {
      kind: "mcq",
      instruction: (
        <>
          Étape 4 — Peux-tu conclure avec le TVI ?
        </>
      ),
      options: [
        <>
          Oui : <TeX>{`f(1) < 0 < f(2)`}</TeX> et <TeX>{"f"}</TeX> continue ⇒ solution dans{" "}
          <TeX>{`[1\\,;\\,2]`}</TeX>
        </>,
        <>
          Non car <TeX>{`f(1) > 0`}</TeX>
        </>,
        <>
          Oui mais la solution est dans <TeX>{`]2\\,;\\,+\\infty[`}</TeX>
        </>,
      ],
      correctIndex: 0,
      explanation: (
        <>
          Toutes les conditions sont réunies : continuité + 0 entre f(1) et f(2). Le TVI
          s'applique, il existe au moins un <TeX>{`c \\in [1\\,;\\,2]`}</TeX> tel que{" "}
          <TeX>{`f(c) = 0`}</TeX>.
        </>
      ),
    },
  ],
  explanation: <>Démarche TVI complète.</>,
};

function DichotomieSection() {
  return (
    <div className="space-y-5">
      <Step id="dich-intro" className="space-y-4">
        <p className="text-[15px] leading-relaxed text-slate-800">
          La dichotomie : on « coupe en deux » (dicho = deux) l'intervalle à chaque étape
          pour piéger la solution dans un intervalle de plus en plus petit.
        </p>

        <MethodBox title="Méthode — la dichotomie">
          <p>
            On suppose <TeX>{"f"}</TeX> continue sur <TeX>{`[a\\,;\\,b]`}</TeX> avec{" "}
            <TeX>{`f(a) \\cdot f(b) < 0`}</TeX>.
          </p>
          <ol className="mt-1 list-decimal space-y-1.5 pl-5">
            <li>
              Calculer le milieu <TeX>{`m = \\frac{a+b}{2}`}</TeX>.
            </li>
            <li>
              Calculer <TeX>{`f(m)`}</TeX>.
            </li>
            <li>
              Si <TeX>{`f(a)\\cdot f(m) < 0`}</TeX>, remplacer <TeX>{"b"}</TeX> par{" "}
              <TeX>{"m"}</TeX> ; sinon remplacer <TeX>{"a"}</TeX> par <TeX>{"m"}</TeX>.
            </li>
            <li>
              Recommencer jusqu'à obtenir la précision voulue : après <TeX>{"n"}</TeX>{" "}
              étapes, la largeur est <TeX>{`\\frac{b-a}{2^n}`}</TeX>.
            </li>
          </ol>
        </MethodBox>

        <TeacherNote>
          Faire exécuter une étape de dichotomie au tableau (sur{" "}
          <TeX>{`x^2 - 2`}</TeX>) avant de lancer l'animation : on suit le mouvement et on
          le compare avec l'animation.
        </TeacherNote>
      </Step>

      <Step id="dich-anim" className="space-y-4">
        <BisectionAnimation />

        <NoteBox>
          <p>
            La dichotomie est inscrite au programme marocain pour{" "}
            <strong>déterminer des valeurs approchées</strong> de solutions d'équations.
            Elle ne demande que des évaluations de <TeX>{"f"}</TeX> : c'est la méthode des
            calculatrices.
          </p>
        </NoteBox>
      </Step>

      <Step id="dich-precision" className="space-y-4">
        <ClassQuestion
          title="Question à la classe"
          options={[
            { label: <TeX>{`\\frac{b-a}{2^n}`}</TeX>, correct: true, note: <>Chaque étape divise la largeur par 2, donc par <TeX>{`2^n`}</TeX> après <TeX>{"n"}</TeX> étapes.</> },
            { label: <TeX>{`\\frac{b-a}{n}`}</TeX> },
            { label: <TeX>{`b - a`}</TeX> },
          ]}
        >
          <p>
            Après <TeX>{"n"}</TeX> étapes de dichotomie sur{" "}
            <TeX>{`[a\\,;\\,b]`}</TeX>, quelle est la largeur de l'intervalle restant ?
          </p>
        </ClassQuestion>

        <ExampleBox>
          <p>
            Dans l'animation : <TeX>{`f(x) = x^2 - 2`}</TeX>, la solution de{" "}
            <TeX>{`f(x)=0`}</TeX> dans <TeX>{`[1\\,;\\,2]`}</TeX> est <TeX>{`\\sqrt{2}`}</TeX>.
            Après quelques étapes, la machine approche <TeX>{`1,4142`}</TeX>.
          </p>
        </ExampleBox>
      </Step>

      <Step id="dich-check" className="space-y-4">
        <ExerciseCard data={dichotomieQuick} />
      </Step>
    </div>
  );
}

const dichotomieQuick: ExerciseData = {
  id: "quick-dichotomie",
  type: "numeric",
  title: "Dichotomie — calcul",
  prompt: (
    <>
      <TeX>{`f(x) = x^2 - 2`}</TeX> sur <TeX>{`[1\\,;\\,2]`}</TeX>, première étape :{" "}
      <TeX>{`m = \\frac{1+2}{2} = 1,5`}</TeX>. On a <TeX>{`f(1,5) = 0,25 > 0`}</TeX>. Le
      nouvel intervalle est donc <TeX>{`[1\\,;\\,1,5]`}</TeX>. Deuxième étape : calcule{" "}
      <TeX>{`m = ?`}</TeX> pour te rapprocher de <TeX>{`\\sqrt{2}`}</TeX>.
    </>
  ),
  answer: 1.25,
  tolerance: 0.001,
  explanation: (
    <>
      <TeX>{`m = \\frac{1 + 1,5}{2} = 1,25`}</TeX>. La largeur a encore été divisée par 2.
    </>
  ),
};

export const tviSection: CourseSection = {
  id: "tvi",
  number: 13,
  title: "Théorème des valeurs intermédiaires",
  category: "continuite",
  Component: TviSection,
};

export const applicationsTviSection: CourseSection = {
  id: "applications-tvi",
  number: 14,
  title: "Applications du TVI : équations",
  category: "continuite",
  Component: ApplicationsSection,
};

export const dichotomieSection: CourseSection = {
  id: "dichotomie",
  number: 15,
  title: "Méthode de dichotomie",
  category: "continuite",
  Component: DichotomieSection,
};