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
import InteractiveLimitGraph from "@/components/math/InteractiveLimitGraph";
import InfiniteLimitGraph from "@/components/math/InfiniteLimitGraph";
import LimitAtInfinityGraph from "@/components/math/LimitAtInfinityGraph";

function LimitePointSection() {
  return (
    <div className="space-y-5">
      <Step id="lp-question" className="space-y-4">
        <p className="text-[15px] leading-relaxed text-slate-800">
          <strong>Situation :</strong> <TeX>{"f(x) = 2x + 1"}</TeX>. Que se passe-t-il
          lorsque <TeX>{"x"}</TeX> se rapproche de <TeX>{"2"}</TeX> ? Quelle valeur{" "}
          <TeX>{"f(x)"}</TeX> semble-t-il atteindre ?
        </p>
        <TeacherNote>
          Poser la question à l'oral <strong>avant</strong> de lancer l'animation. Laisser
          les élèves prédire, puis vérifier ensemble avec le bouton « Play ».
        </TeacherNote>
      </Step>

      <Step id="lp-animation" className="space-y-4">
        <p className="text-[15px] leading-relaxed text-slate-800">
          Soit <TeX>{"f"}</TeX> une fonction définie sur un intervalle contenant{" "}
          <TeX>{"a"}</TeX>, sauf peut-être au point <TeX>{"a"}</TeX> lui-même. Observe :
          déplace <TeX>{"x"}</TeX> avec le slider, ou lance l'animation.
        </p>

        <InteractiveLimitGraph
          expr="2*x+1"
          a={2}
          approach="both"
          limitValue={5}
          auto
          bbox={[-4.5, 13, 4.5, -4]}
          caption="Ici la fonction est définie en 2. Mais la limite ne le « demande » pas : c'est seulement le comportement autour de 2 qui compte."
        />
        <TeacherNote>
          Cliquer sur « ▶ LANCER » (barre du bas) pour faire glisser
          <TeX>{"x"}</TeX> tout seul vers 2, ou déplacer le curseur à la main. Laisser les
          élèves formuler la valeur observée avant de révéler la réponse.
        </TeacherNote>
        <ClassQuestion
          title="Question à la classe"
          options={[
            {
              label: <TeX>{`f(x) \\to 4`}</TeX>,
            },
            {
              label: <TeX>{`f(x) \\to 5`}</TeX>,
              correct: true,
              note: (
                <>
                  Quand <TeX>{"x \\to 2"}</TeX>, on a <TeX>{`2x + 1 \\to 2\\times 2 + 1 = 5`}</TeX>.
                  Ici la limite coïncide avec la valeur <TeX>{`f(2) = 5`}</TeX> : la fonction est
                  même <strong>continue</strong> en 2 (nous y reviendrons).
                </>
              ),
            },
            {
              label: <TeX>{`f(x) \\to 6`}</TeX>,
            },
            {
              label: <TeX>{"Impossible de savoir"}</TeX>,
            },
          ]}
        >
          <p>
            D'après le graphique, vers quelle valeur <TeX>{"f(x)"}</TeX> se rapproche
            lorsque <TeX>{"x"}</TeX> se rapproche de <TeX>{"2"}</TeX> ?
          </p>
        </ClassQuestion>
      </Step>

      <Step id="lp-definition" className="space-y-4">
        <DefinitionBox>
          <p>
            On dit que <TeX>{"f"}</TeX> <strong>admet pour limite le nombre réel{" "}
            <TeX>{"L"}</TeX></strong> en <TeX>{"a"}</TeX> — et on écrit{" "}
            <Formula>{`\\lim_{x \\to a} f(x) = L`}</Formula>
            — si <TeX>{"f(x)"}</TeX> devient aussi proche de <TeX>{"L"}</TeX> qu'on
            le veut, à condition de prendre <TeX>{"x"}</TeX> suffisamment proche de{" "}
            <TeX>{"a"}</TeX>, <strong>en restant différent de <TeX>{"a"}</TeX></strong>.
          </p>
        </DefinitionBox>

        <NoteBox>
          <p>
            Au programme marocain, cette définition est admise de façon intuitive : on
            ne demande pas de démonstration avec des épsilon-petits. Ce qui compte, c'est
            le <strong>comportement d'approche</strong>.
          </p>
        </NoteBox>

        <TeacherNote>
          Insister : la limite <strong>ignore</strong> la valeur de{" "}
          <TeX>{"f(a)"}</TeX>. Certains élèves croient que « limite = valeur » : on
          reviendra dessus avec la continuité.
        </TeacherNote>
      </Step>

      <Step id="lp-exemple" className="space-y-4">
        <ExampleBox>
          <p>
            Reprenons <TeX>{`f(x) = 2x + 1`}</TeX> : plus <TeX>{"x"}</TeX> est proche de 2, plus{" "}
            <TeX>{"f(x)"}</TeX> est proche de <TeX>{"5"}</TeX>.{" "}
            <TeX>{`\\lim_{x \\to 2} (2x+1) = 5`}</TeX>.
          </p>
        </ExampleBox>

        <TheoremBox>
          <p>
            <strong>Unicité de la limite :</strong> si la limite{" "}
            <TeX>{`\\lim_{x \\to a} f(x)`}</TeX> existe, elle est{" "}
            <strong>unique</strong>. Une fonction ne peut pas se rapprocher de deux
            valeurs différentes à la fois.
          </p>
        </TheoremBox>

        <ReminderBox>
          <p>
            On écrit <TeX>{`\\lim_{x\\to a} f(x) = L`}</TeX> (avec <TeX>{"L"}</TeX> fini)
            pour trois situations équivalentes :
          </p>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            <li>
              que <TeX>{"x"}</TeX> approche <TeX>{"a"}</TeX> par la gauche,{" "}
              <TeX>{"x \\to a^{-}"}</TeX>;
            </li>
            <li>
              que <TeX>{"x"}</TeX> approche <TeX>{"a"}</TeX> par la droite,{" "}
              <TeX>{"x \\to a^{+}"}</TeX>;
            </li>
            <li>ou par les deux côtés en même temps.</li>
          </ul>
        </ReminderBox>
      </Step>
    </div>
  );
}

