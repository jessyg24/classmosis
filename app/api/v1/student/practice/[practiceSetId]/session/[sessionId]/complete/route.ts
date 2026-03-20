import { NextResponse } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { verifyStudentSession } from "@/lib/supabase/student-auth";
import { getGrowthMessage } from "@/types/practice";
import { awardCoins } from "@/lib/economy";

export async function POST(
  _request: Request,
  { params }: { params: { practiceSetId: string; sessionId: string } }
) {
  const session = verifyStudentSession(_request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { practiceSetId, sessionId } = params;

  // Count correct responses
  const { data: responses } = await supabase
    .from("practice_responses")
    .select("is_correct")
    .eq("session_id", sessionId);

  const totalAnswered = (responses || []).length;
  const correctCount = (responses || []).filter((r) => r.is_correct).length;
  const pctScore = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 10000) / 100 : 0;

  // Get practice set for coins
  const { data: set } = await supabase
    .from("practice_sets")
    .select("coins_reward, title, class_id")
    .eq("id", practiceSetId)
    .single();

  let coinsAwarded = 0;

  // Award coins if applicable
  if (set && set.coins_reward > 0) {
    try {
      await awardCoins({
        supabase,
        classId: set.class_id,
        studentId: session.studentId,
        amount: set.coins_reward,
        reason: `Practice complete: ${set.title}`,
        category: "block_reward",
        sourceId: sessionId,
      });
      coinsAwarded = set.coins_reward;
    } catch {
      // Non-fatal — session still completes
    }
  }

  // Update session
  const { error } = await supabase
    .from("practice_sessions")
    .update({
      status: "completed",
      correct_count: correctCount,
      total_questions: totalAnswered,
      pct_score: pctScore,
      coins_awarded: coinsAwarded,
      completed_at: new Date().toISOString(),
    })
    .eq("id", sessionId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Trigger mastery recalculation if class_id available
  if (set?.class_id) {
    await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL ? "" : ""}${process.env.NEXT_PUBLIC_APP_URL || ""}/api/v1/classes/${set.class_id}/mastery/recalculate`,
      { method: "POST" }
    ).catch(() => {});
  }

  return NextResponse.json({
    correct_count: correctCount,
    total_questions: totalAnswered,
    pct_score: pctScore,
    coins_awarded: coinsAwarded,
    message: getGrowthMessage(pctScore),
  });
}
