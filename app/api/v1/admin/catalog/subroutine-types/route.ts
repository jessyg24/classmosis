import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod/v4";

const createSchema = z.object({
  key: z.string().min(1).max(100).regex(/^[a-z_]+$/),
  label: z.string().min(1).max(100),
  category: z.string().min(1),
  description: z.string().default(""),
  default_duration_min: z.number().int().min(1).default(5),
  default_duration_max: z.number().int().min(1).default(30),
  supports: z.object({
    assignment: z.boolean(), rubric: z.boolean(), practice_set: z.boolean(),
    economy_trigger: z.boolean(), submission: z.boolean(), standards: z.boolean(),
  }).optional(),
  student_view_description: z.string().default(""),
  icon: z.string().default("Plus"),
  sort_order: z.number().int().default(0),
});

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const supabase = createAdminClient();
  const { data } = await supabase.from("subroutine_types").select("*").order("sort_order");
  return NextResponse.json(data || []);
}

export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues }, { status: 400 });

  const supabase = createAdminClient();
  const { data, error: dbErr } = await supabase.from("subroutine_types").insert(parsed.data).select().single();
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
