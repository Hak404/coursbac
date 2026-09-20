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
import { Reveal } from "@/components/ui/Reveal";
import { Step, TeacherNote } from "@/components/presentation/presentation";
import { ClassQuestion, GuidedExample } from "@/components/presentation/scenes";
import ExerciseCard from "@/components/exercise/ExerciseCard";
import type { ExerciseData } from "@/components/exercise/types";

function OpRow({ left, right, fi }: { left: string; right: string; fi?: boolean }) {
  return (
    <div
      className={`grid grid-cols-[1fr_30px_1fr] items-center gap-1 ${fi ? "rounded-lg bg-amber-50 px-1" : ""}`}
    >
      <div className="text-right">
        <TeX>{left}</TeX>
      </div>
      <div className="text-center text-slate-400">→</div>
      {fi ? (
        <div className="text-left font-bold text-amber-600">
          ⚠ indéterminée
        </div>
      ) : (
        <div className="text-left">
          <TeX>{right}</TeX>
        </div>
      )}
    </div>
  );
}

function OpTable({ title, rows }: { title: string; rows: { left: string; right: string; fi?: boolean }[] }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-slate-200">
      <div className="mb-2 text-sm font-bold text-slate-700">{title}</div>
      <div className="space-y-1.5 text-[13.5px]">
        {rows.map((r, i) => (
          <OpRow key={i} {...r} />
        ))}
      </div>
    </div>
  );
}

const quickOp1: ExerciseData = {
  id: "quick-op-somme",
  type: "mcq",
  title: "Vérification rapide",
  prompt: (
    <>
      Si <TeX>{`\\lim_{x\\to a} f(x) = +\\infty`}</TeX> et{" "}
      <TeX>{`\\lim_{x\\to a} g(x) = 5`}</TeX>, que vaut{" "}
      <TeX>{`\\lim_{x\\to a} \\big(f(x) + g(x)\\big)`}</TeX> ?
    </>
  ),
  options: ["+∞", "5", "∞ − 5 (indéterminée)", "On ne peut pas savoir"],
  correct: 0,
  explanation: (
    <>
      Ajouter un réel fini (5) ne change pas la croissance : le tout tend vers{" "}
      <TeX>{`+\\infty`}</TeX>. Règle : <TeX>{`L + (+\\infty) = +\\infty`}</TeX>.
    </>
  ),
};

