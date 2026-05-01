"use client";

import { useEffect } from "react";
import { formatMs } from "@/lib/examUtils";

type TimerProps = {
  remainingSeconds: number;
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onTimeUp: () => void;
  onTickPersist: (nextRemainingSeconds: number, syncAt: number) => void;
};

export default function Timer({
  remainingSeconds,
  isPaused,
  onPause,
  onResume,
  onTimeUp,
  onTickPersist,
}: TimerProps) {
  useEffect(() => {
    if (isPaused || remainingSeconds <= 0) return;

    const id = window.setInterval(() => {
      const now = Date.now();
      const next = remainingSeconds - 1;

      if (next <= 0) {
        onTickPersist(0, now);
        onTimeUp();
        return;
      }

      onTickPersist(next, now);
    }, 1000);

    return () => {
      window.clearInterval(id);
    };
  }, [isPaused, remainingSeconds, onTickPersist, onTimeUp]);

  const timerClass = isPaused
    ? "rounded border border-amber-300 bg-amber-100 px-3 py-2"
    : "rounded border border-slate-200 bg-white px-3 py-2";

  return (
    <div className={timerClass}>
      <div className="font-mono text-lg">⏱ {formatMs(remainingSeconds * 1000)}</div>
      <div className="text-xs text-slate-600">Status: {isPaused ? "Pausado" : "Rodando"}</div>
      {isPaused ? <div className="text-xs font-medium text-amber-800">Cronômetro pausado</div> : null}
      <button
        type="button"
        className="mt-2 rounded border px-2 py-1 text-sm"
        onClick={isPaused ? onResume : onPause}
      >
        {isPaused ? "Retomar" : "Pausar"}
      </button>
    </div>
  );
}
