import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const supabase = createAdminClient();

  const { data, error: dbErr } = await supabase
    .from("subscriptions")
    .select("*")
    .order("updated_at", { ascending: false });

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });

  // Get teacher emails
  const { data: usersResult } = await supabase.auth.admin.listUsers({ perPage: 500 });
  const userMap: Record<string, { email: string; name: string }> = {};
  for (const u of usersResult?.users || []) {
    userMap[u.id] = { email: u.email || "", name: u.user_metadata?.display_name || "" };
  }

  const result = (data || []).map((s) => ({
    ...s,
    teacher_email: userMap[s.teacher_id]?.email || "",
    teacher_name: userMap[s.teacher_id]?.name || "",
  }));

  return NextResponse.json(result);
}
