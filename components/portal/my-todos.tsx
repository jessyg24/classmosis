"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ClipboardList, Check, Plus } from "lucide-react";
import { toast } from "sonner";

interface TodoData {
  id: string;
  title: string;
  source: string;
  coin_eligible: boolean;
  coins_on_complete: number;
  completed: boolean;
  due_date: string | null;
}

interface MyTodosProps {
  studentId: string;
}

export default function MyTodos({ studentId }: MyTodosProps) {
  const [todos, setTodos] = useState<TodoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [adding, setAdding] = useState(false);

  const getHeaders = () => {
    const stored = localStorage.getItem("classmosis_student");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (stored) {
      try {
        const session = JSON.parse(stored);
        if (session.token) headers["Authorization"] = `Bearer ${session.token}`;
      } catch { /* ignore */ }
    }
    return headers;
  };

  const fetchTodos = () => {
    fetch("/api/v1/student/todos", { headers: getHeaders() })
      .then((res) => (res.ok ? res.json() : []))
      .then((d) => setTodos(d))
      .catch(() => setTodos([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!studentId) return;
    fetchTodos();
  }, [studentId]);

  const handleComplete = async (todoId: string) => {
    try {
      const res = await fetch(`/api/v1/student/todos/${todoId}/complete`, {
        method: "POST",
        headers: getHeaders(),
      });
      if (res.ok) {
        toast.success("Keep it up!");
        fetchTodos();
      }
    } catch { /* ignore */ }
  };

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/v1/student/todos", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ title: newTitle.trim() }),
      });
      if (res.ok) {
        setNewTitle("");
        fetchTodos();
      }
    } catch { /* ignore */ }
    finally { setAdding(false); }
  };

  const activeTodos = todos.filter((t) => !t.completed);
  const completedTodos = todos.filter((t) => t.completed);

  return (
    <Card className="p-cm-6 bg-cm-surface rounded-cm-card border-cm-border">
      <div className="flex items-center gap-cm-3 mb-4">
        <div className="w-8 h-8 bg-cm-amber-light rounded-cm-badge flex items-center justify-center">
          <ClipboardList className="h-4 w-4 text-cm-amber" />
        </div>
        <span className="text-cm-overline text-cm-text-hint uppercase">My Todos</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-4">
          <div className="h-6 w-6 border-2 border-cm-amber border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {activeTodos.length === 0 && completedTodos.length === 0 ? (
            <p className="text-cm-body text-cm-text-secondary">
              No tasks yet. Add your own or check back for teacher-assigned tasks!
            </p>
          ) : (
            <div className="space-y-1">
              {activeTodos.map((todo) => (
                <div key={todo.id} className="flex items-center gap-cm-3 py-1">
                  <button
                    onClick={() => handleComplete(todo.id)}
                    className="shrink-0 w-5 h-5 rounded-full border-2 border-cm-amber hover:bg-cm-amber-light flex items-center justify-center"
                  >
                    <Check className="h-3 w-3 text-cm-amber opacity-0 hover:opacity-100" />
                  </button>
                  <span className="flex-1 text-cm-body text-cm-text-primary">{todo.title}</span>
                  {todo.coin_eligible && (
                    <span className="shrink-0 text-cm-caption text-cm-amber">🪙 {todo.coins_on_complete}</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {completedTodos.length > 0 && (
            <div className="pt-2 border-t border-cm-border">
              <p className="text-cm-overline text-cm-text-hint uppercase mb-1">Done</p>
              {completedTodos.slice(0, 3).map((todo) => (
                <div key={todo.id} className="flex items-center gap-cm-3 py-0.5">
                  <div className="shrink-0 w-5 h-5 rounded-full bg-cm-green-light flex items-center justify-center">
                    <Check className="h-3 w-3 text-cm-green" />
                  </div>
                  <span className="flex-1 text-cm-caption text-cm-text-hint line-through">{todo.title}</span>
                </div>
              ))}
            </div>
          )}

          {/* Add own todo */}
          <div className="flex gap-2 pt-2">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Add a personal task..."
              className="text-cm-caption h-8"
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <button
              onClick={handleAdd}
              disabled={adding || !newTitle.trim()}
              className="shrink-0 w-8 h-8 rounded-cm-button bg-cm-amber-light text-cm-amber flex items-center justify-center hover:bg-cm-amber disabled:opacity-50 disabled:hover:bg-cm-amber-light"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
