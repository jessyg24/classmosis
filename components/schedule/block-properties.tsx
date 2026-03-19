"use client";

import { useScheduleStore } from "@/stores/schedule-store";
import { BLOCK_COLORS, BLOCK_HEX, type BlockType } from "@/types/schedule";
import type { TimerBehavior } from "@/types/database";
import { Settings2 } from "lucide-react";

const BLOCK_TYPE_OPTIONS: BlockType[] = [
  "routine",
  "academic",
  "assessment",
  "economy",
  "flex",
  "rotation",
];

const TIMER_OPTIONS: { value: TimerBehavior; label: string }[] = [
  { value: "none", label: "No timer" },
  { value: "auto_start", label: "Auto start" },
  { value: "manual", label: "Manual start" },
];

export default function BlockProperties() {
  const { blocks, activeBlockId, updateBlock } = useScheduleStore();
  const block = blocks.find((b) => b.id === activeBlockId);

  if (!block) {
    return (
      <aside className="w-80 shrink-0 border-l border-cm-border bg-cm-surface overflow-y-auto">
        <div className="p-cm-4 border-b border-cm-border">
          <h2 className="text-cm-overline text-cm-text-hint uppercase">
            Properties
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center h-64 text-center px-cm-4">
          <div className="w-12 h-12 bg-cm-white rounded-full flex items-center justify-center mb-3 border border-cm-border">
            <Settings2 className="h-5 w-5 text-cm-text-hint" />
          </div>
          <p className="text-cm-body text-cm-text-secondary">
            Click a block to edit its properties
          </p>
        </div>
      </aside>
    );
  }

  const hex = BLOCK_HEX[block.type];

  const handleChange = (field: string, value: unknown) => {
    updateBlock(block.id, { [field]: value });
  };

  return (
    <aside className="w-80 shrink-0 border-l border-cm-border bg-cm-surface overflow-y-auto">
      <div
        className="p-cm-4 border-b border-cm-border flex items-center gap-cm-2"
        style={{ borderBottomColor: hex.main }}
      >
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: hex.main }}
        />
        <h2 className="text-cm-overline text-cm-text-hint uppercase">
          {BLOCK_COLORS[block.type].label} Block
        </h2>
      </div>

      <div className="p-cm-4 space-y-cm-4">
        {/* Label */}
        <div>
          <label className="text-cm-caption text-cm-text-secondary block mb-1">
            Label
          </label>
          <input
            type="text"
            value={block.label}
            onChange={(e) => handleChange("label", e.target.value)}
            className="w-full px-cm-3 py-cm-2 text-cm-body border border-cm-border rounded-cm-button bg-cm-white focus:outline-none focus:ring-2 focus:ring-cm-teal/30 focus:border-cm-teal"
          />
        </div>

        {/* Duration */}
        <div>
          <label className="text-cm-caption text-cm-text-secondary block mb-1">
            Duration (minutes)
          </label>
          <input
            type="number"
            min={1}
            max={240}
            value={block.duration_minutes}
            onChange={(e) =>
              handleChange("duration_minutes", Math.max(1, parseInt(e.target.value) || 1))
            }
            className="w-full px-cm-3 py-cm-2 text-cm-body border border-cm-border rounded-cm-button bg-cm-white focus:outline-none focus:ring-2 focus:ring-cm-teal/30 focus:border-cm-teal"
          />
        </div>

        {/* Type */}
        <div>
          <label className="text-cm-caption text-cm-text-secondary block mb-1">
            Block Type
          </label>
          <select
            value={block.type}
            onChange={(e) => handleChange("type", e.target.value)}
            className="w-full px-cm-3 py-cm-2 text-cm-body border border-cm-border rounded-cm-button bg-cm-white focus:outline-none focus:ring-2 focus:ring-cm-teal/30 focus:border-cm-teal"
          >
            {BLOCK_TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {BLOCK_COLORS[t].label}
              </option>
            ))}
          </select>
        </div>

        {/* Timer behavior */}
        <div>
          <label className="text-cm-caption text-cm-text-secondary block mb-1">
            Timer
          </label>
          <div className="space-y-cm-1">
            {TIMER_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-cm-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name={`timer-${block.id}`}
                  value={opt.value}
                  checked={block.timer_behavior === opt.value}
                  onChange={() => handleChange("timer_behavior", opt.value)}
                  className="accent-cm-teal"
                />
                <span className="text-cm-body text-cm-text-primary">
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Timer warning (show only if timer is not none) */}
        {block.timer_behavior !== "none" && (
          <div>
            <label className="text-cm-caption text-cm-text-secondary block mb-1">
              Warning (minutes before end)
            </label>
            <input
              type="number"
              min={1}
              max={30}
              value={block.timer_warning_minutes}
              onChange={(e) =>
                handleChange("timer_warning_minutes", Math.max(1, parseInt(e.target.value) || 5))
              }
              className="w-full px-cm-3 py-cm-2 text-cm-body border border-cm-border rounded-cm-button bg-cm-white focus:outline-none focus:ring-2 focus:ring-cm-teal/30 focus:border-cm-teal"
            />
          </div>
        )}

        {/* External link */}
        <div>
          <label className="text-cm-caption text-cm-text-secondary block mb-1">
            External Link (optional)
          </label>
          <input
            type="url"
            placeholder="https://..."
            value={block.external_link?.url || ""}
            onChange={(e) =>
              handleChange(
                "external_link",
                e.target.value
                  ? { url: e.target.value, platform_name: block.external_link?.platform_name || "" }
                  : null
              )
            }
            className="w-full px-cm-3 py-cm-2 text-cm-body border border-cm-border rounded-cm-button bg-cm-white focus:outline-none focus:ring-2 focus:ring-cm-teal/30 focus:border-cm-teal"
          />
          {block.external_link?.url && (
            <input
              type="text"
              placeholder="Platform name (e.g., Google Classroom)"
              value={block.external_link?.platform_name || ""}
              onChange={(e) =>
                handleChange("external_link", {
                  ...block.external_link,
                  url: block.external_link?.url || "",
                  platform_name: e.target.value,
                })
              }
              className="w-full mt-cm-1 px-cm-3 py-cm-2 text-cm-body border border-cm-border rounded-cm-button bg-cm-white focus:outline-none focus:ring-2 focus:ring-cm-teal/30 focus:border-cm-teal"
            />
          )}
        </div>

        {/* Student visibility */}
        <div className="flex items-center justify-between">
          <label className="text-cm-caption text-cm-text-secondary">
            Visible to students
          </label>
          <button
            type="button"
            onClick={() =>
              handleChange("visible_to_students", !block.visible_to_students)
            }
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              block.visible_to_students ? "bg-cm-teal" : "bg-cm-border-med"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                block.visible_to_students ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Notes */}
        <div>
          <label className="text-cm-caption text-cm-text-secondary block mb-1">
            Notes (teacher only)
          </label>
          <textarea
            value={block.notes || ""}
            onChange={(e) => handleChange("notes", e.target.value || null)}
            rows={3}
            placeholder="Private notes..."
            className="w-full px-cm-3 py-cm-2 text-cm-body border border-cm-border rounded-cm-button bg-cm-white focus:outline-none focus:ring-2 focus:ring-cm-teal/30 focus:border-cm-teal resize-none"
          />
        </div>
      </div>
    </aside>
  );
}
