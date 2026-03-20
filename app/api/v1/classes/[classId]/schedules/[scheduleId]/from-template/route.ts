import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_START_HOUR, DEFAULT_START_MINUTE } from "@/types/schedule";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ classId: string; scheduleId: string }> }
) {
  const { classId, scheduleId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: cls } = await supabase
    .from("classes")
    .select("id")
    .eq("id", classId)
    .eq("teacher_id", user.id)
    .single();

  if (!cls) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { templateId } = await request.json();
  if (!templateId) {
    return NextResponse.json({ error: "templateId required" }, { status: 400 });
  }

  // Fetch template
  const { data: template } = await supabase
    .from("schedule_templates")
    .select("*")
    .eq("id", templateId)
    .eq("class_id", classId)
    .single();

  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  // Delete existing blocks
  await supabase.from("blocks").delete().eq("schedule_id", scheduleId);

  // Update template_id on schedule
  await supabase
    .from("schedules")
    .update({ template_id: templateId })
    .eq("id", scheduleId);

  // Insert blocks from template
  const templateBlocks = template.blocks_json as Array<{
    type: string;
    label: string;
    duration_minutes: number;
    order_index: number;
    notes?: string | null;
    timer_behavior?: string;
    timer_warning_minutes?: number;
    external_link?: unknown;
    economy_trigger?: unknown;
    visible_to_students?: boolean;
    inserts?: unknown[];
  }>;

  let cumulativeMinutes = DEFAULT_START_HOUR * 60 + DEFAULT_START_MINUTE;

  const blocksToInsert = templateBlocks.map((b, i) => {
    const hours = Math.floor(cumulativeMinutes / 60);
    const mins = cumulativeMinutes % 60;
    const startTime = `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:00`;
    cumulativeMinutes += b.duration_minutes;

    return {
      schedule_id: scheduleId,
      type: b.type,
      label: b.label,
      duration_minutes: b.duration_minutes,
      order_index: i,
      start_time: startTime,
      notes: b.notes || null,
      timer_behavior: b.timer_behavior || "none",
      timer_warning_minutes: b.timer_warning_minutes ?? 5,
      external_link: b.external_link || null,
      economy_trigger: b.economy_trigger || null,
      visible_to_students: b.visible_to_students ?? true,
      inserts: b.inserts || [],
    };
  });

  if (blocksToInsert.length > 0) {
    const { error } = await supabase.from("blocks").insert(blocksToInsert);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  const { data: savedBlocks } = await supabase
    .from("blocks")
    .select("*")
    .eq("schedule_id", scheduleId)
    .order("order_index");

  return NextResponse.json({ blocks: savedBlocks || [] });
}
