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

const createRubricSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  categories: z.array(categorySchema).min(1),
});

export async function GET(
  _request: Request,
  { params }: { params: { classId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { classId } = params;

  const { data, error } = await supabase
    .from("rubrics")
    .select("*, rubric_categories(*)")
    .eq("class_id", classId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Sort categories by order_index
  const rubrics = (data || []).map((r) => ({
    ...r,
    categories: (r.rubric_categories || []).sort(
      (a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index
    ),
    rubric_categories: undefined,
  }));

  return NextResponse.json(rubrics);
}

export async function POST(
  request: Request,
  { params }: { params: { classId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { classId } = params;
  const body = await request.json();
  const parsed = createRubricSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const { title, description, categories } = parsed.data;
  const total_points = categories.reduce((sum, c) => sum + c.max_points, 0);

  // Create rubric
  const { data: rubric, error: rubricError } = await supabase
    .from("rubrics")
    .insert({ class_id: classId, title, description: description || null, total_points, created_by: user.id })
    .select()
    .single();

  if (rubricError) return NextResponse.json({ error: rubricError.message }, { status: 500 });

  // Insert categories
  const categoryRows = categories.map((c) => ({
    rubric_id: rubric.id,
    name: c.name,
    max_points: c.max_points,
    weight_pct: c.weight_pct,
    descriptors: c.descriptors,
    order_index: c.order_index,
  }));

  const { error: catError } = await supabase.from("rubric_categories").insert(categoryRows);
  if (catError) return NextResponse.json({ error: catError.message }, { status: 500 });

  // Fetch full rubric with categories
  const { data: full } = await supabase
    .from("rubrics")
    .select("*, rubric_categories(*)")
    .eq("id", rubric.id)
    .single();

  return NextResponse.json(full, { status: 201 });
}
