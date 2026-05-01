import { AlternativeKey, Question } from "@/lib/types";

export default function FeedbackPanel({ question, selected }: { question: Question; selected: AlternativeKey | null }) {
  const acertou = selected === question.correta;
  const explicacaoGeral = question.explicacaoGeral?.trim();

  return (
    <div className="mt-4 rounded border bg-white p-4">
      <p className="font-semibold">{acertou ? "✅ Acertou" : "❌ Errou"}</p>
      <p className="mt-1">
        <span className="font-semibold">Alternativa correta:</span> {question.correta}
      </p>

      {explicacaoGeral && (
        <div className="mt-3 rounded border border-slate-200 bg-slate-50 p-3">
          <p className="font-semibold">Explicação geral</p>
          <p className="mt-1 text-sm">{explicacaoGeral}</p>
        </div>
      )}

      <div className="mt-3">
        <p className="font-semibold">Comentários por alternativa</p>
        <ul className="mt-2 space-y-2">
          {(["A", "B", "C", "D"] as AlternativeKey[]).map((k) => (
            <li key={k}>
              <span className="font-semibold">{k}:</span> {question.comentarios?.[k] ?? "Sem comentário."}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
