import { callSonnet, AiError } from "./client";
import { rubricGenerationPrompt } from "./prompts";

interface GeneratedCategory {
  name: string;
  max_points: number;
  weight_pct: number;
  descriptors: Record<string, string>;
}

export async function generateRubric({
  assignmentType,
  topic,
  grade,
  numCategories,
  pointsPerCategory,
  standardCode,
}: {
  assignmentType: string;
  topic: string;
  grade: string;
  numCategories: number;
  pointsPerCategory: number;
  standardCode?: string;
}): Promise<GeneratedCategory[]> {
  const { system, user } = rubricGenerationPrompt({
    assignmentType,
    topic,
    grade,
    numCategories,
    pointsPerCategory,
    standardCode,
  });

  const raw = await callSonnet(system, user);

  let parsed: GeneratedCategory[];
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new AiError("Failed to parse AI rubric response", 500, false);
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new AiError("AI returned empty rubric", 500, false);
  }

  // Validate and normalize
  for (const cat of parsed) {
    if (!cat.name || cat.max_points <= 0) {
      throw new AiError("Invalid rubric category from AI", 500, false);
    }
    cat.max_points = Math.round(cat.max_points);
    cat.weight_pct = Math.round(cat.weight_pct);
  }

  // Normalize weights to sum to 100
  const weightSum = parsed.reduce((sum, c) => sum + c.weight_pct, 0);
  if (weightSum !== 100) {
    const factor = 100 / weightSum;
    let remaining = 100;
    for (let i = 0; i < parsed.length - 1; i++) {
      parsed[i].weight_pct = Math.round(parsed[i].weight_pct * factor);
      remaining -= parsed[i].weight_pct;
    }
    parsed[parsed.length - 1].weight_pct = remaining;
  }

  return parsed;
}
