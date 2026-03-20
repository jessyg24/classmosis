import type { QuestionType } from "./database";

export const QUESTION_TYPES: Array<{ value: QuestionType; label: string }> = [
  { value: "multiple_choice", label: "Multiple Choice" },
  { value: "true_false", label: "True / False" },
  { value: "short_answer", label: "Short Answer" },
];

const GROWTH_MESSAGES = {
  low: [
    "Every practice makes you stronger!",
    "Keep going — you're building skills!",
    "Great effort! Try again to level up!",
  ],
  mid: [
    "You're getting there — almost!",
    "Nice work! A little more practice and you'll crush it!",
    "So close! You're almost there!",
  ],
  high: [
    "You got it! Awesome job!",
    "Look at you go! Keep it up!",
    "Crushed it! You're on fire!",
  ],
} as const;

export function getGrowthMessage(pctScore: number): string {
  const bucket = pctScore < 50 ? "low" : pctScore < 85 ? "mid" : "high";
  const messages = GROWTH_MESSAGES[bucket];
  return messages[Math.floor(Math.random() * messages.length)];
}
