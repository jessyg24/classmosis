import { create } from "zustand";
import type { Block, DayType, Insert } from "@/types/database";

interface ScheduleStore {
  // State
  selectedDate: string; // YYYY-MM-DD
  scheduleId: string | null;
  blocks: Block[];
  activeBlockId: string | null;
  activeInsertId: string | null;
  isDirty: boolean;
  isPublished: boolean;
  dayType: DayType;

  // Block actions
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

  // Insert actions
  setActiveInsert: (id: string | null) => void;
  addInsert: (blockId: string, insert: Insert) => void;
  removeInsert: (blockId: string, insertId: string) => void;
  reorderInserts: (blockId: string, fromIndex: number, toIndex: number) => void;
  moveInsert: (fromBlockId: string, toBlockId: string, insertId: string, toIndex: number) => void;
  updateInsert: (blockId: string, insertId: string, updates: Partial<Insert>) => void;
}

function todayString(): string {
  return new Date().toISOString().split("T")[0];
}

/** Helper: update a block's inserts array immutably and renumber order_index */
function updateBlockInserts(
  blocks: Block[],
  blockId: string,
  updater: (inserts: Insert[]) => Insert[],
): Block[] {
  return blocks.map((b) => {
    if (b.id !== blockId) return b;
    const updated = updater([...b.inserts]);
    return {
      ...b,
      inserts: updated.map((ins, i) => ({ ...ins, order_index: i })),
    };
  });
}

export const useScheduleStore = create<ScheduleStore>()((set) => ({
  selectedDate: todayString(),
  scheduleId: null,
  blocks: [],
  activeBlockId: null,
  activeInsertId: null,
  isDirty: false,
  isPublished: false,
  dayType: "normal",

  // ── Block actions ──────────────────────────────────────────

  setDate: (date) =>
    set({
      selectedDate: date,
      blocks: [],
      activeBlockId: null,
      activeInsertId: null,
      isDirty: false,
      scheduleId: null,
    }),

  setScheduleId: (id) => set({ scheduleId: id }),

  setBlocks: (blocks) => set({ blocks, isDirty: true }),

  addBlock: (block) =>
    set((state) => ({
      blocks: [...state.blocks, { ...block, inserts: block.inserts ?? [] }],
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
        activeInsertId:
          state.activeBlockId === id ? null : state.activeInsertId,
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
      blocks: state.blocks.map((b) =>
        b.id === id ? { ...b, ...updates } : b,
      ),
      isDirty: true,
    })),

  setActiveBlock: (id) => set({ activeBlockId: id, activeInsertId: null }),

  setDayType: (dayType) => set({ dayType, isDirty: true }),

  setPublished: (published) => set({ isPublished: published }),

  markClean: () => set({ isDirty: false }),

  loadFromServer: ({ scheduleId, blocks, published, dayType }) =>
    set({
      scheduleId,
      blocks: blocks
        .sort((a, b) => a.order_index - b.order_index)
        .map((b) => ({ ...b, inserts: b.inserts ?? [] })),
      isPublished: published,
      dayType,
      isDirty: false,
      activeBlockId: null,
      activeInsertId: null,
    }),

  // ── Insert actions ─────────────────────────────────────────

  setActiveInsert: (id) => set({ activeInsertId: id }),

  addInsert: (blockId, insert) =>
    set((state) => ({
      blocks: updateBlockInserts(state.blocks, blockId, (inserts) => [
        ...inserts,
        insert,
      ]),
      isDirty: true,
    })),

  removeInsert: (blockId, insertId) =>
    set((state) => ({
      blocks: updateBlockInserts(state.blocks, blockId, (inserts) =>
        inserts.filter((ins) => ins.id !== insertId),
      ),
      activeInsertId:
        state.activeInsertId === insertId ? null : state.activeInsertId,
      isDirty: true,
    })),

  reorderInserts: (blockId, fromIndex, toIndex) =>
    set((state) => ({
      blocks: updateBlockInserts(state.blocks, blockId, (inserts) => {
        const [moved] = inserts.splice(fromIndex, 1);
        inserts.splice(toIndex, 0, moved);
        return inserts;
      }),
      isDirty: true,
    })),

  moveInsert: (fromBlockId, toBlockId, insertId, toIndex) =>
    set((state) => {
      // Find and remove from source block
      let movedInsert: Insert | null = null;
      let blocks = state.blocks.map((b) => {
        if (b.id !== fromBlockId) return b;
        const idx = b.inserts.findIndex((ins) => ins.id === insertId);
        if (idx === -1) return b;
        const newInserts = [...b.inserts];
        [movedInsert] = newInserts.splice(idx, 1);
        return {
          ...b,
          inserts: newInserts.map((ins, i) => ({ ...ins, order_index: i })),
        };
      });

      if (!movedInsert) return state;

      // Add to target block at specified index
      blocks = blocks.map((b) => {
        if (b.id !== toBlockId) return b;
        const newInserts = [...b.inserts];
        newInserts.splice(toIndex, 0, movedInsert!);
        return {
          ...b,
          inserts: newInserts.map((ins, i) => ({ ...ins, order_index: i })),
        };
      });

      return { blocks, isDirty: true };
    }),

  updateInsert: (blockId, insertId, updates) =>
    set((state) => ({
      blocks: updateBlockInserts(state.blocks, blockId, (inserts) =>
        inserts.map((ins) =>
          ins.id === insertId ? { ...ins, ...updates } : ins,
        ),
      ),
      isDirty: true,
    })),
}));
