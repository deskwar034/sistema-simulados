import { AlternativeKey, Question } from "./types";

const ALT_KEYS: AlternativeKey[] = ["A", "B", "C", "D", "E"];

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function extractRawQuestions(input: unknown): unknown[] {
  if (Array.isArray(input)) return input;

  if (isRecord(input)) {
    const fromQuestoes = input.questoes;
    if (Array.isArray(fromQuestoes)) return fromQuestoes;

    const fromQuestions = input.questions;
    if (Array.isArray(fromQuestions)) return fromQuestions;
  }

  const rootKeys = isRecord(input) ? Object.keys(input) : [];
  console.error("[normalizeQuestions] Estrutura inválida de JSON de questões.", {
    inputType: Array.isArray(input) ? "array" : typeof input,
    rootKeys,
    detectedCountBeforeNormalization: 0,
    normalizedCount: 0,
  });

  return [];
}

function toNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const cleaned = value.trim();
  return cleaned.length > 0 ? cleaned : undefined;
}

function normalizeAlternativeValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return "";
}

function normalizeAlternatives(raw: unknown): Partial<Record<AlternativeKey, string>> {
  const source = isRecord(raw) ? raw : {};
  return {
    A: normalizeAlternativeValue(source.A),
    B: normalizeAlternativeValue(source.B),
    C: normalizeAlternativeValue(source.C),
    D: normalizeAlternativeValue(source.D),
    E: normalizeAlternativeValue(source.E),
  };
}

function normalizeCommentValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (isRecord(value) && typeof value.comentario === "string") return value.comentario;
  return "";
}

function normalizeComments(obj: UnknownRecord): Partial<Record<AlternativeKey, string>> | undefined {
  const directComments = isRecord(obj.comentarios) ? obj.comentarios : undefined;
  const englishComments = isRecord(obj.comments) ? obj.comments : undefined;
  const commentedKey = isRecord(obj.gabarito_comentado) && isRecord(obj.gabarito_comentado.alternativas)
    ? obj.gabarito_comentado.alternativas
    : undefined;

  const normalized: Partial<Record<AlternativeKey, string>> = {};

  for (const key of ALT_KEYS) {
    const fromDirect = normalizeCommentValue(directComments?.[key]);
    const fromEnglish = normalizeCommentValue(englishComments?.[key]);
    const fromCommented = normalizeCommentValue(commentedKey?.[key]);

    if (fromDirect) {
      normalized[key] = fromDirect;
      continue;
    }

    if (fromEnglish) {
      normalized[key] = fromEnglish;
      continue;
    }

    if (fromCommented) normalized[key] = fromCommented;
  }

  return Object.keys(normalized).length > 0 ? normalized : undefined;
}

function normalizeGeneralExplanation(obj: UnknownRecord): string | undefined {
  const fromCommented = isRecord(obj.gabarito_comentado)
    ? toNonEmptyString(obj.gabarito_comentado.explicacao_geral)
    : undefined;

  return (
    fromCommented ??
    toNonEmptyString(obj.explicacao_geral) ??
    toNonEmptyString(obj.explicacaoGeral) ??
    toNonEmptyString(obj.generalExplanation) ??
    toNonEmptyString(obj.explanation) ??
    toNonEmptyString(obj.explicacao)
  );
}

function parseCorrectAlternative(raw: unknown, questionId: number): AlternativeKey | null {
  if (typeof raw !== "string") {
    console.warn("[normalizeQuestions] Não foi possível detectar alternativa correta.", { questionId, raw });
    return null;
  }
  const upper = raw.toUpperCase();
  const matched = upper.match(/[ABCDE]/);
  if (!matched) {
    console.warn("[normalizeQuestions] Não foi possível detectar alternativa correta.", { questionId, raw });
    return null;
  }
  return matched[0] as AlternativeKey;
}

export type QuestionStatus = "current" | "correct" | "incorrect" | "selected" | "crossed" | "unanswered";

