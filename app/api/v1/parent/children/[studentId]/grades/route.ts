import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyParentAccess } from "@/lib/supabase/parent-auth";

export async function GET(
  _request: Request,
  { params }: { params: { studentId: string } }
) {
  const guardian = await verifyParentAccess(params.studentId);
  if (!guardian) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = await createClient();

  // Get graded assignments with scores
  const { data: entries } = await supabase
    .from("gradebook_entries")
    .select("id, assignment_id, raw_score, pct_score, display_label, is_missing, is_extra_credit, assignments(id, title, type, points_possible, due_at)")
    .eq("student_id", params.studentId)
    .order("created_at", { ascending: false });

  // Format for parents — plain language
  const grades = (entries || []).map((e) => {
    const assignment = e.assignments as unknown as { id: string; title: string; type: string; points_possible: number; due_at: string | null } | null;
    return {
      id: e.id,
      title: assignment?.title || "Assignment",
      type: assignment?.type || "",
      score: e.raw_score,
      max_points: assignment?.points_possible || 0,
      percentage: e.pct_score,
      label: e.display_label,
      is_missing: e.is_missing,
      due_at: assignment?.due_at,
    };
  });

  // Overall average
  const scored = grades.filter((g) => g.percentage !== null);
  const avgPct = scored.length > 0
    ? Math.round(scored.reduce((sum, g) => sum + (g.percentage || 0), 0) / scored.length)
    : null;

  return NextResponse.json({ grades, average: avgPct });
}
