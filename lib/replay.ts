"use client";

import { useEffect, useRef } from "react";

type ReplayFn = () => void;

const listeners = new Set<ReplayFn>();

export function subscribeReplay(fn: ReplayFn): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function emitReplay() {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch {
      /* ignore errors from one listener */
    }
  });
}

export function hasReplayListeners(): boolean {
  return listeners.size > 0;
}

/**
 * Enregistre une fonction de repli auprès du présentateur : lorsque le
 * professeur clique sur « Relancer l'animation », toutes les fonctions
 * enregistrées sont rappelées (le graphique rejoue son scénario).
 */
export function useReplay(fn: () => void) {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => subscribeReplay(() => ref.current()), []);
}