function GaucheDroiteSection() {
  return (
    <div className="space-y-5">
      <Step id="gd-intro" className="space-y-4">
        <p className="text-[15px] leading-relaxed text-slate-800">
          Parfois la fonction ne se comporte pas pareil à gauche et à droite de{" "}
          <TeX>{"a"}</TeX>. On étudie alors chaque côté séparément.
        </p>

        <DefinitionBox>
          <p>
            On définit deux limites <strong>latérales</strong> :
          </p>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            <li>
              la <strong>limite à gauche</strong>, notée{" "}
              <TeX>{`\\lim_{x \\to a^{-}} f(x)`}</TeX>, où <TeX>{"x"}</TeX> approche{" "}
              <TeX>{"a"}</TeX> en restant <TeX>{"x < a"}</TeX>;
            </li>
            <li>
              la <strong>limite à droite</strong>, notée{" "}
              <TeX>{`\\lim_{x \\to a^{+}} f(x)`}</TeX>, où <TeX>{"x"}</TeX> approche{" "}
              <TeX>{"a"}</TeX> en restant <TeX>{"x > a"}</TeX>.
            </li>
          </ul>
        </DefinitionBox>
      </Step>

      <Step id="gd-observe" className="space-y-4">
        <p className="text-[15px] leading-relaxed text-slate-800">
          Observe le curseur : à gauche, <TeX>{"x"}</TeX> reste strictement plus petit
          que 1 ; à droite, strictement plus grand. Et pour <TeX>{"f(x) = x^2"}</TeX>,
          les deux côtés se rejoignent bien sûr sur la même valeur.
        </p>

        <div className="grid gap-4 lg:grid-cols-2">
          <InteractiveLimitGraph
            expr="x^2"
            a={1}
            approach="left"
            bbox={[-4.5, 6, 4.5, -2]}
            caption="Approche uniquement par la gauche : x < 1."
          />
          <InteractiveLimitGraph
            expr="x^2"
            a={1}
            approach="right"
            bbox={[-4.5, 6, 4.5, -2]}
            caption="Approche uniquement par la droite : x > 1."
          />
        </div>
        <TeacherNote>
          Attirer le regard sur le <strong>point atteint</strong> en commun (en orange
          autour de <TeX>{`(1;1)`}</TeX>) : c'est ce qui permet de conclure sur la
          limite en 1.
        </TeacherNote>
      </Step>

      <Step id="gd-critere" className="space-y-4">
        <TheoremBox>
          <p>
            <strong>Critère de convergence :</strong> la limite{" "}
            <TeX>{`\\lim_{x \\to a} f(x)`}</TeX> existe et vaut <TeX>{"L"}</TeX> si et
            seulement si les deux limites latérales existent et sont égales :
            <Formula>{`\\lim_{x \\to a^{-}} f(x) = \\lim_{x \\to a^{+}} f(x) = L \\;\\Longleftrightarrow\\; \\lim_{x \\to a} f(x) = L`}</Formula>
          </p>
        </TheoremBox>

        <WarningBox>
          <p>
            Si les limites latérales sont <strong>différentes</strong>, alors la limite{" "}
            <TeX>{`\\lim_{x \\to a} f(x)`}</TeX> <strong>n'existe pas</strong>. On dit que
            la fonction présente un <strong>saut</strong> en <TeX>{"a"}</TeX>.
          </p>
        </WarningBox>
      </Step>

      <Step id="gd-exemple" className="space-y-4">
        <ExampleBox>
          <p>
            Soit <Formula>{`f(x) = \\begin{cases} 3 - x & \\text{si } x \\leq 2 \\\\ x^2 - 2 & \\text{si } x > 2 \\end{cases}`}</Formula>
            Considérons le point <TeX>{"x = 2"}</TeX> :
          </p>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            <li>
              à gauche : <TeX>{`\\lim_{x \\to 2^{-}} (3-x) = 3 - 2 = 1`}</TeX>;
            </li>
            <li>
              à droite : <TeX>{`\\lim_{x \\to 2^{+}} (x^2-2) = 4 - 2 = 2`}</TeX>.
            </li>
          </ul>
        </ExampleBox>

        <ClassQuestion
          title="Question à la classe"
          options={[
            {
              label: <TeX>{`\\lim_{x \\to 2} f(x) = 1`}</TeX>,
            },
            {
              label: <TeX>{`\\lim_{x \\to 2} f(x) = 2`}</TeX>,
            },
            {
              label: <TeX>{"La limite n'existe pas"}</TeX>,
              correct: true,
              note: (
                <>
                  Les deux limites latérales n'ont pas la même valeur :{" "}
                  <TeX>{`1 \\neq 2`}</TeX>. Le critère échoue, donc{" "}
                  <TeX>{`\\lim_{x\\to 2} f(x)`}</TeX> <strong>n'existe pas</strong> : la
                  courbe « saute » en 2.
                </>
              ),
            },
          ]}
        >
          <p>
            Que vaut <TeX>{`\\lim_{x \\to 2} f(x)`}</TeX> ?
          </p>
        </ClassQuestion>

        <ReminderBox>
          <p>
            Réflexe d'examen : quand une fonction est définie <strong>par morceaux</strong>{" "}
            (avec « si x ≤ a »), il faut TOUJOURS calculer une limite à gauche et une
            limite à droite avant de conclure.
          </p>
        </ReminderBox>
      </Step>
    </div>
  );
}

