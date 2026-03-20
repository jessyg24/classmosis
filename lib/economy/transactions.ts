import type { SupabaseClient } from "@supabase/supabase-js";
import type { TransactionCategory, EconomyTransaction } from "@/types/database";

export class InsufficientBalanceError extends Error {
  constructor(balance: number, amount: number) {
    super(`Insufficient balance: have ${balance}, need ${Math.abs(amount)}`);
    this.name = "InsufficientBalanceError";
  }
}

interface AwardParams {
  supabase: SupabaseClient;
  classId: string;
  studentId: string;
  amount: number;
  reason: string;
  category: TransactionCategory;
  sourceId?: string;
  createdBy?: string;
  skipJobMultiplier?: boolean;
  mysteryMultiplier?: number;
}

export async function awardCoins({
  supabase,
  classId,
  studentId,
  amount,
  reason,
  category,
  sourceId,
  createdBy,
  skipJobMultiplier,
  mysteryMultiplier,
}: AwardParams): Promise<EconomyTransaction> {
  const baseAmount = amount;
  let jobMultiplier = 1;
  const mystMult = mysteryMultiplier || 1;

  // Look up job multiplier unless skipped
  if (!skipJobMultiplier && amount > 0) {
    const { data: student } = await supabase
      .from("students")
      .select("active_job_multiplier")
      .eq("id", studentId)
      .single();

    if (student && student.active_job_multiplier > 1) {
      jobMultiplier = Number(student.active_job_multiplier);
    }
  }

  const finalAmount = amount > 0
    ? Math.floor(baseAmount * jobMultiplier * mystMult)
    : amount; // Negative amounts (purchases) are not multiplied

  // Check negative balance setting if deducting
  if (finalAmount < 0) {
    const { data: settings } = await supabase
      .from("economy_settings")
      .select("negative_balance")
      .eq("class_id", classId)
      .maybeSingle();

    if (!settings?.negative_balance) {
      const { data: student } = await supabase
        .from("students")
        .select("coin_balance")
        .eq("id", studentId)
        .single();

      if (student && student.coin_balance + finalAmount < 0) {
        throw new InsufficientBalanceError(student.coin_balance, finalAmount);
      }
    }
  }

  // Atomically update balance
  const { data: newBalance, error: rpcErr } = await supabase.rpc(
    "increment_coin_balance",
    { p_student_id: studentId, p_amount: finalAmount }
  );

  if (rpcErr) throw new Error(`Failed to update balance: ${rpcErr.message}`);

  // Record transaction
  const { data: txn, error: txnErr } = await supabase
    .from("economy_transactions")
    .insert({
      class_id: classId,
      student_id: studentId,
      amount: finalAmount,
      base_amount: baseAmount,
      job_multiplier: jobMultiplier,
      mystery_multiplier: mystMult,
      balance_after: newBalance as number,
      reason,
      category,
      source_id: sourceId || null,
      created_by: createdBy || null,
    })
    .select()
    .single();

  if (txnErr) throw new Error(`Failed to record transaction: ${txnErr.message}`);

  return txn as EconomyTransaction;
}

export async function bulkAwardCoins({
  supabase,
  classId,
  amount,
  reason,
  createdBy,
}: {
  supabase: SupabaseClient;
  classId: string;
  amount: number;
  reason: string;
  createdBy: string;
}): Promise<EconomyTransaction[]> {
  const { data: students } = await supabase
    .from("students")
    .select("id")
    .eq("class_id", classId)
    .is("archived_at", null);

  if (!students || students.length === 0) return [];

  const txns: EconomyTransaction[] = [];
  for (const student of students) {
    const txn = await awardCoins({
      supabase,
      classId,
      studentId: student.id,
      amount,
      reason,
      category: "bulk",
      createdBy,
    });
    txns.push(txn);
  }

  return txns;
}

export async function processPurchase({
  supabase,
  classId,
  studentId,
  price,
  itemTitle,
  purchaseRequestId,
}: {
  supabase: SupabaseClient;
  classId: string;
  studentId: string;
  price: number;
  itemTitle: string;
  purchaseRequestId: string;
}): Promise<EconomyTransaction> {
  return awardCoins({
    supabase,
    classId,
    studentId,
    amount: -price,
    reason: `Purchased: ${itemTitle}`,
    category: "purchase",
    sourceId: purchaseRequestId,
    skipJobMultiplier: true,
  });
}

export async function refundPurchase({
  supabase,
  classId,
  studentId,
  price,
  itemTitle,
  purchaseRequestId,
}: {
  supabase: SupabaseClient;
  classId: string;
  studentId: string;
  price: number;
  itemTitle: string;
  purchaseRequestId: string;
}): Promise<EconomyTransaction> {
  return awardCoins({
    supabase,
    classId,
    studentId,
    amount: price,
    reason: `Refund: ${itemTitle}`,
    category: "purchase_refund",
    sourceId: purchaseRequestId,
    skipJobMultiplier: true,
  });
}

export async function getBalance(
  supabase: SupabaseClient,
  studentId: string
): Promise<number> {
  const { data } = await supabase
    .from("students")
    .select("coin_balance")
    .eq("id", studentId)
    .single();

  return data?.coin_balance ?? 0;
}
