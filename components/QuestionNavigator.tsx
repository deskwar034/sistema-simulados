import { Question } from "@/lib/types";

export default function QuestionNavigator({ questions, current, answered, selected, striked, finished, onGo }: any) {
  return <div className="grid grid-cols-8 gap-2">{questions.map((q: Question, i: number)=>{const isAnswered=answered[i];const hasStrike=(striked[i]||[]).length>0;const isCurrent=i===current;const isCorrect=finished&&isAnswered&&selected[i]===q.correta;const isWrong=finished&&isAnswered&&selected[i]!==q.correta;let cls="h-9 rounded text-xs border ";if(isCurrent)cls+="border-blue-600 ";else cls+="border-slate-300 ";if(isCorrect)cls+="bg-green-200 ";else if(isWrong)cls+="bg-red-200 ";else if(isAnswered)cls+="bg-blue-100 ";else cls+="bg-white ";if(hasStrike)cls+=" ring-2 ring-amber-300 ";return <button key={q.id} className={cls} onClick={()=>onGo(i)}>{i+1}</button>;})}</div>
}
