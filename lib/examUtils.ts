import { AlternativeKey, Question } from "./types";

const ALT_KEYS: AlternativeKey[] = ["A", "B", "C", "D"];

export function normalizeQuestions(input: unknown): Question[] {
  if (!Array.isArray(input)) return [];

  return input
    .map((q, idx) => {
      const obj = q as Record<string, unknown>;
      const rawAlt = (obj.alternativas ?? obj.alternatives) as Record<string, string> | undefined;
      const rawComments = (obj.comentarios ?? obj.comments) as Record<string, string> | undefined;
      const correta = (obj.correta ?? obj.correctAnswer) as string | undefined;
      if (!rawAlt || !correta) return null;
      const alt = {
        A: rawAlt.A ?? "",
        B: rawAlt.B ?? "",
        C: rawAlt.C ?? "",
        D: rawAlt.D ?? "",
      };
      const c = (correta.toUpperCase() as AlternativeKey);
      if (!ALT_KEYS.includes(c)) return null;
      return {
        id: Number(obj.id ?? idx + 1),
        disciplina: typeof obj.disciplina === "string" ? obj.disciplina : undefined,
        tema: typeof obj.tema === "string" ? obj.tema : undefined,
        enunciado: String(obj.enunciado ?? ""),
        alternativas: alt,
        correta: c,
        comentarios: rawComments,
        explicacao: (obj.explicacao ?? obj.explanation) as string | undefined,
        pagina_simulado: obj.pagina_simulado as number | undefined,
        pagina_gabarito: obj.pagina_gabarito as number | undefined,
      } as Question;
    })
    .filter((q): q is Question => Boolean(q && q.enunciado));
}

export function getScore(questions: Question[], selectedAnswers: Record<number, AlternativeKey | null>, answered: Record<number, boolean>) {
  let hits = 0;
  let answeredCount = 0;
  questions.forEach((q, index) => {
    if (answered[index]) {
      answeredCount += 1;
      if (selectedAnswers[index] === q.correta) hits += 1;
    }
  });
  return { hits, answeredCount, errors: answeredCount - hits, percentage: questions.length ? (hits / questions.length) * 100 : 0 };
}

export function formatMs(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(totalSec / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
  const s = String(totalSec % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}
