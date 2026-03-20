import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod/v4";
import { bulkAwardCoins } from "@/lib/economy";

const bulkSchema = z.object({
  amount: z.number().int().min(1),
  reason: z.string().min(1).max(200),
});

export async function POST(
  request: Request,
  { params }: { params: { classId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { classId } = params;
  const body = await request.json();
  const parsed = bulkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const txns = await bulkAwardCoins({
    supabase,
    classId,
    amount: parsed.data.amount,
    reason: parsed.data.reason,
    createdBy: user.id,
  });

  return NextResponse.json({ transactions: txns, count: txns.length }, { status: 201 });
}
