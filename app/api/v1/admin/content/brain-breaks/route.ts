import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  const supabase = createAdminClient();
  const { data } = await supabase.from("brain_break_bank").select("*").order("usage_count", { ascending: false });
  return NextResponse.json(data || []);
}

export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const body = await request.json();
  const supabase = createAdminClient();
  const { data, error: dbErr } = await supabase.from("brain_break_bank").insert({ ...body, is_seed: true }).select().single();
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
