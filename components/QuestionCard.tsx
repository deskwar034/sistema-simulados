"use client";
import { AlternativeKey, Question } from "@/lib/types";
import AlternativeButton from "./AlternativeButton";
import FeedbackPanel from "./FeedbackPanel";

export default function QuestionCard(props:{question:Question; index:number; selected:AlternativeKey|null; striked:AlternativeKey[]; answered:boolean; locked:boolean; finished:boolean; onSelect:(a:AlternativeKey)=>void; onToggleStrike:(a:AlternativeKey)=>void; onAnswer:()=>void; onUnlock:()=>void;}) {
  const { question,index,selected,striked,answered,locked,finished,onSelect,onToggleStrike,onAnswer,onUnlock } = props;
  return <div className="rounded-lg bg-white p-4 shadow"><p className="text-sm text-slate-500">Questão {index+1} {question.disciplina?`· ${question.disciplina}`:""} {question.tema?`· ${question.tema}`:""}</p><p className="my-3 whitespace-pre-line">{question.enunciado}</p><div className="space-y-2">{(["A","B","C","D"] as AlternativeKey[]).map((k)=><AlternativeButton key={k} label={k} text={question.alternativas[k]} selected={selected===k} striked={striked.includes(k)} locked={locked && !finished} correct={(answered||finished)&&question.correta===k} wrong={(answered||finished)&&selected===k&&selected!==question.correta} onSelect={()=>onSelect(k)} onToggleStrike={()=>onToggleStrike(k)} />)}</div><div className="mt-4 flex gap-2">{!locked && !finished && <button onClick={onAnswer} className="rounded bg-blue-600 px-4 py-2 text-white">Responder</button>}{locked && !finished && <button onClick={onUnlock} className="rounded bg-amber-600 px-4 py-2 text-white">Alterar resposta</button>}</div>{(answered||finished)&&<FeedbackPanel question={question} selected={selected} />}</div>
}
