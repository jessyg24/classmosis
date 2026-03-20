import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: Request,
  { params }: { params: { classId: string } }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const supabase = createAdminClient();

  const { data, error: dbErr } = await supabase
    .from("classes")
    .select("*")
    .eq("id", params.classId)
    .single();

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(
  request: Request,
  { params }: { params: { classId: string } }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const supabase = createAdminClient();
  const body = await request.json();

  const { data, error: dbErr } = await supabase
    .from("classes")
    .update(body)
    .eq("id", params.classId)
    .select()
    .single();

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json(data);
}
