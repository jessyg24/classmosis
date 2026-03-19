import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod/v4";

const createAssignmentSchema = z.object({
  title: z.string().min(1),
  instructions: z.string().optional(),
  type: z.enum(["classwork", "homework", "quiz", "project", "exit_ticket"]),
  rubric_id: z.string().uuid().optional(),
  category: z.string().default("classwork"),
  points_possible: z.number().int().min(0).default(100),
  due_at: z.string().optional(),
  extra_credit: z.boolean().default(false),
  make_up_eligible: z.boolean().default(true),
  block_id: z.string().uuid().optional(),
  published: z.boolean().default(false),
});

export async function GET(
  request: Request,
  { params }: { params: { classId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { classId } = params;
  const url = new URL(request.url);
  const publishedOnly = url.searchParams.get("published") === "true";

  let query = supabase
    .from("assignments")
    .select("*, rubrics(id, title, total_points)")
    .eq("class_id", classId)
    .order("created_at", { ascending: false });

  if (publishedOnly) {
    query = query.eq("published", true);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data || []);
}

export async function POST(
  request: Request,
  { params }: { params: { classId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { classId } = params;
  const body = await request.json();
  const parsed = createAssignmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("assignments")
    .insert({
      class_id: classId,
      title: parsed.data.title,
      instructions: parsed.data.instructions || null,
      type: parsed.data.type,
      rubric_id: parsed.data.rubric_id || null,
      category: parsed.data.category,
      points_possible: parsed.data.points_possible,
      due_at: parsed.data.due_at || null,
      extra_credit: parsed.data.extra_credit,
      make_up_eligible: parsed.data.make_up_eligible,
      block_id: parsed.data.block_id || null,
      published: parsed.data.published,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}
