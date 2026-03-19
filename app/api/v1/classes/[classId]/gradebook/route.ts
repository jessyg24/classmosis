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
  const periodId = url.searchParams.get("period_id");

  // Fetch students
  const { data: students } = await supabase
    .from("students")
    .select("id, display_name")
    .eq("class_id", classId)
    .is("archived_at", null)
    .order("display_name");

  // Fetch published assignments
  const { data: assignments } = await supabase
    .from("assignments")
    .select("id, title, type, category, points_possible, due_at, extra_credit, rubric_id")
    .eq("class_id", classId)
    .eq("published", true)
    .order("created_at", { ascending: true });

  // Fetch gradebook entries
  let entryQuery = supabase
    .from("gradebook_entries")
    .select("*")
    .in(
      "assignment_id",
      (assignments || []).map((a) => a.id)
    );

  if (periodId) {
    entryQuery = entryQuery.eq("period_id", periodId);
  }

  const { data: entries } = await entryQuery;

  // Fetch category weights
  let weightQuery = supabase
    .from("category_weights")
    .select("category_name, weight_pct")
    .eq("class_id", classId);

  if (periodId) {
    weightQuery = weightQuery.eq("period_id", periodId);
  } else {
    weightQuery = weightQuery.is("period_id", null);
  }

  const { data: categoryWeights } = await weightQuery;

  return NextResponse.json({
    students: students || [],
    assignments: assignments || [],
    entries: entries || [],
    categoryWeights: categoryWeights || [],
  });
}
