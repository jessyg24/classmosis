import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod/v4";
import { generateFeedbackSuggestion, checkAndIncrementUsage, AiError } from "@/lib/anthropic";

const feedbackSchema = z.object({
  score: z.number(),
  max: z.number(),
  category_breakdown: z.string().optional(),
  teacher_notes: z.string().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: { classId: string; assignmentId: string; submissionId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Rate limit
  const usage = await checkAndIncrementUsage(supabase, user.id, params.classId, "feedback");
  if (!usage.allowed) {
    return NextResponse.json({ error: "AI daily limit reached. Try again tomorrow.", remaining: 0 }, { status: 429 });
  }

  const body = await request.json();
  const parsed = feedbackSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues }, { status: 400 });

  const { data: cls } = await supabase
    .from("classes")
    .select("grade_band")
    .eq("id", params.classId)
    .single();

  const pctScore = parsed.data.max > 0 ? (parsed.data.score / parsed.data.max) * 100 : 0;

  try {
    const feedback = await generateFeedbackSuggestion({
      grade: cls?.grade_band || "3-5",
      score: parsed.data.score,
      max: parsed.data.max,
      pctScore,
      categoryBreakdown: parsed.data.category_breakdown,
      teacherNotes: parsed.data.teacher_notes,
    });

    return NextResponse.json({ feedback, remaining: usage.remaining });
  } catch (err) {
    if (err instanceof AiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}
