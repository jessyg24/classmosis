import type { SupabaseClient } from "@supabase/supabase-js";
import type { EconomyTransaction } from "@/types/database";
import { awardCoins } from "./transactions";

export async function processBlockTrigger({
  supabase,
  classId,
  blockId,
  blockLabel,
  trigger,
  presentStudentIds,
  createdBy,
}: {
  supabase: SupabaseClient;
  classId: string;
  blockId: string;
  blockLabel: string;
  trigger: { coins: number; trigger_type: string };
  presentStudentIds: string[];
  createdBy: string;
}): Promise<EconomyTransaction[]> {
  if (trigger.coins <= 0 || presentStudentIds.length === 0) return [];

  const txns: EconomyTransaction[] = [];
  for (const studentId of presentStudentIds) {
    const txn = await awardCoins({
      supabase,
      classId,
      studentId,
      amount: trigger.coins,
      reason: `Block reward: ${blockLabel}`,
      category: "block_reward",
      sourceId: blockId,
      createdBy,
    });
    txns.push(txn);
  }

  return txns;
}
