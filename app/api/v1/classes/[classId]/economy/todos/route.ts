import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod/v4";

const createTodoSchema = z.object({
  student_id: z.string().uuid(),
  title: z.string().min(1).max(200),
  coin_eligible: z.boolean().default(false),
  coins_on_complete: z.number().int().min(0).default(0),
  due_date: z.string().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: { classId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const studentId = url.searchParams.get("student_id");
  const completed = url.searchParams.get("completed");

  let query = supabase
    .from("todo_items")
    .select("*, students(id, display_name)")
    .eq("class_id", params.classId)
    .order("created_at", { ascending: false });

  if (studentId) query = query.eq("student_id", studentId);
  if (completed !== null) query = query.eq("completed", completed === "true");

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

  const body = await request.json();
  const parsed = createTodoSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues }, { status: 400 });

  const { data, error } = await supabase
    .from("todo_items")
    .insert({
      class_id: params.classId,
      student_id: parsed.data.student_id,
      title: parsed.data.title,
      source: "teacher",
      coin_eligible: parsed.data.coin_eligible,
      coins_on_complete: parsed.data.coins_on_complete,
      due_date: parsed.data.due_date || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
