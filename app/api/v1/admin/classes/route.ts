import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const supabase = createAdminClient();

  const { data, error: dbErr } = await supabase
    .from("classes")
    .select("*, students(id)")
    .is("archived_at", null)
    .order("created_at", { ascending: false });

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });

  // Get teacher names
  const { data: usersResult } = await supabase.auth.admin.listUsers({ perPage: 500 });
  const userMap: Record<string, string> = {};
  for (const u of usersResult?.users || []) {
    userMap[u.id] = u.user_metadata?.display_name || u.email || "Unknown";
  }

  const result = (data || []).map((c) => ({
    ...c,
    teacher_name: userMap[c.teacher_id] || "Unknown",
    student_count: (c.students as unknown[])?.length || 0,
    students: undefined,
  }));

  return NextResponse.json(result);
}
