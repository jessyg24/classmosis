import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod/v4";

const updateQuestionSchema = z.object({
  prompt: z.string().min(1).optional(),
  options: z.array(z.string()).min(2).max(6).optional(),
  correct_answer: z.string().min(1).optional(),
  explanation: z.string().nullable().optional(),
  order_index: z.number().int().min(0).optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: { classId: string; practiceSetId: string; questionId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { questionId } = params;
  const body = await request.json();
  const parsed = updateQuestionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("practice_questions")
    .update(parsed.data)
    .eq("id", questionId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { classId: string; practiceSetId: string; questionId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { questionId } = params;

  const { error } = await supabase
    .from("practice_questions")
    .delete()
    .eq("id", questionId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
