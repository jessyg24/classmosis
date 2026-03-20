import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod/v4";
import { awardCoins, InsufficientBalanceError } from "@/lib/economy";

const awardSchema = z.object({
  student_ids: z.array(z.string().uuid()).min(1),
  amount: z.number().int(),
  reason: z.string().min(1).max(200),
});

export async function GET(
  request: Request,
  { params }: { params: { classId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { classId } = params;
  const url = new URL(request.url);
  const studentId = url.searchParams.get("student_id");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 200);

  let query = supabase
    .from("economy_transactions")
    .select("*, students(id, display_name)")
    .eq("class_id", classId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (studentId) query = query.eq("student_id", studentId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data || []);
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
  const parsed = awardSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const txns = [];
  for (const studentId of parsed.data.student_ids) {
    try {
      const txn = await awardCoins({
        supabase,
        classId,
        studentId,
        amount: parsed.data.amount,
        reason: parsed.data.reason,
        category: "manual",
        createdBy: user.id,
      });
      txns.push(txn);
    } catch (err) {
      if (err instanceof InsufficientBalanceError) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
      throw err;
    }
  }

  return NextResponse.json({ transactions: txns }, { status: 201 });
}
