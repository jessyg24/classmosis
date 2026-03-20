"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Insert } from "@/types/database";
import { useScheduleStore } from "@/stores/schedule-store";
import { WoodInsertChip } from "./wood-block";

interface Props {
  insert: Insert;
  index: number;
  blockId: string;
  isActive: boolean;
}

export default function SortableInsertChip({ insert, index, blockId, isActive }: Props) {
  const { setActiveBlock, setActiveInsert } = useScheduleStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: insert.id,
    data: { type: "insert", blockId, insertId: insert.id },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <WoodInsertChip
      ref={setNodeRef}
      insert={insert}
      index={index}
      isActive={isActive}
      style={style}
      className="cursor-grab active:cursor-grabbing"
      dragHandleProps={{ ...attributes, ...listeners }}
      onClick={() => {
        setActiveBlock(blockId);
        setActiveInsert(insert.id);
      }}
    />
  );
}
