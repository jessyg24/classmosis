import { NextResponse } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
  const body = await request.json();
  const { classCode, studentId } = body;

  if (!classCode || !studentId) {
    return NextResponse.json(
      { error: { code: "MISSING_FIELDS", message: "Class code and student ID are required." } },
      { status: 400 }
    );
  }

  // Use service role to bypass RLS
  const supabase = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Validate class code for today
  const today = new Date().toISOString().split("T")[0];
  const { data: codeRow } = await supabase
    .from("class_codes")
    .select("class_id")
    .eq("code", classCode)
    .eq("date", today)
    .single();

  if (!codeRow) {
    return NextResponse.json(
      { error: { code: "INVALID_CODE", message: "That class code isn't active today. Ask your teacher for today's code." } },
      { status: 401 }
    );
  }

  // Look up student — no PIN needed, just verify they're in this class
  const { data: student } = await supabase
    .from("students")
    .select("id, display_name, class_id, coin_balance")
    .eq("id", studentId)
    .eq("class_id", codeRow.class_id)
    .is("archived_at", null)
    .single();

  if (!student) {
    return NextResponse.json(
      { error: { code: "STUDENT_NOT_FOUND", message: "Student not found in this class." } },
      { status: 401 }
    );
  }

  // Get class name for the response
  const { data: cls } = await supabase
    .from("classes")
    .select("name")
    .eq("id", student.class_id)
    .single();

  // Generate JWT that expires at midnight tonight
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(23, 59, 59, 999);

  const token = jwt.sign(
    {
      studentId: student.id,
      classId: student.class_id,
      displayName: student.display_name,
    },
    process.env.STUDENT_JWT_SECRET!,
    { expiresIn: Math.floor((midnight.getTime() - now.getTime()) / 1000) }
  );

  const response = NextResponse.json({
    token,
    student: {
      id: student.id,
      displayName: student.display_name,
      className: cls?.name || "",
      classId: student.class_id,
      coinBalance: student.coin_balance,
    },
  });

  // Set HTTP-only cookie
  response.cookies.set("student_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: midnight,
  });

  return response;
}
