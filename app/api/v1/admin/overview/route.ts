import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const supabase = createAdminClient();

  const [teachers, classes, students, assignments, submissions, practiceSessions, subscriptions] = await Promise.all([
    supabase.auth.admin.listUsers().then((r) => r.data?.users?.length || 0),
    supabase.from("classes").select("id", { count: "exact", head: true }).is("archived_at", null),
    supabase.from("students").select("id", { count: "exact", head: true }).is("archived_at", null),
    supabase.from("assignments").select("id", { count: "exact", head: true }),
    supabase.from("submissions").select("id", { count: "exact", head: true }),
    supabase.from("practice_sessions").select("id", { count: "exact", head: true }),
    supabase.from("subscriptions").select("tier"),
  ]);

  const tiers = { free: 0, pro: 0 };
  for (const s of subscriptions.data || []) {
    if (s.tier === "pro") tiers.pro++;
    else tiers.free++;
  }

  return NextResponse.json({
    teachers,
    classes: classes.count || 0,
    students: students.count || 0,
    assignments: assignments.count || 0,
    submissions: submissions.count || 0,
    practice_sessions: practiceSessions.count || 0,
    tiers,
  });
}
