import { AlternativeKey, Question } from "./types";

const ALT_KEYS: AlternativeKey[] = ["A", "B", "C", "D"];

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

function normalizeAlternatives(raw: unknown): Record<AlternativeKey, string> {
  const source = isRecord(raw) ? raw : {};
  return {
    A: normalizeAlternativeValue(source.A),
    B: normalizeAlternativeValue(source.B),
    C: normalizeAlternativeValue(source.C),
    D: normalizeAlternativeValue(source.D),
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

    if (fromCommented) {
      normalized[key] = fromCommented;
    }
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
  const matched = upper.match(/[ABCD]/);
  if (!matched) {
    console.warn("[normalizeQuestions] Não foi possível detectar alternativa correta.", { questionId, raw });
    return null;
  }

  return matched[0] as AlternativeKey;
}

export function normalizeQuestions(input: unknown): Question[] {
  const sourceQuestions = extractRawQuestions(input);

  const normalized = sourceQuestions
    .map((item, index) => {
      if (!isRecord(item)) return null;

      const rawId = item.id ?? item.numero ?? item.number;
      const id = Number(rawId);
      const enunciado = toNonEmptyString(item.enunciado ?? item.question ?? item.statement ?? item.texto) ?? "";
      const alternativas = normalizeAlternatives(item.alternativas ?? item.alternatives ?? item.opcoes ?? item.options);
      const correta = parseCorrectAlternative(
        item.correta ?? item.correctAnswer ?? item.resposta_correta ?? item.answer ?? item.gabarito,
        Number.isFinite(id) ? id : index + 1,
      );

      const question: Question = {
        id,
        disciplina: toNonEmptyString(item.disciplina ?? item.subject),
        tema: toNonEmptyString(item.tema ?? item.topic),
        enunciado,
        alternativas,
        correta: correta ?? "A",
        comentarios: normalizeComments(item),
        explicacaoGeral: normalizeGeneralExplanation(item),
        explicacao: toNonEmptyString(item.explicacao ?? item.explanation),
        pagina_simulado: typeof item.pagina_simulado === "number" ? item.pagina_simulado : undefined,
        pagina_gabarito: typeof item.pagina_gabarito === "number" ? item.pagina_gabarito : undefined,
      };

      return question;
    })
    .filter((q): q is Question => {
      if (!q) return false;
      const hasValidId = Number.isFinite(q.id);
      const hasStatement = q.enunciado.trim().length > 0;
      const hasAtLeastOneAlternative = ALT_KEYS.some((key) => q.alternativas[key].trim().length > 0);
      return hasValidId && hasStatement && hasAtLeastOneAlternative;
    });

  console.error("[normalizeQuestions] Resumo da normalização.", {
    inputType: Array.isArray(input) ? "array" : typeof input,
    rootKeys: isRecord(input) ? Object.keys(input) : [],
    detectedCountBeforeNormalization: sourceQuestions.length,
    normalizedCount: normalized.length,
  });

  return normalized;
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
