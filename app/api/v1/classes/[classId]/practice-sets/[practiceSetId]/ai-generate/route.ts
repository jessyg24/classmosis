import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod/v4";
import { generatePracticeProblems, checkAndIncrementUsage, AiError } from "@/lib/anthropic";

const generateSchema = z.object({
  count: z.number().int().min(1).max(10).default(5),
  problem_type: z.enum(["multiple_choice", "true_false", "short_answer"]),
  standard_code: z.string().min(1),
  standard_description: z.string().optional(),
  grade: z.string(),
  difficulty: z.number().int().min(1).max(5).default(3),
  context_guidance: z.string().optional(),
  avoid_guidance: z.string().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: { classId: string; practiceSetId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Rate limit
  const usage = await checkAndIncrementUsage(supabase, user.id, params.classId, "practice_gen");
  if (!usage.allowed) {
    return NextResponse.json({ error: "AI daily limit reached. Try again tomorrow.", remaining: 0 }, { status: 429 });
  }

  const body = await request.json();
  const parsed = generateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues }, { status: 400 });

  try {
    const questions = await generatePracticeProblems({
      count: parsed.data.count,
      problemType: parsed.data.problem_type,
      standardCode: parsed.data.standard_code,
      standardDescription: parsed.data.standard_description,
      grade: parsed.data.grade,
      difficulty: parsed.data.difficulty,
      contextGuidance: parsed.data.context_guidance,
      avoidGuidance: parsed.data.avoid_guidance,
    });

    // Get current question count for order_index
    const { count: existingCount } = await supabase
      .from("practice_questions")
      .select("*", { count: "exact", head: true })
      .eq("practice_set_id", params.practiceSetId);

    let orderIdx = existingCount || 0;

    // Insert into practice_questions
    const rows = questions.map((q) => ({
      practice_set_id: params.practiceSetId,
      question_type: parsed.data.problem_type,
      prompt: q.prompt,
      options: q.options || null,
      correct_answer: q.correct_answer,
      explanation: q.explanation || null,
      order_index: orderIdx++,
      ai_generated: true,
    }));

    const { data: inserted, error } = await supabase
      .from("practice_questions")
      .insert(rows)
      .select();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Also add to shared problem bank
    const bankRows = questions.map((q) => {
      return {
        subject: "Multi-subject" as const,
        grade_band: parsed.data.grade,
        standard_code: parsed.data.standard_code,
        question_type: parsed.data.problem_type,
        difficulty: parsed.data.difficulty,
        prompt: q.prompt,
        options: q.options || null,
        correct_answer: q.correct_answer,
        explanation: q.explanation || null,
        hint: q.hint || null,
        ai_generated: true,
        contributed_by: user.id,
      };
    });

    // Best-effort bank insert (don't fail if it errors)
    await supabase.from("problem_bank").insert(bankRows);

    return NextResponse.json({ questions: inserted, remaining: usage.remaining }, { status: 201 });
  } catch (err) {
    if (err instanceof AiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}
