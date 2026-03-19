import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod/v4";

const weightSchema = z.object({
  weights: z.array(z.object({
    category_name: z.string(),
    weight_pct: z.number().min(0).max(100),
  })),
  period_id: z.string().uuid().nullable().default(null),
});

export async function GET(
  request: Request,
  { params }: { params: { classId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { classId } = params;
  const url = new URL(request.url);
  const periodId = url.searchParams.get("period_id");

  let query = supabase
    .from("category_weights")
    .select("*")
    .eq("class_id", classId);

  if (periodId) {
    query = query.eq("period_id", periodId);
  } else {
    query = query.is("period_id", null);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data || []);
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
  const parsed = weightSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const { weights, period_id } = parsed.data;

  // Delete existing weights for this class + period
  let deleteQuery = supabase
    .from("category_weights")
    .delete()
    .eq("class_id", classId);

  if (period_id) {
    deleteQuery = deleteQuery.eq("period_id", period_id);
  } else {
    deleteQuery = deleteQuery.is("period_id", null);
  }

  await deleteQuery;

  // Insert new weights
  if (weights.length > 0) {
    const rows = weights.map((w) => ({
      class_id: classId,
      period_id,
      category_name: w.category_name,
      weight_pct: w.weight_pct,
    }));

    const { error } = await supabase.from("category_weights").insert(rows);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
