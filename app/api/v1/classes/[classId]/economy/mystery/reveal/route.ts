import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod/v4";
import { revealMysteryStudent } from "@/lib/economy";

const revealSchema = z.object({
  date: z.string().optional(),
  teacher_note: z.string().max(500).optional(),
});

export async function POST(
  request: Request,
  { params }: { params: { classId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const parsed = revealSchema.safeParse(body);

  try {
    const record = await revealMysteryStudent(
      supabase,
      params.classId,
      parsed.success ? parsed.data.date : undefined,
      parsed.success ? parsed.data.teacher_note : undefined
    );
    return NextResponse.json(record);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
