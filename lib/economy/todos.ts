import type { SupabaseClient } from "@supabase/supabase-js";
import type { TodoItem } from "@/types/database";
import { awardCoins } from "./transactions";

export async function completeTodo(
  supabase: SupabaseClient,
  todoId: string
): Promise<TodoItem> {
  // Get the todo
  const { data: todo } = await supabase
    .from("todo_items")
    .select("*")
    .eq("id", todoId)
    .single();

  if (!todo) throw new Error("Todo not found");
  if (todo.completed) throw new Error("Todo already completed");

  // Mark complete
  const { data: updated, error } = await supabase
    .from("todo_items")
    .update({ completed: true, completed_at: new Date().toISOString() })
    .eq("id", todoId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Award coins if eligible
  if (todo.coin_eligible && todo.coins_on_complete > 0) {
    await awardCoins({
      supabase,
      classId: todo.class_id,
      studentId: todo.student_id,
      amount: todo.coins_on_complete,
      reason: `Todo complete: ${todo.title}`,
      category: "todo_complete",
      sourceId: todoId,
    });
  }

  return updated as TodoItem;
}
