import { callSonnet, AiError } from "./client";
import { practiceGenerationPrompt } from "./prompts";

export interface GeneratedPracticeQuestion {
  prompt: string;
  correct_answer: string;
  options?: string[];
  explanation: string;
  hint: string;
}

export async function generatePracticeProblems({
  count,
  problemType,
  standardCode,
  standardDescription,
  grade,
  difficulty,
  contextGuidance,
  avoidGuidance,
}: {
  count: number;
  problemType: string;
  standardCode: string;
  standardDescription?: string;
  grade: string;
  difficulty: number;
  contextGuidance?: string;
  avoidGuidance?: string;
}): Promise<GeneratedPracticeQuestion[]> {
  const { system, user } = practiceGenerationPrompt({
    count: Math.min(count, 10),
    problemType,
    standardCode,
    standardDescription,
    grade,
    difficulty: Math.min(5, Math.max(1, difficulty)),
    contextGuidance,
    avoidGuidance,
  });

  const raw = await callSonnet(system, user);

  let parsed: GeneratedPracticeQuestion[];
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new AiError("Failed to parse AI practice response", 500, false);
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new AiError("AI returned empty problem set", 500, false);
  }

  // Validate MC questions have correct_answer in options
  for (const q of parsed) {
    if (problemType === "multiple_choice" && q.options) {
      if (!q.options.includes(q.correct_answer)) {
        q.options[0] = q.correct_answer;
      }
    }
  }

  return parsed;
}
