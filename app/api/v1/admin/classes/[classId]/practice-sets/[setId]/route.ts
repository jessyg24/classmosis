import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: Request,
  { params }: { params: { classId: string; setId: string } }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const supabase = createAdminClient();

  const { data: set } = await supabase
    .from("practice_sets")
    .select("*")
    .eq("id", params.setId)
    .single();

  const { data: questions } = await supabase
    .from("practice_questions")
    .select("*")
    .eq("practice_set_id", params.setId)
    .order("order_index");

  const { data: sessions } = await supabase
    .from("practice_sessions")
    .select("*, students(display_name)")
    .eq("practice_set_id", params.setId)
    .order("started_at", { ascending: false })
    .limit(50);

  return NextResponse.json({ set, questions: questions || [], sessions: sessions || [] });
}

export async function PATCH(
  request: Request,
  { params }: { params: { classId: string; setId: string } }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const supabase = createAdminClient();
  const body = await request.json();

  // Update practice set or question
  if (body.question_id && body.question_data) {
    await supabase.from("practice_questions").update(body.question_data).eq("id", body.question_id);
  } else {
    await supabase.from("practice_sets").update(body).eq("id", params.setId);
  }

  return NextResponse.json({ success: true });
}
