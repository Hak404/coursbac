import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

type Style = {
  border: string;
  bg: string;
  iconBg: string;
  title: string;
  icon: string;
};

const STYLES: Record<string, Style> = {
  definition: {
    border: "border-primary-400",
    bg: "bg-primary-50/70",
    iconBg: "bg-primary-100 text-primary-700",
    title: "text-primary-700",
    icon: "▣",
  },
  theorem: {
    border: "border-violet-400",
    bg: "bg-violet-50/70",
    iconBg: "bg-violet-100 text-violet-700",
    title: "text-violet-700",
    icon: "✦",
  },
  property: {
    border: "border-sky-400",
    bg: "bg-sky-50/70",
    iconBg: "bg-sky-100 text-sky-700",
    title: "text-sky-700",
    icon: "◆",
  },
  reminder: {
    border: "border-emerald-400",
    bg: "bg-emerald-50/70",
    iconBg: "bg-emerald-100 text-emerald-700",
    title: "text-emerald-700",
    icon: "✓",
  },
  warning: {
    border: "border-amber-400",
    bg: "bg-amber-50/70",
    iconBg: "bg-amber-100 text-amber-700",
    title: "text-amber-700",
    icon: "⚠",
  },
  example: {
    border: "border-indigo-400",
    bg: "bg-indigo-50/70",
    iconBg: "bg-indigo-100 text-indigo-700",
    title: "text-indigo-700",
    icon: "✎",
  },
  method: {
    border: "border-teal-400",
    bg: "bg-teal-50/70",
    iconBg: "bg-teal-100 text-teal-700",
    title: "text-teal-700",
    icon: "⚙",
  },
  note: {
    border: "border-slate-300",
    bg: "bg-slate-50/80",
    iconBg: "bg-slate-200 text-slate-600",
    title: "text-slate-600",
    icon: "§",
  },
  proof: {
    border: "border-rose-400",
    bg: "bg-rose-50/70",
    iconBg: "bg-rose-100 text-rose-700",
    title: "text-rose-700",
    icon: "∎",
  },
};

export type BoxKind = keyof typeof STYLES;

const KIND_LABELS: Record<BoxKind, string> = {
  definition: "Définition",
  theorem: "Théorème",
  property: "Propriété",
  reminder: "À retenir",
  warning: "Attention",
  example: "Exemple",
  method: "Méthode",
  note: "Remarque",
  proof: "Démonstration",
};

function PedBox({
  kind,
  title,
  children,
  id,
}: {
  kind: BoxKind;
  title?: string;
  children: ReactNode;
  id?: string;
}) {
  const s = STYLES[kind];
  return (
    <Reveal>
      <div
        id={id}
        className={`my-4 rounded-2xl border-l-4 ${s.border} ${s.bg} p-4 sm:p-5`}
      >
        <div className="mb-2 flex items-center gap-2">
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-md text-sm ${s.iconBg}`}
          >
            {s.icon}
          </span>
          <span className={`text-sm font-bold uppercase tracking-wide ${s.title}`}>
            {title ?? KIND_LABELS[kind]}
          </span>
        </div>
        <div className="text-[15px] leading-relaxed text-slate-800">{children}</div>
      </div>
    </Reveal>
  );
}

export const DefinitionBox = (p: { title?: string; children: ReactNode }) => (
  <PedBox kind="definition" title={p.title} children={p.children} />
);
export const TheoremBox = (p: { title?: string; children: ReactNode }) => (
  <PedBox kind="theorem" title={p.title} children={p.children} />
);
export const PropertyBox = (p: { title?: string; children: ReactNode }) => (
  <PedBox kind="property" title={p.title} children={p.children} />
);
export const ReminderBox = (p: { title?: string; children: ReactNode }) => (
  <PedBox kind="reminder" title={p.title} children={p.children} />
);
export const WarningBox = (p: { title?: string; children: ReactNode }) => (
  <PedBox kind="warning" title={p.title} children={p.children} />
);
export const ExampleBox = (p: { title?: string; children: ReactNode }) => (
  <PedBox kind="example" title={p.title} children={p.children} />
);
export const MethodBox = (p: { title?: string; children: ReactNode }) => (
  <PedBox kind="method" title={p.title} children={p.children} />
);
export const NoteBox = (p: { title?: string; children: ReactNode }) => (
  <PedBox kind="note" title={p.title} children={p.children} />
);
export const ProofBox = (p: { title?: string; children: ReactNode }) => (
  <PedBox kind="proof" title={p.title} children={p.children} />
);