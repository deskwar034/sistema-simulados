"use client";
import { useRef, useState } from "react";
import { AlternativeKey, Question } from "@/lib/types";
import { formatQuestionForCopy } from "@/lib/examUtils";
import AlternativeButton from "./AlternativeButton";
import FeedbackPanel from "./FeedbackPanel";

const ALL_KEYS: AlternativeKey[] = ["A", "B", "C", "D", "E"];

type CopyStatus = "idle" | "success" | "error";

export default function QuestionCard(props: { question: Question; index: number; selected: AlternativeKey | null; striked: AlternativeKey[]; answered: boolean; locked: boolean; finished: boolean; feedbackRef?: React.RefObject<HTMLDivElement | null>; onSelect: (a: AlternativeKey) => void; onToggleStrike: (a: AlternativeKey) => void; onAnswer: () => void; onUnlock: () => void; }) {
  const { question, index, selected, striked, answered, locked, finished, feedbackRef, onSelect, onToggleStrike, onAnswer, onUnlock } = props;
  const canAnswer = !locked && !finished && !!selected;
  const availableAlternatives = ALL_KEYS.filter((key) => !!question.alternativas[key]);
  const [copyStatus, setCopyStatus] = useState<CopyStatus>("idle");
  const copyStatusTimeout = useRef<number | null>(null);

  const setTemporaryCopyStatus = (status: CopyStatus) => {
    setCopyStatus(status);
    if (copyStatusTimeout.current) window.clearTimeout(copyStatusTimeout.current);
    copyStatusTimeout.current = window.setTimeout(() => setCopyStatus("idle"), 1800);
  };

  const fallbackCopyText = (text: string) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "absolute";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    document.body.removeChild(textarea);
    return copied;
  };

  const handleCopyQuestion = async () => {
    const text = formatQuestionForCopy(question, index);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setTemporaryCopyStatus("success");
        return;
      }

      const copied = fallbackCopyText(text);
      if (copied) {
        setTemporaryCopyStatus("success");
        return;
      }

      throw new Error("Falha no fallback de cópia.");
    } catch (error) {
      console.error("Erro ao copiar questão:", error);
      setTemporaryCopyStatus("error");
    }
  };

  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-3 flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-slate-100 px-2 py-1">Questão {index + 1}</span>{question.disciplina ? <span className="rounded-full bg-indigo-100 px-2 py-1 text-indigo-900">{question.disciplina}</span> : null}{question.tema ? <span className="rounded-full bg-purple-100 px-2 py-1 text-purple-900">{question.tema}</span> : null}</div><p className="mb-4 whitespace-pre-line text-slate-800">{question.enunciado}</p><div className="space-y-2">{availableAlternatives.map((k) => <AlternativeButton key={k} label={k} text={question.alternativas[k] || ""} selected={selected === k} striked={striked.includes(k)} locked={locked && !finished} correct={(answered || finished) && question.correta === k} wrong={(answered || finished) && selected === k && selected !== question.correta} onSelect={() => onSelect(k)} onToggleStrike={() => onToggleStrike(k)} />)}</div><div className="mt-4"><button type="button" aria-label="Copiar enunciado e alternativas da questão atual" onClick={handleCopyQuestion} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800">{copyStatus === "success" ? "Copiado!" : copyStatus === "error" ? "Erro ao copiar" : "Copiar questão"}</button></div><div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">{!locked && !finished ? <button onClick={onAnswer} disabled={!canAnswer} className={`rounded-xl px-4 py-2 text-white transition-all ${canAnswer ? "bg-blue-600 hover:bg-blue-700" : "cursor-not-allowed bg-slate-400 opacity-60"}`}>Responder</button> : null}{!canAnswer && !locked && !finished ? <span className="text-sm text-slate-500">Selecione uma alternativa para responder.</span> : null}{locked && !finished ? <button onClick={onUnlock} className="rounded-xl bg-amber-500 px-4 py-2 text-white transition-all hover:bg-amber-600">Alterar resposta</button> : null}</div>{(answered || finished) ? <div ref={feedbackRef} className="scroll-mt-8"><FeedbackPanel question={question} selected={selected} /></div> : null}</div>;
}
