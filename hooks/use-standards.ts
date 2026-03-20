"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Standard, AssignmentStandard, StudentMastery } from "@/types/database";

// ── Standards for a class ─────────────────────────────────

export function useClassStandards(classId: string | null, domain?: string) {
  return useQuery<Standard[]>({
    queryKey: ["standards", classId, domain],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (domain) params.set("domain", domain);
      const res = await fetch(`/api/v1/classes/${classId}/standards?${params}`);
      if (!res.ok) throw new Error("Failed to load standards");
      return res.json();
    },
    enabled: !!classId,
  });
}

// ── Standards linked to an assignment ─────────────────────

export function useAssignmentStandards(classId: string | null, assignmentId: string | null) {
  return useQuery<AssignmentStandard[]>({
    queryKey: ["assignment-standards", classId, assignmentId],
    queryFn: async () => {
      const res = await fetch(
        `/api/v1/classes/${classId}/assignments/${assignmentId}/standards`
      );
      if (!res.ok) throw new Error("Failed to load assignment standards");
      return res.json();
    },
    enabled: !!classId && !!assignmentId,
  });
}

// ── Mastery data for all students in a class ──────────────

export function useClassMastery(classId: string | null) {
  return useQuery<StudentMastery[]>({
    queryKey: ["mastery", classId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/classes/${classId}/mastery`);
      if (!res.ok) throw new Error("Failed to load mastery data");
      return res.json();
    },
    enabled: !!classId,
  });
}

// ── Mutations ─────────────────────────────────────────────

export function useLinkStandards(classId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      assignmentId,
      standardIds,
    }: {
      assignmentId: string;
      standardIds: string[];
    }) => {
      const res = await fetch(
        `/api/v1/classes/${classId}/assignments/${assignmentId}/standards`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ standard_ids: standardIds }),
        }
      );
      if (!res.ok) throw new Error("Failed to link standards");
      return res.json();
    },
    onSuccess: (_data, { assignmentId }) => {
      qc.invalidateQueries({ queryKey: ["assignment-standards", classId, assignmentId] });
    },
  });
}

export function useCreateStandard(classId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (standard: {
      code: string;
      description: string;
      subject: string;
      grade_band: string;
      domain: string;
    }) => {
      const res = await fetch(`/api/v1/classes/${classId}/standards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(standard),
      });
      if (!res.ok) throw new Error("Failed to create standard");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["standards", classId] });
    },
  });
}

export function useRecalculateMastery(classId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/v1/classes/${classId}/mastery/recalculate`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to recalculate mastery");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mastery", classId] });
    },
  });
}
