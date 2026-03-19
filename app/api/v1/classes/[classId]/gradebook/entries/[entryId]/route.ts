import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod/v4";

const updateEntrySchema = z.object({
  raw_score: z.number().min(0).nullable(),
  pct_score: z.number().min(0).max(100).nullable(),
  display_label: z.string().nullable().optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: { classId: string; entryId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { classId, entryId } = params;
  const body = await request.json();
  const parsed = updateEntrySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  // Resolve scale label
  let display_label = parsed.data.display_label ?? null;
  if (parsed.data.pct_score !== null && display_label === undefined) {
    const { data: cls } = await supabase
      .from("classes")
      .select("grading_scale_id")
      .eq("id", classId)
      .single();

    if (cls?.grading_scale_id) {
      const { data: scale } = await supabase
        .from("grading_scales")
        .select("thresholds")
        .eq("id", cls.grading_scale_id)
        .single();

      if (scale?.thresholds) {
        const thresholds = scale.thresholds as Array<{ min_pct: number; max_pct: number; label: string }>;
        const sorted = [...thresholds].sort((a, b) => b.min_pct - a.min_pct);
        const match = sorted.find((t) => (parsed.data.pct_score ?? 0) >= t.min_pct);
        if (match) display_label = match.label;
      }
    }
  }

  const { data, error } = await supabase
    .from("gradebook_entries")
    .update({
      raw_score: parsed.data.raw_score,
      pct_score: parsed.data.pct_score,
      display_label,
      is_missing: parsed.data.raw_score === null,
    })
    .eq("id", entryId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}
