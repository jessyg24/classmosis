import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyParentAccess } from "@/lib/supabase/parent-auth";

export async function GET(
  _request: Request,
  { params }: { params: { studentId: string } }
) {
  const guardian = await verifyParentAccess(params.studentId);
  if (!guardian) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (guardian.custody_restricted) {
    return NextResponse.json({ restricted: true });
  }

  const supabase = await createClient();

  // Active todos
  const { data: todos } = await supabase
    .from("todo_items")
    .select("id, title, due_date, completed, coin_eligible, coins_on_complete")
    .eq("student_id", params.studentId)
    .eq("completed", false)
    .order("due_date", { ascending: true, nullsFirst: false });

  // Missing assignments
  const { data: missing } = await supabase
    .from("gradebook_entries")
    .select("assignment_id, assignments(title, due_at)")
    .eq("student_id", params.studentId)
    .eq("is_missing", true);

  const missingWork = (missing || []).map((m) => {
    const assignment = m.assignments as unknown as { title: string; due_at: string | null } | null;
    return {
      title: assignment?.title || "Assignment",
      due_at: assignment?.due_at,
    };
  });

  return NextResponse.json({
    restricted: false,
    todos: todos || [],
    missing_work: missingWork,
  });
}
