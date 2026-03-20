import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rotateJobs } from "@/lib/economy";

export async function POST(
  _request: Request,
  { params }: { params: { classId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await rotateJobs(supabase, params.classId);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
