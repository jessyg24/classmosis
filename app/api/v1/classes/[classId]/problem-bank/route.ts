import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: { classId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { classId } = params;
  const url = new URL(request.url);
  const standardCode = url.searchParams.get("standard_code");
  const questionType = url.searchParams.get("question_type");
  const difficulty = url.searchParams.get("difficulty");

  // Get class subject + grade_band
  const { data: cls } = await supabase
    .from("classes")
    .select("subject, grade_band")
    .eq("id", classId)
    .single();

  if (!cls) return NextResponse.json({ error: "Class not found" }, { status: 404 });

  let query = supabase
    .from("problem_bank")
    .select("*")
    .or(`subject.eq.${cls.subject},subject.eq.Multi-subject`)
    .eq("grade_band", cls.grade_band)
    .order("usage_count", { ascending: false })
    .limit(100);

  if (standardCode) query = query.eq("standard_code", standardCode);
  if (questionType) query = query.eq("question_type", questionType);
  if (difficulty) query = query.eq("difficulty", parseInt(difficulty));

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data || []);
}
