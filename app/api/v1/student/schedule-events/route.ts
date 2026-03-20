import { NextResponse } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { verifyStudentSession } from "@/lib/supabase/student-auth";

export async function GET(request: Request) {
  const session = verifyStudentSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get today's day name
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

  // Get events assigned to this student
  const { data: assignments } = await supabase
    .from("student_event_assignments")
    .select("event_id")
    .eq("student_id", session.studentId);

  if (!assignments || assignments.length === 0) return NextResponse.json([]);

  const eventIds = assignments.map((a) => a.event_id);

  // Get active events for today
  const { data: events } = await supabase
    .from("student_schedule_events")
    .select("id, title, description, event_type, start_time, duration_minutes, location, provider")
    .in("id", eventIds)
    .eq("active", true)
    .contains("days_of_week", [today])
    .order("start_time");

  return NextResponse.json(events || []);
}
