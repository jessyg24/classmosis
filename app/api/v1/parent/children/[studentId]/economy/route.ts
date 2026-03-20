import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyParentAccess } from "@/lib/supabase/parent-auth";

export async function GET(
  _request: Request,
  { params }: { params: { studentId: string } }
) {
  const guardian = await verifyParentAccess(params.studentId);
  if (!guardian) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Custody-restricted guardians don't see economy
  if (guardian.custody_restricted) {
    return NextResponse.json({ restricted: true });
  }

  const supabase = await createClient();

  const { data: student } = await supabase
    .from("students")
    .select("coin_balance, active_job_id")
    .eq("id", params.studentId)
    .single();

  // Recent transactions
  const { data: transactions } = await supabase
    .from("economy_transactions")
    .select("id, amount, reason, category, created_at")
    .eq("student_id", params.studentId)
    .order("created_at", { ascending: false })
    .limit(20);

  // Active job
  let activeJob = null;
  if (student?.active_job_id) {
    const { data: job } = await supabase
      .from("class_jobs")
      .select("title, coin_multiplier")
      .eq("id", student.active_job_id)
      .single();
    activeJob = job;
  }

  return NextResponse.json({
    restricted: false,
    balance: student?.coin_balance ?? 0,
    transactions: transactions || [],
    activeJob,
  });
}
