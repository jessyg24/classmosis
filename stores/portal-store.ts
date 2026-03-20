import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PortalStore {
  viewMode: "focused" | "full_day";
  setViewMode: (mode: "focused" | "full_day") => void;
}

export const usePortalStore = create<PortalStore>()(
  persist(
    (set) => ({
      viewMode: "focused",
      setViewMode: (mode) => set({ viewMode: mode }),
    }),
    { name: "classmosis-portal-view" }
  )
);
