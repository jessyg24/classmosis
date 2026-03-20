import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod/v4";

const actionSchema = z.object({
  action: z.enum(["approved", "edited", "rejected"]),
  edited_scores: z.array(z.object({
    category_id: z.string(),
    name: z.string(),
    score: z.number(),
    max: z.number(),
  })).optional(),
  overall_feedback: z.string().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: { classId: string; assignmentId: string; submissionId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues }, { status: 400 });

  // Get the latest AI draft
  const { data: draft } = await supabase
    .from("ai_score_drafts")
    .select("*")
    .eq("submission_id", params.submissionId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!draft) return NextResponse.json({ error: "No AI draft found" }, { status: 404 });

  // Update draft status
  await supabase
    .from("ai_score_drafts")
    .update({
      teacher_action: parsed.data.action,
      teacher_acted_at: new Date().toISOString(),
    })
    .eq("id", draft.id);

  if (parsed.data.action === "rejected") {
    return NextResponse.json({ success: true, action: "rejected" });
  }

  // For approved/edited: create teacher grade
  let categoryScores: Array<{ category_id: string; name: string; score: number; max: number }>;

  if (parsed.data.action === "edited" && parsed.data.edited_scores) {
    categoryScores = parsed.data.edited_scores;
  } else {
    // Use AI scores directly
    const aiScores = draft.category_scores as Array<{ category_id: string; name: string; points_awarded: number; max: number }>;
    categoryScores = aiScores.map((s) => ({
      category_id: s.category_id,
      name: s.name,
      score: s.points_awarded,
      max: s.max,
    }));
  }

  const totalRaw = categoryScores.reduce((sum, s) => sum + s.score, 0);
  const totalMax = categoryScores.reduce((sum, s) => sum + s.max, 0);
  const totalPct = totalMax > 0 ? Math.round((totalRaw / totalMax) * 10000) / 100 : 0;

  // Upsert teacher grade
  const { data: grade, error: gradeErr } = await supabase
    .from("teacher_grades")
    .insert({
      submission_id: params.submissionId,
      ai_draft_id: draft.id,
      category_scores: categoryScores,
      total_raw: totalRaw,
      total_pct: totalPct,
      overall_feedback: parsed.data.overall_feedback || null,
      graded_by: user.id,
      graded_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (gradeErr) return NextResponse.json({ error: gradeErr.message }, { status: 500 });

  // Update submission status
  await supabase
    .from("submissions")
    .update({ status: "graded", teacher_grade_id: grade.id })
    .eq("id", params.submissionId);

  return NextResponse.json({ success: true, action: parsed.data.action, grade });
}
