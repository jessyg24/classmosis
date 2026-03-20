"use client";

import { useQuery } from "@tanstack/react-query";

interface ChildSummary {
  guardian_id: string;
  relationship: string;
  custody_restricted: boolean;
  student_id: string;
  student_name: string;
  class_name: string;
  coin_balance: number | null;
  avg_grade: number | null;
  missing_count: number | null;
  todo_count: number | null;
  streak: number;
}

export function useChildren() {
  return useQuery<ChildSummary[]>({
    queryKey: ["parent-children"],
    queryFn: async () => {
      const res = await fetch("/api/v1/parent/children");
      if (!res.ok) throw new Error("Failed to load children");
      return res.json();
    },
  });
}

export function useChildGrades(studentId: string | null) {
  return useQuery({
    queryKey: ["parent-grades", studentId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/parent/children/${studentId}/grades`);
      if (!res.ok) throw new Error("Failed to load grades");
      return res.json() as Promise<{
        grades: Array<{
          id: string;
          title: string;
          type: string;
          score: number | null;
          max_points: number;
          percentage: number | null;
          label: string | null;
          is_missing: boolean;
          due_at: string | null;
        }>;
        average: number | null;
      }>;
    },
    enabled: !!studentId,
  });
}

export function useChildEconomy(studentId: string | null) {
  return useQuery({
    queryKey: ["parent-economy", studentId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/parent/children/${studentId}/economy`);
      if (!res.ok) throw new Error("Failed to load economy");
      return res.json();
    },
    enabled: !!studentId,
  });
}

export function useChildMastery(studentId: string | null) {
  return useQuery({
    queryKey: ["parent-mastery", studentId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/parent/children/${studentId}/mastery`);
      if (!res.ok) throw new Error("Failed to load mastery");
      return res.json() as Promise<Record<string, Array<{ description: string; level: string; plain_level: string }>>>;
    },
    enabled: !!studentId,
  });
}

export function useChildTodos(studentId: string | null) {
  return useQuery({
    queryKey: ["parent-todos", studentId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/parent/children/${studentId}/todos`);
      if (!res.ok) throw new Error("Failed to load todos");
      return res.json();
    },
    enabled: !!studentId,
  });
}
