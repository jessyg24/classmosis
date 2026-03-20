"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  EconomyTransaction,
  RewardStoreItem,
  PurchaseRequest,
  EconomySettings,
  ClassJob,
  MysteryStudentRecord,
  TodoItem,
} from "@/types/database";

// ── Transactions ─────────────────────────────────────────

export function useTransactions(classId: string | null, studentId?: string) {
  return useQuery<EconomyTransaction[]>({
    queryKey: ["economy-transactions", classId, studentId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (studentId) params.set("student_id", studentId);
      const res = await fetch(`/api/v1/classes/${classId}/economy/transactions?${params}`);
      if (!res.ok) throw new Error("Failed to load transactions");
      return res.json();
    },
    enabled: !!classId,
  });
}

// ── Store Items ──────────────────────────────────────────

export function useStoreItems(classId: string | null) {
  return useQuery<RewardStoreItem[]>({
    queryKey: ["store-items", classId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/classes/${classId}/economy/store`);
      if (!res.ok) throw new Error("Failed to load store items");
      return res.json();
    },
    enabled: !!classId,
  });
}

// ── Purchase Requests ────────────────────────────────────

export function usePurchaseRequests(classId: string | null, status?: string) {
  return useQuery<PurchaseRequest[]>({
    queryKey: ["purchase-requests", classId, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      const res = await fetch(`/api/v1/classes/${classId}/economy/purchases?${params}`);
      if (!res.ok) throw new Error("Failed to load purchase requests");
      return res.json();
    },
    enabled: !!classId,
  });
}

// ── Economy Settings ─────────────────────────────────────

export function useEconomySettings(classId: string | null) {
  return useQuery<EconomySettings>({
    queryKey: ["economy-settings", classId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/classes/${classId}/economy/settings`);
      if (!res.ok) throw new Error("Failed to load economy settings");
      return res.json();
    },
    enabled: !!classId,
  });
}

// ── Leaderboard ──────────────────────────────────────────

export function useLeaderboard(classId: string | null) {
  return useQuery<Array<{ id: string; display_name: string; coin_balance: number }>>({
    queryKey: ["leaderboard", classId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/classes/${classId}/economy/leaderboard`);
      if (!res.ok) throw new Error("Failed to load leaderboard");
      return res.json();
    },
    enabled: !!classId,
  });
}

// ── Mutations ────────────────────────────────────────────

export function useAwardCoins(classId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { student_ids: string[]; amount: number; reason: string }) => {
      const res = await fetch(`/api/v1/classes/${classId}/economy/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to award coins");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["economy-transactions", classId] });
      qc.invalidateQueries({ queryKey: ["leaderboard", classId] });
    },
  });
}

export function useBulkAward(classId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { amount: number; reason: string }) => {
      const res = await fetch(`/api/v1/classes/${classId}/economy/bulk-award`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to bulk award");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["economy-transactions", classId] });
      qc.invalidateQueries({ queryKey: ["leaderboard", classId] });
    },
  });
}

export function useCreateStoreItem(classId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; description?: string; price: number; icon?: string; stock?: number | null }) => {
      const res = await fetch(`/api/v1/classes/${classId}/economy/store`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create store item");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["store-items", classId] });
    },
  });
}

export function useUpdateStoreItem(classId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ itemId, data }: { itemId: string; data: Partial<RewardStoreItem> }) => {
      const res = await fetch(`/api/v1/classes/${classId}/economy/store/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update store item");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["store-items", classId] });
    },
  });
}

export function useResolvePurchase(classId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ purchaseId, status, teacher_note }: { purchaseId: string; status: "approved" | "denied"; teacher_note?: string }) => {
      const res = await fetch(`/api/v1/classes/${classId}/economy/purchases/${purchaseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, teacher_note }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to resolve purchase");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["purchase-requests", classId] });
      qc.invalidateQueries({ queryKey: ["economy-transactions", classId] });
      qc.invalidateQueries({ queryKey: ["leaderboard", classId] });
    },
  });
}

