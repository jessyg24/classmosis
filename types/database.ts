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
  coin_balance: number;
  streak_count: number;
  grade_level: string | null;
  display_level: string | null;
  iep_flag: boolean;
  flag_504: boolean;
  gate_flag: boolean;
  ell_flag: boolean;
  daily_status: DailyStatus;
  active_job_id: string | null;
  active_job_multiplier: number;
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

// Block type is now a free string — validated against the 44-block catalog in TypeScript
export type BlockType = string;
export type DayType = "normal" | "minimum_day" | "testing" | "field_trip" | "assembly" | "substitute";
export type TimerBehavior = "auto_start" | "manual" | "none";

// Insert/sub-routine type is now a free string — validated against the 63-subroutine catalog
export type InsertType = string;

export interface StudentViewSettings {
  show_sub_routines_in_full_day: boolean;
  student_can_see_ahead: "all" | "current_and_next" | "current_only";
  full_day_view_available: boolean;
}

export interface Insert {
  id: string;
  type: InsertType;
  label: string;
  duration_minutes: number | null;
  order_index: number;
  settings: Record<string, unknown> | null;
  supports?: Record<string, boolean> | null;
  student_view_description?: string | null;
}

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
  inserts: Insert[];
  is_instructional: boolean;
  non_instructional_message: string | null;
  subject_description: string | null;
  student_view_settings: StudentViewSettings;
  category: string | null;
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

// ============================================================
// Standards Types (Sprint 5)
// ============================================================

export type MasteryLevel = "building" | "almost_there" | "got_it" | "crushed_it";

export interface Standard {
  id: string;
  class_id: string | null;
  code: string;
  description: string;
  subject: Subject;
  grade_band: GradeBand;
  domain: string;
  sort_key: string;
  created_at: string;
}

export interface AssignmentStandard {
  id: string;
  assignment_id: string;
  standard_id: string;
  standard?: Standard;
}

export interface StudentMastery {
  id: string;
  student_id: string;
  standard_id: string;
  attempts: number;
  avg_pct: number | null;
  mastery_level: MasteryLevel;
  last_assessed_at: string | null;
  updated_at: string;
  standard?: Standard;
  student?: Pick<Student, "id" | "display_name">;
}

// ============================================================
// Economy Types (Sprint 6)
// ============================================================

export type TransactionCategory =
  | "manual"
  | "block_reward"
  | "purchase"
  | "purchase_refund"
  | "bulk"
  | "adjustment"
  | "todo_complete"
  | "mystery_bonus";

export type PurchaseStatus = "pending" | "approved" | "denied" | "cancelled";

export interface EconomyTransaction {
  id: string;
  class_id: string;
  student_id: string;
  amount: number;
  balance_after: number;
  reason: string;
  category: TransactionCategory;
  source_id: string | null;
  created_by: string | null;
  base_amount: number;
  job_multiplier: number;
  mystery_multiplier: number;
  created_at: string;
  student?: Pick<Student, "id" | "display_name">;
}

export interface RewardStoreItem {
  id: string;
  class_id: string;
  title: string;
  description: string | null;
  price: number;
  icon: string;
  stock: number | null;
  active: boolean;
  sort_order: number;
  created_at: string;
}

export interface PurchaseRequest {
  id: string;
  class_id: string;
  student_id: string;
  item_id: string;
  price_at_request: number;
  status: PurchaseStatus;
  teacher_note: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  fulfilled: boolean;
  fulfilled_at: string | null;
  created_at: string;
  student?: Pick<Student, "id" | "display_name">;
  item?: Pick<RewardStoreItem, "id" | "title" | "icon" | "price">;
}

export interface EconomySettings {
  id: string;
  class_id: string;
  leaderboard_visible: boolean;
  negative_balance: boolean;
  auto_approve: boolean;
  weekly_allowance: number;
  created_at: string;
}

export type JobRotation = "daily" | "weekly" | "teacher_assigned" | "random";

export interface ClassJob {
  id: string;
  class_id: string;
  title: string;
  description: string | null;
  coin_multiplier: number;
  rotation: JobRotation;
  current_holder_id: string | null;
  expires_at: string | null;
  active: boolean;
  sort_order: number;
  created_at: string;
  current_holder?: Pick<Student, "id" | "display_name">;
}

export interface MysteryStudentRecord {
  id: string;
  class_id: string;
  date: string;
  selected_student_id: string;
  day_earnings_before: number;
  multiplier: number;
  bonus_payout: number;
  revealed_at: string | null;
  teacher_note: string | null;
  created_at: string;
  student?: Pick<Student, "id" | "display_name">;
}

export type TodoSource = "student" | "teacher";

export interface TodoItem {
  id: string;
  student_id: string;
  class_id: string;
  title: string;
  source: TodoSource;
  coin_eligible: boolean;
  coins_on_complete: number;
  completed: boolean;
  completed_at: string | null;
  due_date: string | null;
  created_at: string;
  student?: Pick<Student, "id" | "display_name">;
}

// ============================================================
// Practice Types (Sprint 7)
// ============================================================

export type QuestionType = "multiple_choice" | "true_false" | "short_answer";
export type PracticeSessionStatus = "in_progress" | "completed" | "abandoned";

