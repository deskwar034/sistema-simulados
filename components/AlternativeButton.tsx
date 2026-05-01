"use client";
import { AlternativeKey } from "@/lib/types";

type Props = { label: AlternativeKey; text: string; selected?: boolean; striked?: boolean; correct?: boolean; wrong?: boolean; locked?: boolean; onSelect: () => void; onToggleStrike: () => void };

export default function AlternativeButton({ label, text, selected, striked, correct, wrong, locked, onSelect, onToggleStrike }: Props) {
  let cls = "w-full text-left p-3 rounded border ";
  if (selected) cls += "border-blue-600 bg-blue-50 ";
  else cls += "border-slate-300 bg-white ";
  if (correct) cls += "!border-green-600 !bg-green-50 ";
  if (wrong) cls += "!border-red-600 !bg-red-50 ";
  if (striked) cls += "opacity-60 line-through ";
  return (
    <button aria-label={`Alternativa ${label}`} disabled={locked} className={cls} onClick={onSelect} onDoubleClick={onToggleStrike}>
      <span className="font-bold mr-2">{label})</span>{text}
    </button>
  );
}
