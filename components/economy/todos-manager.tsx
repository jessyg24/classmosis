"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Plus, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { useClassTodos, useCreateTodo, useCompleteTodo, useDeleteTodo } from "@/hooks/use-economy";

interface TodosManagerProps {
  classId: string;
}

interface FormData {
  title: string;
  coins_on_complete: number;
  due_date: string;
}

export default function TodosManager({ classId }: TodosManagerProps) {
  const [filterStudentId, setFilterStudentId] = useState<string | undefined>();
  const { data: todos, isLoading } = useClassTodos(classId, filterStudentId);
  const createMutation = useCreateTodo(classId);
  const completeMutation = useCompleteTodo(classId);
  const deleteMutation = useDeleteTodo(classId);
  const [addOpen, setAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [coinEligible, setCoinEligible] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [students, setStudents] = useState<Array<{ id: string; display_name: string }>>([]);

  const { register, handleSubmit, reset } = useForm<FormData>({
    defaultValues: { title: "", coins_on_complete: 1, due_date: "" },
  });

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("students")
      .select("id, display_name")
      .eq("class_id", classId)
      .is("archived_at", null)
      .order("display_name")
      .then(({ data }) => setStudents(data || []));
  }, [classId]);

  const onSubmit = async (data: FormData) => {
    if (!selectedStudentId) { toast.error("Select a student"); return; }
    setSaving(true);
    try {
      await createMutation.mutateAsync({
        student_id: selectedStudentId,
        title: data.title,
        coin_eligible: coinEligible,
        coins_on_complete: coinEligible ? Number(data.coins_on_complete) : 0,
        due_date: data.due_date || undefined,
      });
      toast.success("Todo created");
      reset();
      setSelectedStudentId("");
      setCoinEligible(false);
      setAddOpen(false);
    } catch {
      toast.error("Failed to create todo");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-6 w-6 border-2 border-cm-amber border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Select value={filterStudentId || "all"} onValueChange={(v) => setFilterStudentId(!v || v === "all" ? undefined : v)}>
          <SelectTrigger className="w-48 h-8 text-cm-caption">
            <SelectValue placeholder="All students" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All students</SelectItem>
            {students.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.display_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => setAddOpen(true)} className="bg-cm-amber hover:bg-cm-amber-dark text-white">
          <Plus className="h-4 w-4 mr-1" />
          Add Todo
        </Button>
      </div>

      {(!todos || todos.length === 0) ? (
        <p className="text-cm-body text-cm-text-secondary py-8 text-center">
          No active todos. Create tasks for students to complete!
        </p>
      ) : (
        <div className="divide-y divide-cm-border">
          {(todos as Array<{ id: string; title: string; student_id: string; coin_eligible: boolean; coins_on_complete: number; due_date: string | null; students?: { display_name: string } }>).map((todo) => (
            <div key={todo.id} className="flex items-center gap-cm-3 py-cm-3">
              <button
                onClick={async () => {
                  try { await completeMutation.mutateAsync(todo.id); toast.success("Completed!"); }
                  catch { toast.error("Failed"); }
                }}
                className="shrink-0 w-6 h-6 rounded-full border-2 border-cm-amber hover:bg-cm-amber-light flex items-center justify-center transition-colors"
              >
                <Check className="h-3 w-3 text-cm-amber opacity-0 hover:opacity-100" />
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-cm-body text-cm-text-primary">{todo.title}</p>
                <p className="text-cm-caption text-cm-text-hint">
                  {todo.students?.display_name || "Student"}
                  {todo.due_date && ` · Due ${new Date(todo.due_date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`}
                </p>
              </div>
              {todo.coin_eligible && (
                <span className="shrink-0 px-1.5 py-0.5 rounded-cm-badge bg-cm-amber-light text-cm-amber text-[10px] font-medium">
                  🪙 {todo.coins_on_complete}
                </span>
              )}
              <button
                onClick={async () => {
                  try { await deleteMutation.mutateAsync(todo.id); toast.success("Removed"); }
                  catch { toast.error("Failed"); }
                }}
                className="shrink-0 text-cm-text-hint hover:text-cm-coral"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add Todo</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Student</Label>
              <Select value={selectedStudentId} onValueChange={(v) => { if (v) setSelectedStudentId(v); }}>
                <SelectTrigger><SelectValue placeholder="Select student..." /></SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.display_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="todo-title">Task</Label>
              <Input id="todo-title" {...register("title", { required: true })} placeholder="e.g. Complete reading log" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="todo-due">Due Date (optional)</Label>
                <Input id="todo-due" type="date" {...register("due_date")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="todo-coins">Coins</Label>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={coinEligible} onChange={(e) => setCoinEligible(e.target.checked)} className="rounded" />
                  {coinEligible && (
                    <Input id="todo-coins" type="number" min={0} {...register("coins_on_complete", { valueAsNumber: true })} className="w-20" />
                  )}
                  {!coinEligible && <span className="text-cm-caption text-cm-text-hint">No reward</span>}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={saving} className="bg-cm-amber hover:bg-cm-amber-dark text-white">
                {saving ? "Creating..." : "Add Todo"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
