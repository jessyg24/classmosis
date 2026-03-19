import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateClassCode } from "@/lib/utils/pin";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  const { classId } = await params;
  const supabase = await createClient();

  // Verify auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify class ownership
  const { data: cls } = await supabase
    .from("classes")
    .select("id")
    .eq("id", classId)
    .eq("teacher_id", user.id)
    .single();

  if (!cls) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  const today = new Date().toISOString().split("T")[0];

  // Check if code already exists for today
  const { data: existing } = await supabase
    .from("class_codes")
    .select("code")
    .eq("class_id", classId)
    .eq("date", today)
    .limit(1);

  if (existing && existing.length > 0) {
    return NextResponse.json({ code: existing[0].code });
  }

  // Generate unique code — retry if collision
  let code = generateClassCode();
  let attempts = 0;

  while (attempts < 10) {
    const { error } = await supabase.from("class_codes").insert({
      class_id: classId,
      code,
      date: today,
    });

    if (!error) {
      return NextResponse.json({ code });
    }

    // Unique constraint violation — try another code
    code = generateClassCode();
    attempts++;
  }

  return NextResponse.json(
    { error: "Failed to generate unique code" },
    { status: 500 }
  );
}
