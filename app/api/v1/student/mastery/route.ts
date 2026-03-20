import { NextResponse } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { verifyStudentSession } from "@/lib/supabase/student-auth";

export async function GET(request: Request) {
  const session = verifyStudentSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("student_mastery")
    .select("*, standards(id, code, description, domain, sort_key)")
    .eq("student_id", session.studentId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Group by domain
  const grouped: Record<string, typeof data> = {};
  for (const row of data || []) {
    const domain = row.standards?.domain || "Other";
    if (!grouped[domain]) grouped[domain] = [];
    grouped[domain].push(row);
  }

  // Sort within each domain by sort_key
  for (const domain of Object.keys(grouped)) {
    grouped[domain].sort((a, b) =>
      (a.standards?.sort_key || "").localeCompare(b.standards?.sort_key || "")
    );
  }

  return NextResponse.json(grouped);
}
