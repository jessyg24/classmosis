"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { PracticeSet, PracticeQuestion } from "@/types/database";

// ── Practice Sets ────────────────────────────────────────

export function usePracticeSets(classId: string | null) {
  return useQuery<PracticeSet[]>({
    queryKey: ["practice-sets", classId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/classes/${classId}/practice-sets`);
      if (!res.ok) throw new Error("Failed to load practice sets");
      return res.json();
    },
    enabled: !!classId,
  });
}

export function usePracticeQuestions(classId: string | null, practiceSetId: string | null) {
  return useQuery<PracticeQuestion[]>({
    queryKey: ["practice-questions", classId, practiceSetId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/classes/${classId}/practice-sets/${practiceSetId}/questions`);
      if (!res.ok) throw new Error("Failed to load questions");
      return res.json();
    },
    enabled: !!classId && !!practiceSetId,
  });
}

// ── Mutations ────────────────────────────────────────────

export function useCreatePracticeSet(classId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
      shuffle_questions?: boolean;
      allow_retries?: boolean;
      show_correct_after?: boolean;
      coins_reward?: number;
      published?: boolean;
      standard_ids?: string[];
    }) => {
      const res = await fetch(`/api/v1/classes/${classId}/practice-sets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create practice set");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["practice-sets", classId] });
    },
  });
}

export function useDeletePracticeSet(classId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (practiceSetId: string) => {
      const res = await fetch(`/api/v1/classes/${classId}/practice-sets/${practiceSetId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["practice-sets", classId] });
    },
  });
}

export function usePublishPracticeSet(classId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (practiceSetId: string) => {
      const res = await fetch(`/api/v1/classes/${classId}/practice-sets/${practiceSetId}/publish`, {
        method: "POST",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to publish");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["practice-sets", classId] });
    },
  });
}

export function useCreateQuestion(classId: string | null, practiceSetId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      question_type: string;
      prompt: string;
      options?: string[];
      correct_answer: string;
      explanation?: string;
    }) => {
      const res = await fetch(`/api/v1/classes/${classId}/practice-sets/${practiceSetId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create question");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["practice-questions", classId, practiceSetId] });
      qc.invalidateQueries({ queryKey: ["practice-sets", classId] });
    },
  });
}

export function useDeleteQuestion(classId: string | null, practiceSetId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (questionId: string) => {
      const res = await fetch(`/api/v1/classes/${classId}/practice-sets/${practiceSetId}/questions/${questionId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete question");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["practice-questions", classId, practiceSetId] });
      qc.invalidateQueries({ queryKey: ["practice-sets", classId] });
    },
  });
}
