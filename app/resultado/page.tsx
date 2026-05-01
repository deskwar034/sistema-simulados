"use client";
import Link from "next/link";
import { getScore, formatMs } from "@/lib/examUtils";
import { getQuestions } from "@/lib/getQuestions";
import { clearState, loadState } from "@/lib/examStorage";

export default function ResultadoPage() {
  const questions = getQuestions();
  const state = typeof window !== "undefined" ? loadState() : null;
  if (!state) return <main className="p-6">Sem dados de simulado.</main>;
  const score = getScore(questions, state.selectedAnswers, state.answeredQuestions);
  const used = (state.finishedAt ?? Date.now()) - state.startedAt;

  return <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white"><div className="mx-auto max-w-6xl p-6"><h1 className="text-3xl font-bold text-slate-900">Resultado final</h1><div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Percentual de acerto</p><p className="text-4xl font-bold text-blue-700">{score.percentage.toFixed(1)}%</p></div><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[{k:"Acertos",v:score.hits,cls:"bg-emerald-50 border-emerald-200"},{k:"Erros",v:score.errors,cls:"bg-rose-50 border-rose-200"},{k:"Respondidas",v:`${score.answeredCount}/${questions.length}`,cls:"bg-slate-50 border-slate-200"},{k:"Tempo",v:formatMs(used),cls:"bg-blue-50 border-blue-200"}].map((item)=><div key={item.k} className={`rounded-2xl border p-4 ${item.cls}`}><p className="text-sm text-slate-500">{item.k}</p><p className="text-2xl font-bold">{item.v}</p></div>)}</div><div className="mt-5 overflow-auto rounded-2xl border border-slate-200 bg-white shadow-sm"><table className="w-full text-sm"><thead><tr className="bg-slate-100 text-slate-700"><th className="p-2">#</th><th>Disciplina</th><th>Sua resposta</th><th>Correta</th><th>Status</th></tr></thead><tbody>{questions.map((q, i) => { const user = state.selectedAnswers[i]; const ok = user === q.correta; return <tr key={q.id} className={`border-t ${state.answeredQuestions[i] ? (ok ? "bg-emerald-50" : "bg-rose-50") : ""}`}><td className="p-2">{i + 1}</td><td>{q.disciplina ?? "-"}</td><td>{user ?? "-"}</td><td>{q.correta}</td><td>{state.answeredQuestions[i] ? (ok ? "✅ Correta" : "❌ Errada") : "-"}</td></tr>; })}</tbody></table></div><div className="mt-4 flex flex-wrap gap-2"><Link href="/simulado?review=wrong" className="rounded-xl bg-amber-600 px-3 py-2 text-white">Revisar questões erradas</Link><button onClick={() => { clearState(); location.href = "/simulado"; }} className="rounded-xl bg-rose-600 px-3 py-2 text-white">Refazer simulado</button><Link href="/simulado" className="rounded-xl border border-slate-300 bg-white px-3 py-2">Voltar para o simulado</Link></div></div></main>;
}
