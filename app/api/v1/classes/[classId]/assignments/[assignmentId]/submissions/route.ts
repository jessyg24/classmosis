import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: { classId: string; assignmentId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { assignmentId } = params;

  const { data, error } = await supabase
    .from("submissions")
    .select("*, students(id, display_name), teacher_grades(*)")
    .eq("assignment_id", assignmentId)
    .order("submitted_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Flatten student join
  const submissions = (data || []).map((s) => ({
    ...s,
    student: s.students,
    students: undefined,
    teacher_grade: s.teacher_grades || null,
    teacher_grades: undefined,
  }));

  return NextResponse.json(submissions);
}
