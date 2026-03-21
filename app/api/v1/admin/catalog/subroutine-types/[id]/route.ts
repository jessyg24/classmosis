import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const supabase = createAdminClient();
  const { data, error: dbErr } = await supabase.from("subroutine_types").update(body).eq("id", params.id).select().single();
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const supabase = createAdminClient();
  await supabase.from("subroutine_types").update({ active: false }).eq("id", params.id);
  return NextResponse.json({ success: true });
}
