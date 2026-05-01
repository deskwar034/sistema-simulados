"use client";
import { formatMs } from "@/lib/examUtils";
export default function Timer({ remainingMs }: { remainingMs: number }) { return <div className="font-mono text-lg">⏱ {formatMs(remainingMs)}</div>; }
