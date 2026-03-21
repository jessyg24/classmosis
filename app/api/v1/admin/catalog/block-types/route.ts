import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod/v4";

const createSchema = z.object({
  key: z.string().min(1).max(100).regex(/^[a-z_]+$/),
  label: z.string().min(1).max(100),
  category: z.string().min(1),
  default_color: z.string().default("coral"),
  default_duration_min: z.number().int().min(1).default(10),
  default_duration_max: z.number().int().min(1).default(60),
  subject_description: z.string().default(""),
  standards_framework: z.string().nullable().optional(),
  is_instructional: z.boolean().default(true),
  non_instructional_message: z.string().nullable().optional(),
  icon: z.string().default("Plus"),
  sort_order: z.number().int().default(0),
});

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const supabase = createAdminClient();
  const { data } = await supabase.from("block_types").select("*").order("sort_order");
  return NextResponse.json(data || []);
}

export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues }, { status: 400 });

  const supabase = createAdminClient();
  const { data, error: dbErr } = await supabase.from("block_types").insert(parsed.data).select().single();
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
