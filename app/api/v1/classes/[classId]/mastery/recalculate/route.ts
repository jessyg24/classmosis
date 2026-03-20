import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getMasteryLevel } from "@/types/standards";

export async function POST(
  _request: Request,
  { params }: { params: { classId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { classId } = params;

  // Get all students in the class
  const { data: students } = await supabase
    .from("students")
    .select("id")
    .eq("class_id", classId)
    .is("archived_at", null);

  if (!students || students.length === 0) {
    return NextResponse.json({ recalculated: 0 });
  }

  // Get all assignments with linked standards
  const { data: assignments } = await supabase
    .from("assignments")
    .select("id, points_possible")
    .eq("class_id", classId)
    .eq("published", true);

  if (!assignments || assignments.length === 0) {
    return NextResponse.json({ recalculated: 0 });
  }

  const assignmentIds = assignments.map((a) => a.id);

  // Get assignment-standard links
  const { data: links } = await supabase
    .from("assignment_standards")
    .select("assignment_id, standard_id")
    .in("assignment_id", assignmentIds);

  if (!links || links.length === 0) {
    return NextResponse.json({ recalculated: 0 });
  }

  // Build map: standard_id -> assignment_ids
  const standardAssignments: Record<string, string[]> = {};
  for (const link of links) {
    if (!standardAssignments[link.standard_id]) {
      standardAssignments[link.standard_id] = [];
    }
    standardAssignments[link.standard_id].push(link.assignment_id);
  }

  // Get all gradebook entries for these assignments
  const studentIds = students.map((s) => s.id);
  const { data: entries } = await supabase
    .from("gradebook_entries")
    .select("student_id, assignment_id, pct_score")
    .in("student_id", studentIds)
    .in("assignment_id", assignmentIds)
    .not("pct_score", "is", null);

  // Build map: student_id -> assignment_id -> pct_score
  const scoreMap: Record<string, Record<string, number>> = {};
  for (const entry of entries || []) {
    if (!scoreMap[entry.student_id]) scoreMap[entry.student_id] = {};
    if (entry.pct_score !== null) {
      scoreMap[entry.student_id][entry.assignment_id] = entry.pct_score;
    }
  }

  // Calculate and upsert mastery for each student × standard
  const upserts: Array<{
    student_id: string;
    standard_id: string;
    attempts: number;
    avg_pct: number;
    mastery_level: string;
    last_assessed_at: string;
    updated_at: string;
  }> = [];

  const now = new Date().toISOString();

  for (const studentId of studentIds) {
    const studentScores = scoreMap[studentId] || {};
    for (const [standardId, stdAssignmentIds] of Object.entries(standardAssignments)) {
      const scores = stdAssignmentIds
        .map((aid) => studentScores[aid])
        .filter((s): s is number => s !== undefined);

      if (scores.length === 0) continue;

      const avgPct = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100;

      upserts.push({
        student_id: studentId,
        standard_id: standardId,
        attempts: scores.length,
        avg_pct: avgPct,
        mastery_level: getMasteryLevel(avgPct),
        last_assessed_at: now,
        updated_at: now,
      });
    }
  }

  if (upserts.length > 0) {
    const { error } = await supabase
      .from("student_mastery")
      .upsert(upserts, { onConflict: "student_id,standard_id" });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ recalculated: upserts.length });
}
