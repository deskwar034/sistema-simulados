export type AlternativeKey = "A" | "B" | "C" | "D";

export type Question = {
  id: number;
  disciplina?: string;
  tema?: string;
  enunciado: string;
  alternativas: Record<AlternativeKey, string>;
  correta: AlternativeKey;
  comentarios?: Partial<Record<AlternativeKey, string>>;
  explicacao?: string;
  pagina_simulado?: number;
  pagina_gabarito?: number;
};

export type ExamState = {
  currentQuestionIndex: number;
  selectedAnswers: Record<number, AlternativeKey | null>;
  strikedAlternatives: Record<number, AlternativeKey[]>;
  answeredQuestions: Record<number, boolean>;
  lockedQuestions: Record<number, boolean>;
  startTimestamp: number;
  durationMs: number;
  finished: boolean;
  finishedAt?: number;
  startedAtISO: string;
};