function OperationsSection() {
  return (
    <div className="space-y-5">
      <Step id="op-regles" className="space-y-4">
        <p className="text-[15px] leading-relaxed text-slate-800">
          Les limites « se transmettent » aux combinaisons de fonctions. Voici les règles,
          à condition que les limites utilisées existent.
        </p>

        <DefinitionBox>
          <p>
            Soient <TeX>{"f"}</TeX> et <TeX>{"g"}</TeX> deux fonctions telles que les limites
            ci-dessous existent (éventuellement infinies). Le tableau donne la limite du
            résultat. <TeX>{"L, L', M"}</TeX> désignent des <strong>réels finis</strong>.
          </p>
        </DefinitionBox>

        <div className="grid gap-3 md:grid-cols-2">
          <OpTable
            title="Somme"
            rows={[
              { left: "L + L'", right: "L + L'" },
              { left: "L + (+∞)", right: "+∞" },
              { left: "L + (−∞)", right: "−∞" },
              { left: "+∞ + (+∞)", right: "+∞" },
              { left: "−∞ + (−∞)", right: "−∞" },
              { left: "+∞ + (−∞)", right: "", fi: true },
            ]}
          />
          <OpTable
            title="Produit"
            rows={[
              { left: "L × M", right: "L × M" },
              { left: "L (≠0) × ∞", right: "∞ (signe de L)" },
              { left: "∞ × (+∞)", right: "+∞" },
              { left: "∞ × (−∞)", right: "−∞" },
              { left: "0 × ∞", right: "", fi: true },
            ]}
          />
          <OpTable
            title="Quotient"
            rows={[
              { left: "L ÷ M (M ≠ 0)", right: "L ÷ M" },
              { left: "L ÷ ∞", right: "0" },
              { left: "L (≠0) ÷ 0", right: "±∞ (signe à étudier)" },
              { left: "∞ ÷ L", right: "±∞" },
              { left: "0 ÷ 0", right: "", fi: true },
              { left: "∞ ÷ ∞", right: "", fi: true },
            ]}
          />
          <OpTable
            title="Composée / puissances"
            rows={[
              { left: String.raw`\lim_{x\to a} u(x) = b \text{ et } \lim_{y\to b} f(y) = L`, right: String.raw`\lim_{x\to a} f(u(x)) = L` },
              { left: String.raw`\lim u = L`, right: String.raw`\lim u^n = L^n \; (n \in \mathbb{N}^*)` },
              { left: String.raw`\lim u = +\infty`, right: String.raw`\lim u^n = +\infty` },
              { left: String.raw`\lim u = L \geq 0`, right: String.raw`\lim \sqrt{u} = \sqrt{L}` },
              { left: String.raw`\lim u = +\infty`, right: String.raw`\lim \sqrt{u} = +\infty` },
            ]}
          />
        </div>

        <ClassQuestion
          title="Question à la classe"
          options={[
            { label: <TeX>{`0 \\times \\infty = 0`}</TeX> },
            { label: <TeX>{`0 \\times \\infty = \\infty`}</TeX> },
            {
              label: "On ne peut pas conclure",
              correct: true,
              note: (
                <>
                  <TeX>{`0 \\times \\infty`}</TeX> est l'une des quatre formes
                  indéterminées : il faut transformer l'expression avant de conclure.
                </>
              ),
            },
          ]}
        >
          <p>
            Si <TeX>{`\\lim f = 0`}</TeX> et <TeX>{`\\lim g = +\\infty`}</TeX>, que vaut{" "}
            <TeX>{`\\lim f \\times g`}</TeX> ?
          </p>
        </ClassQuestion>

        <WarningBox>
          <p>
            Ces règles supposent qu'<strong>aucune des deux limites n'est sur le point de
            devenir une forme indéterminée</strong>. Si la case « ⚠ indéterminée » apparaît,
            on ne peut rien conclure directement : il faut transformer l'expression.
          </p>
        </WarningBox>
      </Step>

      <Step id="op-theoremes" className="space-y-4">
        <TheoremBox>
          <p>
            <strong>Théorème d'encadrement (« des gendarmes ») :</strong> si pour{" "}
            <TeX>{"x"}</TeX> au voisinage de <TeX>{"a"}</TeX> on a{" "}
            <TeX>{`g(x) \\leq f(x) \\leq h(x)`}</TeX> et que{" "}
            <TeX>{`\\lim g = \\lim h = L`}</TeX>, alors{" "}
            <TeX>{`\\lim f = L`}</TeX>.
          </p>
          <p className="mt-1">
            <strong>Théorème de comparaison :</strong> si <TeX>{`f \\geq g`}</TeX> et{" "}
            <TeX>{`\\lim g = +\\infty`}</TeX>, alors <TeX>{`\\lim f = +\\infty`}</TeX>. (Et la
            version avec <TeX>{"-"}</TeX>∞ et des inégalités renversées.)
          </p>
        </TheoremBox>

        <ExampleBox>
          <p>
            Pour <TeX>{`f(x) = \\dfrac{\\sin x}{x}`}</TeX> avec <TeX>{`x > 0`}</TeX>, on encadre :{" "}
            <TeX>{`-\\dfrac{1}{x} \\leq \\dfrac{\\sin x}{x} \\leq \\dfrac{1}{x}`}</TeX>. Comme{" "}
            <TeX>{`\\lim_{x\\to +\\infty} \\pm\\dfrac{1}{x} = 0`}</TeX>, les gendarmes donnent{" "}
            <TeX>{`\\lim_{x\\to +\\infty} \\dfrac{\\sin x}{x} = 0`}</TeX>.
          </p>
        </ExampleBox>

        <TeacherNote>
          Sur le théorème des gendarmes : dessiner trois courbes « prises en sandwich » et
          faire remarquer que la fonction du milieu doit forcément suivre les deux autres.
        </TeacherNote>

        <ExerciseCard data={quickOp1} />
      </Step>
    </div>
  );
}

