import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const supabase = createAdminClient();
  const url = new URL(request.url);
  const subject = url.searchParams.get("subject");
  const gradeBand = url.searchParams.get("grade_band");

  let query = supabase
    .from("standards")
    .select("*")
    .order("sort_key")
    .limit(200);

  if (subject) query = query.eq("subject", subject);
  if (gradeBand) query = query.eq("grade_band", gradeBand);

  const { data, error: dbErr } = await query;
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const supabase = createAdminClient();
  const body = await request.json();

  const { data, error: dbErr } = await supabase
    .from("standards")
    .insert(body)
    .select()
    .single();

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