export function getQuestionStatus(
  question: Question,
  answer: AlternativeKey | null,
  isAnswered: boolean,
  crossedAlternatives: AlternativeKey[] = [],
  isCurrent = false,
): QuestionStatus {
  if (isCurrent) return "current";
  if (isAnswered) return answer === question.correta ? "correct" : "incorrect";
  if (answer) return "selected";
  if (crossedAlternatives.length > 0) return "crossed";
  return "unanswered";
}

export function normalizeQuestions(input: unknown): Question[] { /* unchanged */
  const sourceQuestions = extractRawQuestions(input);
  const normalized = sourceQuestions
    .map((item, index) => {
      if (!isRecord(item)) return null;
      const rawId = item.id ?? item.numero ?? item.number;
      const id = Number(rawId);
      const enunciado = toNonEmptyString(item.enunciado ?? item.question ?? item.statement ?? item.texto) ?? "";
      const alternativas = normalizeAlternatives(item.alternativas ?? item.alternatives ?? item.opcoes ?? item.options);
      const correta = parseCorrectAlternative(item.correta ?? item.correctAnswer ?? item.resposta_correta ?? item.answer ?? item.gabarito, Number.isFinite(id) ? id : index + 1);
      return {
        id, disciplina: toNonEmptyString(item.disciplina ?? item.subject), tema: toNonEmptyString(item.tema ?? item.topic), enunciado, alternativas,
        correta: correta ?? "A", comentarios: normalizeComments(item), explicacaoGeral: normalizeGeneralExplanation(item), explicacao: toNonEmptyString(item.explicacao ?? item.explanation),
        pagina_simulado: typeof item.pagina_simulado === "number" ? item.pagina_simulado : undefined,
        pagina_gabarito: typeof item.pagina_gabarito === "number" ? item.pagina_gabarito : undefined,
      } as Question;
    })
    .filter((q): q is Question => !!q && Number.isFinite(q.id) && q.enunciado.trim().length > 0 && ALT_KEYS.some((key) => (q.alternativas[key] || "").trim().length > 0));
  console.error("[normalizeQuestions] Resumo da normalização.", { inputType: Array.isArray(input) ? "array" : typeof input, rootKeys: isRecord(input) ? Object.keys(input) : [], detectedCountBeforeNormalization: sourceQuestions.length, normalizedCount: normalized.length });
  return normalized;
}


export function formatQuestionForCopy(question: Question, index: number): string {
  const lines: string[] = [`Questão ${index + 1}`, ""];

  if (question.disciplina) lines.push(`Disciplina: ${question.disciplina}`);
  if (question.tema) lines.push(`Tema: ${question.tema}`);
  if (question.disciplina || question.tema) lines.push("");

  lines.push(question.enunciado.trim(), "");

  const sortedAlternatives = Object.entries(question.alternativas)
    .filter(([, value]) => typeof value === "string" && value.trim().length > 0)
    .sort(([a], [b]) => a.localeCompare(b));

  for (const [key, value] of sortedAlternatives) {
    lines.push(`${key}) ${value}`);
  }

  return lines.join("\n");
}

export function calculateScore(questions: Question[], selectedAnswers: Record<number, AlternativeKey | null>, answeredQuestions: Record<number, boolean>) {
  let correctCount = 0;
  let totalAnswered = 0;

  questions.forEach((q, index) => {
    if (answeredQuestions[index]) {
      totalAnswered += 1;
      if (selectedAnswers[index] === q.correta) correctCount += 1;
    }
  });

  const wrongCount = totalAnswered - correctCount;
  const percentage = questions.length ? (correctCount / questions.length) * 100 : 0;

  return { totalAnswered, correctCount, wrongCount, percentage };
}

export function getScore(questions: Question[], selectedAnswers: Record<number, AlternativeKey | null>, answered: Record<number, boolean>) {
  const score = calculateScore(questions, selectedAnswers, answered);
  return { hits: score.correctCount, answeredCount: score.totalAnswered, errors: score.wrongCount, percentage: score.percentage };
}

export function formatMs(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(totalSec / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
  const s = String(totalSec % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}
