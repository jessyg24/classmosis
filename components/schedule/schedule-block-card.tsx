"use client";

import { useSortable } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { GripVertical, X, Plus } from "lucide-react";
import {
  BLOCK_COLORS,
  BLOCK_WOOD,
  BLOCK_TYPE_WOOD,
  CONNECTOR,
  woodGrain,
  formatTime,
  DEFAULT_START_HOUR,
  DEFAULT_START_MINUTE,
} from "@/types/schedule";
import type { Block } from "@/types/database";
import { useScheduleStore } from "@/stores/schedule-store";
import SortableInsertChip from "./sortable-insert-chip";

interface Props {
  block: Block;
  cumulativeMinutesBefore: number;
}

export default function ScheduleBlockCard({ block, cumulativeMinutesBefore }: Props) {
  const { activeBlockId, activeInsertId, setActiveBlock, removeBlock } = useScheduleStore();
  const config = BLOCK_COLORS[block.type];
  const woodColor = BLOCK_TYPE_WOOD[block.type];
  const wood = BLOCK_WOOD[woodColor];
  const isActive = activeBlockId === block.id;
  const hasInserts = block.inserts && block.inserts.length > 0;

  const startMinutes = DEFAULT_START_HOUR * 60 + DEFAULT_START_MINUTE + cumulativeMinutesBefore;
  const endMinutes = startMinutes + block.duration_minutes;

  const woodStyle = {
    backgroundColor: wood.base,
    backgroundImage: woodGrain(wood.grain),
  };

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id, data: { type: "block" } });

  // Droppable well for inserts
  const { setNodeRef: setWellRef, isOver: isWellOver } = useDroppable({
    id: `well-${block.id}`,
    data: { blockId: block.id, isWell: true },
  });

  const wrapperStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={wrapperStyle}
      className={`transition-all ${isDragging ? "opacity-50 z-50" : ""}`}
    >
      <div
        className={`relative rounded-[4px] overflow-hidden ${
          isActive ? "ring-2 ring-offset-1" : ""
        }`}
        style={isActive ? { "--tw-ring-color": wood.base } as React.CSSProperties : undefined}
      >
        {/* ── Top bar ─────────────────────────────────────────── */}
        <div
          className="relative px-3 py-2.5 cursor-pointer"
          style={woodStyle}
          onClick={() => setActiveBlock(block.id)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === "Enter") setActiveBlock(block.id); }}
        >
          {/* Top highlight */}
          <div className="absolute inset-x-0 top-0 h-[1px] rounded-t-[4px] bg-white/20" />
          {/* Depth edge (only when no inserts — otherwise bottom bar has it) */}
          {!hasInserts && (
            <div
              className="absolute inset-x-0 bottom-0"
              style={{ height: 3, backgroundColor: wood.dark }}
            />
          )}

          <div className="relative flex items-center gap-2 text-white">
            {/* Drag handle */}
            <button
              className="shrink-0 cursor-grab active:cursor-grabbing text-white/50 hover:text-white/80 touch-none"
              {...attributes}
              {...listeners}
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="h-4 w-4" />
            </button>

            {/* Time */}
            <div className="w-20 shrink-0">
              <p className="text-cm-caption text-white/60">
                {formatTime(startMinutes)} – {formatTime(endMinutes)}
              </p>
            </div>

            {/* Label */}
            <div className="flex-1 min-w-0">
              <p
                className="text-cm-body font-semibold text-white truncate"
                style={{ textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}
              >
                {block.label}
              </p>
            </div>

            {/* Badges */}
            <span className="rounded-[3px] bg-white/15 px-1.5 py-0.5 text-[10px] font-medium text-white/80">
              {block.duration_minutes}m
            </span>
            <span
              className="rounded-[3px] px-1.5 py-0.5 text-[10px] font-semibold text-white"
              style={{ backgroundColor: "rgba(255,255,255,0.18)", textShadow: "0 1px 1px rgba(0,0,0,0.2)" }}
            >
              {config.label}
            </span>

            {/* Delete */}
            <button
              className="shrink-0 opacity-0 group-hover:opacity-100 text-white/40 hover:text-white transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                removeBlock(block.id);
              }}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* ── C-shaped body with insert well ──────────────────── */}
        <div className="flex group">
          {/* Left wall */}
          <div
            className="relative shrink-0"
            style={{ ...woodStyle, width: CONNECTOR.TAB_L }}
          >
            <div className="absolute inset-y-0 right-0 w-[1px] bg-black/10" />
          </div>

          {/* Insert well — droppable zone */}
          <div
            ref={setWellRef}
            className={`flex-1 min-h-[36px] py-1.5 pl-1.5 pr-2 transition-colors ${
              isWellOver ? "bg-cm-teal-light/40" : "bg-cm-surface"
            }`}
          >
            {hasInserts ? (
              <SortableContext
                items={block.inserts.map((ins) => ins.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-1">
                  {block.inserts.map((insert, idx) => (
                    <SortableInsertChip
                      key={insert.id}
                      insert={insert}
                      index={idx}
                      blockId={block.id}
                      isActive={activeInsertId === insert.id}
                    />
                  ))}
                </div>
              </SortableContext>
            ) : (
              <div className="flex items-center justify-center h-full min-h-[28px] rounded-[3px] border border-dashed border-cm-border text-cm-text-hint">
                <Plus className="h-3 w-3 mr-1" />
                <span className="text-[10px]">Drop inserts here</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Bottom bar ──────────────────────────────────────── */}
        <div
          className="relative h-[10px]"
          style={woodStyle}
        >
          <div
            className="absolute inset-x-0 bottom-0 rounded-b-[4px]"
            style={{ height: 3, backgroundColor: wood.dark }}
          />
        </div>
      </div>
    </div>
  );
}
