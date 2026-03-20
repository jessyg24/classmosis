import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: Request,
  { params }: { params: { classId: string; assignmentId: string } }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const supabase = createAdminClient();

  const { data: assignment } = await supabase
    .from("assignments")
    .select("*")
    .eq("id", params.assignmentId)
    .single();

  const { data: submissions } = await supabase
    .from("submissions")
    .select("*, students(display_name), teacher_grades(*)")
    .eq("assignment_id", params.assignmentId)
    .order("submitted_at", { ascending: false });

  return NextResponse.json({ assignment, submissions: submissions || [] });
}

export async function PATCH(
  request: Request,
  { params }: { params: { classId: string; assignmentId: string } }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const supabase = createAdminClient();
  const body = await request.json();

  const { data, error: dbErr } = await supabase
    .from("assignments")
    .update(body)
    .eq("id", params.assignmentId)
    .select()
    .single();

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json(data);
}
