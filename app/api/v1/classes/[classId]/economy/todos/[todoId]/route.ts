import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod/v4";
import { completeTodo } from "@/lib/economy";

const updateTodoSchema = z.object({
  completed: z.boolean().optional(),
  title: z.string().min(1).max(200).optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: { classId: string; todoId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = updateTodoSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues }, { status: 400 });

  if (parsed.data.completed) {
    try {
      const todo = await completeTodo(supabase, params.todoId);
      return NextResponse.json(todo);
    } catch (err) {
      return NextResponse.json({ error: (err as Error).message }, { status: 400 });
    }
  }

  const { data, error } = await supabase
    .from("todo_items")
    .update(parsed.data)
    .eq("id", params.todoId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { classId: string; todoId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Only delete incomplete todos
  const { data: todo } = await supabase
    .from("todo_items")
    .select("completed")
    .eq("id", params.todoId)
    .single();

  if (todo?.completed) {
    return NextResponse.json({ error: "Cannot delete completed todos" }, { status: 400 });
  }

  const { error } = await supabase
    .from("todo_items")
    .delete()
    .eq("id", params.todoId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
