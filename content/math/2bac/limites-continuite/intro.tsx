import type { CourseSection } from "./types";
import { DefinitionBox, ReminderBox, WarningBox, NoteBox, ExampleBox, PropertyBox } from "@/components/ui/Boxes";
import { Formula, TeX } from "@/components/ui/TeX";
import { Reveal } from "@/components/ui/Reveal";
import { Step, TeacherNote } from "@/components/presentation/presentation";
import InteractiveLimitGraph from "@/components/math/InteractiveLimitGraph";

function IntroSection() {
  const rows = [
    { x: "2", fx: "4" },
    { x: "1,5", fx: "2,25" },
    { x: "1,1", fx: "1,21" },
    { x: "1,01", fx: "1,0201" },
    { x: "1,001", fx: "1,002001" },
    { x: "1,0001", fx: "1,00020001" },
  ];
  return (
    <div className="space-y-5">
      <Step id="in-situation" className="space-y-4">
        <p className="text-[15px] leading-relaxed text-slate-800">
          Imagine un tigre… non, imagine la fonction{" "}
          <TeX>{`f(x) = x^2`}</TeX>. On s'intéresse à ce qui se passe quand{" "}
          <TeX>{"x"}</TeX> devient de plus en plus proche de{" "}
          <TeX>{"1"}</TeX> <em>sans jamais l'atteindre</em>.
        </p>

        <Reveal>
          <div className="overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-slate-200">
            <table className="w-full text-center text-sm">
              <thead className="bg-primary-50 text-primary-800">
                <tr>
                  <th className="px-3 py-2 font-bold">
                    <TeX>{"x"}</TeX> se rapproche de <TeX>{"1"}</TeX>
                  </th>
                  <th className="px-3 py-2 font-bold">
                    <TeX>{"x^2"}</TeX> se rapproche de…
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r) => (
                  <tr key={r.x}>
                    <td className="px-3 py-1.5 font-mono text-slate-700">
                      {r.x}
                      <span className="ml-2 text-emerald-500">→ 1</span>
                    </td>
                    <td className="px-3 py-1.5 font-mono text-slate-700">
                      {r.fx}
                      <span className="ml-2 text-emerald-500">→ 1</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>

        <TeacherNote>
          Faire lire le tableau colonne par colonne : les élèves doivent VOIR que tout se
          rapproche de 1. Puis poser la question « et si je demande x = 1 ? ».
        </TeacherNote>
      </Step>

      <Step id="in-ecriture" className="space-y-4">
        <p className="text-[15px] leading-relaxed text-slate-800">
          Regarde les colonnes : plus <TeX>{"x"}</TeX> est proche de 1, plus{" "}
          <TeX>{"x^2"}</TeX> est proche de 1. On écrit :
        </p>
        <Formula>{`\\lim_{x \\to 1} x^2 = 1`}</Formula>
        <p className="text-[15px] leading-relaxed text-slate-800">
          On lit : <em>« la limite de x² quand x tend vers 1 est égale à 1 »</em>.
          On note <TeX>{"x \\to 1"}</TeX> pour dire que x s'approche de 1 de toutes les directions possibles.
        </p>

        <InteractiveLimitGraph
          expr="x^2"
          a={1}
          approach="both"
          auto
          caption="Fais varier les curseurs : les deux points (bleu à gauche, vert à droite) se rapprochent de la cible. Les valeurs x et f(x) s'affichent en dessous."
        />

        <ReminderBox>
          <p>
            La limite décrit le <strong>comportement</strong> d'une fonction{" "}
            <em>au voisinage</em> d'un point : ce qui se passe quand{" "}
            <TeX>{"x"}</TeX> se rapproche de <TeX>{"a"}</TeX>,{" "}
            <strong>sans jamais lui demander de valoir</strong> <TeX>{"a"}</TeX>.
          </p>
        </ReminderBox>

        <NoteBox>
          <p>
            Si <TeX>{"\\lim_{x\\to a} f(x) = L"}</TeX>, alors <TeX>{"f(x)"}</TeX>{" "}
            peut être rendu aussi proche de <TeX>{"L"}</TeX> qu'on le veut, à condition de
            prendre <TeX>{"x"}</TeX> suffisamment proche de <TeX>{"a"}</TeX>.
          </p>
        </NoteBox>
      </Step>

      <Step id="in-warning" className="space-y-4">
        <WarningBox>
          <p>
            <strong>Ne pas confondre :</strong> la limite en <TeX>{"a"}</TeX> n'utilise{" "}
            <strong>jamais</strong> la valeur <TeX>{"f(a)"}</TeX>. On impose même que{" "}
            <TeX>{"x \\neq a"}</TeX> pendant l'approche. C'est ce qui nous permettra
            d'étudier des fonctions non définies en <TeX>{"a"}</TeX> (trous, asymptotes…).
          </p>
        </WarningBox>

        <ExampleBox>
          <p>
            Avec <TeX>{`f(x) = \\dfrac{x^2-1}{x-1}`}</TeX>, on ne peut pas remplacer{" "}
            <TeX>{"x"}</TeX> par 1 : cela donnerait <TeX>{"\\dfrac{0}{0}"}</TeX>. Pourtant, en
            factorisant, on verra que la limite existe et vaut… <TeX>{"2"}</TeX>. C'est la
            magie des limites : <strong>étudier sans calculer</strong>.
          </p>
        </ExampleBox>

        <TeacherNote>
          Annoncer l'objectif de la séance et pointer ce qui viendra : « on termine le
          chapitre quand vous savez lever cette indétermination ».
        </TeacherNote>
      </Step>

      <Step id="in-objectifs" className="space-y-4">
        <p className="text-[15px] leading-relaxed text-slate-800">
          À la fin de ce chapitre, tu sauras : calculer toutes sortes de limites, lever les
          formes indéterminées, prouver la continuité d'une fonction, et utiliser le TVI
          (théorème des valeurs intermédiaires) pour résoudre des équations — y compris en
          les approchant numériquement par dichotomie.
        </p>
      </Step>
    </div>
  );
}

