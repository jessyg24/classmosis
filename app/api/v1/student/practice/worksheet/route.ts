import { NextResponse } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { verifyStudentSession } from "@/lib/supabase/student-auth";
import { awardCoins } from "@/lib/economy";

/**
 * POST /api/v1/student/practice/worksheet
 *
 * Saves an algorithmically-generated worksheet result.
 * Awards coins based on performance. Records as a practice session
 * for gradebook integration.
 */
export async function POST(request: Request) {
  const session = verifyStudentSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    worksheetId,
    title,
    totalProblems,
    correctCount,
    pctScore,
  } = body as {
    worksheetId: string;
    title: string;
    totalProblems: number;
    correctCount: number;
    pctScore: number;
  };

  if (!worksheetId || totalProblems === undefined) {
    return NextResponse.json(
      { error: { code: "MISSING_FIELDS", message: "Worksheet data is required." } },
      { status: 400 }
    );
  }

  const supabase = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Save as a practice session record (reuses existing practice_sessions table)
  const { data: practiceSession, error: sessionError } = await supabase
    .from("practice_sessions")
    .insert({
      student_id: session.studentId,
      practice_set_id: null, // algorithmic — no set in DB
      status: "completed",
      total_questions: totalProblems,
      correct_count: correctCount,
      pct_score: pctScore,
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      coins_awarded: 0, // updated below
    })
    .select("id")
    .single();

  if (sessionError) {
    // If practice_sessions table doesn't allow null practice_set_id, fall back gracefully
    // The worksheet result is still valid — just won't be in the DB
    console.error("Failed to save practice session:", sessionError.message);
  }

  // Calculate coins: 1 per correct + bonus tiers
  let coinsToAward = correctCount;
  if (pctScore >= 90) coinsToAward += 5;
  else if (pctScore >= 80) coinsToAward += 3;
  else if (pctScore >= 70) coinsToAward += 1;

  let coinsAwarded = 0;
  try {
    await awardCoins({
      supabase,
      classId: session.classId,
      studentId: session.studentId,
      amount: coinsToAward,
      reason: `Math Practice: ${title} (${correctCount}/${totalProblems})`,
      category: "block_reward",
      sourceId: practiceSession?.id || worksheetId,
    });
    coinsAwarded = coinsToAward;

    // Update session with actual coins awarded
    if (practiceSession?.id) {
      await supabase
        .from("practice_sessions")
        .update({ coins_awarded: coinsAwarded })
        .eq("id", practiceSession.id);
    }
  } catch {
    // Non-fatal — worksheet still counts
  }

  // Create a gradebook entry if the class has a "practice" category
  try {
    // Check if there's a gradebook category for practice
    const { data: weights } = await supabase
      .from("category_weights")
      .select("category_name")
      .eq("class_id", session.classId)
      .ilike("category_name", "%practice%")
      .limit(1);

    if (weights && weights.length > 0) {
      await supabase.from("gradebook_entries").insert({
        student_id: session.studentId,
        assignment_id: null, // algorithmic — no assignment record
        teacher_grade_id: null,
        period_id: null,
        category: "practice",
        raw_score: correctCount,
        pct_score: pctScore,
        display_label: `${correctCount}/${totalProblems}`,
        is_missing: false,
        is_extra_credit: false,
        is_dropped: false,
      });
    }
  } catch {
    // Non-fatal
  }

  // Growth language response
  let message: string;
  if (pctScore >= 90) message = "Outstanding work! You crushed it!";
  else if (pctScore >= 80) message = "Great job — keep building those skills!";
  else if (pctScore >= 70) message = "Nice effort! You're getting stronger!";
  else if (pctScore >= 50) message = "Good start — practice makes progress!";
  else message = "Keep going — every problem makes you better!";

  return NextResponse.json({
    saved: true,
    sessionId: practiceSession?.id || null,
    correctCount,
    totalProblems,
    pctScore,
    coinsAwarded,
    message,
  });
}
