import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod/v4";

const createEventSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  event_type: z.enum(["pull_out", "support", "therapy", "enrichment", "assessment", "custom"]).default("pull_out"),
  days_of_week: z.array(z.string()).min(1),
  start_time: z.string().min(1),
  duration_minutes: z.number().int().min(5).max(120).default(30),
  location: z.string().max(200).optional(),
  provider: z.string().max(200).optional(),
  student_ids: z.array(z.string().uuid()).min(1),
});

export async function GET(
  request: Request,
  { params }: { params: { classId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const studentId = url.searchParams.get("student_id");

  let eventIds: string[] | null = null;

  // If filtering by student, get their event IDs first
  if (studentId) {
    const { data: assignments } = await supabase
      .from("student_event_assignments")
      .select("event_id")
      .eq("student_id", studentId);
    eventIds = (assignments || []).map((a) => a.event_id);
    if (eventIds.length === 0) return NextResponse.json([]);
  }

  let query = supabase
    .from("student_schedule_events")
    .select("*")
    .eq("class_id", params.classId)
    .eq("active", true)
    .order("start_time");

  if (eventIds) {
    query = query.in("id", eventIds);
  }

  const { data: events, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Get assigned students for each event
  const allEventIds = (events || []).map((e) => e.id);
  const { data: allAssignments } = await supabase
    .from("student_event_assignments")
    .select("event_id, student_id, students(id, display_name)")
    .in("event_id", allEventIds.length > 0 ? allEventIds : ["none"]);

  const assignmentMap: Record<string, Array<{ id: string; display_name: string }>> = {};
  for (const a of (allAssignments || []) as unknown as Array<{ event_id: string; students: { id: string; display_name: string } }>) {
    if (!assignmentMap[a.event_id]) assignmentMap[a.event_id] = [];
    if (a.students) assignmentMap[a.event_id].push(a.students);
  }

  const result = (events || []).map((e) => ({
    ...e,
    assigned_students: assignmentMap[e.id] || [],
  }));

  return NextResponse.json(result);
}

export async function POST(
  request: Request,
  { params }: { params: { classId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = createEventSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues }, { status: 400 });

  const { student_ids, ...eventData } = parsed.data;

  // Create event
  const { data: event, error } = await supabase
    .from("student_schedule_events")
    .insert({
      class_id: params.classId,
      title: eventData.title,
      description: eventData.description || null,
      event_type: eventData.event_type,
      days_of_week: eventData.days_of_week,
      start_time: eventData.start_time,
      duration_minutes: eventData.duration_minutes,
      location: eventData.location || null,
      provider: eventData.provider || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Assign students
  const assignments = student_ids.map((sid) => ({ event_id: event.id, student_id: sid }));
  await supabase.from("student_event_assignments").insert(assignments);

  return NextResponse.json(event, { status: 201 });
}
