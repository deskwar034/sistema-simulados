"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import rawQuestions from "@/data/questions.json";
import { normalizeQuestions, getScore } from "@/lib/examUtils";
import { createInitialState, loadState, saveState } from "@/lib/examStorage";
import { AlternativeKey } from "@/lib/types";
import QuestionNavigator from "@/components/QuestionNavigator";
import QuestionCard from "@/components/QuestionCard";
import Timer from "@/components/Timer";
import ProgressSummary from "@/components/ProgressSummary";

export default function SimuladoPage(){
const router=useRouter();
const questions=useMemo(()=>normalizeQuestions(rawQuestions),[]);
const [state,setState]=useState(()=>createInitialState(Math.max(questions.length,1)));
const [error,setError]=useState("");
useEffect(()=>{if(!questions.length){setError("Não foi possível carregar questões.");return;} const loaded=loadState(); setState(loaded ?? createInitialState(questions.length));},[questions.length]);
useEffect(()=>{saveState(state);},[state]);
useEffect(()=>{if(typeof window==="undefined") return; const review=new URLSearchParams(window.location.search).get("review");if(review==="wrong"&&questions.length){const first=questions.findIndex((q,i)=>state.answeredQuestions[i]&&state.selectedAnswers[i]!==q.correta);if(first>=0)setState(s=>({...s,currentQuestionIndex:first}));}},[questions,state.answeredQuestions,state.selectedAnswers]);
useEffect(()=>{const id=setInterval(()=>{setState(prev=>{if(prev.finished) return prev; const remaining=prev.durationMs-(Date.now()-prev.startTimestamp); if(remaining<=0){router.push('/resultado'); return {...prev,finished:true,finishedAt:Date.now()};} return prev;});},1000);return ()=>clearInterval(id);},[router]);
if(error) return <main className="p-6">{error}</main>;
const q=questions[state.currentQuestionIndex]; if(!q) return null;
const remainingMs=Math.max(0,state.durationMs-(Date.now()-state.startTimestamp));
const score=getScore(questions,state.selectedAnswers,state.answeredQuestions);
const selectAlt=(a:AlternativeKey)=>setState(s=>{if(s.lockedQuestions[s.currentQuestionIndex]&&!s.finished)return s;const strikes=(s.strikedAlternatives[s.currentQuestionIndex]||[]).filter(x=>x!==a);return {...s,selectedAnswers:{...s.selectedAnswers,[s.currentQuestionIndex]:a},strikedAlternatives:{...s.strikedAlternatives,[s.currentQuestionIndex]:strikes}}});
const toggleStrike=(a:AlternativeKey)=>setState(s=>{if(s.lockedQuestions[s.currentQuestionIndex]&&!s.finished)return s;const curr=s.strikedAlternatives[s.currentQuestionIndex]||[];const next=curr.includes(a)?curr.filter(x=>x!==a):[...curr,a];return {...s,strikedAlternatives:{...s.strikedAlternatives,[s.currentQuestionIndex]:next}}});
return <main className="mx-auto max-w-7xl p-4"><div className="mb-4 flex items-center justify-between gap-4"><Timer remainingMs={remainingMs}/><ProgressSummary total={questions.length} answered={score.answeredCount} hits={score.hits} errors={score.errors}/></div><div className="grid gap-4 lg:grid-cols-[280px_1fr]"><aside><QuestionNavigator questions={questions} current={state.currentQuestionIndex} answered={state.answeredQuestions} selected={state.selectedAnswers} striked={state.strikedAlternatives} finished={state.finished} onGo={(i:number)=>setState(s=>({...s,currentQuestionIndex:i}))}/></aside><section><QuestionCard question={q} index={state.currentQuestionIndex} selected={state.selectedAnswers[state.currentQuestionIndex]} striked={state.strikedAlternatives[state.currentQuestionIndex]||[]} answered={state.answeredQuestions[state.currentQuestionIndex]||state.finished} locked={state.lockedQuestions[state.currentQuestionIndex]} finished={state.finished} onSelect={selectAlt} onToggleStrike={toggleStrike} onAnswer={()=>setState(s=>({...s,answeredQuestions:{...s.answeredQuestions,[s.currentQuestionIndex]:true},lockedQuestions:{...s.lockedQuestions,[s.currentQuestionIndex]:true}}))} onUnlock={()=>setState(s=>({...s,lockedQuestions:{...s.lockedQuestions,[s.currentQuestionIndex]:false}}))}/><div className="mt-4 flex flex-wrap gap-2"><button className="rounded border px-3 py-2" onClick={()=>setState(s=>({...s,currentQuestionIndex:Math.max(0,s.currentQuestionIndex-1)}))}>Anterior</button><button className="rounded border px-3 py-2" onClick={()=>setState(s=>({...s,currentQuestionIndex:Math.min(questions.length-1,s.currentQuestionIndex+1)}))}>Próxima</button><button className="rounded bg-slate-800 px-3 py-2 text-white" onClick={()=>{const unanswered=questions.length-score.answeredCount;const ok=window.confirm(unanswered?`Existem ${unanswered} não respondidas. Finalizar?`:"Finalizar simulado?"); if(ok){setState(s=>({...s,finished:true,finishedAt:Date.now()})); router.push('/resultado');}}}>Finalizar simulado</button></div></section></div></main>
}
