import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateClassCode } from "@/lib/utils/pin";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ classId: string; scheduleId: string }> }
) {
  const { classId, scheduleId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify ownership
  const { data: cls } = await supabase
    .from("classes")
    .select("id")
    .eq("id", classId)
    .eq("teacher_id", user.id)
    .single();

  if (!cls) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { data: schedule } = await supabase
    .from("schedules")
    .select("id, class_id, date")
    .eq("id", scheduleId)
    .eq("class_id", classId)
    .single();

  if (!schedule) {
    return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
  }

  // Check there are blocks
  const { count } = await supabase
    .from("blocks")
    .select("*", { count: "exact", head: true })
    .eq("schedule_id", scheduleId);

  if (!count || count === 0) {
    return NextResponse.json(
      { error: "Cannot publish a schedule with no blocks" },
      { status: 400 }
    );
  }

  // Generate class code for this schedule's date
  let code = generateClassCode();
  let attempts = 0;

  while (attempts < 10) {
    const { error } = await supabase.from("class_codes").insert({
      class_id: classId,
      code,
      date: schedule.date,
    });

    if (!error) break;

    // Check if code already exists for this class+date (already generated)
    const { data: existing } = await supabase
      .from("class_codes")
      .select("code")
      .eq("class_id", classId)
      .eq("date", schedule.date)
      .limit(1);

    if (existing && existing.length > 0) {
      code = existing[0].code;
      break;
    }

    code = generateClassCode();
    attempts++;
  }

  // Publish the schedule
  const { error: pubError } = await supabase
    .from("schedules")
    .update({
      published: true,
      published_at: new Date().toISOString(),
      class_code: code,
    })
    .eq("id", scheduleId);

  if (pubError) {
    return NextResponse.json({ error: pubError.message }, { status: 500 });
  }

  return NextResponse.json({ published: true, classCode: code });
}
