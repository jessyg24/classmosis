import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const supabase = createAdminClient();

  const { data: usersResult } = await supabase.auth.admin.listUsers({ perPage: 500 });
  const users = usersResult?.users || [];

  // Get subscription info
  const { data: subs } = await supabase.from("subscriptions").select("teacher_id, tier, status");
  const subMap: Record<string, { tier: string; status: string }> = {};
  for (const s of subs || []) subMap[s.teacher_id] = { tier: s.tier, status: s.status };

  // Get class counts per teacher
  const { data: classes } = await supabase.from("classes").select("teacher_id").is("archived_at", null);
  const classCounts: Record<string, number> = {};
  for (const c of classes || []) classCounts[c.teacher_id] = (classCounts[c.teacher_id] || 0) + 1;

  const teachers = users
    .filter((u) => u.user_metadata?.role !== "parent")
    .map((u) => ({
      id: u.id,
      email: u.email,
      name: u.user_metadata?.display_name || "Unknown",
      school: u.user_metadata?.school_name || null,
      created_at: u.created_at,
      tier: subMap[u.id]?.tier || "free",
      status: subMap[u.id]?.status || "active",
      class_count: classCounts[u.id] || 0,
    }));

  return NextResponse.json(teachers);
}
