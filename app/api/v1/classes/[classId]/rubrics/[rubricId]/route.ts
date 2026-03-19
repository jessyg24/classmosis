import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod/v4";

const categorySchema = z.object({
  name: z.string().min(1),
  max_points: z.number().int().min(0),
  weight_pct: z.number().min(0).max(100),
  descriptors: z.record(z.string(), z.string()).default({}),
  order_index: z.number().int().min(0),
});

const updateRubricSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  categories: z.array(categorySchema).min(1),
});

export async function GET(
  _request: Request,
  { params }: { params: { classId: string; rubricId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { rubricId } = params;

  const { data, error } = await supabase
    .from("rubrics")
    .select("*, rubric_categories(*)")
    .eq("id", rubricId)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });

  return NextResponse.json({
    ...data,
    categories: (data.rubric_categories || []).sort(
      (a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index
    ),
    rubric_categories: undefined,
  });
}

export async function PUT(
  request: Request,
  { params }: { params: { classId: string; rubricId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { rubricId } = params;
  const body = await request.json();
  const parsed = updateRubricSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const { title, description, categories } = parsed.data;
  const total_points = categories.reduce((sum, c) => sum + c.max_points, 0);

  // Update rubric
  const { error: rubricError } = await supabase
    .from("rubrics")
    .update({ title, description: description || null, total_points })
    .eq("id", rubricId);

  if (rubricError) return NextResponse.json({ error: rubricError.message }, { status: 500 });

  // Replace categories: delete old, insert new
  await supabase.from("rubric_categories").delete().eq("rubric_id", rubricId);

  const categoryRows = categories.map((c) => ({
    rubric_id: rubricId,
    name: c.name,
    max_points: c.max_points,
    weight_pct: c.weight_pct,
    descriptors: c.descriptors,
    order_index: c.order_index,
  }));

  const { error: catError } = await supabase.from("rubric_categories").insert(categoryRows);
  if (catError) return NextResponse.json({ error: catError.message }, { status: 500 });

  // Return updated rubric
  const { data: full } = await supabase
    .from("rubrics")
    .select("*, rubric_categories(*)")
    .eq("id", rubricId)
    .single();

  return NextResponse.json(full);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { classId: string; rubricId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { rubricId } = params;

  // Check if any assignments reference this rubric
  const { count } = await supabase
    .from("assignments")
    .select("id", { count: "exact", head: true })
    .eq("rubric_id", rubricId);

  if (count && count > 0) {
    return NextResponse.json(
      { error: "Cannot delete rubric that is attached to assignments." },
      { status: 409 }
    );
  }

  const { error } = await supabase.from("rubrics").delete().eq("id", rubricId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
