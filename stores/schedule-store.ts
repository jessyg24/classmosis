import { create } from "zustand";
import type { Block, DayType } from "@/types/database";

interface ScheduleStore {
  // State
  selectedDate: string; // YYYY-MM-DD
  scheduleId: string | null;
  blocks: Block[];
  activeBlockId: string | null;
  isDirty: boolean;
  isPublished: boolean;
  dayType: DayType;

  // Actions
  setDate: (date: string) => void;
  setScheduleId: (id: string | null) => void;
  setBlocks: (blocks: Block[]) => void;
  addBlock: (block: Block) => void;
  removeBlock: (id: string) => void;
  reorderBlocks: (fromIndex: number, toIndex: number) => void;
  updateBlock: (id: string, updates: Partial<Block>) => void;
  setActiveBlock: (id: string | null) => void;
  setDayType: (type: DayType) => void;
  setPublished: (published: boolean) => void;
  markClean: () => void;
  loadFromServer: (data: {
    scheduleId: string;
    blocks: Block[];
    published: boolean;
    dayType: DayType;
  }) => void;
}

function todayString(): string {
  return new Date().toISOString().split("T")[0];
}

export const useScheduleStore = create<ScheduleStore>()((set) => ({
  selectedDate: todayString(),
  scheduleId: null,
  blocks: [],
  activeBlockId: null,
  isDirty: false,
  isPublished: false,
  dayType: "normal",

  setDate: (date) =>
    set({ selectedDate: date, blocks: [], activeBlockId: null, isDirty: false, scheduleId: null }),

  setScheduleId: (id) => set({ scheduleId: id }),

  setBlocks: (blocks) => set({ blocks, isDirty: true }),

  addBlock: (block) =>
    set((state) => ({
      blocks: [...state.blocks, block],
      isDirty: true,
    })),

  removeBlock: (id) =>
    set((state) => {
      const filtered = state.blocks
        .filter((b) => b.id !== id)
        .map((b, i) => ({ ...b, order_index: i }));
      return {
        blocks: filtered,
        activeBlockId: state.activeBlockId === id ? null : state.activeBlockId,
        isDirty: true,
      };
    }),

  reorderBlocks: (fromIndex, toIndex) =>
    set((state) => {
      const newBlocks = [...state.blocks];
      const [moved] = newBlocks.splice(fromIndex, 1);
      newBlocks.splice(toIndex, 0, moved);
      return {
        blocks: newBlocks.map((b, i) => ({ ...b, order_index: i })),
        isDirty: true,
      };
    }),

  updateBlock: (id, updates) =>
    set((state) => ({
      blocks: state.blocks.map((b) => (b.id === id ? { ...b, ...updates } : b)),
      isDirty: true,
    })),

  setActiveBlock: (id) => set({ activeBlockId: id }),

  setDayType: (dayType) => set({ dayType, isDirty: true }),

  setPublished: (published) => set({ isPublished: published }),

  markClean: () => set({ isDirty: false }),

  loadFromServer: ({ scheduleId, blocks, published, dayType }) =>
    set({
      scheduleId,
      blocks: blocks.sort((a, b) => a.order_index - b.order_index),
      isPublished: published,
      dayType,
      isDirty: false,
      activeBlockId: null,
    }),
}));
