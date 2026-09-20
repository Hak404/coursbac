"use client";

import { motion } from "framer-motion";

export function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-200">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
      <span className="whitespace-nowrap text-xs font-bold text-slate-500">
        {Math.round(percent)} %
      </span>
    </div>
  );
}