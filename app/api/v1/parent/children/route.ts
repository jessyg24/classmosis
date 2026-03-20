import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get all linked children
  const { data: guardians } = await supabase
    .from("parent_guardians")
    .select("id, student_id, relationship, custody_restricted, students(id, display_name, coin_balance, streak_count, class_id)")
    .eq("user_id", user.id)
    .not("accepted_at", "is", null);

  if (!guardians || guardians.length === 0) {
    return NextResponse.json([]);
  }

  const children = [];

  for (const g of guardians) {
    const student = g.students as unknown as { id: string; display_name: string; coin_balance: number; streak_count: number; class_id: string } | null;
    if (!student) continue;

    // Get class name
    const { data: cls } = await supabase
      .from("classes")
      .select("name")
      .eq("id", student.class_id)
      .single();

    // Get grade average
    const { data: entries } = await supabase
      .from("gradebook_entries")
      .select("pct_score")
      .eq("student_id", student.id)
      .not("pct_score", "is", null);

    const scores = (entries || []).map((e) => e.pct_score).filter((s): s is number => s !== null);
    const avgGrade = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

    // Missing work count
    const { count: missingCount } = await supabase
      .from("gradebook_entries")
      .select("*", { count: "exact", head: true })
      .eq("student_id", student.id)
      .eq("is_missing", true);

    // Active todos
    const { count: todoCount } = await supabase
      .from("todo_items")
      .select("*", { count: "exact", head: true })
      .eq("student_id", student.id)
      .eq("completed", false);

    children.push({
      guardian_id: g.id,
      relationship: g.relationship,
      custody_restricted: g.custody_restricted,
      student_id: student.id,
      student_name: student.display_name,
      class_name: cls?.name || "",
      coin_balance: g.custody_restricted ? null : student.coin_balance,
      avg_grade: avgGrade,
      missing_count: g.custody_restricted ? null : (missingCount || 0),
      todo_count: g.custody_restricted ? null : (todoCount || 0),
      streak: student.streak_count,
    });
  }

  return NextResponse.json(children);
}
