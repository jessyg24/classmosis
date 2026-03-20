import { create } from "zustand";

interface AdminStore {
  selectedClassId: string | null;
  setSelectedClassId: (id: string | null) => void;
}

export const useAdminStore = create<AdminStore>((set) => ({
  selectedClassId: null,
  setSelectedClassId: (id) => set({ selectedClassId: id }),
}));
