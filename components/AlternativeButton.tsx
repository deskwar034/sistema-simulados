"use client";
import { AlternativeKey } from "@/lib/types";

type Props = { label: AlternativeKey; text: string; selected?: boolean; striked?: boolean; correct?: boolean; wrong?: boolean; locked?: boolean; onSelect: () => void; onToggleStrike: () => void };

export default function AlternativeButton({ label, text, selected, striked, correct, wrong, locked, onSelect, onToggleStrike }: Props) {
  const isPreAnswerSelected = !!selected && !correct && !wrong;

  let cls = "w-full rounded-2xl border p-4 text-left transition-all ";
  cls += "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm ";

  if (isPreAnswerSelected) cls += "border-blue-600 bg-blue-100 text-blue-950 ring-2 ring-blue-300 shadow-md ";
  if (striked) cls += "opacity-60 line-through ";
  if (correct) cls += "!border-emerald-500 !bg-emerald-50 !text-emerald-900 ";
  if (wrong) cls += "!border-rose-500 !bg-rose-50 !text-rose-900 ";
  if (locked) cls += "cursor-not-allowed";

  return (
    <button aria-label={`Alternativa ${label}`} disabled={locked} className={cls} onClick={onSelect} onDoubleClick={onToggleStrike}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start">
          <span className={`mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${isPreAnswerSelected ? "bg-blue-600 text-white" : "bg-slate-100"}`}>
            {label}
          </span>
          <span>{text}</span>
        </div>
        {isPreAnswerSelected ? <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">✓ Selecionada</span> : null}
      </div>
    </button>
  );
}
