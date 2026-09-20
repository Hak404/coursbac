"use client";

import { useEffect, useRef, useState } from "react";
import { loadJXG, type Board, type Jxg } from "@/lib/jxg";

export type BoardInit = (JXG: Jxg, board: Board) => void | (() => void);

type BorderBox = [number, number, number, number];

export function useBoard(init: BoardInit, bbox: BorderBox = [-7, 4.5, 7, -4.5]) {
  const containerRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<Board | null>(null);
  const jxgRef = useRef<Jxg | null>(null);
  const initRef = useRef(init);
  initRef.current = init;
  const readyRef = useRef(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let dispose: void | (() => void) = undefined;
    readyRef.current = false;
    setReady(false);

    loadJXG().then((JXG) => {
      if (cancelled || !containerRef.current || boardRef.current) return;
      containerRef.current.innerHTML = "";
      const board: Board = JXG.JSXGraph.initBoard(containerRef.current, {
        boundingbox: bbox,
        axis: true,
        grid: true,
        pan: { needTwoFingers: true },
        zoom: { wheel: false },
        showNavigation: false,
        showCopyright: false,
        renderer: "svg",
      });
      jxgRef.current = JXG;
      boardRef.current = board;
      try {
        dispose = initRef.current(JXG, board);
      } catch (err) {
        console.error("Board init error", err);
      }
      readyRef.current = true;
      setReady(true);
    });

    const onResize = () => {
      if (boardRef.current && containerRef.current) {
        try {
          boardRef.current.resizeContainer(
            containerRef.current.clientWidth,
            containerRef.current.clientHeight || 360
          );
        } catch {
          /* ignore */
        }
      }
    };

    const ro = typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(() => onResize())
      : null;
    if (containerRef.current && ro) ro.observe(containerRef.current);

    return () => {
      cancelled = true;
      dispose?.();
      ro?.disconnect();
      if (boardRef.current && jxgRef.current) {
        try {
          jxgRef.current.JSXGraph.freeBoard(boardRef.current);
        } catch {
          /* ignore */
        }
      }
      boardRef.current = null;
      jxgRef.current = null;
    };
  }, [bbox]);

  return { containerRef, boardRef, jxgRef, ready };
}