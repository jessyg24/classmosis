import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod/v4";

const linkStandardsSchema = z.object({
  standard_ids: z.array(z.string().uuid()),
});

export async function GET(
  _request: Request,
  { params }: { params: { classId: string; assignmentId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { assignmentId } = params;

  const { data, error } = await supabase
    .from("assignment_standards")
    .select("*, standards(*)")
    .eq("assignment_id", assignmentId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data || []);
}

export async function PUT(
  request: Request,
  { params }: { params: { classId: string; assignmentId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { assignmentId } = params;
  const body = await request.json();
  const parsed = linkStandardsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  // Delete existing links
  await supabase
    .from("assignment_standards")
    .delete()
    .eq("assignment_id", assignmentId);

  // Insert new links
  if (parsed.data.standard_ids.length > 0) {
    const rows = parsed.data.standard_ids.map((sid) => ({
      assignment_id: assignmentId,
      standard_id: sid,
    }));

    const { error } = await supabase
      .from("assignment_standards")
      .insert(rows);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Return updated links
  const { data } = await supabase
    .from("assignment_standards")
    .select("*, standards(*)")
    .eq("assignment_id", assignmentId);

  return NextResponse.json(data || []);
}
