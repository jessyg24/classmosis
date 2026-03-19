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

export type BlockType = "routine" | "academic" | "assessment" | "economy" | "flex" | "rotation";
export type DayType = "normal" | "minimum_day" | "testing" | "field_trip" | "assembly" | "substitute";
export type TimerBehavior = "auto_start" | "manual" | "none";

export interface Schedule {
  id: string;
  class_id: string;
  date: string;
  class_code: string | null;
  published: boolean;
  published_at: string | null;
  template_id: string | null;
  day_type: DayType;
  created_at: string;
}

export interface Block {
  id: string;
  schedule_id: string;
  type: BlockType;
  label: string;
  duration_minutes: number;
  order_index: number;
  start_time: string | null;
  notes: string | null;
  timer_behavior: TimerBehavior;
  timer_warning_minutes: number;
  external_link: { url: string; platform_name: string; icon?: string } | null;
  economy_trigger: { coins: number; trigger_type: string } | null;
  visible_to_students: boolean;
  created_at: string;
}

export interface ScheduleTemplate {
  id: string;
  class_id: string;
  name: string;
  blocks_json: Array<Omit<Block, "id" | "schedule_id" | "created_at" | "start_time">>;
  created_at: string;
}

// ============================================================
// Grading Types (Sprint 3)
// ============================================================

export type AssignmentType = "classwork" | "homework" | "quiz" | "project" | "exit_ticket";
export type SubmissionStatus = "draft" | "submitted" | "graded" | "returned";
export type SubmissionContentType = "text" | "file" | "photo" | "url";

export interface Rubric {
  id: string;
  class_id: string;
  title: string;
  description: string | null;
  total_points: number;
  created_by: string;
  created_at: string;
  categories?: RubricCategory[];
}

export interface RubricCategory {
  id: string;
  rubric_id: string;
  name: string;
  max_points: number;
  weight_pct: number;
  descriptors: Record<string, string>;
  order_index: number;
  created_at: string;
}

export interface CategoryWeight {
  id: string;
  class_id: string;
  period_id: string | null;
  category_name: string;
  weight_pct: number;
}

export interface Assignment {
  id: string;
  class_id: string;
  block_id: string | null;
  title: string;
  instructions: string | null;
  type: AssignmentType;
  rubric_id: string | null;
  category: string;
  points_possible: number;
  due_at: string | null;
  extra_credit: boolean;
  make_up_eligible: boolean;
  published: boolean;
  created_at: string;
  rubric?: Rubric;
}

export interface Submission {
  id: string;
  student_id: string;
  assignment_id: string;
  content_type: SubmissionContentType;
  content: string | null;
  file_url: string | null;
  submitted_at: string;
  is_late: boolean;
  is_draft: boolean;
  revision_number: number;
  status: SubmissionStatus;
  created_at: string;
  student?: Pick<Student, "id" | "display_name">;
  teacher_grade?: TeacherGrade;
}

export interface TeacherGrade {
  id: string;
  submission_id: string;
  category_scores: Array<{ category_id: string; name: string; score: number; max: number }>;
  total_raw: number;
  total_pct: number;
  scale_label: string | null;
  overall_feedback: string | null;
  graded_by: string;
  graded_at: string;
}

export interface GradebookEntry {
  id: string;
  student_id: string;
  assignment_id: string;
  teacher_grade_id: string | null;
  period_id: string | null;
  category: string | null;
  raw_score: number | null;
  pct_score: number | null;
  display_label: string | null;
  is_missing: boolean;
  is_extra_credit: boolean;
  is_dropped: boolean;
  created_at: string;
}

export interface StudentFeedback {
  id: string;
  teacher_grade_id: string;
  student_id: string;
  viewed_at: string | null;
  proud_flag: boolean;
  student_reply: string | null;
  reply_at: string | null;
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
