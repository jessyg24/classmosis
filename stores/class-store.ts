import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ClassStore {
  activeClassId: string | null;
  setActiveClassId: (id: string) => void;
}

export const useClassStore = create<ClassStore>()(
  persist(
    (set) => ({
      activeClassId: null,
      setActiveClassId: (id) => set({ activeClassId: id }),
    }),
    {
      name: "classmosis-active-class",
    }
  )
);
