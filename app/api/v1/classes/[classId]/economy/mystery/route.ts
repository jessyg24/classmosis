import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod/v4";
import { selectMysteryStudent, getTodayMystery } from "@/lib/economy";

const selectSchema = z.object({
  multiplier: z.number().min(1).max(10).default(3),
});

export async function GET(
  _request: Request,
  { params }: { params: { classId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const record = await getTodayMystery(supabase, params.classId);
    return NextResponse.json(record);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { classId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const parsed = selectSchema.safeParse(body);
  const multiplier = parsed.success ? parsed.data.multiplier : 3;

  try {
    const record = await selectMysteryStudent(supabase, params.classId, multiplier);
    return NextResponse.json(record, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
