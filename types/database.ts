// Classmosis Database Types
// These mirror the Supabase schema and will eventually be auto-generated

export type Subject = "ELA" | "Math" | "Science" | "Social Studies" | "Multi-subject" | "Other";
export type GradeBand = "K-2" | "3-5" | "6-8";
export type DailyStatus = "present" | "absent" | "tardy" | "early_release" | "remote";
export type GradingScaleType = "points" | "percentage" | "letter" | "standards" | "mastery" | "custom";
export type MissingValue = "zero" | "empty" | "exclude" | "incomplete";

export interface School {
  id: string;
  name: string;
  district: string | null;
  timezone: string;
  state: string | null;
  admin_id: string;
  created_at: string;
  settings: Record<string, unknown>;
}

export interface Class {
  id: string;
  teacher_id: string;
  school_id: string | null;
  name: string;
  subject: Subject;
  grade_band: GradeBand;
  grading_scale_id: string | null;
  currency_name: string;
  currency_icon: string;
  theme: string | null;
  academic_year: string | null;
  created_at: string;
  archived_at: string | null;
}

export interface Student {
  id: string;
  class_id: string;
  display_name: string;
  pin_hash: string;
  google_id: string | null;
  coin_balance: number;
  streak_count: number;
  grade_level: string | null;
  display_level: string | null;
  iep_flag: boolean;
  flag_504: boolean;
  gate_flag: boolean;
  ell_flag: boolean;
  daily_status: DailyStatus;
  created_at: string;
  archived_at: string | null;
}

export interface GradingScale {
  id: string;
  class_id: string;
  type: GradingScaleType;
  thresholds: Array<{ min_pct: number; max_pct: number; label: string }>;
  labels: string[];
  drop_lowest: number;
  missing_value: MissingValue;
}

export interface GradingPeriod {
  id: string;
  class_id: string;
  name: string;
  starts_at: string;
  ends_at: string;
  locked: boolean;
  locked_at: string | null;
  locked_by: string | null;
}

export interface ClassCode {
  id: string;
  class_id: string;
  code: string;
  date: string;
  created_at: string;
}

// Teacher profile (extends Supabase auth.users via user_metadata)
export interface TeacherProfile {
  id: string;
  email: string;
  display_name: string;
  school_name: string | null;
  state: string | null;
  onboarding_completed: boolean;
}
