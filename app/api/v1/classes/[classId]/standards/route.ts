import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod/v4";

const createStandardSchema = z.object({
  code: z.string().min(1),
  description: z.string().min(1),
  subject: z.enum(["ELA", "Math", "Science", "Social Studies", "Multi-subject", "Other"]),
  grade_band: z.enum(["K-2", "3-5", "6-8"]),
  domain: z.string().min(1),
  sort_key: z.string().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: { classId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { classId } = params;
  const url = new URL(request.url);
  const domainFilter = url.searchParams.get("domain");

  // Get class subject + grade_band to filter relevant global standards
  const { data: cls, error: clsErr } = await supabase
    .from("classes")
    .select("subject, grade_band")
    .eq("id", classId)
    .single();

  if (clsErr || !cls) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  // Fetch global standards matching class subject+grade_band + class-scoped custom standards
  let query = supabase
    .from("standards")
    .select("*")
    .or(`class_id.is.null,class_id.eq.${classId}`)
    .in("subject", [cls.subject, "Multi-subject"])
    .eq("grade_band", cls.grade_band)
    .order("sort_key");

  if (domainFilter) {
    query = query.eq("domain", domainFilter);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data || []);
}

export async function POST(
  request: Request,
  { params }: { params: { classId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { classId } = params;
  const body = await request.json();
  const parsed = createStandardSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("standards")
    .insert({
      class_id: classId,
      code: parsed.data.code,
      description: parsed.data.description,
      subject: parsed.data.subject,
      grade_band: parsed.data.grade_band,
      domain: parsed.data.domain,
      sort_key: parsed.data.sort_key || `CUSTOM-${parsed.data.code}`,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}
