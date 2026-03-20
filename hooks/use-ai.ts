"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AiScoreDraft, RubricTemplate, ProblemBankItem } from "@/types/database";

// ── AI Grading ───────────────────────────────────────────

export function useAiGradeDraft(classId: string | null, assignmentId: string | null, submissionId: string | null) {
  return useQuery<AiScoreDraft | null>({
    queryKey: ["ai-grade", classId, assignmentId, submissionId],
    queryFn: async () => {
      const res = await fetch(
        `/api/v1/classes/${classId}/assignments/${assignmentId}/submissions/${submissionId}/ai-grade`
      );
      if (!res.ok) throw new Error("Failed to load AI draft");
      return res.json();
    },
    enabled: !!classId && !!assignmentId && !!submissionId,
  });
}

export function useGenerateAiGrade(classId: string | null, assignmentId: string | null, submissionId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `/api/v1/classes/${classId}/assignments/${assignmentId}/submissions/${submissionId}/ai-grade`,
        { method: "POST" }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to generate AI grade");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ai-grade", classId, assignmentId, submissionId] });
    },
  });
}

export function useAiGradeAction(classId: string | null, assignmentId: string | null, submissionId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      action: "approved" | "edited" | "rejected";
      edited_scores?: Array<{ category_id: string; name: string; score: number; max: number }>;
      overall_feedback?: string;
    }) => {
      const res = await fetch(
        `/api/v1/classes/${classId}/assignments/${assignmentId}/submissions/${submissionId}/ai-grade/action`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ai-grade", classId, assignmentId, submissionId] });
      qc.invalidateQueries({ queryKey: ["gradebook", classId] });
      qc.invalidateQueries({ queryKey: ["submissions", assignmentId] });
    },
  });
}

// ── AI Feedback ──────────────────────────────────────────

export function useGenerateFeedback(classId: string | null, assignmentId: string | null, submissionId: string | null) {
  return useMutation({
    mutationFn: async (data: { score: number; max: number; category_breakdown?: string; teacher_notes?: string }) => {
      const res = await fetch(
        `/api/v1/classes/${classId}/assignments/${assignmentId}/submissions/${submissionId}/ai-feedback`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to generate feedback");
      }
      return res.json() as Promise<{ feedback: string; remaining: number }>;
    },
  });
}

// ── AI Practice Generation ───────────────────────────────

export function useGeneratePracticeProblems(classId: string | null, practiceSetId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      count: number;
      problem_type: string;
      standard_code: string;
      standard_description?: string;
      grade: string;
      difficulty: number;
      context_guidance?: string;
      avoid_guidance?: string;
    }) => {
      const res = await fetch(
        `/api/v1/classes/${classId}/practice-sets/${practiceSetId}/ai-generate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to generate problems");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["practice-questions", classId, practiceSetId] });
      qc.invalidateQueries({ queryKey: ["practice-sets", classId] });
    },
  });
}

// ── AI Rubric Generation ─────────────────────────────────

export function useGenerateRubric(classId: string | null) {
  return useMutation({
    mutationFn: async (data: {
      assignment_type: string;
      topic: string;
      grade: string;
      num_categories?: number;
      points_per_category?: number;
      standard_code?: string;
    }) => {
      const res = await fetch(`/api/v1/classes/${classId}/rubrics/ai-generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to generate rubric");
      }
      return res.json() as Promise<{ categories: Array<{ name: string; max_points: number; weight_pct: number; descriptors: Record<string, string> }>; remaining: number }>;
    },
  });
}

// ── Shared Banks ─────────────────────────────────────────

export function useRubricTemplates(classId: string | null, assignmentType?: string) {
  return useQuery<RubricTemplate[]>({
    queryKey: ["rubric-templates", classId, assignmentType],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (assignmentType) params.set("assignment_type", assignmentType);
      const res = await fetch(`/api/v1/classes/${classId}/rubrics/templates?${params}`);
      if (!res.ok) throw new Error("Failed to load templates");
      return res.json();
    },
    enabled: !!classId,
  });
}

export function useProblemBank(classId: string | null, filters?: { standard_code?: string; question_type?: string; difficulty?: number }) {
  return useQuery<ProblemBankItem[]>({
    queryKey: ["problem-bank", classId, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.standard_code) params.set("standard_code", filters.standard_code);
      if (filters?.question_type) params.set("question_type", filters.question_type);
      if (filters?.difficulty) params.set("difficulty", String(filters.difficulty));
      const res = await fetch(`/api/v1/classes/${classId}/problem-bank?${params}`);
      if (!res.ok) throw new Error("Failed to load problem bank");
      return res.json();
    },
    enabled: !!classId,
  });
}

// ── Morning Brief ────────────────────────────────────────

export function useMorningBrief(classId: string | null) {
  return useQuery<{ brief: string; remaining: number }>({
    queryKey: ["morning-brief", classId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/classes/${classId}/morning-brief`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!classId,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}
