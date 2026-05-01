import { ExamState } from "./types";

const KEY = "oab46_exam_state";
export const DEFAULT_DURATION_MS = 5 * 60 * 60 * 1000;

function normalizeLoadedState(parsed: ExamState): ExamState {
  const startedAt = parsed.startedAt ?? Date.now();
  const durationMs = parsed.durationMs ?? DEFAULT_DURATION_MS;
  const fallbackRemaining = Math.floor(durationMs / 1000);
  return {
    ...parsed,
    startedAt,
    durationMs,
    remainingSeconds: typeof parsed.remainingSeconds === "number" ? parsed.remainingSeconds : fallbackRemaining,
    isTimerPaused: typeof parsed.isTimerPaused === "boolean" ? parsed.isTimerPaused : false,
    lastTimerSyncAt: parsed.lastTimerSyncAt ?? startedAt,
    startedAtISO: parsed.startedAtISO ?? new Date(startedAt).toISOString(),
    approvalPopupShown: typeof parsed.approvalPopupShown === "boolean" ? parsed.approvalPopupShown : false,
  };
}

export function loadState(): ExamState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return normalizeLoadedState(JSON.parse(raw) as ExamState);
  } catch {
    return null;
  }
}

export function saveState(state: ExamState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function clearState() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}

export function createInitialState(totalQuestions: number): ExamState {
  const now = Date.now();
  const selectedAnswers: ExamState["selectedAnswers"] = {};
  const strikedAlternatives: ExamState["strikedAlternatives"] = {};
  const answeredQuestions: ExamState["answeredQuestions"] = {};
  const lockedQuestions: ExamState["lockedQuestions"] = {};
  for (let i = 0; i < totalQuestions; i += 1) {
    selectedAnswers[i] = null;
    strikedAlternatives[i] = [];
    answeredQuestions[i] = false;
    lockedQuestions[i] = false;
  }
  return {
    currentQuestionIndex: 0,
    selectedAnswers,
    strikedAlternatives,
    answeredQuestions,
    lockedQuestions,
    durationMs: DEFAULT_DURATION_MS,
    remainingSeconds: Math.floor(DEFAULT_DURATION_MS / 1000),
    isTimerPaused: false,
    lastTimerSyncAt: now,
    startedAt: now,
    finished: false,
    startedAtISO: new Date(now).toISOString(),
    approvalPopupShown: false,
  };
}
