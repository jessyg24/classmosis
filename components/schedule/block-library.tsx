"use client";

import { useDraggable } from "@dnd-kit/core";
import {
  Coffee,
  BookOpen,
  ClipboardCheck,
  Coins,
  Puzzle,
  RotateCcw,
} from "lucide-react";
import { BLOCK_COLORS, BLOCK_HEX, type BlockType } from "@/types/schedule";

const BLOCK_ICONS: Record<BlockType, React.ComponentType<{ className?: string }>> = {
  routine: Coffee,
  academic: BookOpen,
  assessment: ClipboardCheck,
  economy: Coins,
  flex: Puzzle,
  rotation: RotateCcw,
};

const BLOCK_TYPES: BlockType[] = [
  "routine",
  "academic",
  "assessment",
  "economy",
  "flex",
  "rotation",
];

function DraggableBlockCard({ type }: { type: BlockType }) {
  const config = BLOCK_COLORS[type];
  const hex = BLOCK_HEX[type];
  const Icon = BLOCK_ICONS[type];

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `library-${type}`,
    data: { type, fromLibrary: true },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`flex items-center gap-cm-3 px-cm-3 py-cm-3 rounded-cm-button cursor-grab active:cursor-grabbing transition-all select-none ${config.light} ${isDragging ? "opacity-50 scale-95" : "hover:shadow-sm"}`}
      style={{ borderLeft: `3px solid ${hex.main}` }}
    >
      <span style={{ color: hex.main }}>
        <Icon className="h-4 w-4 shrink-0" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-cm-body font-medium" style={{ color: hex.dark }}>
          {config.label}
        </p>
        <p className="text-cm-caption text-cm-text-hint">
          {config.defaultDuration}m default
        </p>
      </div>
    </div>
  );
}

export default function BlockLibrary() {
  return (
    <aside className="w-60 shrink-0 border-r border-cm-border bg-cm-surface overflow-y-auto">
      <div className="p-cm-4 border-b border-cm-border">
        <h2 className="text-cm-overline text-cm-text-hint uppercase">
          Block Library
        </h2>
      </div>
      <div className="p-cm-3 space-y-cm-2">
        {BLOCK_TYPES.map((type) => (
          <DraggableBlockCard key={type} type={type} />
        ))}
      </div>
      <div className="p-cm-3 border-t border-cm-border mt-auto">
        <p className="text-cm-caption text-cm-text-hint">
          Drag a block onto the canvas to add it to your schedule.
        </p>
      </div>
    </aside>
  );
}
