import type { SupabaseClient } from "@supabase/supabase-js";
import type { MysteryStudentRecord } from "@/types/database";
import { awardCoins } from "./transactions";

export async function selectMysteryStudent(
  supabase: SupabaseClient,
  classId: string,
  multiplier = 3
): Promise<MysteryStudentRecord> {
  const today = new Date().toISOString().split("T")[0];

  // Check no record exists for today
  const { data: existing } = await supabase
    .from("mystery_student_records")
    .select("id")
    .eq("class_id", classId)
    .eq("date", today)
    .maybeSingle();

  if (existing) throw new Error("Mystery student already selected for today");

  // Get present students
  const { data: students } = await supabase
    .from("students")
    .select("id")
    .eq("class_id", classId)
    .is("archived_at", null)
    .in("daily_status", ["present", "tardy", "remote"]);

  if (!students || students.length === 0) {
    throw new Error("No present students to select from");
  }

  // Get yesterday's winner to exclude
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const { data: yesterdayRecord } = await supabase
    .from("mystery_student_records")
    .select("selected_student_id")
    .eq("class_id", classId)
    .eq("date", yesterdayStr)
    .maybeSingle();

  // Get recent winners (last 14 days) for weighting
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  const { data: recentRecords } = await supabase
    .from("mystery_student_records")
    .select("selected_student_id")
    .eq("class_id", classId)
    .gte("date", twoWeeksAgo.toISOString().split("T")[0]);

  const recentWinnerCounts: Record<string, number> = {};
  for (const r of recentRecords || []) {
    recentWinnerCounts[r.selected_student_id] = (recentWinnerCounts[r.selected_student_id] || 0) + 1;
  }

  // Build weighted candidates (exclude yesterday's winner)
  const candidates = students.filter(
    (s) => s.id !== yesterdayRecord?.selected_student_id
  );

  if (candidates.length === 0) {
    // If only one student and they won yesterday, allow them
    candidates.push(...students);
  }

  // Weight: fewer recent wins = higher weight
  const maxRecent = Math.max(1, ...Object.values(recentWinnerCounts));
  const weights = candidates.map((s) => {
    const wins = recentWinnerCounts[s.id] || 0;
    return maxRecent - wins + 1; // More weight for fewer wins
  });

  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let rand = Math.random() * totalWeight;
  let selectedIdx = 0;
  for (let i = 0; i < weights.length; i++) {
    rand -= weights[i];
    if (rand <= 0) {
      selectedIdx = i;
      break;
    }
  }

  const selectedId = candidates[selectedIdx].id;

  const { data: record, error } = await supabase
    .from("mystery_student_records")
    .insert({
      class_id: classId,
      date: today,
      selected_student_id: selectedId,
      multiplier,
    })
    .select("*, students:selected_student_id(id, display_name)")
    .single();

  if (error) throw new Error(error.message);

  return {
    ...record,
    student: record.students || null,
    students: undefined,
  } as unknown as MysteryStudentRecord;
}

export async function revealMysteryStudent(
  supabase: SupabaseClient,
  classId: string,
  date?: string,
  teacherNote?: string
): Promise<MysteryStudentRecord> {
  const targetDate = date || new Date().toISOString().split("T")[0];

  const { data: record } = await supabase
    .from("mystery_student_records")
    .select("*")
    .eq("class_id", classId)
    .eq("date", targetDate)
    .single();

  if (!record) throw new Error("No mystery student record for this date");
  if (record.revealed_at) throw new Error("Already revealed");

  // Calculate day's earnings (sum of positive transactions today)
  const { data: txns } = await supabase
    .from("economy_transactions")
    .select("amount")
    .eq("student_id", record.selected_student_id)
    .eq("class_id", classId)
    .gt("amount", 0)
    .gte("created_at", `${targetDate}T00:00:00`)
    .lt("created_at", `${targetDate}T23:59:59`);

  const dayEarnings = (txns || []).reduce((sum, t) => sum + t.amount, 0);
  const bonusPayout = Math.floor(dayEarnings * (record.multiplier - 1));

  // Award bonus if any
  if (bonusPayout > 0) {
    await awardCoins({
      supabase,
      classId,
      studentId: record.selected_student_id,
      amount: bonusPayout,
      reason: "Mystery Student bonus!",
      category: "mystery_bonus",
      sourceId: record.id,
      skipJobMultiplier: true,
    });
  }

  // Update record
  const { data: updated, error } = await supabase
    .from("mystery_student_records")
    .update({
      revealed_at: new Date().toISOString(),
      day_earnings_before: dayEarnings,
      bonus_payout: bonusPayout,
      teacher_note: teacherNote || null,
    })
    .eq("id", record.id)
    .select("*, students:selected_student_id(id, display_name)")
    .single();

  if (error) throw new Error(error.message);

  return {
    ...updated,
    student: updated.students || null,
    students: undefined,
  } as unknown as MysteryStudentRecord;
}

export async function getTodayMystery(
  supabase: SupabaseClient,
  classId: string
): Promise<MysteryStudentRecord | null> {
  const today = new Date().toISOString().split("T")[0];

  const { data } = await supabase
    .from("mystery_student_records")
    .select("*, students:selected_student_id(id, display_name)")
    .eq("class_id", classId)
    .eq("date", today)
    .maybeSingle();

  if (!data) return null;

  return {
    ...data,
    student: data.students || null,
    students: undefined,
  } as unknown as MysteryStudentRecord;
}
