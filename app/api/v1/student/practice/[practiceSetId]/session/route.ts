import { NextResponse } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { verifyStudentSession } from "@/lib/supabase/student-auth";

export async function POST(
  request: Request,
  { params }: { params: { practiceSetId: string } }
) {
  const session = verifyStudentSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { practiceSetId } = params;

  // Check for existing in-progress session
  const { data: existing } = await supabase
    .from("practice_sessions")
    .select("id")
    .eq("student_id", session.studentId)
    .eq("practice_set_id", practiceSetId)
    .eq("status", "in_progress")
    .maybeSingle();

  // Get practice set config
  const { data: set } = await supabase
    .from("practice_sets")
    .select("shuffle_questions, show_correct_after")
    .eq("id", practiceSetId)
    .single();

  if (!set) return NextResponse.json({ error: "Practice set not found" }, { status: 404 });

  // Get questions (without correct_answer for students)
  const questionQuery = supabase
    .from("practice_questions")
    .select("id, question_type, prompt, options, order_index")
    .eq("practice_set_id", practiceSetId)
    .order("order_index");

  const { data: questions } = await questionQuery;

  let orderedQuestions = questions || [];
  if (set.shuffle_questions) {
    orderedQuestions = [...orderedQuestions].sort(() => Math.random() - 0.5);
  }

  let sessionId: string;

  if (existing) {
    sessionId = existing.id;

    // Get already-answered question IDs
    const { data: answered } = await supabase
      .from("practice_responses")
      .select("question_id")
      .eq("session_id", sessionId);

    const answeredIds = new Set((answered || []).map((a) => a.question_id));

    return NextResponse.json({
      session_id: sessionId,
      resumed: true,
      questions: orderedQuestions,
      answered_ids: Array.from(answeredIds),
      total: orderedQuestions.length,
    });
  }

  // Create new session
  const { data: newSession, error } = await supabase
    .from("practice_sessions")
    .insert({
      student_id: session.studentId,
      practice_set_id: practiceSetId,
      total_questions: orderedQuestions.length,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  sessionId = newSession.id;

  return NextResponse.json({
    session_id: sessionId,
    resumed: false,
    questions: orderedQuestions,
    answered_ids: [],
    total: orderedQuestions.length,
  });
}
