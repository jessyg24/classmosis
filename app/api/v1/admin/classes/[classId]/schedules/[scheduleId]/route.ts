import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: Request,
  { params }: { params: { classId: string; scheduleId: string } }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const supabase = createAdminClient();

  // Get schedule
  const { data: schedule } = await supabase
    .from("schedules")
    .select("*")
    .eq("id", params.scheduleId)
    .single();

  if (!schedule) return NextResponse.json({ error: "Schedule not found" }, { status: 404 });

  // Get blocks with inserts
  const { data: blocks } = await supabase
    .from("blocks")
    .select("*")
    .eq("schedule_id", params.scheduleId)
    .order("order_index");

  return NextResponse.json({ ...schedule, blocks: blocks || [] });
}

export async function PUT(
  request: Request,
  { params }: { params: { classId: string; scheduleId: string } }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const supabase = createAdminClient();
  const body = await request.json();

  // Update schedule metadata
  if (body.schedule) {
    await supabase
      .from("schedules")
      .update(body.schedule)
      .eq("id", params.scheduleId);
  }

  // Update individual block
  if (body.block) {
    await supabase
      .from("blocks")
      .update(body.block)
      .eq("id", body.block.id);
  }

  return NextResponse.json({ success: true });
}
