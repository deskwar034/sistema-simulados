import { AlternativeKey, Question } from "@/lib/types";

export default function FeedbackPanel({ question, selected }: { question: Question; selected: AlternativeKey | null }) {
  const acertou = selected === question.correta;
  const explicacaoGeral = question.explicacaoGeral?.trim();
  return <div className={`mt-5 rounded-2xl border p-4 ${acertou ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"}`}><p className="font-semibold">{acertou ? "✅ Você acertou!" : "❌ Você errou!"}</p><p className="mt-2 text-sm">Alternativa correta: <span className="rounded-full bg-white px-2 py-1 font-semibold">{question.correta}</span></p>{explicacaoGeral ? <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3"><p className="font-semibold">Explicação geral</p><p className="mt-1 whitespace-pre-wrap text-sm">{explicacaoGeral}</p></div> : null}<div className="mt-3"><p className="font-semibold">Comentários por alternativa</p><div className="mt-2 grid gap-2 sm:grid-cols-2">{(["A", "B", "C", "D"] as AlternativeKey[]).map((k) => <div key={k} className="rounded-xl border border-slate-200 bg-white p-2 text-sm"><p className="font-semibold">{k}</p><p className="whitespace-pre-wrap">{question.comentarios?.[k] ?? "Sem comentário."}</p></div>)}</div></div></div>;
}
