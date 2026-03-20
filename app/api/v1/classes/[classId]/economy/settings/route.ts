import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod/v4";

const settingsSchema = z.object({
  leaderboard_visible: z.boolean().optional(),
  negative_balance: z.boolean().optional(),
  auto_approve: z.boolean().optional(),
  weekly_allowance: z.number().int().min(0).optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: { classId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { classId } = params;

  // Get or create default settings
  const { data: existing } = await supabase
    .from("economy_settings")
    .select("*")
    .eq("class_id", classId)
    .maybeSingle();

  if (existing) return NextResponse.json(existing);

  // Create default
  const { data: created, error } = await supabase
    .from("economy_settings")
    .insert({ class_id: classId })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(created);
}

export async function PUT(
  request: Request,
  { params }: { params: { classId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { classId } = params;
  const body = await request.json();
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("economy_settings")
    .upsert({ class_id: classId, ...parsed.data }, { onConflict: "class_id" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}
