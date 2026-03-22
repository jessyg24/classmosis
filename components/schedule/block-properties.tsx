"use client";

import { useScheduleStore } from "@/stores/schedule-store";
import {
  BLOCK_COLORS,
  BLOCK_WOOD,
  BLOCK_TYPE_WOOD,
  INSERT_CONFIG,
  INSERT_TYPES,
  type BlockType,
  type InsertType,
} from "@/types/schedule";
import type { TimerBehavior } from "@/types/database";
import { Settings2, ChevronLeft, Trash2 } from "lucide-react";
import { getInsertIcon } from "./wood-block";
import InsertSettingsForm from "./insert-settings-form";

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
  const {
    blocks,
    activeBlockId,
    activeInsertId,
    updateBlock,
    updateInsert,
    removeInsert,
    setActiveInsert,
  } = useScheduleStore();

  const block = blocks.find((b) => b.id === activeBlockId);
  const insert = block?.inserts.find((ins) => ins.id === activeInsertId);

  // ── No block selected ────────────────────────────────────────

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

  const woodColor = BLOCK_TYPE_WOOD[block.type] || "teal";
  const wood = BLOCK_WOOD[woodColor as keyof typeof BLOCK_WOOD] || BLOCK_WOOD.teal;

  // ── Insert selected → insert properties ──────────────────────

  if (insert && activeInsertId) {
    const insertConfig = INSERT_CONFIG[insert.type as InsertType];
    const IconComp = insertConfig ? getInsertIcon(insertConfig.icon) : null;

    return (
      <aside className="w-80 shrink-0 border-l border-cm-border bg-cm-surface overflow-y-auto">
        <div
          className="p-cm-4 border-b border-cm-border flex items-center gap-cm-2"
          style={{ borderBottomColor: wood.base }}
        >
          <button
            onClick={() => setActiveInsert(null)}
            className="text-cm-text-hint hover:text-cm-text-primary"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {IconComp && <IconComp className="h-4 w-4" style={{ color: wood.base }} />}
          <h2 className="text-cm-overline text-cm-text-hint uppercase flex-1">
            Insert
          </h2>
          <button
            onClick={() => {
              removeInsert(block.id, insert.id);
              setActiveInsert(null);
            }}
            className="text-cm-text-hint hover:text-cm-coral"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="p-cm-4 space-y-cm-4">
          {/* Label */}
          <div>
            <label className="text-cm-caption text-cm-text-secondary block mb-1">
              Label
            </label>
            <input
              type="text"
              value={insert.label}
              onChange={(e) => updateInsert(block.id, insert.id, { label: e.target.value })}
              className="w-full px-cm-3 py-cm-2 text-cm-body border border-cm-border rounded-cm-button bg-cm-white focus:outline-none focus:ring-2 focus:ring-cm-teal/30 focus:border-cm-teal"
            />
          </div>

          {/* Type */}
          <div>
            <label className="text-cm-caption text-cm-text-secondary block mb-1">
              Insert Type
            </label>
            <select
              value={insert.type}
              onChange={(e) => {
                const newType = e.target.value as InsertType;
                const newConfig = INSERT_CONFIG[newType];
                updateInsert(block.id, insert.id, {
                  type: newType,
                  label: insert.label === INSERT_CONFIG[insert.type as InsertType]?.defaultLabel
                    ? newConfig.defaultLabel
                    : insert.label,
                });
              }}
              className="w-full px-cm-3 py-cm-2 text-cm-body border border-cm-border rounded-cm-button bg-cm-white focus:outline-none focus:ring-2 focus:ring-cm-teal/30 focus:border-cm-teal"
            >
              {INSERT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {INSERT_CONFIG[t].label}
                </option>
              ))}
            </select>
          </div>

          {/* Duration */}
          <div>
            <label className="text-cm-caption text-cm-text-secondary block mb-1">
              Duration (minutes, optional)
            </label>
            <input
              type="number"
              min={1}
              max={120}
              value={insert.duration_minutes ?? ""}
              placeholder="Auto"
              onChange={(e) =>
                updateInsert(block.id, insert.id, {
                  duration_minutes: e.target.value ? Math.max(1, parseInt(e.target.value) || 0) : null,
                })
              }
              className="w-full px-cm-3 py-cm-2 text-cm-body border border-cm-border rounded-cm-button bg-cm-white focus:outline-none focus:ring-2 focus:ring-cm-teal/30 focus:border-cm-teal"
            />
            <p className="text-[10px] text-cm-text-hint mt-1">
              Leave blank to auto-divide parent block time
            </p>
          </div>

          {/* Type-specific settings */}
          <div className="border-t border-cm-border pt-cm-4">
            <InsertSettingsForm insert={insert} blockId={block.id} />
          </div>
        </div>
      </aside>
    );
  }

  // ── Block selected → block properties ────────────────────────

  const handleChange = (field: string, value: unknown) => {
    updateBlock(block.id, { [field]: value });
  };

  return (
    <aside className="w-80 shrink-0 border-l border-cm-border bg-cm-surface overflow-y-auto">
      <div
        className="p-cm-4 border-b border-cm-border flex items-center gap-cm-2"
        style={{ borderBottomColor: wood.base }}
      >
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: wood.base }}
        />
        <h2 className="text-cm-overline text-cm-text-hint uppercase">
          {(BLOCK_COLORS[block.type]?.label || block.label || block.type)} Block
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

        {/* Timer warning */}
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

        {/* Inserts summary */}
        {block.inserts.length > 0 && (
          <div>
            <label className="text-cm-caption text-cm-text-secondary block mb-2">
              Inserts ({block.inserts.length})
            </label>
            <div className="space-y-1">
              {block.inserts.map((ins) => {
                const cfg = INSERT_CONFIG[ins.type as InsertType];
                const Icon = cfg ? getInsertIcon(cfg.icon) : null;
                return (
                  <button
                    key={ins.id}
                    onClick={() => setActiveInsert(ins.id)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-cm-badge text-left hover:bg-cm-white transition-colors"
                  >
                    {Icon && <Icon className="h-3 w-3 shrink-0 text-cm-text-hint" />}
                    <span className="text-cm-caption text-cm-text-primary truncate flex-1">
                      {ins.label}
                    </span>
                    {ins.duration_minutes && (
                      <span className="text-[10px] text-cm-text-hint">{ins.duration_minutes}m</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