function LimitesInfiniesSection() {
  return (
    <div className="space-y-5">
      <Step id="li-intro" className="space-y-4">
        <p className="text-[15px] leading-relaxed text-slate-800">
          La limite peut être <strong>infinie</strong> : ce n'est pas un nombre, juste une
          manière de dire que la fonction « explose » ou « s'effondre » sans limite.
        </p>

        <DefinitionBox>
          <p>
            On écrit <TeX>{`\\lim_{x \\to a} f(x) = +\\infty`}</TeX> si{" "}
            <TeX>{"f(x)"}</TeX> devient plus grand que n'importe quel nombre, pourvu que{" "}
            <TeX>{"x"}</TeX> soit assez proche de <TeX>{"a"}</TeX>. De même pour{" "}
            <TeX>{`\\lim_{x \\to a} f(x) = -\\infty`}</TeX> (la fonction devient plus petite que
            n'importe quel nombre).
          </p>
        </DefinitionBox>

        <TeacherNote>
          Expliquer « sans limite » : un graphique qui « monte » toujours plus haut
          quand <TeX>{"x"}</TeX> s'approche. Faire dire aux élèves ce que devient la
          courbe avant de lire la définition.
        </TeacherNote>
      </Step>

      <Step id="li-observe" className="space-y-4">
        <p className="text-[15px] leading-relaxed text-slate-800">
          Observe la fonction <TeX>{`f(x) = \\dfrac{1}{x-1}`}</TeX> au voisinage de{" "}
          <TeX>{"1"}</TeX> :
        </p>

        <InfiniteLimitGraph expr="1/(x-1)" a={1} />

        <p className="text-[15px] leading-relaxed text-slate-800">
          Quand <TeX>{"x"}</TeX> approche 1 par la droite, le dénominateur{" "}
          <TeX>{"x - 1"}</TeX> est très petit et positif (<TeX>{"0^+"}</TeX>), donc la
          fraction devient gigantesque positive. Par la gauche, le dénominateur est très
          petit et négatif (<TeX>{"0^-"}</TeX>), donc la fraction devient très négative.
        </p>

        <ClassQuestion
          title="Question à la classe"
          options={[
            { label: <TeX>{"+\\infty"}</TeX> },
            { label: <TeX>{"-\\infty"}</TeX> },
            {
              label: "La limite n'existe pas",
              correct: true,
              note: (
                <>
                  La limite à gauche vaut <TeX>{"-\\infty"}</TeX> et celle à droite{" "}
                  <TeX>{"+\\infty"}</TeX>. Elles sont différentes : la fonction n'admet
                  <strong> aucune limite</strong> en <TeX>{"1"}</TeX> (même si la courbe
                  possède un comportement infini de chaque côté).
                </>
              ),
            },
            { label: <TeX>{"0"}</TeX> },
          ]}
        >
          <p>
            Vers quelle valeur se rapproche <TeX>{"f(x)"}</TeX> quand{" "}
            <TeX>{"x"}</TeX> se rapproche de <TeX>{"1"}</TeX> (des deux côtés) ?
          </p>
        </ClassQuestion>
      </Step>

      <Step id="li-regle" className="space-y-4">
        <PropertyBox>
          <p>
            <strong>Règle de l'inverse :</strong> si <TeX>{`\\lim_{x\\to a} f(x) = 0`}</TeX>{" "}
            <em>en gardant un signe précis</em>, alors{" "}
            <TeX>{`\\dfrac{1}{f}`}</TeX> tend vers une limite infinie :
          </p>
          <Formula>{`f(x) \\to 0^{+} \\;\\Rightarrow\\; \\frac{1}{f(x)} \\to +\\infty, \\qquad f(x) \\to 0^{-} \\;\\Rightarrow\\; \\frac{1}{f(x)} \\to -\\infty`}</Formula>
        </PropertyBox>

        <DefinitionBox>
          <p>
            Si <TeX>{`\\lim_{x \\to a^{-}} f(x) = \\pm \\infty`}</TeX> ou{" "}
            <TeX>{`\\lim_{x \\to a^{+}} f(x) = \\pm \\infty`}</TeX>, alors la droite
            d'équation <TeX>{"x = a"}</TeX> est une <strong>asymptote verticale</strong> à{" "}
            <TeX>{"C_f"}</TeX> : la courbe en « monte » ou « descend » sans jamais la toucher.
          </p>
        </DefinitionBox>

        <WarningBox>
          <p>
            <TeX>{`+\\infty`}</TeX> n'est pas un nombre ! On ne peut pas écrire{" "}
            <TeX>{`\\lim f = +\\infty`}</TeX> puis utiliser ce résultat dans une addition
            comme un nombre ordinaire : il faut appliquer les règles sur les limites (voir
            plus loin).
          </p>
        </WarningBox>
      </Step>
    </div>
  );
}

function LimitesInfiniSection() {
  return (
    <div className="space-y-5">
      <Step id="li-inf-intro" className="space-y-4">
        <p className="text-[15px] leading-relaxed text-slate-800">
          On peut aussi faire « voyager » <TeX>{"x"}</TeX> vers <TeX>{"+\\infty"}</TeX> ou{" "}
          <TeX>{"-\\infty"}</TeX>, c'est-à-dire vers de très grandes (ou très petites)
          valeurs.
        </p>

        <DefinitionBox>
          <p>
            On dit que <TeX>{`\\lim_{x \\to +\\infty} f(x) = L`}</TeX> (avec{" "}
            <TeX>{"L"}</TeX> réel) si <TeX>{"f(x)"}</TeX> se rapproche de <TeX>{"L"}</TeX>{" "}
            quand <TeX>{"x"}</TeX> devient très grand. Idem pour{" "}
            <TeX>{`x \\to -\\infty`}</TeX>.
          </p>
        </DefinitionBox>

        <TeacherNote>
          Faire deviner les limites des trois courbes qui suivent <strong>avant</strong>{" "}
          de révéler les graphiques, puis vérifier ensemble.
        </TeacherNote>
      </Step>

      <Step id="li-inf-observe" className="space-y-4">
        <ClassQuestion
          title="Question à la classe"
          options={[
            {
              label: <TeX>{"+\\infty"}</TeX>,
            },
            { label: <TeX>{"-\\infty"}</TeX> },
            { label: <TeX>{"0"}</TeX>, correct: true, note: "La courbe 1/x se rapproche de l'axe des x, sans jamais l'atteindre." },
            { label: <TeX>{"1"}</TeX> },
          ]}
        >
          <p>
            Pour <TeX>{`f(x) = \\dfrac{1}{x}`}</TeX>, que vaut{" "}
            <TeX>{`\\lim_{x \\to +\\infty} f(x)`}</TeX> quand <TeX>{"x"}</TeX> devient
            très grand ?
          </p>
        </ClassQuestion>

        <ExampleBox>
          <p>
            La fonction <TeX>{`f(x) = \\dfrac{1}{x}`}</TeX> se rapproche de 0 quand{" "}
            <TeX>{"x"}</TeX> devient très grand :
          </p>
        </ExampleBox>
        <LimitAtInfinityGraph expr="1/x" limit={0} caption="" />

        <ExampleBox>
          <p>
            La fonction <TeX>{`f(x) = x^2`}</TeX> grandit sans borne :{" "}
            <TeX>{`\\lim_{x \\to +\\infty} x^2 = +\\infty`}</TeX>.
          </p>
        </ExampleBox>
        <LimitAtInfinityGraph
          expr="x^2"
          limit="inf"
          bbox={[-3, 3.4, 40, -3]}
          caption=""
        />

        <ExampleBox>
          <p>
            La fonction <TeX>{`f(x) = \\dfrac{2x+1}{x+1}`}</TeX> se stabilise près de 2.
          </p>
        </ExampleBox>
        <LimitAtInfinityGraph expr="(2*x+1)/(x+1)" limit={2} bbox={[-4, 3.6, 30, -3]} caption="" />
      </Step>

      <Step id="li-inf-asymptote" className="space-y-4">
        <DefinitionBox>
          <p>
            Si <TeX>{`\\lim_{x \\to +\\infty} f(x) = L`}</TeX> (ou{" "}
            <TeX>{`x \\to -\\infty`}</TeX>) avec <TeX>{"L"}</TeX> fini, la droite{" "}
            <TeX>{"y = L"}</TeX> est une <strong>asymptote horizontale</strong> à{" "}
            <TeX>{"C_f"}</TeX>.
          </p>
        </DefinitionBox>

        <TeacherNote>
          Relier à la courbe 1/x : l'axe des <TeX>{"x"}</TeX> est une asymptote
          horizontale d'équation <TeX>{"y = 0"}</TeX>.
        </TeacherNote>

        <ReminderBox>
          <p>
            Pour une limite à l'infini, seul compte le <strong>comportement quand{" "}
            <TeX>{"x"}</TeX> est très grand</strong> : les calculs avec les polynômes et
            les fractions se simplifient énormément (voir les méthodes à la section
            suivante).
          </p>
        </ReminderBox>
      </Step>
    </div>
  );
}

export const limitePointSection: CourseSection = {
  id: "limite-point",
  number: 3,
  title: "Limite d'une fonction en un point",
  category: "limites",
  Component: LimitePointSection,
};

export const gaucheDroiteSection: CourseSection = {
  id: "limites-gauche-droite",
  number: 4,
  title: "Limites à gauche et à droite",
  category: "limites",
  Component: GaucheDroiteSection,
};

export const limitesInfiniesSection: CourseSection = {
  id: "limites-infinies",
  number: 5,
  title: "Limites infinies : asymptote verticale",
  category: "limites",
  Component: LimitesInfiniesSection,
};

export const limitesInfiniSection: CourseSection = {
  id: "limites-infini",
  number: 6,
  title: "Limites à l'infini : asymptote horizontale",
  category: "limites",
  Component: LimitesInfiniSection,
};