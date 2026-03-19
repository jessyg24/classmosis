import { create } from "zustand";

interface SelectedCell {
  studentId: string;
  assignmentId: string;
}

interface GradebookStore {
  activePeriodId: string | null;
  selectedCell: SelectedCell | null;
  gradingPanelOpen: boolean;

  setActivePeriodId: (id: string | null) => void;
  selectCell: (cell: SelectedCell | null) => void;
  openGradingPanel: (cell: SelectedCell) => void;
  closeGradingPanel: () => void;
}

export const useGradebookStore = create<GradebookStore>()((set) => ({
  activePeriodId: null,
  selectedCell: null,
  gradingPanelOpen: false,

  setActivePeriodId: (id) => set({ activePeriodId: id }),
  selectCell: (cell) => set({ selectedCell: cell }),
  openGradingPanel: (cell) => set({ selectedCell: cell, gradingPanelOpen: true }),
  closeGradingPanel: () => set({ gradingPanelOpen: false, selectedCell: null }),
}));
