import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateGradeDraft, checkAndIncrementUsage, AiError } from "@/lib/anthropic";

export async function GET(
  _request: Request,
  { params }: { params: { classId: string; assignmentId: string; submissionId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await supabase
    .from("ai_score_drafts")
    .select("*")
    .eq("submission_id", params.submissionId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json(data);
}

export async function POST(
  _request: Request,
  { params }: { params: { classId: string; assignmentId: string; submissionId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Rate limit check
  const usage = await checkAndIncrementUsage(supabase, user.id, params.classId, "grading");
  if (!usage.allowed) {
    return NextResponse.json({ error: "AI daily limit reached. Try again tomorrow.", remaining: 0 }, { status: 429 });
  }

  // Get submission content
  const { data: submission } = await supabase
    .from("submissions")
    .select("content, content_type")
    .eq("id", params.submissionId)
    .single();

  if (!submission?.content) {
    return NextResponse.json({ error: "No submission content to grade" }, { status: 400 });
  }

  // Get assignment rubric
  const { data: assignment } = await supabase
    .from("assignments")
    .select("rubric_id, rubrics(id, rubric_categories(id, name, max_points))")
    .eq("id", params.assignmentId)
    .single();

  if (!assignment?.rubric_id) {
    return NextResponse.json({ error: "Assignment has no rubric" }, { status: 400 });
  }

  const rubric = assignment.rubrics as unknown as { id: string; rubric_categories: Array<{ id: string; name: string; max_points: number }> };
  if (!rubric?.rubric_categories?.length) {
    return NextResponse.json({ error: "Rubric has no categories" }, { status: 400 });
  }

  // Get class grade band
  const { data: cls } = await supabase
    .from("classes")
    .select("grade_band")
    .eq("id", params.classId)
    .single();

  try {
    const draft = await generateGradeDraft({
      rubricCategories: rubric.rubric_categories,
      submissionContent: submission.content,
      grade: cls?.grade_band || "3-5",
    });

    // Insert into ai_score_drafts
    const { data: saved, error } = await supabase
      .from("ai_score_drafts")
      .insert({
        submission_id: params.submissionId,
        rubric_id: assignment.rubric_id,
        category_scores: draft.scores,
        total_raw: draft.total_raw,
        total_pct: draft.total_pct,
        model_version: draft.model_version,
        flagged_for_review: draft.flagged_for_review,
        flag_reason: draft.flag_reason,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ...saved, remaining: usage.remaining }, { status: 201 });
  } catch (err) {
    if (err instanceof AiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}
