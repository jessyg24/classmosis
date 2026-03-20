import { callHaiku } from "./client";
import { feedbackAssistPrompt } from "./prompts";

export async function generateFeedbackSuggestion({
  grade,
  score,
  max,
  pctScore,
  categoryBreakdown,
  teacherNotes,
}: {
  grade: string;
  score: number;
  max: number;
  pctScore: number;
  categoryBreakdown?: string;
  teacherNotes?: string;
}): Promise<string> {
  const { system, user } = feedbackAssistPrompt({
    grade,
    score,
    max,
    pctScore,
    categoryBreakdown,
    teacherNotes,
  });

  return callHaiku(system, user, 512);
}
