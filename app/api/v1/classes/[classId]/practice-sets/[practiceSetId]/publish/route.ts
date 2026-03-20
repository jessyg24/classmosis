import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  _request: Request,
  { params }: { params: { classId: string; practiceSetId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { classId, practiceSetId } = params;

  // Check that at least 1 question exists
  const { count } = await supabase
    .from("practice_questions")
    .select("*", { count: "exact", head: true })
    .eq("practice_set_id", practiceSetId);

  if (!count || count === 0) {
    return NextResponse.json({ error: "Add at least one question before publishing" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("practice_sets")
    .update({ published: true, updated_at: new Date().toISOString() })
    .eq("id", practiceSetId)
    .eq("class_id", classId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}