export interface PracticeSet {
  id: string;
  class_id: string;
  title: string;
  description: string | null;
  published: boolean;
  shuffle_questions: boolean;
  allow_retries: boolean;
  show_correct_after: boolean;
  coins_reward: number;
  created_at: string;
  updated_at: string;
  standards?: Standard[];
  question_count?: number;
}

export interface PracticeSetStandard {
  id: string;
  practice_set_id: string;
  standard_id: string;
  standard?: Standard;
}

export interface PracticeQuestion {
  id: string;
  practice_set_id: string;
  question_type: QuestionType;
  prompt: string;
  options: string[] | null;
  correct_answer: string;
  explanation: string | null;
  order_index: number;
  ai_generated: boolean;
  created_at: string;
}

export interface PracticeSession {
  id: string;
  student_id: string;
  practice_set_id: string;
  status: PracticeSessionStatus;
  total_questions: number;
  correct_count: number;
  pct_score: number | null;
  started_at: string;
  completed_at: string | null;
  coins_awarded: number;
  practice_set?: PracticeSet;
  student?: Pick<Student, "id" | "display_name">;
}

export interface PracticeResponse {
  id: string;
  session_id: string;
  question_id: string;
  student_answer: string;
  is_correct: boolean;
  answered_at: string;
}

// ============================================================
// AI Types (Sprint 5)
// ============================================================

export interface AiScoreDraft {
  id: string;
  submission_id: string;
  rubric_id: string;
  category_scores: Array<{
    category_id: string;
    name: string;
    points_awarded: number;
    max: number;
    reasoning: string;
    confidence: number;
  }>;
  total_raw: number;
  total_pct: number;
  model_version: string;
  generated_at: string;
  flagged_for_review: boolean;
  flag_reason: string | null;
  teacher_action: "pending" | "approved" | "edited" | "rejected";
  teacher_acted_at: string | null;
  created_at: string;
}

export interface AiUsage {
  id: string;
  teacher_id: string;
  class_id: string;
  date: string;
  call_count: number;
  call_type: string;
  created_at: string;
}

export interface RubricTemplate {
  id: string;
  title: string;
  description: string | null;
  subject: Subject;
  grade_band: GradeBand;
  assignment_type: string;
  total_points: number;
  categories: Array<{
    name: string;
    max_points: number;
    weight_pct: number;
    descriptors: Record<string, string>;
  }>;
  standard_codes: string[] | null;
  ai_generated: boolean;
  contributed_by: string | null;
  usage_count: number;
  created_at: string;
}

export interface ProblemBankItem {
  id: string;
  subject: Subject;
  grade_band: GradeBand;
  standard_code: string | null;
  question_type: QuestionType;
  difficulty: number;
  prompt: string;
  options: string[] | null;
  correct_answer: string;
  explanation: string | null;
  hint: string | null;
  ai_generated: boolean;
  contributed_by: string | null;
  usage_count: number;
  created_at: string;
}

export interface FeedbackTemplate {
  id: string;
  subject: Subject;
  grade_band: GradeBand;
  score_range: "low" | "mid" | "high";
  template: string;
  ai_generated: boolean;
  created_at: string;
}

// ============================================================
// Parent Guardian Types (Sprint 6)
// ============================================================

export interface ParentGuardian {
  id: string;
  user_id: string | null;
  student_id: string;
  relationship: string;
  preferred_language: string;
  notification_preferences: {
    weekly_digest: boolean;
    grade_alert: boolean;
    missing_alert: boolean;
  };
  custody_restricted: boolean;
  invite_token: string | null;
  invite_expires_at: string | null;
  accepted_at: string | null;
  created_at: string;
  student?: Pick<Student, "id" | "display_name" | "coin_balance" | "streak_count">;
}

// ============================================================
// Brain Break Bank + Student Schedule Events
// ============================================================

export type BrainBreakCategory = "movement" | "breathing" | "dance" | "game" | "stretch" | "mindfulness" | "creative" | "custom";

export interface BrainBreakItem {
  id: string;
  title: string;
  description: string | null;
  category: BrainBreakCategory;
  duration_minutes: number;
  video_url: string | null;
  is_seed: boolean;
  contributed_by: string | null;
  usage_count: number;
  created_at: string;
}

export type StudentEventType = "pull_out" | "support" | "therapy" | "enrichment" | "assessment" | "custom";

export interface StudentScheduleEvent {
  id: string;
  class_id: string;
  title: string;
  description: string | null;
  event_type: StudentEventType;
  days_of_week: string[];
  start_time: string;
  duration_minutes: number;
  location: string | null;
  provider: string | null;
  active: boolean;
  created_at: string;
  assigned_students?: Array<Pick<Student, "id" | "display_name">>;
}

export interface StudentEventAssignment {
  id: string;
  event_id: string;
  student_id: string;
}

// ============================================================
// Subscription / Billing Types (Sprint 7)
// ============================================================

export type SubscriptionTier = "free" | "pro";
export type SubscriptionStatus = "active" | "trialing" | "past_due" | "canceled" | "unpaid" | "incomplete";
export type BillingInterval = "month" | "year";

export interface Subscription {
  id: string;
  teacher_id: string;
  tier: SubscriptionTier;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  status: SubscriptionStatus;
  billing_interval: BillingInterval | null;
  trial_ends_at: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
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
