import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: { classId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { classId } = params;
  const url = new URL(request.url);
  const studentId = url.searchParams.get("student_id");

  // Get all students in this class
  const { data: students } = await supabase
    .from("students")
    .select("id")
    .eq("class_id", classId)
    .is("archived_at", null);

  const studentIds = (students || []).map((s) => s.id);
  if (studentIds.length === 0) return NextResponse.json([]);

  let query = supabase
    .from("student_mastery")
    .select("*, standards(*), students(id, display_name)")
    .in("student_id", studentIds);

  if (studentId) {
    query = query.eq("student_id", studentId);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data || []);
}
