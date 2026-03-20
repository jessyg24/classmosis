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
    .from("practice_sets")
    .select("*")
    .eq("class_id", params.classId)
    .order("created_at", { ascending: false });

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json(data || []);
}
