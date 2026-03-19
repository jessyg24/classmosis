import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod/v4";

const updateAssignmentSchema = z.object({
  title: z.string().min(1).optional(),
  instructions: z.string().optional(),
  type: z.enum(["classwork", "homework", "quiz", "project", "exit_ticket"]).optional(),
  rubric_id: z.string().uuid().nullable().optional(),
  category: z.string().optional(),
  points_possible: z.number().int().min(0).optional(),
  due_at: z.string().nullable().optional(),
  extra_credit: z.boolean().optional(),
  make_up_eligible: z.boolean().optional(),
  block_id: z.string().uuid().nullable().optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: { classId: string; assignmentId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { assignmentId } = params;

  const { data, error } = await supabase
    .from("assignments")
    .select("*, rubrics(*, rubric_categories(*))")
    .eq("id", assignmentId)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });

  // Get submission count
  const { count } = await supabase
    .from("submissions")
    .select("id", { count: "exact", head: true })
    .eq("assignment_id", assignmentId);

  return NextResponse.json({ ...data, submission_count: count || 0 });
}

export async function PUT(
  request: Request,
  { params }: { params: { classId: string; assignmentId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { assignmentId } = params;
  const body = await request.json();
  const parsed = updateAssignmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("assignments")
    .update(parsed.data)
    .eq("id", assignmentId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { classId: string; assignmentId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { assignmentId } = params;

  // Check for submissions
  const { count } = await supabase
    .from("submissions")
    .select("id", { count: "exact", head: true })
    .eq("assignment_id", assignmentId);

  if (count && count > 0) {
    return NextResponse.json(
      { error: "Cannot delete assignment with existing submissions." },
      { status: 409 }
    );
  }

  const { error } = await supabase.from("assignments").delete().eq("id", assignmentId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
