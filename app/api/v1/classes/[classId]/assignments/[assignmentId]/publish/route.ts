import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  _request: Request,
  { params }: { params: { classId: string; assignmentId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { classId, assignmentId } = params;

  // Get the assignment
  const { data: assignment, error: aErr } = await supabase
    .from("assignments")
    .select("id, category, extra_credit, published")
    .eq("id", assignmentId)
    .eq("class_id", classId)
    .single();

  if (aErr || !assignment) {
    return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
  }

  if (assignment.published) {
    return NextResponse.json({ error: "Already published" }, { status: 400 });
  }

  // Set published = true
  const { error: pubError } = await supabase
    .from("assignments")
    .update({ published: true })
    .eq("id", assignmentId);

  if (pubError) return NextResponse.json({ error: pubError.message }, { status: 500 });

  // Get current grading period (if any)
  const today = new Date().toISOString().split("T")[0];
  const { data: period } = await supabase
    .from("grading_periods")
    .select("id")
    .eq("class_id", classId)
    .lte("starts_at", today)
    .gte("ends_at", today)
    .single();

  // Get all active students in this class
  const { data: students } = await supabase
    .from("students")
    .select("id")
    .eq("class_id", classId)
    .is("archived_at", null);

  if (students && students.length > 0) {
    // Bulk-insert gradebook entries (is_missing = true)
    const entries = students.map((s) => ({
      student_id: s.id,
      assignment_id: assignmentId,
      period_id: period?.id || null,
      category: assignment.category,
      is_missing: true,
      is_extra_credit: assignment.extra_credit,
    }));

    const { error: entryError } = await supabase
      .from("gradebook_entries")
      .upsert(entries, { onConflict: "student_id,assignment_id" });

    if (entryError) {
      return NextResponse.json({ error: entryError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true, published: true });
}
