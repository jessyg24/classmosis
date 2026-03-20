import { NextResponse } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { verifyStudentSession } from "@/lib/supabase/student-auth";

export async function GET(request: Request) {
  const session = verifyStudentSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Published practice sets for this class
  const { data: sets } = await supabase
    .from("practice_sets")
    .select("id, title, description, allow_retries, coins_reward, practice_set_standards(standard_id, standards(code, description))")
    .eq("class_id", session.classId)
    .eq("published", true)
    .order("created_at", { ascending: false });

  // Get question counts
  const setIds = (sets || []).map((s) => s.id);
  const questionCounts: Record<string, number> = {};
  if (setIds.length > 0) {
    const { data: qRows } = await supabase
      .from("practice_questions")
      .select("practice_set_id")
      .in("practice_set_id", setIds);

    for (const q of qRows || []) {
      questionCounts[q.practice_set_id] = (questionCounts[q.practice_set_id] || 0) + 1;
    }
  }

  // Get student's best sessions
  const { data: sessions } = await supabase
    .from("practice_sessions")
    .select("practice_set_id, status, pct_score")
    .eq("student_id", session.studentId)
    .eq("status", "completed")
    .order("pct_score", { ascending: false });

  const bestScores: Record<string, number> = {};
  const hasCompleted: Record<string, boolean> = {};
  for (const s of sessions || []) {
    if (!(s.practice_set_id in bestScores) && s.pct_score !== null) {
      bestScores[s.practice_set_id] = s.pct_score;
    }
    hasCompleted[s.practice_set_id] = true;
  }

  // Check for in-progress sessions
  const { data: inProgress } = await supabase
    .from("practice_sessions")
    .select("practice_set_id")
    .eq("student_id", session.studentId)
    .eq("status", "in_progress");

  const inProgressSet = new Set((inProgress || []).map((s) => s.practice_set_id));

  const result = (sets || []).map((s) => ({
    ...s,
    question_count: questionCounts[s.id] || 0,
    best_score: bestScores[s.id] ?? null,
    has_completed: hasCompleted[s.id] || false,
    in_progress: inProgressSet.has(s.id),
    can_retry: s.allow_retries || !hasCompleted[s.id],
  }));

  return NextResponse.json(result);
}
