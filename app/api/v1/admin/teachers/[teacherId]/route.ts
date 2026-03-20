import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod/v4";

const updateSchema = z.object({
  tier: z.enum(["free", "pro"]).optional(),
  status: z.enum(["active", "trialing", "past_due", "canceled"]).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: { teacherId: string } }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues }, { status: 400 });

  const supabase = createAdminClient();

  const { data, error: dbErr } = await supabase
    .from("subscriptions")
    .upsert({
      teacher_id: params.teacherId,
      ...parsed.data,
      updated_at: new Date().toISOString(),
    }, { onConflict: "teacher_id" })
    .select()
    .single();

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json(data);
}