const quickFi1: ExerciseData = {
  id: "quick-fi-1",
  type: "mcq",
  title: "Reconnaître une forme indéterminée",
  prompt: (
    <>
      Laquelle de ces limites est une <strong>forme indéterminée</strong> ?
    </>
  ),
  options: [
    <span key="0"><TeX>{`\\lim_{x\\to 1} \\dfrac{x^2-1}{x-1}`}</TeX> (en remplaçant x par 1)</span>,
    <span key="1"><TeX>{`\\lim_{x\\to +\\infty} (2x+3)`}</TeX></span>,
    <span key="2"><TeX>{`\\lim_{x\\to 2} (x^2 + 1)`}</TeX></span>,
    <span key="3"><TeX>{`\\lim_{x\\to +\\infty} \\dfrac{1}{x}`}</TeX></span>,
  ],
  correct: 0,
  explanation: (
    <>
      En remplaçant <TeX>{"x"}</TeX> par 1 dans le quotient, on obtient{" "}
      <TeX>{`\\dfrac{0}{0}`}</TeX> : c'est une forme indéterminée. Les autres se calculent
      directement (<TeX>{`2x+3 \\to +\\infty`}</TeX>, <TeX>{`x^2+1 \\to 5`}</TeX>,{" "}
      <TeX>{`\\frac{1}{x} \\to 0`}</TeX>).
    </>
  ),
};

function FormesIndetermineesSection() {
  const fis = [
    { tex: "\\infty - \\infty", id: "∞−∞" },
    { tex: "\\dfrac{\\infty}{\\infty}", id: "∞/∞" },
    { tex: "\\dfrac{0}{0}", id: "0/0" },
    { tex: "0 \\times \\infty", id: "0×∞" },
  ];
  return (
    <div className="space-y-5">
      <Step id="fi-intro" className="space-y-4">
        <p className="text-[15px] leading-relaxed text-slate-800">
          Il existe quatre « formes » qui ne disent rien du résultat :
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {fis.map((f) => (
            <div
              key={f.id}
              className="rounded-2xl bg-amber-50 p-4 text-center ring-1 ring-amber-200"
            >
              <Formula>{f.tex}</Formula>
            </div>
          ))}
        </div>

        <WarningBox>
          <p>
            <strong>Une forme indéterminée ne « vaut » rien !</strong> Écrire{" "}
            <TeX>{`\\infty - \\infty = 0`}</TeX> est une erreur très grave. Une FI signifie :
            <em> les règles ordinaires ne s'appliquent pas, il faut transformer l'expression</em>.
          </p>
        </WarningBox>

        <TeacherNote>
          Demander aux élèves de proposer des « valeurs » pour ces quatre formes avant
          d'afficher l'avertissement. Les envies de <TeX>{`\\infty - \\infty = 0`}</TeX>
          sont le meilleur point de départ pour cette scène.
        </TeacherNote>
      </Step>

      <Step id="fi-guided" className="space-y-4">
        <GuidedExample
          id="ex-fi-fraction"
          title="Exemple guidé — lever une forme 0/0"
          steps={[
            {
              tag: "Substitution",
              body: (
                <>
                  On remplace <TeX>{"x"}</TeX> par 1 :
                  <Formula>{`\\lim_{x\\to 1} \\dfrac{x^2-1}{x-1} \\qquad \\xrightarrow{x=1} \\;\\dfrac{1^2-1}{1-1} = \\dfrac{0}{0}`}</Formula>
                </>
              ),
            },
            {
              tag: "Forme indéterminée",
              body: (
                <p>
                  <TeX>{`\\dfrac{0}{0}`}</TeX> est une forme indéterminée : on ne peut rien
                  conclure. Le numérateur et le dénominateur s'annulent {`tous les deux`} en 1
                  — il faut <strong>éliminer la cause</strong>.
                </p>
              ),
            },
            {
              tag: "Factoriser",
              body: (
                <>
                  On factorise grâce à l'identité <TeX>{`a^2-b^2`}</TeX> :
                  <Formula>{`x^2 - 1 = (x-1)(x+1)`}</Formula>
                </>
              ),
            },
            {
              tag: "Simplifier",
              body: (
                <>
                  Pour <TeX>{`x \\neq 1`}</TeX>, le facteur commun <TeX>{`(x-1)`}</TeX> se
                  simplifie :
                  <Formula>{`\\dfrac{(x-1)(x+1)}{x-1} = x+1`}</Formula>
                </>
              ),
            },
            {
              tag: "Calculer",
              body: (
                <>
                  La fonction simplifiée est définie en 1 : on remplace à nouveau.
                  <Formula>{`\\lim_{x\\to 1} (x+1) = 1 + 1 = 2`}</Formula>
                </>
              ),
            },
            {
              tag: "Conclusion",
              body: (
                <p className="font-bold text-primary-700">
                  <TeX>{`\\lim_{x\\to 1} \\dfrac{x^2-1}{x-1} = 2`}</TeX>
                </p>
              ),
            },
          ]}
        />
      </Step>

      <Step id="fi-methode" className="space-y-4">
        <MethodBox>
          <p>
            <strong>Que faire face à une forme indéterminée ?</strong> On choisit une
            transformation selon l'origine de la FI :
          </p>
          <ul className="mt-2 space-y-2">
            <li>
              <strong>FI 0/0 avec des polynômes</strong> → factoriser puis simplifier le
              facteur commun.
            </li>
            <li>
              <strong>FI 0/0 avec des racines</strong> → utiliser l'expression
              conjuguée.
            </li>
            <li>
              <strong>FI ∞/∞ ou ∞−∞ à l'infini</strong> → factoriser par le{" "}
              <strong>terme dominant</strong>.
            </li>
            <li>
              <strong>FI ∞−∞ avec des fractions</strong> → réduire au même dénominateur.
            </li>
            <li>
              <strong>FI 0×∞</strong> → écrire le produit comme un quotient{" "}
              <TeX>{`f\\times g = \\dfrac{f}{1/g}`}</TeX> puis appliquer une méthode
              précédente.
            </li>
          </ul>
        </MethodBox>

        <div className="grid gap-3 md:grid-cols-2">
          {[
            {
              title: "∞ − ∞",
              before: "\\infty - \\infty",
              then: "réécrire (même dénominateur, conjuguée, terme dominant)",
              example: String.raw`\lim_{x\to+\infty} \sqrt{x+1} - \sqrt{x} = 0`,
            },
            {
              title: "0/0",
              before: "\\dfrac{0}{0}",
              then: "factoriser et simplifier",
              example: String.raw`\lim_{x\to 1} \dfrac{x^2-1}{x-1} = 2`,
            },
            {
              title: "∞/∞",
              before: "\\dfrac{\\infty}{\\infty}",
              then: "factoriser le terme dominant",
              example: String.raw`\lim_{x\to+\infty} \dfrac{x^2+1}{x^2} = 1`,
            },
            {
              title: "0 × ∞",
              before: "0 \\times \\infty",
              then: "transformer en quotient",
              example: String.raw`\lim_{x\to+\infty} \dfrac{\sin x}{x} = 0`,
            },
          ].map((c) => (
            <div key={c.title} className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-slate-200">
              <div className="mb-1 text-sm font-bold text-amber-700">{c.title}</div>
              <Formula>{String.raw`\underbrace{${c.before}}_{\text{forme indéterminée}}`}</Formula>
              <p className="text-[13px] text-slate-600">
                <strong>Méthode :</strong> {c.then}.
              </p>
              <div className="mt-1 rounded-lg bg-slate-50 px-2 py-1">
                <Formula>{c.example}</Formula>
              </div>
            </div>
          ))}
        </div>

        <ExerciseCard data={quickFi1} />
      </Step>
    </div>
  );
}

