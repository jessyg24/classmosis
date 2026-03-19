"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";
import { BLOCK_COLORS, BLOCK_HEX, formatTime, DEFAULT_START_HOUR, DEFAULT_START_MINUTE } from "@/types/schedule";
import type { Block } from "@/types/database";
import { useScheduleStore } from "@/stores/schedule-store";

interface Props {
  block: Block;
  cumulativeMinutesBefore: number;
}

export default function ScheduleBlockCard({ block, cumulativeMinutesBefore }: Props) {
  const { activeBlockId, setActiveBlock, removeBlock } = useScheduleStore();
  const config = BLOCK_COLORS[block.type];
  const hex = BLOCK_HEX[block.type];
  const isActive = activeBlockId === block.id;

  const startMinutes = DEFAULT_START_HOUR * 60 + DEFAULT_START_MINUTE + cumulativeMinutesBefore;
  const endMinutes = startMinutes + block.duration_minutes;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    borderLeft: `3px solid ${hex.main}`,
  };

  return (
    <div
      ref={setNodeRef}
      style={isActive ? { ...style, "--tw-ring-color": hex.main } as React.CSSProperties : style}
      className={`flex items-center gap-cm-2 px-cm-3 py-cm-3 rounded-cm-button ${config.light} transition-all group cursor-pointer ${
        isDragging ? "opacity-50 shadow-lg z-50" : ""
      } ${isActive ? "ring-2 ring-offset-1" : "hover:shadow-sm"}`}
      onClick={() => setActiveBlock(block.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter") setActiveBlock(block.id); }}
    >
      {/* Drag handle */}
      <button
        className="shrink-0 cursor-grab active:cursor-grabbing text-cm-text-hint hover:text-cm-text-secondary touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Time range */}
      <div className="w-24 shrink-0">
        <p className="text-cm-caption font-medium" style={{ color: hex.dark }}>
          {formatTime(startMinutes)}
        </p>
        <p className="text-cm-caption text-cm-text-hint">
          {formatTime(endMinutes)}
        </p>
      </div>

      {/* Label */}
      <div className="flex-1 min-w-0">
        <p className="text-cm-body font-medium text-cm-text-primary truncate">
          {block.label}
        </p>
        <div className="flex items-center gap-cm-2 mt-0.5">
          <span
            className="text-[10px] font-medium px-1.5 py-0.5 rounded"
            style={{ backgroundColor: hex.main, color: "#fff" }}
          >
            {config.label}
          </span>
          <span className="text-cm-caption text-cm-text-hint">
            {block.duration_minutes}m
          </span>
        </div>
      </div>

      {/* Delete */}
      <button
        className="shrink-0 opacity-0 group-hover:opacity-100 text-cm-text-hint hover:text-cm-coral transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          removeBlock(block.id);
        }}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
