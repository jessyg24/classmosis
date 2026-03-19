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

  // Get published assignments for the student's class
  const { data: assignments, error } = await supabase
    .from("assignments")
    .select("id, title, type, category, points_possible, due_at, instructions, rubric_id, rubrics(id, title, total_points, rubric_categories(*))")
    .eq("class_id", session.classId)
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Get student's submissions to join status
  const assignmentIds = (assignments || []).map((a) => a.id);
  let submissionMap: Record<string, string> = {};

  if (assignmentIds.length > 0) {
    const { data: subs } = await supabase
      .from("submissions")
      .select("assignment_id, status")
      .eq("student_id", session.studentId)
      .in("assignment_id", assignmentIds);

    if (subs) {
      submissionMap = Object.fromEntries(subs.map((s) => [s.assignment_id, s.status]));
    }
  }

  const result = (assignments || []).map((a) => ({
    ...a,
    submission_status: submissionMap[a.id] || null,
  }));

  return NextResponse.json(result);
}