const guidedFactorisation: ExerciseData = {
  id: "guided-factorisation",
  type: "guided",
  title: "Exercice guidé",
  prompt: (
    <>
      Calcule <TeX>{`\\lim_{x\\to 1} \\dfrac{x^2-1}{x-1}`}</TeX> (forme{" "}
      <TeX>{`\\frac{0}{0}`}</TeX>).
    </>
  ),
  steps: [
    {
      kind: "mcq",
      instruction: (
        <>
          Étape 1 — Pour lever la FI, quelle identité permet de factoriser{" "}
          <TeX>{`x^2 - 1`}</TeX> ?
        </>
      ),
      options: [
        <>
          <TeX>{`x^2 - 1 = (x-1)(x+1)`}</TeX>
        </>,
        <>
          <TeX>{`x^2 - 1 = (x-1)^2`}</TeX>
        </>,
        <>
          <TeX>{`x^2 - 1 = (x+1)^2`}</TeX>
        </>,
      ],
      correctIndex: 0,
      explanation: (
        <>
          C'est l'identité remarquable <TeX>{`a^2-b^2 = (a-b)(a+b)`}</TeX> avec{" "}
          <TeX>{`a=x`}</TeX> et <TeX>{`b=1`}</TeX>.
        </>
      ),
    },
    {
      kind: "mcq",
      instruction: (
        <>
          Étape 2 — Après simplification, l'expression vaut :
        </>
      ),
      options: [
        <><TeX>{`x + 1`}</TeX></>,
        <><TeX>{`x - 1`}</TeX></>,
        <><TeX>{`(x-1)(x+1)`}</TeX></>,
      ],
      correctIndex: 0,
      explanation: (
        <>
          On simplifie : <TeX>{`\\dfrac{(x-1)(x+1)}{x-1} = x+1`}</TeX> pour{" "}
          <TeX>{`x \\neq 1`}</TeX>.
        </>
      ),
    },
    {
      kind: "numeric",
      instruction: (
        <>
          Étape 3 — Conclus : <TeX>{`\\lim_{x\\to 1} \\dfrac{x^2-1}{x-1} = \\; ?`}</TeX>
        </>
      ),
      answer: 2,
      tolerance: 0.001,
      explanation: (
        <>
          En remplaçant : <TeX>{`1 + 1 = 2`}</TeX>. On peut vérifier : la fonction{" "}
          <TeX>{`x^2-1`}</TeX> coupe bien l'axe autour de… et la limite est 2.
        </>
      ),
    },
  ],
  explanation: <>Méthode de la factorisation complète.</>,
};

