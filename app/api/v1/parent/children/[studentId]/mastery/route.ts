import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyParentAccess } from "@/lib/supabase/parent-auth";

// Plain language mastery labels for parents
const MASTERY_LABELS: Record<string, string> = {
  building: "Just getting started",
  almost_there: "Making great progress",
  got_it: "Has a solid understanding",
  crushed_it: "Has mastered this",
};

export async function GET(
  _request: Request,
  { params }: { params: { studentId: string } }
) {
  const guardian = await verifyParentAccess(params.studentId);
  if (!guardian) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = await createClient();

  const { data } = await supabase
    .from("student_mastery")
    .select("id, mastery_level, avg_pct, standards(description, domain)")
    .eq("student_id", params.studentId);

  // Group by domain with plain language
  const grouped: Record<string, Array<{
    description: string;
    level: string;
    plain_level: string;
  }>> = {};

  for (const row of (data || []) as unknown as Array<{ mastery_level: string; standards: { description: string; domain: string } | null }>) {
    if (!row.standards) continue;
    const domain = row.standards.domain;
    if (!grouped[domain]) grouped[domain] = [];
    grouped[domain].push({
      description: row.standards.description,
      level: row.mastery_level,
      plain_level: MASTERY_LABELS[row.mastery_level] || row.mastery_level,
    });
  }

  return NextResponse.json(grouped);
}
