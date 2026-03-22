"use client";

import { forwardRef } from "react";
import type { CSSProperties } from "react";
import type { Block, Insert } from "@/types/database";
import {
  BLOCK_WOOD,
  BLOCK_TYPE_WOOD,
  INSERT_WOOD_COLORS,
  INSERT_CONFIG,
  woodGrain,
  type WoodColor,
  type InsertType,
} from "@/types/schedule";
import { getSubRoutineDef } from "@/types/subroutine-catalog";
import * as LucideIcons from "lucide-react";
import { BookOpen } from "lucide-react";

// ── Icon resolver ──────────────────────────────────────────────

const iconCache: Record<string, React.ComponentType<{ className?: string; style?: CSSProperties }>> = {};

export function getInsertIcon(iconName: string): React.ComponentType<{ className?: string; style?: CSSProperties }> {
  if (iconCache[iconName]) return iconCache[iconName];

  // Try PascalCase directly (catalog format: "BookOpen", "Zap", etc.)
  const direct = (LucideIcons as Record<string, unknown>)[iconName];
  if (typeof direct === "function" || (typeof direct === "object" && direct !== null)) {
    iconCache[iconName] = direct as React.ComponentType<{ className?: string; style?: CSSProperties }>;
    return iconCache[iconName];
  }

  // Try kebab-case to PascalCase conversion (old format: "book-open" → "BookOpen")
  const pascal = iconName.split("-").map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join("");
  const converted = (LucideIcons as Record<string, unknown>)[pascal];
  if (typeof converted === "function" || (typeof converted === "object" && converted !== null)) {
    iconCache[iconName] = converted as React.ComponentType<{ className?: string; style?: CSSProperties }>;
    return iconCache[iconName];
  }

  return BookOpen;
}

// ── Wood style helpers ─────────────────────────────────────────

export function getWoodStyle(color: WoodColor): CSSProperties {
  const w = BLOCK_WOOD[color];
  return {
    backgroundColor: w.base,
    backgroundImage: woodGrain(w.grain),
  };
}

// Category-based stable colors for sub-routines (don't change on reorder)
const SUBROUTINE_CATEGORY_COLORS: Record<string, { base: string; dark: string }> = {
  instruction: { base: "#5A8FCC", dark: "#4A7AB5" },   // blue
  practice: { base: "#3D9E7A", dark: "#2D8868" },      // teal
  discussion_sharing: { base: "#7B5FB5", dark: "#6A4DA0" }, // purple
  assessment: { base: "#C4923A", dark: "#B07E2A" },     // amber
  routine: { base: "#6BA050", dark: "#5A8D40" },        // green
  economy: { base: "#D4764E", dark: "#C0623A" },        // coral
  special: { base: "#A85A7A", dark: "#944668" },        // pink
};

const DEFAULT_INSERT_COLOR = { base: "#A39070", dark: "#8E7A5A" }; // walnut fallback

export function getInsertWoodStyle(index: number, type?: string): { style: CSSProperties; dark: string } {
  // If type is provided, use category-based stable color
  let color = DEFAULT_INSERT_COLOR;
  if (type) {
    const subDef = getSubRoutineDef(type);
    color = SUBROUTINE_CATEGORY_COLORS[subDef.category] || DEFAULT_INSERT_COLOR;
  } else {
    // Legacy fallback: position-based
    color = INSERT_WOOD_COLORS[index % INSERT_WOOD_COLORS.length];
  }
  return {
    style: {
      backgroundColor: color.base,
      backgroundImage: woodGrain("rgba(0,0,0,0.07)"),
      borderRadius: "3px",
    },
    dark: color.dark,
  };
}

// ── WoodInsertChip ─────────────────────────────────────────────

interface WoodInsertChipProps {
  insert: Insert;
  index: number;
  isActive?: boolean;
  onClick?: () => void;
  onDelete?: () => void;
  dragHandleProps?: Record<string, unknown>;
  style?: CSSProperties;
  className?: string;
}