function MethodesSection() {
  return (
    <div className="space-y-6">
      <Step id="mth-remplacement" className="space-y-4">
        <MethodBox>
          <p>
            <strong>Méthode 1 — Remplacement direct.</strong> Quand la fonction est définie
            et continue en <TeX>{"a"}</TeX>, on remplace simplement <TeX>{"x"}</TeX> par{" "}
            <TeX>{"a"}</TeX>.
          </p>
        </MethodBox>
        <ExampleBox>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <TeX>{`\\lim_{x\\to 2} (3x-1) = 6 - 1 = 5`}</TeX>
            </li>
            <li>
              <TeX>{`\\lim_{x\\to 0} \\cos x = \\cos 0 = 1`}</TeX>
            </li>
            <li>
              <TeX>{`\\lim_{x\\to 4} \\sqrt{x} = 2`}</TeX>
            </li>
          </ul>
        </ExampleBox>
        <WarningBox>
          <p>
            Trois refus du remplacement direct : quotient avec dénominateur nul, limite
            infinie, ou f n'est pas définie en <TeX>{"a"}</TeX>. Dans ces cas, on ne
            « remplace pas » : on transforme.
          </p>
        </WarningBox>
        <TeacherNote>
          La méthode 1 marche parce que les fonctions de référence sont <strong>continues</strong>{" "}
          en <TeX>{"a"}</TeX>. « Remplacer » revient à utiliser f(a).
        </TeacherNote>
      </Step>

      <Step id="mth-factorisation" className="space-y-4">
        <MethodBox>
          <p>
            <strong>Méthode 2 — Factorisation.</strong> Pour une FI <TeX>{`\\frac{0}{0}`}</TeX>{" "}
            avec des polynômes, on factorise numérateur et dénominateur par{" "}
            <TeX>{`(x-a)`}</TeX> puis on simplifie.
          </p>
        </MethodBox>
        <ExampleBox>
          <p>
            <TeX>{`\\lim_{x\\to 1} \\dfrac{x^2-1}{x-1} = \\lim_{x\\to 1} \\dfrac{(x-1)(x+1)}{x-1} = \\lim_{x\\to 1} (x+1) = 2`}</TeX>
          </p>
        </ExampleBox>
        <ExerciseCard data={guidedFactorisation} />
      </Step>

      <Step id="mth-conjuguee" className="space-y-4">
        <MethodBox>
          <p>
            <strong>Méthode 3 — Expression conjuguée.</strong> Pour une FI{" "}
            <TeX>{`\\frac{0}{0}`}</TeX> ou <TeX>{`\\infty - \\infty`}</TeX> avec des racines
            carrées, on multiplie par l'expression conjuguée.
          </p>
        </MethodBox>
        <ExampleBox>
          <p>
            <Formula>{`\\lim_{x\\to 4} \\dfrac{\\sqrt{x}-2}{x-4} = \\lim_{x\\to 4} \\dfrac{(\\sqrt{x}-2)(\\sqrt{x}+2)}{(x-4)(\\sqrt{x}+2)} = \\lim_{x\\to 4} \\dfrac{x-4}{(x-4)(\\sqrt{x}+2)} = \\lim_{x\\to 4} \\dfrac{1}{\\sqrt{x}+2} = \\dfrac{1}{4}`}</Formula>
          </p>
        </ExampleBox>
        <ExampleBox>
          <p>
            <Formula>{`\\lim_{x\\to +\\infty} \\sqrt{x+1} - \\sqrt{x} = \\lim \\dfrac{(\\sqrt{x+1}-\\sqrt{x})(\\sqrt{x+1}+\\sqrt{x})}{\\sqrt{x+1}+\\sqrt{x}} = \\lim \\dfrac{1}{\\sqrt{x+1}+\\sqrt{x}} = 0`}</Formula>
          </p>
        </ExampleBox>
      </Step>

      <Step id="mth-dominant" className="space-y-4">
        <MethodBox>
          <p>
            <strong>Méthode 4 — Terme dominant.</strong> À l'infini, on factorise par le
            terme de plus haut degré.
          </p>
        </MethodBox>
        <ExampleBox>
          <p>
            <Formula>{`\\lim_{x\\to +\\infty} \\dfrac{2x^2 + 3x + 1}{x^2 - 5} = \\lim \\dfrac{x^2\\left(2 + \\frac{3}{x} + \\frac{1}{x^2}\\right)}{x^2\\left(1 - \\frac{5}{x^2}\\right)} = \\lim \\dfrac{2 + \\frac{3}{x} + \\frac{1}{x^2}}{1 - \\frac{5}{x^2}} = 2`}</Formula>
          </p>
        </ExampleBox>
      </Step>

      <Step id="mth-degres" className="space-y-4">
        <MethodBox>
          <p>
            <strong>Méthode 5 — Comparaison des degrés</strong> (quotients de polynômes à
            l'infini). Soit <TeX>{`f(x) = \\dfrac{P(x)}{Q(x)}`}</TeX>.
          </p>
        </MethodBox>
        <div className="overflow-x-auto rounded-2xl bg-white p-3 shadow-card ring-1 ring-slate-200">
          <table className="w-full text-center text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-2 py-2">degré de P vs degré de Q</th>
                <th className="px-2 py-2">
                  <TeX>{`\\lim_{x\\to \\pm\\infty} f(x)`}</TeX>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="px-2 py-2">
                  <TeX>{`\\deg P < \\deg Q`}</TeX>
                </td>
                <td className="px-2 py-2 font-semibold text-emerald-700">0</td>
              </tr>
              <tr>
                <td className="px-2 py-2">
                  <TeX>{`\\deg P = \\deg Q`}</TeX>
                </td>
                <td className="px-2 py-2 font-semibold text-emerald-700">
                  rapport des coefficients des termes dominants
                </td>
              </tr>
              <tr>
                <td className="px-2 py-2">
                  <TeX>{`\\deg P > \\deg Q`}</TeX>
                </td>
                <td className="px-2 py-2 font-semibold text-emerald-700">
                  <TeX>{`\\pm\\infty`}</TeX> (signe du rapport des termes dominants)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Step>

      <Step id="mth-checklist" className="space-y-4">
        <ReminderBox>
          <p>
            L'ordre d'attaque d'une limite :
          </p>
          <ol className="mt-1 list-decimal space-y-1 pl-5">
            <li>remplacement direct (si possible) ;</li>
            <li>sinon, identifier la forme indéterminée ;</li>
            <li>choisir la transformation adaptée ;</li>
            <li>recalculer, et si besoin recommencer.</li>
          </ol>
        </ReminderBox>
        <TeacherNote>
          Afficher cette check-list avant les exercices : c'est l'ordre à appliquer en
          examen.
        </TeacherNote>
      </Step>
    </div>
  );
}

export const operationsSection: CourseSection = {
  id: "operations",
  number: 7,
  title: "Opérations sur les limites",
  category: "limites",
  Component: OperationsSection,
};

export const formesIndetermineesSection: CourseSection = {
  id: "formes-indeterminees",
  number: 8,
  title: "Les formes indéterminées",
  category: "limites",
  Component: FormesIndetermineesSection,
};

export const methodesSection: CourseSection = {
  id: "methodes",
  number: 9,
  title: "Méthodes de calcul des limites",
  category: "limites",
  Component: MethodesSection,
};