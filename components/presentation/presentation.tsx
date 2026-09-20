"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type PresentationMode = "course" | "presentation";

type PresentationCtxValue = {
  mode: PresentationMode;
  registerStep: (id: string) => void;
  orderOf: (id: string) => number;
  revealed: number;
  totalSteps: number;
  revealedAll: boolean;
  revealMore: () => void;
  revealBack: () => void;
  resetSteps: () => void;
  revealTo: (order: number) => void;
  revealAll: () => void;
  notesVisible: boolean;
  toggleNotes: () => void;
};

const PresentationCtx = createContext<PresentationCtxValue | null>(null);

export function usePresentationCtx() {
  return useContext(PresentationCtx);
}

export function PresentationProvider({
  mode,
  children,
}: {
  mode: PresentationMode;
  children: ReactNode;
}) {
  const orderMap = useRef<Map<string, number>>(new Map());
  const [, setTick] = useState(0);
  const [revealed, setRevealed] = useState(1);
  const [notesVisible, setNotesVisible] = useState(mode === "course");

  const registerStep = useCallback((id: string) => {
    if (!orderMap.current.has(id)) {
      orderMap.current.set(id, orderMap.current.size);
      setTick((t) => t + 1);
    }
  }, []);

  const orderOf = useCallback((id: string) => {
    return orderMap.current.get(id) ?? Number.MAX_SAFE_INTEGER;
  }, []);

  const totalSteps = orderMap.current.size;

  const revealMore = useCallback(() => {
    setRevealed((r) => Math.min(r + 1, orderMap.current.size));
  }, []);

  const revealBack = useCallback(() => {
    setRevealed((r) => Math.max(1, r - 1));
  }, []);

  const resetSteps = useCallback(() => {
    setRevealed(1);
  }, []);

  const revealTo = useCallback((order: number) => {
    setRevealed((r) => Math.max(r, Math.min(order + 1, orderMap.current.size)));
  }, []);

  const revealAll = useCallback(() => {
    setRevealed(orderMap.current.size);
  }, []);

  const toggleNotes = useCallback(() => {
    setNotesVisible((v) => !v);
  }, []);

  const value: PresentationCtxValue = {
    mode,
    registerStep,
    orderOf,
    revealed,
    totalSteps,
    revealedAll: totalSteps > 0 && revealed >= totalSteps,
    revealMore,
    revealBack,
    resetSteps,
    revealTo,
    revealAll,
    notesVisible,
    toggleNotes,
  };

  return <PresentationCtx.Provider value={value}>{children}</PresentationCtx.Provider>;
}

/**
 * Bloc de contenu révélé pas à pas. En mode « course », tout est visible.
 * En mode « presentation », un bloc n'apparaît que si la prof a avancé
 * jusqu'à son numéro d'ordre (bouton « Étape suivante »).
 */
export function Step({
  id,
  children,
  className,
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) {
  const ctx = usePresentationCtx();
  const order = ctx ? ctx.orderOf(id) : 0;

  useLayoutEffect(() => {
    ctx?.registerStep(id);
  }, [ctx, id]);

  if (!ctx || ctx.mode === "course") {
    return <div className={className}>{children}</div>;
  }

  if (order >= ctx.revealed) return null;
  return <div className={className}>{children}</div>;
}

/**
 * Note réservée au professeur. Visible dans le mode « course » ; masquée
 * par défaut dans la présentation (la prof peut l'afficher avec « N »).
 */
export function TeacherNote({ children }: { children: ReactNode }) {
  const ctx = usePresentationCtx();
  if (ctx && ctx.mode === "presentation" && !ctx.notesVisible) return null;
  return (
    <div className="rounded-xl border-l-4 border-amber-400 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900 ring-1 ring-amber-100">
      <div className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-amber-700">
        <span aria-hidden>📝</span> Note du professeur
      </div>
      {children}
    </div>
  );
}