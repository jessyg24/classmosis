import { NextResponse } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { verifyStudentSession } from "@/lib/supabase/student-auth";
import { z } from "zod/v4";

const submitSchema = z.object({
  assignment_id: z.string().uuid(),
  content_type: z.enum(["text", "file", "photo", "url"]),
  content: z.string().optional(),
});

export async function GET(request: Request) {
  const session = verifyStudentSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get student's submissions with grades (only returned ones show grades)
  const { data, error } = await supabase
    .from("submissions")
    .select("*, assignments(id, title, type, points_possible), teacher_grades(*), student_feedback(*)")
    .eq("student_id", session.studentId)
    .order("submitted_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Filter: only show grade/feedback for returned submissions
  const result = (data || []).map((s) => ({
    ...s,
    assignment: s.assignments,
    assignments: undefined,
    teacher_grade: s.status === "returned" ? s.teacher_grades : null,
    teacher_grades: undefined,
    feedback: s.status === "returned" ? s.student_feedback : null,
    student_feedback: undefined,
  }));

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const session = verifyStudentSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Handle file upload via FormData
  const contentType = request.headers.get("content-type") || "";
  let assignmentId: string;
  let submissionContentType: string;
  let content: string | null = null;
  let fileUrl: string | null = null;

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    assignmentId = formData.get("assignment_id") as string;
    submissionContentType = (formData.get("content_type") as string) || "file";
    const file = formData.get("file") as File | null;

    if (file) {
      const filePath = `${session.classId}/${session.studentId}/${assignmentId}/${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("submissions")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        return NextResponse.json({ error: uploadError.message }, { status: 500 });
      }

      const { data: urlData } = supabase.storage
        .from("submissions")
        .getPublicUrl(filePath);

      fileUrl = urlData.publicUrl;
    }
  } else {
    const body = await request.json();
    const parsed = submitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }
    assignmentId = parsed.data.assignment_id;
    submissionContentType = parsed.data.content_type;
    content = parsed.data.content || null;
  }

  // Check assignment exists and is published
  const { data: assignment } = await supabase
    .from("assignments")
    .select("id, due_at, class_id, published")
    .eq("id", assignmentId)
    .eq("class_id", session.classId)
    .eq("published", true)
    .single();

  if (!assignment) {
    return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
  }

  // Check if late
  const isLate = assignment.due_at ? new Date() > new Date(assignment.due_at) : false;

  // Check for existing submission (for revision tracking)
  const { data: existing } = await supabase
    .from("submissions")
    .select("revision_number")
    .eq("student_id", session.studentId)
    .eq("assignment_id", assignmentId)
    .order("revision_number", { ascending: false })
    .limit(1);

  const revisionNumber = existing && existing.length > 0 ? existing[0].revision_number + 1 : 1;

  const { data: submission, error } = await supabase
    .from("submissions")
    .insert({
      student_id: session.studentId,
      assignment_id: assignmentId,
      content_type: submissionContentType,
      content,
      file_url: fileUrl,
      is_late: isLate,
      revision_number: revisionNumber,
      status: "submitted",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Update gradebook entry to not missing
  await supabase
    .from("gradebook_entries")
    .update({ is_missing: false })
    .eq("student_id", session.studentId)
    .eq("assignment_id", assignmentId);

  return NextResponse.json(submission, { status: 201 });
}
