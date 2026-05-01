export default function ProgressSummary({ total, answered, hits, errors }: { total:number; answered:number; hits:number; errors:number }) {
  const pct = total ? ((hits/total)*100).toFixed(1) : "0.0";
  return <div className="rounded border bg-white p-3 text-sm">Respondidas: {answered}/{total} · Acertos: {hits} · Erros: {errors} · {pct}%</div>;
}
