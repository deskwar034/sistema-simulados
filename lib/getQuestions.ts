import questionsRaw from "@/data/questions.json";
import { normalizeQuestions } from "@/lib/examUtils";
import { Question } from "@/lib/types";

export function getQuestions(): Question[] {
  return normalizeQuestions(questionsRaw);
}
