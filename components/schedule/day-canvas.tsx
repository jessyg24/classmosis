"use client";

import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { useScheduleStore } from "@/stores/schedule-store";
import ScheduleBlockCard from "./schedule-block-card";
import { Calendar } from "lucide-react";

export default function DayCanvas() {
  const { blocks } = useScheduleStore();

  const { setNodeRef, isOver } = useDroppable({ id: "canvas" });

  // Pre-calculate cumulative minutes for time display
  const cumulativeMinutes: number[] = [];
  let sum = 0;
  for (const block of blocks) {
    cumulativeMinutes.push(sum);
    sum += block.duration_minutes;
  }

  return (
    <div className="flex-1 overflow-y-auto bg-cm-white">
      <div
        ref={setNodeRef}
        className={`min-h-full p-cm-4 transition-colors ${
          isOver ? "bg-cm-teal-light/30" : ""
        }`}
      >
        {blocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-80 text-center">
            <div className="w-16 h-16 bg-cm-teal-light rounded-full flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-cm-teal" />
            </div>
            <h3 className="text-cm-label text-cm-text-primary mb-1">
              No blocks yet
            </h3>
            <p className="text-cm-body text-cm-text-secondary max-w-xs">
              Drag blocks from the library on the left to build your schedule for the day.
            </p>
          </div>
        ) : (
          <SortableContext
            items={blocks.map((b) => b.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-cm-2">
              {blocks.map((block, i) => (
                <ScheduleBlockCard
                  key={block.id}
                  block={block}
                  cumulativeMinutesBefore={cumulativeMinutes[i]}
                />
              ))}
            </div>
          </SortableContext>
        )}
      </div>
    </div>
  );
}
