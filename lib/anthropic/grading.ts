import { callSonnet, AiError } from "./client";
import { gradingPrompt } from "./prompts";

interface GradeDraftResult {
  scores: Array<{
    category_id: string;
    name: string;
    points_awarded: number;
    max: number;
    reasoning: string;
    confidence: number;
  }>;
  flagged_for_review: boolean;
  flag_reason: string | null;
  total_raw: number;
  total_pct: number;
  model_version: string;
}

export async function generateGradeDraft({
  rubricCategories,
  submissionContent,
  grade,
}: {
  rubricCategories: Array<{ id: string; name: string; max_points: number }>;
  submissionContent: string;
  grade: string;
}): Promise<GradeDraftResult> {
  const rubricJson = JSON.stringify(
    rubricCategories.map((c) => ({ category_id: c.id, name: c.name, max: c.max_points }))
  );

  const { system, user } = gradingPrompt({ rubricJson, submissionContent, grade });
  const raw = await callSonnet(system, user);

  let parsed: { scores: Array<{ category_id: string; name: string; points_awarded: number; max: number; reasoning: string; confidence: number }>; flagged_for_review: boolean; flag_reason: string | null };
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new AiError("Failed to parse AI grading response", 500, false);
  }

  // Validate scores
  for (const score of parsed.scores) {
    const cat = rubricCategories.find((c) => c.id === score.category_id);
    if (cat) {
      score.points_awarded = Math.min(Math.max(0, Math.round(score.points_awarded)), cat.max_points);
      score.max = cat.max_points;
    }
    score.confidence = Math.min(1, Math.max(0, score.confidence));
  }

  // Check for low confidence
  const hasLowConfidence = parsed.scores.some((s) => s.confidence < 0.7);
  if (hasLowConfidence && !parsed.flagged_for_review) {
    parsed.flagged_for_review = true;
    parsed.flag_reason = "Low confidence on one or more categories";
  }

  const totalMax = rubricCategories.reduce((sum, c) => sum + c.max_points, 0);
  const totalRaw = parsed.scores.reduce((sum, s) => sum + s.points_awarded, 0);
  const totalPct = totalMax > 0 ? Math.round((totalRaw / totalMax) * 10000) / 100 : 0;

  return {
    scores: parsed.scores,
    flagged_for_review: parsed.flagged_for_review,
    flag_reason: parsed.flag_reason,
    total_raw: totalRaw,
    total_pct: totalPct,
    model_version: "claude-sonnet-4-5-20250514",
  };
}
