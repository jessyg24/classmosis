import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const supabase = createAdminClient();
  const url = new URL(request.url);
  const subject = url.searchParams.get("subject");
  let query = supabase.from("rubric_templates").select("*").order("usage_count", { ascending: false }).limit(100);
  if (subject) query = query.eq("subject", subject);
  const { data } = await query;
  return NextResponse.json(data || []);
}

export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const body = await request.json();
  const supabase = createAdminClient();
  const { data, error: dbErr } = await supabase.from("rubric_templates").insert(body).select().single();
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
