import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod/v4";
import { randomUUID } from "crypto";

const inviteSchema = z.object({
  student_id: z.string().uuid(),
  guardian_email: z.string().email(),
  relationship: z.string().min(1).max(50).default("guardian"),
  custody_restricted: z.boolean().default(false),
});

export async function POST(
  request: Request,
  { params }: { params: { classId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = inviteSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues }, { status: 400 });

  // Verify student belongs to this class
  const { data: student } = await supabase
    .from("students")
    .select("id, display_name")
    .eq("id", parsed.data.student_id)
    .eq("class_id", params.classId)
    .single();

  if (!student) return NextResponse.json({ error: "Student not found in this class" }, { status: 404 });

  // Check guardian count
  const { count } = await supabase
    .from("parent_guardians")
    .select("*", { count: "exact", head: true })
    .eq("student_id", parsed.data.student_id);

  if ((count || 0) >= 3) {
    return NextResponse.json({ error: "Maximum 3 guardians per student" }, { status: 400 });
  }

  const inviteToken = randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const { data: guardian, error } = await supabase
    .from("parent_guardians")
    .insert({
      student_id: parsed.data.student_id,
      relationship: parsed.data.relationship,
      custody_restricted: parsed.data.custody_restricted,
      invite_token: inviteToken,
      invite_expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || "https://classmosis.com"}/family/join?token=${inviteToken}`;

  return NextResponse.json({
    guardian,
    invite_link: inviteLink,
    guardian_email: parsed.data.guardian_email,
    student_name: student.display_name,
  }, { status: 201 });
}
