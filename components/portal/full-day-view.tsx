"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import type { Block } from "@/types/database";
import { getSubRoutineDef } from "@/types/subroutine-catalog";
import ViewToggle from "./view-toggle";
import { usePortalStore } from "@/stores/portal-store";

interface FullDayViewProps {
  blocks: Block[];
}

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

export default function FullDayView({ blocks }: FullDayViewProps) {
  const { setViewMode } = usePortalStore();
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

  let cumulative = 8 * 60;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-cm-section text-cm-text-primary">
          {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
        </h3>
        <ViewToggle />
      </div>

      <div className="space-y-1">
        {blocks.map((block) => {
          const start = cumulative;
          const end = cumulative + block.duration_minutes;
          cumulative = end;

          const isCurrent = now >= start && now < end;
          const isCompleted = now >= end;
          const inserts = block.inserts || [];
          const settings = block.student_view_settings;

          return (
            <div
              key={block.id}
              className={`rounded-cm-button border transition-all ${
                isCurrent
                  ? "border-cm-teal bg-cm-teal-light/30"
                  : isCompleted
                    ? "border-cm-border opacity-60"
                    : "border-cm-border"
              }`}
            >
              <button
                onClick={() => {
                  if (isCurrent) setViewMode("focused");
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left"
              >
                {/* Status */}
                <div className="shrink-0">
                  {isCompleted ? (
                    <div className="w-5 h-5 rounded-full bg-cm-teal flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  ) : isCurrent ? (
                    <div className="w-5 h-5 rounded-full bg-cm-teal animate-pulse flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-cm-border" />
                  )}
                </div>

                {/* Block info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-cm-body ${isCurrent ? "font-medium text-cm-teal-dark" : isCompleted ? "text-cm-text-hint" : "text-cm-text-primary"}`}>
                      {block.label}
                    </p>
                    {isCurrent && (
                      <span className="px-1.5 py-0.5 rounded-cm-badge bg-cm-teal text-white text-[9px] font-medium uppercase">
                        Now
                      </span>
                    )}
                  </div>

                  {/* Sub-routine peek for current block */}
                  {isCurrent && inserts.length > 0 && settings?.show_sub_routines_in_full_day !== false && (
                    <div className="flex items-center gap-1 mt-1 flex-wrap">
                      {inserts.map((ins, i) => {
                        // Determine if this insert is active/completed based on timing
                        let insCum = start;
                        let insIsCompleted = false;
                        let insIsActive = false;
                        for (let j = 0; j <= i; j++) {
                          const dur = inserts[j].duration_minutes || 10;
                          if (j === i) {
                            insIsActive = now >= insCum && now < insCum + dur;
                            insIsCompleted = now >= insCum + dur;
                          }
                          insCum += dur;
                        }

                        return (
                          <span
                            key={ins.id}
                            className={`text-[10px] ${
                              insIsActive ? "text-cm-teal-dark font-medium" :
                              insIsCompleted ? "text-cm-text-hint line-through" :
                              "text-cm-text-hint"
                            }`}
                          >
                            {insIsCompleted && "✓ "}
                            {insIsActive && "▶ "}
                            {ins.label || getSubRoutineDef(ins.type).label}
                            {i < inserts.length - 1 && <span className="text-cm-text-hint/50 ml-1">·</span>}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Time */}
                <div className="shrink-0 text-right">
                  <p className="text-cm-caption text-cm-text-hint">{formatTime(start)}</p>
                  <p className="text-[10px] text-cm-text-hint">{block.duration_minutes}m</p>
                </div>
              </button>

              {/* Non-instructional message */}
              {isCurrent && !block.is_instructional && block.non_instructional_message && (
                <div className="px-3 pb-2.5">
                  <p className="text-cm-caption text-cm-teal">{block.non_instructional_message}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
