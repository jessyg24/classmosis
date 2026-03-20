"use client";

import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { Search, ChevronDown, ChevronRight } from "lucide-react";
import {
  BLOCK_WOOD,
  BLOCK_TYPE_WOOD,
  woodGrain,
} from "@/types/schedule";
import {
  BLOCK_CATEGORIES,
  getBlocksByCategory,
  type MainBlockDef,
} from "@/types/block-catalog";
import {
  SUBROUTINE_CATEGORIES,
  getSubRoutinesByCategory,
  type SubRoutineDef,
} from "@/types/subroutine-catalog";
import { InsertPaletteChip } from "./wood-block";

// ── Draggable Main Block Card ────────────────────────────────

function DraggableBlockCard({ def }: { def: MainBlockDef }) {
  const woodColor = BLOCK_TYPE_WOOD[def.key] || def.defaultColor || "teal";
  const wood = BLOCK_WOOD[woodColor as keyof typeof BLOCK_WOOD] || BLOCK_WOOD.teal;

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `library-${def.key}`,
    data: { type: def.key, fromLibrary: true },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`relative flex items-center gap-2 px-2.5 py-2 text-white cursor-grab active:cursor-grabbing select-none transition-all ${
        isDragging ? "opacity-50 scale-95" : "hover:brightness-110"
      }`}
      style={{
        backgroundColor: wood.base,
        backgroundImage: woodGrain(wood.grain),
        borderRadius: "4px",
      }}
    >
      <div className="absolute inset-x-0 bottom-0" style={{ height: 3, backgroundColor: wood.dark, borderRadius: "0 0 4px 4px" }} />
      <div className="absolute inset-x-0 top-0 h-[1px] rounded-t-[4px] bg-white/20" />
      <div className="relative flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-white truncate" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>
          {def.label}
        </p>
        <p className="text-[10px] text-white/50">
          {def.defaultDurationMin}–{def.defaultDurationMax}m
        </p>
      </div>
    </div>
  );
}

// ── Draggable Sub-Routine Chip ───────────────────────────────

function DraggableSubRoutineChip({ def, index }: { def: SubRoutineDef; index: number }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `insert-library-${def.key}`,
    data: { insertType: def.key, fromInsertLibrary: true },
  });

  return (
    <InsertPaletteChip
      type={def.key}
      index={index}
      dragRef={setNodeRef}
      dragProps={{ ...attributes, ...listeners }}
      isDragging={isDragging}
    />
  );
}

// ── Collapsible Category Section ─────────────────────────────

function CategorySection({
  label,
  count,
  defaultOpen,
  children,
}: {
  label: string;
  count: number;
  defaultOpen: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-medium text-cm-text-hint uppercase tracking-wider hover:bg-cm-white transition-colors"
      >
        {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        {label}
        <span className="text-cm-text-hint/50 ml-auto">{count}</span>
      </button>
      {open && <div className="px-2 pb-2 space-y-1.5">{children}</div>}
    </div>
  );
}

// ── Main Block Library Component ─────────────────────────────

export default function BlockLibrary() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"blocks" | "subroutines">("blocks");

  const searchLower = search.toLowerCase();

  return (
    <aside className="w-64 shrink-0 border-r border-cm-border bg-cm-surface overflow-y-auto flex flex-col">
      {/* Search */}
      <div className="p-2 border-b border-cm-border">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-cm-text-hint" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full pl-7 pr-2 py-1.5 text-cm-caption bg-cm-white border border-cm-border rounded-cm-badge focus:outline-none focus:ring-1 focus:ring-cm-teal placeholder:text-cm-text-hint"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-cm-border">
        <button
          onClick={() => setTab("blocks")}
          className={`flex-1 py-2 text-[11px] font-medium uppercase tracking-wider transition-colors ${
            tab === "blocks" ? "text-cm-teal border-b-2 border-cm-teal" : "text-cm-text-hint"
          }`}
        >
          Blocks
        </button>
        <button
          onClick={() => setTab("subroutines")}
          className={`flex-1 py-2 text-[11px] font-medium uppercase tracking-wider transition-colors ${
            tab === "subroutines" ? "text-cm-teal border-b-2 border-cm-teal" : "text-cm-text-hint"
          }`}
        >
          Sub-routines
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {tab === "blocks" ? (
          <div className="py-1">
            {BLOCK_CATEGORIES.map((cat, catIdx) => {
              const blocks = getBlocksByCategory(cat.key).filter(
                (b) => !search || b.label.toLowerCase().includes(searchLower) || b.subjectDescription.toLowerCase().includes(searchLower)
              );
              if (blocks.length === 0) return null;
              return (
                <CategorySection
                  key={cat.key}
                  label={cat.label}
                  count={blocks.length}
                  defaultOpen={catIdx === 0 || !!search}
                >
                  {blocks.map((def) => (
                    <DraggableBlockCard key={def.key} def={def} />
                  ))}
                </CategorySection>
              );
            })}
            {search && getBlocksByCategory("core_academic").filter((b) => b.label.toLowerCase().includes(searchLower)).length === 0 && (
              <p className="text-cm-caption text-cm-text-hint text-center py-4">No blocks match</p>
            )}
          </div>
        ) : (
          <div className="py-1">
            <p className="px-3 py-1 text-[10px] text-cm-text-hint">Drag into a block</p>
            {SUBROUTINE_CATEGORIES.map((cat) => {
              const subs = getSubRoutinesByCategory(cat.key).filter(
                (s) => !search || s.label.toLowerCase().includes(searchLower) || s.description.toLowerCase().includes(searchLower)
              );
              if (subs.length === 0) return null;
              return (
                <CategorySection
                  key={cat.key}
                  label={cat.label}
                  count={subs.length}
                  defaultOpen={!!search}
                >
                  {subs.map((def, i) => (
                    <DraggableSubRoutineChip key={def.key} def={def} index={i} />
                  ))}
                </CategorySection>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
