import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callHaiku, checkAndIncrementUsage, AiError } from "@/lib/anthropic";
import { morningBriefPrompt } from "@/lib/anthropic/prompts";

export async function GET(
  _request: Request,
  { params }: { params: { classId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { classId } = params;

  // Rate limit (1 per day is fine)
  const usage = await checkAndIncrementUsage(supabase, user.id, classId, "morning_brief");
  if (!usage.allowed) {
    return NextResponse.json({ error: "Already generated today's brief", remaining: 0 }, { status: 429 });
  }

  // Gather class stats
  const teacherName = user.user_metadata?.display_name || "Teacher";

  const { count: studentCount } = await supabase
    .from("students")
    .select("*", { count: "exact", head: true })
    .eq("class_id", classId)
    .is("archived_at", null);

  const { count: pendingSubmissions } = await supabase
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .eq("status", "submitted")
    .in("assignment_id", (
      await supabase.from("assignments").select("id").eq("class_id", classId)
    ).data?.map((a) => a.id) || []);

  const { count: pendingPurchases } = await supabase
    .from("purchase_requests")
    .select("*", { count: "exact", head: true })
    .eq("class_id", classId)
    .eq("status", "pending");

  const today = new Date().toISOString().split("T")[0];
  const { data: schedule } = await supabase
    .from("schedules")
    .select("id, published")
    .eq("class_id", classId)
    .eq("date", today)
    .maybeSingle();

  const classStats = [
    `${studentCount || 0} students`,
    `${pendingSubmissions || 0} submissions waiting for grading`,
    `${pendingPurchases || 0} pending store requests`,
    schedule?.published ? "Today's schedule is published" : "No schedule published for today",
  ].join("\n");

  try {
    const { system, user: userPrompt } = morningBriefPrompt({ teacherName, classStats });
    const brief = await callHaiku(system, userPrompt, 512);
    return NextResponse.json({ brief, remaining: usage.remaining });
  } catch (err) {
    if (err instanceof AiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}
