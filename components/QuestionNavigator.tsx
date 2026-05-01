import { getQuestionStatus } from "@/lib/examUtils";
import { AlternativeKey, Question } from "@/lib/types";

type Props = { questions: Question[]; current: number; answered: Record<number, boolean>; selected: Record<number, AlternativeKey | null>; striked: Record<number, AlternativeKey[]>; onGo: (idx: number) => void; };

const legend = [
  ["Atual", "ring-2 ring-sky-500"],
  ["Não respondida", "bg-slate-100 border-slate-200"],
  ["Marcada", "bg-blue-100 border-blue-300"],
  ["Correta", "bg-emerald-100 border-emerald-300"],
  ["Errada", "bg-rose-100 border-rose-300"],
  ["Riscada", "bg-amber-100 border-amber-300"],
];

export default function QuestionNavigator({ questions, current, answered, selected, striked, onGo }: Props) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><h3 className="mb-3 text-sm font-semibold text-slate-700">Navegação das questões</h3><div className="grid grid-cols-5 gap-2 sm:grid-cols-8 lg:grid-cols-5">{questions.map((q, i) => {
    const status = getQuestionStatus(q, selected[i], answered[i], striked[i] || [], i === current);
    const hasStrike = (striked[i] || []).length > 0;
    const base = "relative h-10 rounded-xl border text-sm font-semibold transition-all";
    const map: Record<string, string> = {
      current: "bg-white text-slate-900 border-sky-400 ring-2 ring-sky-500 shadow",
      correct: "bg-emerald-100 text-emerald-900 border-emerald-300",
      incorrect: "bg-rose-100 text-rose-900 border-rose-300",
      selected: "bg-blue-100 text-blue-900 border-blue-300",
      crossed: "bg-amber-50 text-amber-900 border-amber-300",
      unanswered: "bg-slate-100 text-slate-700 border-slate-200",
    };
    const marker = status === "correct" ? "✓" : status === "incorrect" ? "×" : hasStrike ? "•" : "";
    return <button key={q.id} aria-label={`Ir para questão ${i + 1}`} className={`${base} ${map[status]}`} onClick={() => onGo(i)}><span>{i + 1}</span>{marker ? <span className="absolute right-1 top-1 text-[10px]">{marker}</span> : null}</button>;
  })}</div><div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-600 sm:grid-cols-3">{legend.map(([label, cls]) => <div key={label} className="flex items-center gap-2"><span className={`inline-block h-3 w-3 rounded border ${cls}`} />{label}</div>)}</div></div>;
}
