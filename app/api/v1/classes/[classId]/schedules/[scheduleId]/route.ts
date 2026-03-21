import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_START_HOUR, DEFAULT_START_MINUTE } from "@/types/schedule";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ classId: string; scheduleId: string }> }
) {
  const { classId, scheduleId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify ownership chain: schedule → class → teacher
  const { data: schedule } = await supabase
    .from("schedules")
    .select("id, class_id")
    .eq("id", scheduleId)
    .single();

  if (!schedule || schedule.class_id !== classId) {
    return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
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

  const body = await request.json();
  const { blocks, dayType } = body as {
    blocks: Array<{
      id?: string;
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
      is_instructional?: boolean;
      non_instructional_message?: string | null;
      subject_description?: string | null;
      student_view_settings?: unknown;
      category?: string | null;
    }>;
    dayType?: string;
  };

  // Update day type if provided
  if (dayType) {
    await supabase
      .from("schedules")
      .update({ day_type: dayType })
      .eq("id", scheduleId);
  }

  // Delete all existing blocks for this schedule
  await supabase.from("blocks").delete().eq("schedule_id", scheduleId);

  // Calculate start times and insert new blocks
  let cumulativeMinutes = DEFAULT_START_HOUR * 60 + DEFAULT_START_MINUTE;

  const blocksToInsert = blocks.map((b, i) => {
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
      is_instructional: b.is_instructional ?? true,
      non_instructional_message: b.non_instructional_message || null,
      subject_description: b.subject_description || null,
      student_view_settings: b.student_view_settings || { show_sub_routines_in_full_day: true, student_can_see_ahead: "all", full_day_view_available: true },
      category: b.category || null,
    };
  });

  if (blocksToInsert.length > 0) {
    const { error } = await supabase.from("blocks").insert(blocksToInsert);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // Fetch the saved blocks back
  const { data: savedBlocks } = await supabase
    .from("blocks")
    .select("*")
    .eq("schedule_id", scheduleId)
    .order("order_index");

  return NextResponse.json({ blocks: savedBlocks || [] });
}
