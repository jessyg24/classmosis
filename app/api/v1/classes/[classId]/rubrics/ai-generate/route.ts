import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod/v4";
import { generateRubric, checkAndIncrementUsage, AiError } from "@/lib/anthropic";

const generateSchema = z.object({
  assignment_type: z.string().min(1),
  topic: z.string().min(1),
  grade: z.string(),
  num_categories: z.number().int().min(1).max(6).default(4),
  points_per_category: z.number().int().min(1).default(25),
  standard_code: z.string().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: { classId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Rate limit
  const usage = await checkAndIncrementUsage(supabase, user.id, params.classId, "rubric_gen");
  if (!usage.allowed) {
    return NextResponse.json({ error: "AI daily limit reached. Try again tomorrow.", remaining: 0 }, { status: 429 });
  }

  const body = await request.json();
  const parsed = generateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues }, { status: 400 });

  try {
    const categories = await generateRubric({
      assignmentType: parsed.data.assignment_type,
      topic: parsed.data.topic,
      grade: parsed.data.grade,
      numCategories: parsed.data.num_categories,
      pointsPerCategory: parsed.data.points_per_category,
      standardCode: parsed.data.standard_code,
    });

    // Also save to shared rubric_templates bank (best effort)
    const { data: cls } = await supabase
      .from("classes")
      .select("subject, grade_band")
      .eq("id", params.classId)
      .single();

    if (cls) {
      await supabase.from("rubric_templates").insert({
        title: `${parsed.data.assignment_type}: ${parsed.data.topic}`,
        subject: cls.subject,
        grade_band: cls.grade_band,
        assignment_type: parsed.data.assignment_type,
        total_points: categories.reduce((s, c) => s + c.max_points, 0),
        categories,
        standard_codes: parsed.data.standard_code ? [parsed.data.standard_code] : null,
        ai_generated: true,
        contributed_by: user.id,
      });
    }

    return NextResponse.json({ categories, remaining: usage.remaining });
  } catch (err) {
    if (err instanceof AiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}
