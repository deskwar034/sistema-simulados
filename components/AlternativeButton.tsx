"use client";
import { AlternativeKey } from "@/lib/types";

type Props = { label: AlternativeKey; text: string; selected?: boolean; striked?: boolean; correct?: boolean; wrong?: boolean; locked?: boolean; onSelect: () => void; onToggleStrike: () => void };

export default function AlternativeButton({ label, text, selected, striked, correct, wrong, locked, onSelect, onToggleStrike }: Props) {
  let cls = "w-full rounded-2xl border p-4 text-left transition-all ";
  cls += "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm ";
  if (selected) cls += "border-blue-400 bg-blue-50 text-blue-900 ";
  if (striked) cls += "opacity-60 line-through ";
  if (correct) cls += "!border-emerald-400 !bg-emerald-50 !text-emerald-900 ";
  if (wrong) cls += "!border-rose-400 !bg-rose-50 !text-rose-900 ";
  if (locked) cls += "cursor-not-allowed";
  return <button aria-label={`Alternativa ${label}`} disabled={locked} className={cls} onClick={onSelect} onDoubleClick={onToggleStrike}><span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold">{label}</span>{text}</button>;
}
