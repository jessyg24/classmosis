import { NextResponse } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { verifyStudentSession } from "@/lib/supabase/student-auth";

export async function POST(
  request: Request,
  { params }: { params: { practiceSetId: string; sessionId: string } }
) {
  const session = verifyStudentSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { practiceSetId, sessionId } = params;
  const { question_id, student_answer } = await request.json();

  if (!question_id || student_answer === undefined) {
    return NextResponse.json({ error: "question_id and student_answer required" }, { status: 400 });
  }

  // Get the question with correct answer
  const { data: question } = await supabase
    .from("practice_questions")
    .select("correct_answer, explanation, question_type")
    .eq("id", question_id)
    .single();

  if (!question) return NextResponse.json({ error: "Question not found" }, { status: 404 });

  // Check correctness
  let isCorrect: boolean;
  if (question.question_type === "short_answer") {
    isCorrect = student_answer.trim().toLowerCase() === question.correct_answer.trim().toLowerCase();
  } else {
    isCorrect = student_answer === question.correct_answer;
  }

  // Record response
  const { error: respErr } = await supabase
    .from("practice_responses")
    .upsert({
      session_id: sessionId,
      question_id,
      student_answer,
      is_correct: isCorrect,
      answered_at: new Date().toISOString(),
    }, { onConflict: "session_id,question_id" });

  if (respErr) return NextResponse.json({ error: respErr.message }, { status: 500 });

  // Get practice set config for show_correct_after
  const { data: set } = await supabase
    .from("practice_sets")
    .select("show_correct_after")
    .eq("id", practiceSetId)
    .single();

  const response: Record<string, unknown> = { is_correct: isCorrect };

  if (set?.show_correct_after) {
    response.correct_answer = question.correct_answer;
    if (question.explanation) response.explanation = question.explanation;
  }

  return NextResponse.json(response);
}
