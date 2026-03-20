import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod/v4";
import { unassignJob } from "@/lib/economy";

const updateJobSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  coin_multiplier: z.number().min(1).max(5).optional(),
  rotation: z.enum(["daily", "weekly", "teacher_assigned", "random"]).optional(),
  active: z.boolean().optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: { classId: string; jobId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = updateJobSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues }, { status: 400 });

  // If multiplier changed, update current holder's multiplier too
  if (parsed.data.coin_multiplier !== undefined) {
    const { data: job } = await supabase
      .from("class_jobs")
      .select("current_holder_id")
      .eq("id", params.jobId)
      .single();

    if (job?.current_holder_id) {
      await supabase
        .from("students")
        .update({ active_job_multiplier: parsed.data.coin_multiplier })
        .eq("id", job.current_holder_id);
    }
  }

  const { data, error } = await supabase
    .from("class_jobs")
    .update(parsed.data)
    .eq("id", params.jobId)
    .eq("class_id", params.classId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { classId: string; jobId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await unassignJob(supabase, params.jobId);

  const { error } = await supabase
    .from("class_jobs")
    .update({ active: false })
    .eq("id", params.jobId)
    .eq("class_id", params.classId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
