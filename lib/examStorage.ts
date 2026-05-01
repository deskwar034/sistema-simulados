import { ExamState } from "./types";

const KEY = "oab46_exam_state";
export const DEFAULT_DURATION_MS = 5 * 60 * 60 * 1000;

export function loadState(): ExamState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ExamState;
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
  return { currentQuestionIndex: 0, selectedAnswers, strikedAlternatives, answeredQuestions, lockedQuestions, startTimestamp: now, durationMs: DEFAULT_DURATION_MS, finished: false, startedAtISO: new Date(now).toISOString() };
}
