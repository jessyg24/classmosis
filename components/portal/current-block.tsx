"use client";

import { Clock } from "lucide-react";
import type { Block } from "@/types/database";
import { usePortalStore } from "@/stores/portal-store";
import FocusedView from "./focused-view";
import FullDayView from "./full-day-view";

export default function CurrentBlock({ blocks }: { blocks: Block[] }) {
  const { viewMode } = usePortalStore();

  if (blocks.length === 0) {
    return (
      <div className="flex items-center gap-cm-3">
        <div className="w-8 h-8 bg-cm-teal-light rounded-cm-badge flex items-center justify-center">
          <Clock className="h-4 w-4 text-cm-teal" />
        </div>
        <div>
          <span className="text-cm-overline text-cm-text-hint uppercase block">Now</span>
          <p className="text-cm-body text-cm-text-secondary">
            No schedule for today. Check back when class starts!
          </p>
        </div>
      </div>
    );
  }

  // Filter to visible blocks
  const visibleBlocks = blocks.filter((b) => b.visible_to_students);

  // Check if full day view is restricted by current block settings
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  let cumulative = 8 * 60;
  let currentBlock: Block | null = null;
  for (const block of visibleBlocks) {
    const end = cumulative + block.duration_minutes;
    if (currentMinutes >= cumulative && currentMinutes < end) {
      currentBlock = block;
      break;
    }
    cumulative = end;
  }

  const fullDayAvailable = currentBlock?.student_view_settings?.full_day_view_available !== false;

  // Force focused view if full day is restricted
  const effectiveMode = (!fullDayAvailable && viewMode === "full_day") ? "focused" : viewMode;

  return effectiveMode === "full_day" ? (
    <FullDayView blocks={visibleBlocks} />
  ) : (
    <FocusedView blocks={visibleBlocks} />
  );
}
