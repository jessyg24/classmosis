"use client";

import { useEffect, useState } from "react";
import { BLOCK_HEX, BLOCK_COLORS, formatTime, DEFAULT_START_HOUR, DEFAULT_START_MINUTE } from "@/types/schedule";
import type { Block } from "@/types/database";
import { Clock, ChevronRight } from "lucide-react";

interface BlockWithTimes extends Block {
  startMinutes: number;
  endMinutes: number;
}

function addTimes(blocks: Block[]): BlockWithTimes[] {
  let cumulative = DEFAULT_START_HOUR * 60 + DEFAULT_START_MINUTE;
  return blocks.map((b) => {
    const start = cumulative;
    cumulative += b.duration_minutes;
    return { ...b, startMinutes: start, endMinutes: cumulative };
  });
}

function getCurrentMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

export default function CurrentBlock({ blocks }: { blocks: Block[] }) {
  const [now, setNow] = useState(getCurrentMinutes);

  // Poll every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(getCurrentMinutes());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  if (blocks.length === 0) {
    return (
      <div className="flex items-center gap-cm-3">
        <div className="w-8 h-8 bg-cm-teal-light rounded-cm-badge flex items-center justify-center">
          <Clock className="h-4 w-4 text-cm-teal" />
        </div>
        <div>
          <span className="text-cm-overline text-cm-text-hint uppercase block">
            Now
          </span>
          <p className="text-cm-body text-cm-text-secondary">
            No schedule for today. Check back when class starts!
          </p>
        </div>
      </div>
    );
  }

  const timed = addTimes(blocks.filter((b) => b.visible_to_students));
  const current = timed.find((b) => now >= b.startMinutes && now < b.endMinutes);
  const currentIdx = current ? timed.indexOf(current) : -1;
  const next = currentIdx >= 0 && currentIdx < timed.length - 1 ? timed[currentIdx + 1] : null;

  // Before school or after school
  if (!current) {
    const first = timed[0];
    const last = timed[timed.length - 1];

    if (now < first.startMinutes) {
      return (
        <div>
          <div className="flex items-center gap-cm-3 mb-3">
            <div className="w-8 h-8 bg-cm-teal-light rounded-cm-badge flex items-center justify-center">
              <Clock className="h-4 w-4 text-cm-teal" />
            </div>
            <span className="text-cm-overline text-cm-text-hint uppercase">
              Now
            </span>
          </div>
          <p className="text-cm-body text-cm-text-secondary mb-2">
            Class starts at {formatTime(first.startMinutes)}
          </p>
          <p className="text-cm-caption text-cm-text-hint">
            First up: {first.label}
          </p>
        </div>
      );
    }

    if (now >= last.endMinutes) {
      return (
        <div>
          <div className="flex items-center gap-cm-3 mb-3">
            <div className="w-8 h-8 bg-cm-teal-light rounded-cm-badge flex items-center justify-center">
              <Clock className="h-4 w-4 text-cm-teal" />
            </div>
            <span className="text-cm-overline text-cm-text-hint uppercase">
              Now
            </span>
          </div>
          <p className="text-cm-body text-cm-text-secondary">
            All done for today! Great work.
          </p>
        </div>
      );
    }

    // Between blocks (shouldn't happen with contiguous schedule, but handle gracefully)
    return (
      <div>
        <div className="flex items-center gap-cm-3 mb-3">
          <div className="w-8 h-8 bg-cm-teal-light rounded-cm-badge flex items-center justify-center">
            <Clock className="h-4 w-4 text-cm-teal" />
          </div>
          <span className="text-cm-overline text-cm-text-hint uppercase">
            Now
          </span>
        </div>
        <p className="text-cm-body text-cm-text-secondary">Transition time</p>
      </div>
    );
  }

  const hex = BLOCK_HEX[current.type] || BLOCK_HEX.academic;
  const config = BLOCK_COLORS[current.type] || BLOCK_COLORS.academic;
  const minutesLeft = current.endMinutes - now;

  return (
    <div>
      <div className="flex items-center gap-cm-3 mb-3">
        <div
          className="w-8 h-8 rounded-cm-badge flex items-center justify-center"
          style={{ backgroundColor: hex.light }}
        >
          <Clock className="h-4 w-4" style={{ color: hex.main }} />
        </div>
        <span className="text-cm-overline text-cm-text-hint uppercase">
          Now
        </span>
      </div>

      {/* Current block card */}
      <div
        className="rounded-cm-card p-cm-4 mb-3"
        style={{
          backgroundColor: hex.light,
          borderLeft: `4px solid ${hex.main}`,
        }}
      >
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-cm-label" style={{ color: hex.dark }}>
              {current.label}
            </h3>
            <span
              className="text-[10px] font-medium px-1.5 py-0.5 rounded inline-block mt-1"
              style={{ backgroundColor: hex.main, color: "#fff" }}
            >
              {config.label}
            </span>
          </div>
          <div className="text-right">
            <p className="text-cm-section font-mono" style={{ color: hex.dark }}>
              {minutesLeft}m
            </p>
            <p className="text-cm-caption text-cm-text-hint">remaining</p>
          </div>
        </div>
        <p className="text-cm-caption text-cm-text-secondary">
          {formatTime(current.startMinutes)} – {formatTime(current.endMinutes)}
        </p>
      </div>

      {/* Up next */}
      {next && (
        <div className="flex items-center gap-cm-2 text-cm-caption text-cm-text-hint">
          <ChevronRight className="h-3 w-3" />
          <span>
            Up next: <strong className="text-cm-text-secondary">{next.label}</strong>{" "}
            at {formatTime(next.startMinutes)}
          </span>
        </div>
      )}
    </div>
  );
}
