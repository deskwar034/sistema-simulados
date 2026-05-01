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
  explicacaoGeral?: string;
  gabarito_comentado?: {
    explicacao_geral?: string;
    alternativas?: Record<string, {
      status?: string;
      comentario?: string;
    }>;
  };
  pagina_simulado?: number;
  pagina_gabarito?: number;
};

export type ExamState = {
  currentQuestionIndex: number;
  selectedAnswers: Record<number, AlternativeKey | null>;
  strikedAlternatives: Record<number, AlternativeKey[]>;
  answeredQuestions: Record<number, boolean>;
  lockedQuestions: Record<number, boolean>;
  durationMs: number;
  remainingSeconds: number;
  isTimerPaused: boolean;
  lastTimerSyncAt: number;
  startedAt: number;
  finished: boolean;
  finishedAt?: number;
  startedAtISO: string;
  approvalPopupShown?: boolean;
};
