import { createClient } from "./server";
import type { ParentGuardian } from "@/types/database";

export async function getParentGuardians(): Promise<ParentGuardian[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("parent_guardians")
    .select("*, students(id, display_name, coin_balance, streak_count, class_id)")
    .eq("user_id", user.id)
    .not("accepted_at", "is", null);

  return (data || []) as unknown as ParentGuardian[];
}

export async function verifyParentAccess(studentId: string): Promise<ParentGuardian | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("parent_guardians")
    .select("*")
    .eq("user_id", user.id)
    .eq("student_id", studentId)
    .not("accepted_at", "is", null)
    .maybeSingle();

  return data as ParentGuardian | null;
}
