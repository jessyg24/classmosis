import { create } from "zustand";
import type { SubscriptionTier } from "@/types/database";

interface SubscriptionState {
  tier: SubscriptionTier | null;
  loading: boolean;
  fetched: boolean;
  fetch: () => Promise<void>;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  tier: null,
  loading: false,
  fetched: false,

  fetch: async () => {
    if (get().fetched || get().loading) return;
    set({ loading: true });

    try {
      const res = await fetch("/api/v1/billing");
      if (res.ok) {
        const data = await res.json();
        set({ tier: data.tier || "free", loading: false, fetched: true });
      } else {
        set({ tier: "free", loading: false, fetched: true });
      }
    } catch {
      set({ tier: "free", loading: false, fetched: true });
    }
  },
}));
