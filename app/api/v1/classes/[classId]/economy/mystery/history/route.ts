import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: { classId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("mystery_student_records")
    .select("*, students:selected_student_id(id, display_name)")
    .eq("class_id", params.classId)
    .order("date", { ascending: false })
    .limit(30);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const result = (data || []).map((r) => ({
    ...r,
    student: r.students || null,
    students: undefined,
  }));

  return NextResponse.json(result);
}
