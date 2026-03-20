import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod/v4";
import { getClassJobs } from "@/lib/economy";
import { checkFeatureAccess } from "@/lib/subscription";

const createJobSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  coin_multiplier: z.number().min(1).max(5).default(1),
  rotation: z.enum(["daily", "weekly", "teacher_assigned", "random"]).default("teacher_assigned"),
});

export async function GET(
  _request: Request,
  { params }: { params: { classId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const jobs = await getClassJobs(supabase, params.classId);
    return NextResponse.json(jobs);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { classId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const access = await checkFeatureAccess(supabase, user.id, 'class_jobs');
  if (!access.allowed) return NextResponse.json({ error: "Pro feature", upgrade: true }, { status: 403 });

  const body = await request.json();
  const parsed = createJobSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues }, { status: 400 });

  const { data, error } = await supabase
    .from("class_jobs")
    .insert({ class_id: params.classId, ...parsed.data })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
