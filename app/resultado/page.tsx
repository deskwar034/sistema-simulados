"use client";
import Link from "next/link";
import rawQuestions from "@/data/questions.json";
import { normalizeQuestions, getScore, formatMs } from "@/lib/examUtils";
import { clearState, loadState } from "@/lib/examStorage";

export default function ResultadoPage(){
  const questions=normalizeQuestions(rawQuestions);
  const state=typeof window!=="undefined"?loadState():null;
  if(!state) return <main className="p-6">Sem dados de simulado.</main>;
  const score=getScore(questions,state.selectedAnswers,state.answeredQuestions);
  const used=(state.finishedAt??Date.now())-state.startTimestamp;
  return <main className="mx-auto max-w-5xl p-6"><h1 className="text-2xl font-bold">Resultado final</h1><div className="mt-3 rounded border bg-white p-4">Total: {questions.length} · Respondidas: {score.answeredCount} · Acertos: {score.hits} · Erros: {score.errors} · Percentual: {score.percentage.toFixed(1)}% · Tempo utilizado: {formatMs(used)}</div><div className="mt-4 overflow-auto rounded border bg-white"><table className="w-full text-sm"><thead><tr className="bg-slate-100"><th>#</th><th>Disciplina</th><th>Sua resposta</th><th>Correta</th><th>Status</th></tr></thead><tbody>{questions.map((q,i)=>{const user=state.selectedAnswers[i];const ok=user===q.correta;return <tr key={q.id} className="border-t"><td className="p-2">{i+1}</td><td>{q.disciplina??"-"}</td><td>{user??"-"}</td><td>{q.correta}</td><td>{state.answeredQuestions[i]?(ok?"✅":"❌"):"-"}</td></tr>})}</tbody></table></div><div className="mt-4 flex flex-wrap gap-2"><Link href="/simulado?review=wrong" className="rounded bg-amber-600 px-3 py-2 text-white">Revisar questões erradas</Link><button onClick={()=>{clearState(); location.href='/simulado';}} className="rounded bg-red-600 px-3 py-2 text-white">Refazer simulado</button><Link href="/simulado" className="rounded border px-3 py-2">Voltar para o simulado</Link></div></main>
}
