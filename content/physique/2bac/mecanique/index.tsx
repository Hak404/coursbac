import type { CourseSection } from "@/lib/content/types";
import { Step, TeacherNote } from "@/components/presentation/presentation";
import { Formula, TeX } from "@/components/ui/TeX";
import { NoteBox, ReminderBox, ExampleBox, WarningBox } from "@/components/ui/Boxes";

function TransformationsSection() {
  return (
    <div className="space-y-5">
      <Step id="tfr-intro" className="space-y-4">
        <p className="text-[15px] leading-relaxed text-slate-800">
          Au cours d'une transformation chimique, des espèces disparaissent tandis que
          d'autres apparaissent. Toutes les transformations ne se déroulent pas à la même
          allure : on distingue les transformations{" "}
          <strong>lentes</strong>, <strong>rapides</strong> et{" "}
          <strong>quasi-instantanées</strong> selon la durée de l'évolution.
        </p>
        <ReminderBox>
          <p>
            La vitesse d'une transformation est définie à partir de l'évolution d'une
            espèce au cours du temps :
          </p>
          <Formula>{`v = \\left| \\dfrac{\\mathrm{d}[\\mathrm{X}]}{\\mathrm{d}t} \\right|`}</Formula>
        </ReminderBox>
      </Step>

      <Step id="tfr-classification" className="space-y-4">
        <ExampleBox>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>Transformation lente</strong> : oxydation d'un clou en fer placé dans
              une solution de sulfate de cuivre (plusieurs minutes, voire heures).
            </li>
            <li>
              <strong>Transformation rapide</strong> : oxydation des ions iodure{" "}
              <TeX>{"\\mathrm{I}^{-}"}</TeX> par l'eau oxygénée.
            </li>
            <li>
              <strong>Transformation quasi-instantanée</strong> : précipitation du chlorure
              d'argent <TeX>{"\\mathrm{AgCl}"}</TeX>, ou les réactions acido-basiques usuelles.
            </li>
          </ul>
        </ExampleBox>
        <WarningBox>
          <p>
            La « rapidité » d'une transformation dépend du <strong>contexte</strong> :
            température, concentration des réactifs, présence d'un catalyseur. Une même
            réaction peut être lente ou quasi-instantanée !
          </p>
        </WarningBox>
      </Step>

      <Step id="tfr-temps-caracteristique" className="space-y-4">
        <NoteBox>
          <p>
            Pour estimer la durée d'une transformation lente, on utilise le{" "}
            <strong>temps de demi-réaction</strong> <TeX>{"t_{1/2}"}</TeX> : la date à
            laquelle l'avancement <TeX>{"x"}</TeX> atteint la moitié de sa valeur finale{" "}
            <TeX>{"x_f"}</TeX>.
          </p>
          <Formula>{`t_{1/2} \\ \\text{tel que } x(t_{1/2}) = \\dfrac{x_f}{2}`}</Formula>
        </NoteBox>
        <TeacherNote>
          Faire le parallèle avec la demi-vie radioactive et montrer le suivi
          expérimental (conductimétrie, pH-métrie, spectrophotométrie).
        </TeacherNote>
      </Step>
    </div>
  );
}

export const PHYSIQUE_SECTIONS: CourseSection[] = [
  {
    id: "transformations-lentes-rapides",
    number: 1,
    title: "Transformations lentes et rapides",
    category: "mecanique",
    Component: TransformationsSection,
  },
];