export const WoodInsertChip = forwardRef<HTMLDivElement, WoodInsertChipProps>(
  function WoodInsertChip({ insert, index, isActive, onClick, onDelete, dragHandleProps, style: externalStyle, className = "" }, ref) {
    const { style: woodStyle, dark } = getInsertWoodStyle(index, insert.type);
    const config = INSERT_CONFIG[insert.type as InsertType];
    const subDef = !config ? getSubRoutineDef(insert.type) : null;
    const IconComp = getInsertIcon(config?.icon || subDef?.icon || "book-open");

    return (
      <div
        ref={ref}
        className={`relative flex items-center gap-2 px-2.5 py-2 text-white cursor-pointer select-none group/insert ${
          isActive ? "ring-2 ring-white/50 ring-offset-1 ring-offset-cm-surface" : ""
        } ${className}`}
        style={{ ...woodStyle, ...externalStyle }}
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" && onClick) onClick(); }}
        {...dragHandleProps}
      >
        {/* Depth edge */}
        <div
          className="absolute inset-x-0 bottom-0"
          style={{ height: 2, backgroundColor: dark, borderRadius: "0 0 3px 3px" }}
        />
        {/* Top bevel */}
        <div className="absolute inset-x-0 top-0 h-[1px] rounded-t-[3px] bg-white/15" />
        <IconComp className="relative h-3.5 w-3.5 shrink-0 text-white/70" />
        <span
          className="relative text-cm-caption font-medium flex-1 min-w-0 truncate"
          style={{ textShadow: "0 1px 1px rgba(0,0,0,0.25)" }}
        >
          {insert.label}
        </span>
        {insert.duration_minutes && (
          <span className="relative text-[10px] text-white/50">
            {insert.duration_minutes}m
          </span>
        )}
        {onDelete && (
          <button
            className="relative shrink-0 opacity-0 group-hover/insert:opacity-100 text-white/40 hover:text-white transition-opacity ml-0.5"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
          >
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
    );
  }
);

// ── Insert palette chip (for library) ──────────────────────────

interface InsertPaletteChipProps {
  type: InsertType;
  index: number;
  dragRef?: (node: HTMLElement | null) => void;
  dragProps?: Record<string, unknown>;
  isDragging?: boolean;
}

export function InsertPaletteChip({ type, index, dragRef, dragProps, isDragging }: InsertPaletteChipProps) {
  const config = INSERT_CONFIG[type];
  const subDef = !config ? getSubRoutineDef(type) : null;
  const { style: woodStyle, dark } = getInsertWoodStyle(index, type);
  const IconComp = getInsertIcon(config?.icon || subDef?.icon || "book-open");
  const label = config?.label || subDef?.label || type;

  return (
    <div
      ref={dragRef}
      className={`relative flex items-center gap-2 px-2.5 py-1.5 text-white cursor-grab active:cursor-grabbing select-none transition-all ${
        isDragging ? "opacity-50 scale-95" : "hover:brightness-110"
      }`}
      style={woodStyle}
      {...dragProps}
    >
      <div
        className="absolute inset-x-0 bottom-0"
        style={{ height: 2, backgroundColor: dark, borderRadius: "0 0 3px 3px" }}
      />
      <div className="absolute inset-x-0 top-0 h-[1px] rounded-t-[3px] bg-white/15" />
      <IconComp className="relative h-3 w-3 shrink-0 text-white/70" />
      <span
        className="relative text-[11px] font-medium"
        style={{ textShadow: "0 1px 1px rgba(0,0,0,0.2)" }}
      >
        {label}
      </span>
    </div>
  );
}

// ── Block type to wood color helper ────────────────────────────

export function blockWoodColor(block: Block): WoodColor {
  return BLOCK_TYPE_WOOD[block.type] || "teal";
}