export function useUpdateEconomySettings(classId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<EconomySettings>) => {
      const res = await fetch(`/api/v1/classes/${classId}/economy/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update settings");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["economy-settings", classId] });
    },
  });
}

// ── Jobs ─────────────────────────────────────────────────

export function useClassJobs(classId: string | null) {
  return useQuery<ClassJob[]>({
    queryKey: ["class-jobs", classId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/classes/${classId}/economy/jobs`);
      if (!res.ok) throw new Error("Failed to load jobs");
      return res.json();
    },
    enabled: !!classId,
  });
}

export function useCreateJob(classId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; description?: string; coin_multiplier?: number; rotation?: string }) => {
      const res = await fetch(`/api/v1/classes/${classId}/economy/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create job");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["class-jobs", classId] }); },
  });
}

export function useAssignJob(classId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ jobId, studentId }: { jobId: string; studentId: string }) => {
      const res = await fetch(`/api/v1/classes/${classId}/economy/jobs/${jobId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: studentId }),
      });
      if (!res.ok) throw new Error("Failed to assign job");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["class-jobs", classId] }); },
  });
}

export function useUnassignJob(classId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (jobId: string) => {
      const res = await fetch(`/api/v1/classes/${classId}/economy/jobs/${jobId}/assign`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to unassign job");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["class-jobs", classId] }); },
  });
}

export function useRotateJobs(classId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/v1/classes/${classId}/economy/jobs/rotate`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to rotate jobs");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["class-jobs", classId] }); },
  });
}

// ── Mystery Student ──────────────────────────────────────

export function useTodayMystery(classId: string | null) {
  return useQuery<MysteryStudentRecord | null>({
    queryKey: ["mystery-today", classId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/classes/${classId}/economy/mystery`);
      if (!res.ok) throw new Error("Failed to load mystery");
      return res.json();
    },
    enabled: !!classId,
  });
}

export function useSelectMystery(classId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (multiplier?: number) => {
      const res = await fetch(`/api/v1/classes/${classId}/economy/mystery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ multiplier: multiplier || 3 }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Failed to select"); }
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["mystery-today", classId] }); },
  });
}

export function useRevealMystery(classId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (teacherNote?: string) => {
      const res = await fetch(`/api/v1/classes/${classId}/economy/mystery/reveal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacher_note: teacherNote }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Failed to reveal"); }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mystery-today", classId] });
      qc.invalidateQueries({ queryKey: ["economy-transactions", classId] });
      qc.invalidateQueries({ queryKey: ["leaderboard", classId] });
    },
  });
}

export function useMysteryHistory(classId: string | null) {
  return useQuery<MysteryStudentRecord[]>({
    queryKey: ["mystery-history", classId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/classes/${classId}/economy/mystery/history`);
      if (!res.ok) throw new Error("Failed to load history");
      return res.json();
    },
    enabled: !!classId,
  });
}

// ── Todos ────────────────────────────────────────────────

export function useClassTodos(classId: string | null, studentId?: string) {
  return useQuery<TodoItem[]>({
    queryKey: ["class-todos", classId, studentId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (studentId) params.set("student_id", studentId);
      params.set("completed", "false");
      const res = await fetch(`/api/v1/classes/${classId}/economy/todos?${params}`);
      if (!res.ok) throw new Error("Failed to load todos");
      return res.json();
    },
    enabled: !!classId,
  });
}

export function useCreateTodo(classId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { student_id: string; title: string; coin_eligible?: boolean; coins_on_complete?: number; due_date?: string }) => {
      const res = await fetch(`/api/v1/classes/${classId}/economy/todos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create todo");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["class-todos", classId] }); },
  });
}

export function useCompleteTodo(classId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (todoId: string) => {
      const res = await fetch(`/api/v1/classes/${classId}/economy/todos/${todoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: true }),
      });
      if (!res.ok) throw new Error("Failed to complete todo");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["class-todos", classId] });
      qc.invalidateQueries({ queryKey: ["economy-transactions", classId] });
    },
  });
}

export function useDeleteTodo(classId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (todoId: string) => {
      const res = await fetch(`/api/v1/classes/${classId}/economy/todos/${todoId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete todo");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["class-todos", classId] }); },
  });
}

export function useFulfillPurchase(classId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (purchaseId: string) => {
      const res = await fetch(`/api/v1/classes/${classId}/economy/purchases/${purchaseId}/fulfill`, { method: "PUT" });
      if (!res.ok) throw new Error("Failed to fulfill");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["purchase-requests", classId] }); },
  });
}
