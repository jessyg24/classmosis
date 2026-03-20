import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod/v4";

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  shuffle_questions: z.boolean().default(true),
  allow_retries: z.boolean().default(true),
  show_correct_after: z.boolean().default(true),
  coins_reward: z.number().int().min(0).default(0),
  published: z.boolean().default(false),
  standard_ids: z.array(z.string().uuid()).optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: { classId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { classId } = params;

  const { data, error } = await supabase
    .from("practice_sets")
    .select("*, practice_set_standards(standard_id, standards(id, code, description))")
    .eq("class_id", classId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Get question counts
  const setIds = (data || []).map((s) => s.id);
  const questionCounts: Record<string, number> = {};
  if (setIds.length > 0) {
    const { data: counts } = await supabase
      .from("practice_questions")
      .select("practice_set_id")
      .in("practice_set_id", setIds);

    if (counts) {
      for (const c of counts) {
        questionCounts[c.practice_set_id] = (questionCounts[c.practice_set_id] || 0) + 1;
      }
    }
  }

  const result = (data || []).map((s) => ({
    ...s,
    question_count: questionCounts[s.id] || 0,
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

  const { classId } = params;
  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const { standard_ids, ...setData } = parsed.data;

  const { data: set, error } = await supabase
    .from("practice_sets")
    .insert({ class_id: classId, ...setData })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Link standards
  if (standard_ids && standard_ids.length > 0) {
    await supabase
      .from("practice_set_standards")
      .insert(standard_ids.map((sid) => ({ practice_set_id: set.id, standard_id: sid })));
  }

  return NextResponse.json(set, { status: 201 });
}
