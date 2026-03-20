"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { GradebookData } from "@/types/grading";
import type { Rubric, Assignment } from "@/types/database";

// ── Gradebook ──────────────────────────────────────────────

export function useGradebook(classId: string | null, periodId?: string | null) {
  return useQuery<GradebookData>({
    queryKey: ["gradebook", classId, periodId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (periodId) params.set("period_id", periodId);
      const res = await fetch(`/api/v1/classes/${classId}/gradebook?${params}`);
      if (!res.ok) throw new Error("Failed to load gradebook");
      return res.json();
    },
    enabled: !!classId,
  });
}

// ── Assignments ────────────────────────────────────────────

export function useAssignments(classId: string | null) {
  return useQuery<Assignment[]>({
    queryKey: ["assignments", classId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/classes/${classId}/assignments`);
      if (!res.ok) throw new Error("Failed to load assignments");
      return res.json();
    },
    enabled: !!classId,
  });
}

// ── Rubrics ────────────────────────────────────────────────

export function useRubrics(classId: string | null) {
  return useQuery<Rubric[]>({
    queryKey: ["rubrics", classId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/classes/${classId}/rubrics`);
      if (!res.ok) throw new Error("Failed to load rubrics");
      return res.json();
    },
    enabled: !!classId,
  });
}

// ── Mutations ──────────────────────────────────────────────

export function usePublishAssignment(classId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (assignmentId: string) => {
      const res = await fetch(
        `/api/v1/classes/${classId}/assignments/${assignmentId}/publish`,
        { method: "POST" }
      );
      if (!res.ok) throw new Error("Failed to publish");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assignments", classId] });
      qc.invalidateQueries({ queryKey: ["gradebook", classId] });
    },
  });
}

export function useGradeSubmission(classId: string | null, assignmentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      submissionId,
      grade,
    }: {
      submissionId: string;
      grade: {
        category_scores: Array<{ category_id: string; name: string; score: number; max: number }>;
        total_raw: number;
        total_pct: number;
        overall_feedback?: string;
      };
    }) => {
      const res = await fetch(
        `/api/v1/classes/${classId}/assignments/${assignmentId}/submissions/${submissionId}/grade`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(grade) }
      );
      if (!res.ok) throw new Error("Failed to save grade");
      return res.json();
    },
    onSuccess: async () => {
      qc.invalidateQueries({ queryKey: ["gradebook", classId] });
      qc.invalidateQueries({ queryKey: ["submissions", assignmentId] });
      // Recalculate mastery after grading
      if (classId) {
        await fetch(`/api/v1/classes/${classId}/mastery/recalculate`, { method: "POST" });
        qc.invalidateQueries({ queryKey: ["mastery", classId] });
      }
    },
  });
}

export function useReturnSubmission(classId: string | null, assignmentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (submissionId: string) => {
      const res = await fetch(
        `/api/v1/classes/${classId}/assignments/${assignmentId}/submissions/${submissionId}/return`,
        { method: "POST" }
      );
      if (!res.ok) throw new Error("Failed to return");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["submissions", assignmentId] });
      qc.invalidateQueries({ queryKey: ["gradebook", classId] });
    },
  });
}

export function useUpdateGradebookEntry(classId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      entryId,
      data,
    }: {
      entryId: string;
      data: { raw_score: number | null; pct_score: number | null; display_label?: string | null };
    }) => {
      const res = await fetch(
        `/api/v1/classes/${classId}/gradebook/entries/${entryId}`,
        { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }
      );
      if (!res.ok) throw new Error("Failed to update entry");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["gradebook", classId] });
    },
  });
}
