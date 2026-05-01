export default function ProgressSummary({ total, answered, hits, errors }: { total: number; answered: number; hits: number; errors: number }) {
  const pct = total ? ((hits / total) * 100).toFixed(1) : "0.0";
  return <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"><div className="mb-2 text-xs font-semibold text-slate-500">Progresso</div><div className="flex flex-wrap gap-2 text-sm"><span className="rounded-full bg-slate-100 px-2 py-1">Respondidas {answered}/{total}</span><span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-900">Acertos {hits}</span><span className="rounded-full bg-rose-100 px-2 py-1 text-rose-900">Erros {errors}</span><span className="rounded-full bg-blue-100 px-2 py-1 text-blue-900">{pct}%</span></div></div>;
}
