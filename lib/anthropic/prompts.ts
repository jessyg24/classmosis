// Prompt templates — all AI prompts live here, never inline

export function rubricGenerationPrompt({
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
}): { system: string; user: string } {
  return {
    system: `You are an experienced K-8 teacher building assessment rubrics. Output valid JSON only, no markdown.`,
    user: `Generate a rubric for a ${assignmentType} on "${topic}" for grade ${grade}.
Include ${numCategories} categories. Each category should have:
- A clear name
- Maximum ${pointsPerCategory} points
- Descriptors for each point level as an object: {"full": "...", "partial": "...", "minimal": "...", "missing": "..."}
- weight_pct (integer, all categories should sum to 100)
${standardCode ? `- Connection to standard ${standardCode} where relevant` : ""}

Output as a JSON array of objects with fields: name, max_points, weight_pct, descriptors`,
  };
}

export function gradingPrompt({
  rubricJson,
  submissionContent,
  grade,
}: {
  rubricJson: string;
  submissionContent: string;
  grade: string;
}): { system: string; user: string } {
  return {
    system: `You are an experienced teacher grading student work against a rubric. Be fair, encouraging, and specific. Grade as if the teacher will review your draft. Output valid JSON only, no markdown.`,
    user: `Rubric categories:
${rubricJson}

Student submission (grade ${grade}):
${submissionContent}

For each rubric category, provide:
- category_id (from the rubric)
- name (category name)
- points_awarded (integer, 0 to max)
- max (category max points)
- reasoning (1-2 sentences, specific to this student's work)
- confidence (0.0 to 1.0)

Output as JSON: { "scores": [...], "flagged_for_review": boolean, "flag_reason": string | null }
Set flagged_for_review to true if confidence < 0.7 on any category.`,
  };
}

export function practiceGenerationPrompt({
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
}): { system: string; user: string } {
  return {
    system: `You are an experienced K-8 teacher creating practice problems. Use growth-oriented language. Output valid JSON only, no markdown.`,
    user: `Generate ${count} ${problemType} problems for standard ${standardCode}${standardDescription ? ` (${standardDescription})` : ""}.
Grade level: ${grade}. Difficulty: ${difficulty}/5.
${contextGuidance ? `Context guidance: ${contextGuidance}` : ""}
${avoidGuidance ? `Avoid: ${avoidGuidance}` : ""}

For each problem provide:
- prompt (the question text)
- correct_answer (the correct answer text)
${problemType === "multiple_choice" ? '- options (array of 4 strings including the correct answer, shuffled)' : ""}
- explanation (brief explanation of the answer)
- hint (one sentence hint)

Output as a JSON array.`,
  };
}

export function feedbackAssistPrompt({
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
}): { system: string; user: string } {
  return {
    system: `You are an experienced teacher writing feedback on student work. Be warm, specific, growth-oriented. Never use "good job" alone. Never use deficit language like "failing" or "below basic". Output only the feedback text, no JSON.`,
    user: `Grade level: ${grade}
Student score: ${score}/${max} (${Math.round(pctScore)}%)
${categoryBreakdown ? `Category breakdown: ${categoryBreakdown}` : ""}
${teacherNotes ? `Teacher notes: ${teacherNotes}` : ""}

Write 2-3 sentences of feedback that:
- Acknowledges something specific the student likely did well given their score
- Names one concrete next step
- Ends encouragingly`,
  };
}

export function morningBriefPrompt({
  teacherName,
  classStats,
}: {
  teacherName: string;
  classStats: string;
}): { system: string; user: string } {
  return {
    system: `You are a helpful assistant summarizing a teacher's classroom data. Be warm, practical, and brief. Write as if talking to a trusted colleague. Output only the brief text, no JSON.`,
    user: `Teacher: ${teacherName}
Today's data:
${classStats}

Generate a morning brief with:
- 2-3 sentence summary of the most important things to know today
- Up to 3 specific action items
- One encouragement if data shows positive trends

Keep total length under 100 words.`,
  };
}
