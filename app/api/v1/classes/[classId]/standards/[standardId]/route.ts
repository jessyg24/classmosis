import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod/v4";

const updateStandardSchema = z.object({
  code: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  domain: z.string().min(1).optional(),
  sort_key: z.string().optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: { classId: string; standardId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { classId, standardId } = params;

  // Only allow editing class-scoped custom standards
  const { data: existing } = await supabase
    .from("standards")
    .select("class_id")
    .eq("id", standardId)
    .single();

  if (!existing || existing.class_id !== classId) {
    return NextResponse.json({ error: "Cannot edit global standards" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = updateStandardSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("standards")
    .update(parsed.data)
    .eq("id", standardId)
    .eq("class_id", classId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { classId: string; standardId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { classId, standardId } = params;

  // Only allow deleting class-scoped custom standards
  const { data: existing } = await supabase
    .from("standards")
    .select("class_id")
    .eq("id", standardId)
    .single();

  if (!existing || existing.class_id !== classId) {
    return NextResponse.json({ error: "Cannot delete global standards" }, { status: 403 });
  }

  const { error } = await supabase
    .from("standards")
    .delete()
    .eq("id", standardId)
    .eq("class_id", classId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
