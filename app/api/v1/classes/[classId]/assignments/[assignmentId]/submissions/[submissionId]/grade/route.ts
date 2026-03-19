import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod/v4";

const gradeSchema = z.object({
  category_scores: z.array(z.object({
    category_id: z.string(),
    name: z.string(),
    score: z.number().min(0),
    max: z.number().min(0),
  })).default([]),
  total_raw: z.number().min(0),
  total_pct: z.number().min(0).max(100),
  overall_feedback: z.string().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: { classId: string; assignmentId: string; submissionId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { classId, assignmentId, submissionId } = params;
  const body = await request.json();
  const parsed = gradeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  // Get submission to find student_id
  const { data: submission } = await supabase
    .from("submissions")
    .select("id, student_id")
    .eq("id", submissionId)
    .single();

  if (!submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  // Resolve scale_label from class grading scale
  let scale_label: string | null = null;
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
      const match = sorted.find((t) => parsed.data.total_pct >= t.min_pct);
      if (match) scale_label = match.label;
    }
  }

  // Upsert teacher grade
  const { data: grade, error: gradeError } = await supabase
    .from("teacher_grades")
    .upsert(
      {
        submission_id: submissionId,
        category_scores: parsed.data.category_scores,
        total_raw: parsed.data.total_raw,
        total_pct: parsed.data.total_pct,
        scale_label,
        overall_feedback: parsed.data.overall_feedback || null,
        graded_by: user.id,
        graded_at: new Date().toISOString(),
      },
      { onConflict: "submission_id" }
    )
    .select()
    .single();

  if (gradeError) return NextResponse.json({ error: gradeError.message }, { status: 500 });

  // Upsert gradebook entry
  const { error: entryError } = await supabase
    .from("gradebook_entries")
    .upsert(
      {
        student_id: submission.student_id,
        assignment_id: assignmentId,
        teacher_grade_id: grade.id,
        raw_score: parsed.data.total_raw,
        pct_score: parsed.data.total_pct,
        display_label: scale_label,
        is_missing: false,
      },
      { onConflict: "student_id,assignment_id" }
    );

  if (entryError) return NextResponse.json({ error: entryError.message }, { status: 500 });

  // Update submission status
  await supabase
    .from("submissions")
    .update({ status: "graded" })
    .eq("id", submissionId);

  // Create student feedback row (upsert to avoid duplicates)
  await supabase
    .from("student_feedback")
    .upsert(
      {
        teacher_grade_id: grade.id,
        student_id: submission.student_id,
      },
      { onConflict: "teacher_grade_id,student_id", ignoreDuplicates: true }
    );

  return NextResponse.json(grade);
}
