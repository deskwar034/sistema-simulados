"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { calculateScore, getScore } from "@/lib/examUtils";
import { getQuestions } from "@/lib/getQuestions";
import { createInitialState, loadState, saveState } from "@/lib/examStorage";
import { AlternativeKey, ExamState } from "@/lib/types";
import QuestionNavigator from "@/components/QuestionNavigator";
import QuestionCard from "@/components/QuestionCard";
import Timer from "@/components/Timer";
import ProgressSummary from "@/components/ProgressSummary";
import ApprovalMilestoneModal from "@/components/ApprovalMilestoneModal";

const ALL_KEYS: AlternativeKey[] = ["A", "B", "C", "D", "E"];

export default function SimuladoPage() {
  const router = useRouter();
  const questions = useMemo(() => getQuestions(), []);
  const [state, setState] = useState<ExamState>(() => createInitialState(Math.max(questions.length, 1)));
  const [error, setError] = useState("");
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const questionTopRef = useRef<HTMLDivElement | null>(null);
  const feedbackRef = useRef<HTMLDivElement | null>(null);
  const hasMountedRef = useRef(false);

  const goToPreviousQuestion = useCallback(() => setState((s) => ({ ...s, currentQuestionIndex: Math.max(0, s.currentQuestionIndex - 1) })), []);
  const goToNextQuestion = useCallback(() => setState((s) => ({ ...s, currentQuestionIndex: Math.min(questions.length - 1, s.currentQuestionIndex + 1) })), [questions.length]);

  const scrollToFeedback = useCallback(() => {
    requestAnimationFrame(() => {
      if (!feedbackRef.current) return;
      const y = feedbackRef.current.getBoundingClientRect().top + window.scrollY - 24;
      window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
    });
  }, []);

  const selectAlt = useCallback((a: AlternativeKey) => setState((s) => {
    if (s.lockedQuestions[s.currentQuestionIndex] && !s.finished) return s;
    const strikes = (s.strikedAlternatives[s.currentQuestionIndex] || []).filter((x) => x !== a);
    return {
      ...s,
      selectedAnswers: { ...s.selectedAnswers, [s.currentQuestionIndex]: a },
      strikedAlternatives: { ...s.strikedAlternatives, [s.currentQuestionIndex]: strikes },
    };
  }), []);

  const toggleStrike = useCallback((a: AlternativeKey) => setState((s) => {
    if (s.lockedQuestions[s.currentQuestionIndex] && !s.finished) return s;
    const curr = s.strikedAlternatives[s.currentQuestionIndex] || [];
    const next = curr.includes(a) ? curr.filter((x) => x !== a) : [...curr, a];
    return { ...s, strikedAlternatives: { ...s.strikedAlternatives, [s.currentQuestionIndex]: next } };
  }), []);

  const answerCurrentQuestion = useCallback(() => {
    let didAnswer = false;
    setState((s) => {
      if (s.lockedQuestions[s.currentQuestionIndex] || s.finished) return s;
      const selected = s.selectedAnswers[s.currentQuestionIndex];
      if (!selected) return s;
      didAnswer = true;
      return { ...s, answeredQuestions: { ...s.answeredQuestions, [s.currentQuestionIndex]: true }, lockedQuestions: { ...s.lockedQuestions, [s.currentQuestionIndex]: true } };
    });
    if (didAnswer) scrollToFeedback();
  }, [scrollToFeedback]);

  useEffect(() => {
    if (!questions.length) {
      setError("Não foi possível carregar questões. Verifique se data/questions.json possui a chave questoes ou é um array de questões.");
      return;
    }
    const loaded = loadState();
    const baseState = loaded ?? createInitialState(questions.length);
    if (baseState.finished || baseState.isTimerPaused) {
      setState(baseState);
      return;
    }
    const elapsed = Math.floor((Date.now() - baseState.lastTimerSyncAt) / 1000);
    const adjusted = Math.max(0, baseState.remainingSeconds - Math.max(0, elapsed));
    const next = { ...baseState, remainingSeconds: adjusted, lastTimerSyncAt: Date.now(), finished: adjusted <= 0 ? true : baseState.finished, finishedAt: adjusted <= 0 ? Date.now() : baseState.finishedAt };
    setState(next);
    if (next.finished) router.push("/resultado");
  }, [questions.length, router]);

  useEffect(() => { saveState(state); }, [state]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const review = new URLSearchParams(window.location.search).get("review");
    if (review === "wrong" && questions.length) {
      const first = questions.findIndex((q, i) => state.answeredQuestions[i] && state.selectedAnswers[i] !== q.correta);
      if (first >= 0) setState((s) => ({ ...s, currentQuestionIndex: first }));
    }
  }, [questions, state.answeredQuestions, state.selectedAnswers]);

  useEffect(() => {
    if (!hasMountedRef.current) { hasMountedRef.current = true; return; }
    if (!questionTopRef.current) return;
    const y = questionTopRef.current.getBoundingClientRect().top + window.scrollY - 24;
    window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
  }, [state.currentQuestionIndex]);

  useEffect(() => {
    const scoreNow = calculateScore(questions, state.selectedAnswers, state.answeredQuestions);
    if (scoreNow.correctCount >= 40 && !state.approvalPopupShown) {
      setShowApprovalModal(true);
      setState((s) => (s.approvalPopupShown ? s : { ...s, approvalPopupShown: true }));
    }
  }, [questions, state.answeredQuestions, state.approvalPopupShown, state.selectedAnswers]);

  const q = questions[state.currentQuestionIndex];
  useEffect(() => {
    if (!q) return;
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT" || target.isContentEditable) return;
      if (event.key === "ArrowLeft") return event.preventDefault(), goToNextQuestion();
      if (event.key === "ArrowRight") return event.preventDefault(), goToPreviousQuestion();
      if (event.key === "Enter") return event.preventDefault(), answerCurrentQuestion();
      const key = event.key.toUpperCase() as AlternativeKey;
      if (!ALL_KEYS.includes(key)) return;
      if (state.lockedQuestions[state.currentQuestionIndex] || state.finished) return;
      if (!q.alternativas[key]) return;
      const selected = state.selectedAnswers[state.currentQuestionIndex];
      const strikes = state.strikedAlternatives[state.currentQuestionIndex] || [];
      event.preventDefault();
      if (selected === key) {
        setState((s) => ({ ...s, selectedAnswers: { ...s.selectedAnswers, [s.currentQuestionIndex]: null }, strikedAlternatives: { ...s.strikedAlternatives, [s.currentQuestionIndex]: [...(s.strikedAlternatives[s.currentQuestionIndex] || []), key] } }));
        return;
      }
      if (strikes.includes(key)) return toggleStrike(key);
      selectAlt(key);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [answerCurrentQuestion, goToNextQuestion, goToPreviousQuestion, q, selectAlt, state, toggleStrike]);

  if (error) return <main className="p-6">{error}</main>;
  if (!q) return null;

  const score = getScore(questions, state.selectedAnswers, state.answeredQuestions);
  const handleTimeUp = () => {
    setState((s) => (s.finished ? s : { ...s, remainingSeconds: 0, finished: true, finishedAt: Date.now(), isTimerPaused: false, lastTimerSyncAt: Date.now() }));
    router.push("/resultado");
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white"><div className="mx-auto max-w-7xl p-4">
      <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="mb-3 flex flex-wrap items-center justify-between gap-3"><h1 className="text-lg font-semibold text-slate-900">Simulado OAB 46</h1><button className="rounded-xl bg-slate-900 px-3 py-2 text-sm text-white" onClick={() => {
              const unanswered = questions.length - score.answeredCount;
              const ok = window.confirm(unanswered ? `Existem ${unanswered} não respondidas. Finalizar?` : "Finalizar simulado?");
              if (ok) {
                setState((s) => ({ ...s, finished: true, finishedAt: Date.now() }));
                router.push("/resultado");
              }
            }}>Finalizar simulado</button></div><div className="grid gap-3 md:grid-cols-2">
        <Timer remainingSeconds={state.remainingSeconds} isPaused={state.isTimerPaused || state.finished} onPause={() => setState((s) => ({ ...s, isTimerPaused: true, lastTimerSyncAt: Date.now() }))} onResume={() => setState((s) => ({ ...s, isTimerPaused: false, lastTimerSyncAt: Date.now() }))} onTimeUp={handleTimeUp} onTickPersist={(nextRemainingSeconds, syncAt) => {
            setState((s) => (s.finished || s.isTimerPaused ? s : { ...s, remainingSeconds: nextRemainingSeconds, lastTimerSyncAt: syncAt }));
          }} />
        <ProgressSummary total={questions.length} answered={score.answeredCount} hits={score.hits} errors={score.errors} />
      </div></div>
      {state.isTimerPaused && !state.finished ? <div className="mb-3 rounded border border-amber-300 bg-amber-100 p-2 text-amber-800">Tempo pausado. Você pode continuar navegando e lendo as questões.</div> : null}
      <div className="grid gap-4 lg:grid-cols-[300px_1fr]"><aside className="order-2 lg:order-1"><QuestionNavigator questions={questions} current={state.currentQuestionIndex} answered={state.answeredQuestions} selected={state.selectedAnswers} striked={state.strikedAlternatives} onGo={(i: number) => setState((s) => ({ ...s, currentQuestionIndex: i }))} /></aside>
        <section ref={questionTopRef} className="order-1 lg:order-2">
          <QuestionCard question={q} index={state.currentQuestionIndex} selected={state.selectedAnswers[state.currentQuestionIndex]} striked={state.strikedAlternatives[state.currentQuestionIndex] || []} answered={state.answeredQuestions[state.currentQuestionIndex] || state.finished} locked={state.lockedQuestions[state.currentQuestionIndex]} finished={state.finished} feedbackRef={feedbackRef} onSelect={selectAlt} onToggleStrike={toggleStrike} onAnswer={answerCurrentQuestion} onUnlock={() => setState((s) => ({ ...s, lockedQuestions: { ...s.lockedQuestions, [s.currentQuestionIndex]: false } }))} />
          <p className="mt-3 text-xs text-slate-500">Atalhos: A/B/C/D/E selecionam, Enter responde, ← próxima, → anterior.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="rounded border px-3 py-2" onClick={goToPreviousQuestion}>Anterior</button>
            <button className="rounded border px-3 py-2" onClick={goToNextQuestion}>Próxima</button>
          </div>
        </section>
      </div>
      <ApprovalMilestoneModal open={showApprovalModal} onClose={() => setShowApprovalModal(false)} />
    </div></main>
  );
}