function RappelsSection() {
  const maps = [
    {
      title: "Les intervalles",
      color: "bg-sky-50 ring-sky-200 text-sky-800",
      items: [
        { label: "fermé", tex: "[a \\,;\\, b]" },
        { label: "ouvert", tex: "]a \\,;\\, b[" },
        { label: "semi-ouvert", tex: "[a \\,;\\, b[" },
        { label: "infini", tex: "]-\\infty \\,;\\, b]" },
      ],
    },
    {
      title: "Identités remarquables",
      color: "bg-emerald-50 ring-emerald-200 text-emerald-800",
      items: [
        { label: "différence de carrés", tex: "a^2 - b^2 = (a-b)(a+b)" },
        { label: "carré d'une somme", tex: "(a+b)^2 = a^2 + 2ab + b^2" },
        { label: "cube de sommes", tex: "a^3 - b^3 = (a-b)(a^2+ab+b^2)" },
      ],
    },
    {
      title: "Valeur absolue",
      color: "bg-violet-50 ring-violet-200 text-violet-800",
      items: [
        { label: "définition", tex: "|x| = x \\ \\text{si } x \\geq 0, \\ -x \\ \\text{sinon}" },
        { label: "distance", tex: "|x-a| = \\text{distance entre } x \\text{ et } a" },
        { label: "racine", tex: "\\sqrt{x^2} = |x|" },
      ],
    },
    {
      title: "Puissances & racines",
      color: "bg-amber-50 ring-amber-200 text-amber-800",
      items: [
        { label: "produit", tex: "a^{m} \\times a^{n} = a^{m+n}" },
        { label: "quotient", tex: "\\dfrac{a^{m}}{a^{n}} = a^{m-n}" },
        { label: "racine carrée", tex: "(\\sqrt{x})^2 = x \\ \\text{pour } x \\geq 0" },
      ],
    },
  ];
  return (
    <div className="space-y-5">
      <Step id="rap-outils" className="space-y-4">
        <p className="text-[15px] leading-relaxed text-slate-800">
          Avant de partir, voici un petit rappel des outils que tu dois connaître par cœur
          pour tout le chapitre. Les limites et la continuité ne marchent bien que si le
          <strong> calcul algébrique est solide</strong>.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {maps.map((m) => (
            <div key={m.title} className={`rounded-2xl p-4 ring-1 ${m.color}`}>
              <div className="mb-2 text-sm font-bold">{m.title}</div>
              <ul className="space-y-1.5">
                {m.items.map((it) => (
                  <li key={it.label} className="text-[13.5px]">
                    <span className="text-slate-600">{it.label} :</span>{" "}
                    <Formula>{it.tex}</Formula>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Step>

      <Step id="rap-fonctions" className="space-y-4">
        <PropertyBox>
          <p>
            <strong>Fonctions usuelles</strong> (à connaître) : les fonctions{" "}
            <strong>polynomiales</strong>, <strong>rationnelles</strong>,{" "}
            <TeX>{"x \\mapsto \\sqrt{x}"}</TeX>, <TeX>{"x \\mapsto |x|"}</TeX>,{" "}
            <TeX>{"\\sin"}</TeX> et <TeX>{"\\cos"}</TeX> sont définies et{" "}
            <strong>continues</strong> sur leur ensemble de définition. On le verra dans ce chapitre.
          </p>
        </PropertyBox>

        <Formula>{`\\lim_{x \\to 0} \\dfrac{\\sin x}{x} = 1`}</Formula>

        <NoteBox>
          <p>
            La limite remarquable <TeX>{`\\lim_{x\\to 0} \\dfrac{\\sin x}{x} = 1`}</TeX>{" "}
            est <strong>admise</strong> au programme et sera souvent utile (fonctions
            trigonométriques). On peut la visualiser ainsi : quand l'angle{" "}
            <TeX>{"x"}</TeX> (en radians) est petit, <TeX>{"\\sin x \\approx x"}</TeX>.
          </p>
        </NoteBox>
      </Step>

      <Step id="rap-radians" className="space-y-4">
        <WarningBox>
          <p>
            Radians obligatoires ! La formule <TeX>{`\\lim_{x\\to 0} \\dfrac{\\sin x}{x} = 1`}</TeX>{" "}
            n'est valable que si <TeX>{"x"}</TeX> est exprimé en{" "}
            <strong>radians</strong>.
          </p>
        </WarningBox>

        <TeacherNote>
          Question piège à la classe : « et si l'angle est en degrés ? ». Vérifier que les
          élèves savent que les calculatrices trigonométriques se règlent en radians.
        </TeacherNote>
      </Step>

      <Step id="rap-calcul" className="space-y-4">
        <ReminderBox>
          <p>
            Le cours de ce chapitre utilise en permanence : écriture simplifiée des
            fractions, factorisations, dénominateur commun, quantités conjuguées{" "}
            <TeX>{(`(\\sqrt{a}-b)(\\sqrt{a}+b) = a - b^2`)}</TeX>. Si ces calculs ne sont pas
            automatisés, entraîne-toi avant de continuer.
          </p>
        </ReminderBox>
      </Step>
    </div>
  );
}

export const introSection: CourseSection = {
  id: "intro",
  number: 1,
  title: "Introduction : pourquoi les limites ?",
  category: "decouverte",
  Component: IntroSection,
};

export const rappelsSection: CourseSection = {
  id: "rappels",
  number: 2,
  title: "Rappels : les outils indispensables",
  category: "decouverte",
  Component: RappelsSection,
};