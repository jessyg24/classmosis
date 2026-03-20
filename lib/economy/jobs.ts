import type { SupabaseClient } from "@supabase/supabase-js";
import type { ClassJob } from "@/types/database";

export async function getClassJobs(
  supabase: SupabaseClient,
  classId: string
): Promise<ClassJob[]> {
  const { data, error } = await supabase
    .from("class_jobs")
    .select("*, students:current_holder_id(id, display_name)")
    .eq("class_id", classId)
    .order("sort_order");

  if (error) throw new Error(error.message);

  return (data || []).map((j) => ({
    ...j,
    current_holder: j.students || null,
    students: undefined,
  })) as unknown as ClassJob[];
}

export async function assignJob(
  supabase: SupabaseClient,
  jobId: string,
  studentId: string
): Promise<void> {
  // Get job details
  const { data: job } = await supabase
    .from("class_jobs")
    .select("id, coin_multiplier, current_holder_id")
    .eq("id", jobId)
    .single();

  if (!job) throw new Error("Job not found");

  // Clear previous holder
  if (job.current_holder_id) {
    await supabase
      .from("students")
      .update({ active_job_id: null, active_job_multiplier: 1.00 })
      .eq("active_job_id", jobId);
  }

  // Set new holder
  await supabase
    .from("students")
    .update({ active_job_id: jobId, active_job_multiplier: job.coin_multiplier })
    .eq("id", studentId);

  // Update job
  await supabase
    .from("class_jobs")
    .update({ current_holder_id: studentId })
    .eq("id", jobId);
}

export async function unassignJob(
  supabase: SupabaseClient,
  jobId: string
): Promise<void> {
  // Clear holder's active job
  await supabase
    .from("students")
    .update({ active_job_id: null, active_job_multiplier: 1.00 })
    .eq("active_job_id", jobId);

  // Clear job holder
  await supabase
    .from("class_jobs")
    .update({ current_holder_id: null })
    .eq("id", jobId);
}

export async function rotateJobs(
  supabase: SupabaseClient,
  classId: string
): Promise<void> {
  // Get all active auto-rotation jobs
  const { data: jobs } = await supabase
    .from("class_jobs")
    .select("id, rotation, current_holder_id, coin_multiplier")
    .eq("class_id", classId)
    .eq("active", true)
    .in("rotation", ["daily", "weekly", "random"]);

  if (!jobs || jobs.length === 0) return;

  // Get all available students
  const { data: students } = await supabase
    .from("students")
    .select("id")
    .eq("class_id", classId)
    .is("archived_at", null);

  if (!students || students.length === 0) return;

  const studentIds = students.map((s) => s.id);

  for (const job of jobs) {
    // Pick a random student different from current holder
    const candidates = studentIds.filter((id) => id !== job.current_holder_id);
    if (candidates.length === 0) continue;

    const newHolderId = candidates[Math.floor(Math.random() * candidates.length)];
    await assignJob(supabase, job.id, newHolderId);
  }
}
