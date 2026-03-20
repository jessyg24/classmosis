"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import type { Block } from "@/types/database";
import { getSubRoutineDef } from "@/types/subroutine-catalog";
import ViewToggle from "./view-toggle";

interface FocusedViewProps {
  blocks: Block[];
}

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

export default function FocusedView({ blocks }: FocusedViewProps) {
  const [now, setNow] = useState(() => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const d = new Date();
      setNow(d.getHours() * 60 + d.getMinutes());
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Find current block based on time
  let cumulative = 8 * 60; // 8:00 AM default start
  let currentBlock: Block | null = null;
  let blockStart = cumulative;

  for (const block of blocks) {
    const end = cumulative + block.duration_minutes;
    if (now >= cumulative && now < end) {
      currentBlock = block;
      blockStart = cumulative;
      break;
    }
    cumulative = end;
  }

  if (!currentBlock) {
    // Before or after school
    if (now < 8 * 60) {
      return (
        <div className="text-center py-8">
          <p className="text-cm-body text-cm-text-secondary">School hasn&apos;t started yet.</p>
          <p className="text-cm-caption text-cm-text-hint mt-1">Check back at {formatTime(8 * 60)}</p>
        </div>
      );
    }
    return (
      <div className="text-center py-8">
        <p className="text-cm-body text-cm-text-secondary">That&apos;s a wrap for today!</p>
        <p className="text-cm-caption text-cm-text-hint mt-1">Great work. See you tomorrow!</p>
      </div>
    );
  }

  const blockEnd = blockStart + currentBlock.duration_minutes;
  const blockRemaining = blockEnd - now;

  // Non-instructional block
  if (!currentBlock.is_instructional && currentBlock.non_instructional_message) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-cm-section text-cm-text-primary">{currentBlock.label}</h3>
          <ViewToggle />
        </div>
        <div className="flex items-center justify-center py-12">
          <p className="text-cm-section text-cm-text-secondary">{currentBlock.non_instructional_message}</p>
        </div>
      </div>
    );
  }

  // Calculate sub-routine timing
  const inserts = currentBlock.inserts || [];
  let insertCumulative = blockStart;
  const insertTimes = inserts.map((ins) => {
    const dur = ins.duration_minutes || 10;
    const start = insertCumulative;
    insertCumulative += dur;
    return { ...ins, startMin: start, endMin: start + dur };
  });

  // Find active sub-routine
  const activeIdx = insertTimes.findIndex((ins) => now >= ins.startMin && now < ins.endMin);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-cm-section text-cm-text-primary">{currentBlock.label}</h3>
          <p className="text-cm-caption text-cm-text-hint">
            {formatTime(blockStart)} · {currentBlock.duration_minutes} min total · {blockRemaining} min remaining
          </p>
        </div>
        <ViewToggle />
      </div>

      {/* Sub-routines */}
      {inserts.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-cm-body text-cm-text-secondary">Focus time — keep working!</p>
        </div>
      ) : (
        <div className="space-y-1">
          {insertTimes.map((ins, idx) => {
            const isActive = idx === activeIdx;
            const isCompleted = idx < activeIdx;
            const subDef = getSubRoutineDef(ins.type);
            const remaining = isActive ? ins.endMin - now : null;

            return (
              <div
                key={ins.id}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-cm-button transition-all ${
                  isActive
                    ? "bg-cm-teal-light border border-cm-teal/20"
                    : isCompleted
                      ? "opacity-50"
                      : "opacity-60"
                }`}
              >
                {/* Status indicator */}
                <div className="shrink-0">
                  {isCompleted ? (
                    <div className="w-5 h-5 rounded-full bg-cm-teal flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  ) : isActive ? (
                    <div className="w-5 h-5 rounded-full bg-cm-teal animate-pulse flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-cm-border" />
                  )}
                </div>

                {/* Label */}
                <div className="flex-1 min-w-0">
                  <p className={`text-cm-body ${isActive ? "font-medium text-cm-teal-dark" : "text-cm-text-secondary"}`}>
                    {ins.label || subDef.label}
                  </p>
                  {isActive && subDef.studentViewDescription && (
                    <p className="text-cm-caption text-cm-teal">{subDef.studentViewDescription}</p>
                  )}
                </div>

                {/* Timer */}
                <div className="shrink-0 text-right">
                  {isActive && remaining !== null ? (
                    <span className={`text-cm-body font-medium tabular-nums ${remaining <= 2 ? "text-cm-coral animate-pulse" : "text-cm-teal-dark"}`}>
                      {remaining}m left
                    </span>
                  ) : (
                    <span className="text-cm-caption text-cm-text-hint">
                      {ins.duration_minutes || "—"}m
                    </span>
                  )}
                </div>

                {/* NOW badge */}
                {isActive && (
                  <span className="shrink-0 px-1.5 py-0.5 rounded-cm-badge bg-cm-teal text-white text-[9px] font-medium uppercase">
                    Now
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
