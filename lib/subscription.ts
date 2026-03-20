import type { SupabaseClient } from "@supabase/supabase-js";
import type { SubscriptionTier, Subscription } from "@/types/database";

// Feature-to-tier mapping
export const FEATURE_TIER_MAP = {
  ai_grading: "pro",
  ai_rubric_gen: "pro",
  ai_practice_gen: "pro",
  ai_feedback: "pro",
  parent_portal: "pro",
  mystery_student: "pro",
  class_jobs: "pro",
  unlimited_classes: "pro",
  unlimited_students: "pro",
} as const;

export type FeatureKey = keyof typeof FEATURE_TIER_MAP;

export const FREE_LIMITS = {
  MAX_CLASSES: 3,
  MAX_STUDENTS_PER_CLASS: 30,
} as const;

export async function getTeacherTier(
  supabase: SupabaseClient,
  teacherId: string
): Promise<SubscriptionTier> {
  const { data } = await supabase
    .from("subscriptions")
    .select("tier, status")
    .eq("teacher_id", teacherId)
    .single();

  if (!data) return "free";

  if (data.tier === "pro" && (data.status === "active" || data.status === "trialing")) {
    return "pro";
  }

  return "free";
}

export async function checkFeatureAccess(
  supabase: SupabaseClient,
  teacherId: string,
  feature: FeatureKey
): Promise<{ allowed: boolean; requiredTier: SubscriptionTier }> {
  const requiredTier = FEATURE_TIER_MAP[feature] as SubscriptionTier;
  if (!requiredTier || requiredTier === "free") {
    return { allowed: true, requiredTier: "free" };
  }

  const currentTier = await getTeacherTier(supabase, teacherId);
  return { allowed: currentTier === "pro", requiredTier };
}

export async function checkClassLimit(
  supabase: SupabaseClient,
  teacherId: string
): Promise<{ allowed: boolean; current: number; max: number | null }> {
  const tier = await getTeacherTier(supabase, teacherId);
  if (tier === "pro") return { allowed: true, current: 0, max: null };

  const { count } = await supabase
    .from("classes")
    .select("id", { count: "exact", head: true })
    .eq("teacher_id", teacherId)
    .is("archived_at", null);

  const current = count || 0;
  return { allowed: current < FREE_LIMITS.MAX_CLASSES, current, max: FREE_LIMITS.MAX_CLASSES };
}

export async function checkStudentLimit(
  supabase: SupabaseClient,
  teacherId: string,
  classId: string
): Promise<{ allowed: boolean; current: number; max: number | null }> {
  const tier = await getTeacherTier(supabase, teacherId);
  if (tier === "pro") return { allowed: true, current: 0, max: null };

  const { count } = await supabase
    .from("students")
    .select("id", { count: "exact", head: true })
    .eq("class_id", classId)
    .is("archived_at", null);

  const current = count || 0;
  return { allowed: current < FREE_LIMITS.MAX_STUDENTS_PER_CLASS, current, max: FREE_LIMITS.MAX_STUDENTS_PER_CLASS };
}

export async function getSubscription(
  supabase: SupabaseClient,
  teacherId: string
): Promise<Subscription | null> {
  const { data } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("teacher_id", teacherId)
    .single();

  return data as Subscription | null;
}
