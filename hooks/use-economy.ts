"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  EconomyTransaction,
  RewardStoreItem,
  PurchaseRequest,
  EconomySettings,
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
