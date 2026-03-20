import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  request: Request,
  { params }: { params: { classId: string } }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const supabase = createAdminClient();
  const url = new URL(request.url);
  const date = url.searchParams.get("date");

  let query = supabase
    .from("schedules")
    .select("*")
    .eq("class_id", params.classId)
    .order("date", { ascending: false })
    .limit(30);

  if (date) query = query.eq("date", date);

  const { data, error: dbErr } = await query;
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json(data || []);
}
