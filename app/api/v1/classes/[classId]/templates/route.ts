import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  const { classId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: cls } = await supabase
    .from("classes")
    .select("id")
    .eq("id", classId)
    .eq("teacher_id", user.id)
    .single();

  if (!cls) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  const { data: templates } = await supabase
    .from("schedule_templates")
    .select("*")
    .eq("class_id", classId)
    .order("created_at", { ascending: false });

  return NextResponse.json({ templates: templates || [] });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  const { classId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: cls } = await supabase
    .from("classes")
    .select("id")
    .eq("id", classId)
    .eq("teacher_id", user.id)
    .single();

  if (!cls) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  const { name, blocks, days_of_week } = await request.json();

  if (!name || !blocks) {
    return NextResponse.json({ error: "name and blocks required" }, { status: 400 });
  }

  const { data: template, error } = await supabase
    .from("schedule_templates")
    .insert({
      class_id: classId,
      name,
      blocks_json: blocks,
      days_of_week: days_of_week || [],
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ template });
}
