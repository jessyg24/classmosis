import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(
  request: Request,
  { params }: { params: { standardId: string } }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const supabase = createAdminClient();
  const body = await request.json();

  const { data, error: dbErr } = await supabase
    .from("standards")
    .update(body)
    .eq("id", params.standardId)
    .select()
    .single();

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { standardId: string } }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const supabase = createAdminClient();

  const { error: dbErr } = await supabase
    .from("standards")
    .delete()
    .eq("id", params.standardId);

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
