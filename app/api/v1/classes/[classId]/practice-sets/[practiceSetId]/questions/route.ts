import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod/v4";

const createQuestionSchema = z.object({
  question_type: z.enum(["multiple_choice", "true_false", "short_answer"]),
  prompt: z.string().min(1),
  options: z.array(z.string()).min(2).max(6).optional(),
  correct_answer: z.string().min(1),
  explanation: z.string().optional(),
  order_index: z.number().int().min(0).optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: { classId: string; practiceSetId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { practiceSetId } = params;

  const { data, error } = await supabase
    .from("practice_questions")
    .select("*")
    .eq("practice_set_id", practiceSetId)
    .order("order_index");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data || []);
}

export async function POST(
  request: Request,
  { params }: { params: { classId: string; practiceSetId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { practiceSetId } = params;
  const body = await request.json();
  const parsed = createQuestionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const { question_type, options, correct_answer } = parsed.data;

  // Validate options for MC/TF
  if (question_type === "multiple_choice") {
    if (!options || options.length < 2) {
      return NextResponse.json({ error: "Multiple choice requires at least 2 options" }, { status: 400 });
    }
    if (!options.includes(correct_answer)) {
      return NextResponse.json({ error: "Correct answer must match one of the options" }, { status: 400 });
    }
  }

  let finalOptions = options;
  if (question_type === "true_false") {
    finalOptions = ["True", "False"];
    if (!["True", "False"].includes(correct_answer)) {
      return NextResponse.json({ error: "True/False answer must be 'True' or 'False'" }, { status: 400 });
    }
  }

  // Auto-assign order_index if not provided
  let orderIndex = parsed.data.order_index;
  if (orderIndex === undefined) {
    const { count } = await supabase
      .from("practice_questions")
      .select("*", { count: "exact", head: true })
      .eq("practice_set_id", practiceSetId);
    orderIndex = count || 0;
  }

  const { data, error } = await supabase
    .from("practice_questions")
    .insert({
      practice_set_id: practiceSetId,
      question_type,
      prompt: parsed.data.prompt,
      options: finalOptions || null,
      correct_answer,
      explanation: parsed.data.explanation || null,
      order_index: orderIndex,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}
