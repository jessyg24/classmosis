import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  const { classId } = await params;
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json({ error: "date query param required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify class ownership
  const { data: cls } = await supabase
    .from("classes")
    .select("id")
    .eq("id", classId)
    .eq("teacher_id", user.id)
    .single();

  if (!cls) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  // Look for existing schedule
  let { data: schedule } = await supabase
    .from("schedules")
    .select("*")
    .eq("class_id", classId)
    .eq("date", date)
    .single();

  // Create draft if none exists
  if (!schedule) {
    const { data: created, error } = await supabase
      .from("schedules")
      .insert({ class_id: classId, date, day_type: "normal" })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    schedule = created;
  }

  // Fetch blocks
  const { data: blocks } = await supabase
    .from("blocks")
    .select("*")
    .eq("schedule_id", schedule.id)
    .order("order_index");

  return NextResponse.json({ schedule, blocks: blocks || [] });
}
