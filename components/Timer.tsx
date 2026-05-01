"use client";
import { useEffect } from "react";
import { formatMs } from "@/lib/examUtils";

type TimerProps = { remainingSeconds: number; isPaused: boolean; onPause: () => void; onResume: () => void; onTimeUp: () => void; onTickPersist: (nextRemainingSeconds: number, syncAt: number) => void; };

export default function Timer({ remainingSeconds, isPaused, onPause, onResume, onTimeUp, onTickPersist }: TimerProps) {
  useEffect(() => {
    if (isPaused || remainingSeconds <= 0) return;
    const id = window.setInterval(() => {
      const now = Date.now();
      const next = remainingSeconds - 1;
      if (next <= 0) { onTickPersist(0, now); onTimeUp(); return; }
      onTickPersist(next, now);
    }, 1000);
    return () => window.clearInterval(id);
  }, [isPaused, remainingSeconds, onTickPersist, onTimeUp]);

  const isUrgent = remainingSeconds <= 10 * 60;
  const isWarning = remainingSeconds <= 30 * 60;
  const color = isUrgent ? "border-rose-300 bg-rose-50 text-rose-900" : isWarning ? "border-amber-300 bg-amber-50 text-amber-900" : "border-slate-200 bg-white text-slate-900";

  return <div className={`rounded-2xl border p-3 shadow-sm ${color}`}><div className="text-xs font-medium">Tempo restante</div><div className="font-mono text-2xl font-bold">{formatMs(remainingSeconds * 1000)}</div><div className="mt-1 text-xs">Status: {isPaused ? "Pausado" : "Rodando"}</div><button type="button" className="mt-2 rounded-xl border bg-white px-3 py-1.5 text-sm font-semibold transition-all hover:bg-slate-50" onClick={isPaused ? onResume : onPause}>{isPaused ? "Retomar" : "Pausar"}</button></div>;
}
