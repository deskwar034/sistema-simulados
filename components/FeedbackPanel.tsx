import { AlternativeKey, Question } from "@/lib/types";

export default function FeedbackPanel({ question, selected }: { question: Question; selected: AlternativeKey | null }) {
  const acertou = selected === question.correta;
  return <div className="mt-4 rounded border bg-white p-4"><p className="font-semibold">{acertou ? "✅ Acertou" : "❌ Errou"} — Correta: {question.correta}</p><ul className="mt-2 space-y-2">{(["A","B","C","D"] as AlternativeKey[]).map((k)=><li key={k}><span className="font-semibold">{k}:</span> {question.comentarios?.[k] ?? "Sem comentário."}</li>)}</ul>{question.explicacao && <p className="mt-2 text-sm">{question.explicacao}</p>}</div>;
}
