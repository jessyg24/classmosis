import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod/v4";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  shuffle_questions: z.boolean().optional(),
  allow_retries: z.boolean().optional(),
  show_correct_after: z.boolean().optional(),
  coins_reward: z.number().int().min(0).optional(),
  standard_ids: z.array(z.string().uuid()).optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: { classId: string; practiceSetId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { practiceSetId } = params;

  const { data, error } = await supabase
    .from("practice_sets")
    .select("*, practice_set_standards(standard_id, standards(id, code, description)), practice_questions(*, count:id)")
    .eq("id", practiceSetId)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

export async function PUT(
  request: Request,
  { params }: { params: { classId: string; practiceSetId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { classId, practiceSetId } = params;
  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const { standard_ids, ...setData } = parsed.data;

  if (Object.keys(setData).length > 0) {
    const { error } = await supabase
      .from("practice_sets")
      .update({ ...setData, updated_at: new Date().toISOString() })
      .eq("id", practiceSetId)
      .eq("class_id", classId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (standard_ids !== undefined) {
    await supabase.from("practice_set_standards").delete().eq("practice_set_id", practiceSetId);
    if (standard_ids.length > 0) {
      await supabase
        .from("practice_set_standards")
        .insert(standard_ids.map((sid) => ({ practice_set_id: practiceSetId, standard_id: sid })));
    }
  }

  const { data } = await supabase.from("practice_sets").select("*").eq("id", practiceSetId).single();
  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { classId: string; practiceSetId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { classId, practiceSetId } = params;

  const { error } = await supabase
    .from("practice_sets")
    .delete()
    .eq("id", practiceSetId)
    .eq("class_id", classId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
