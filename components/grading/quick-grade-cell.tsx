"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { GradebookCell } from "@/types/grading";

interface QuickGradeCellProps {
  cell: GradebookCell;
  pointsPossible: number;
  hasRubric: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onInlineGrade: (score: number) => void;
}

export default function QuickGradeCell({
  cell,
  pointsPossible,
  hasRubric,
  isSelected,
  onSelect,
  onInlineGrade,
}: QuickGradeCellProps) {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleClick = () => {
    if (hasRubric) {
      onSelect();
    } else {
      // For no-rubric assignments, allow inline editing
      setEditing(true);
      setInputValue(cell.rawScore !== null ? String(cell.rawScore) : "");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = parseFloat(inputValue);
      if (!isNaN(val) && val >= 0) {
        onInlineGrade(val);
      }
      setEditing(false);
    } else if (e.key === "Escape") {
      setEditing(false);
    }
  };

  const displayValue = cell.isMissing
    ? "---"
    : cell.displayLabel || (cell.rawScore !== null ? `${cell.rawScore}` : "---");

  return (
    <td
      className={cn(
        "px-3 py-2 text-center text-cm-body cursor-pointer border-r border-cm-border transition-colors select-none whitespace-nowrap",
        cell.isMissing && "bg-cm-coral/5",
        cell.isDropped && "line-through text-cm-text-hint",
        cell.isExtraCredit && "text-cm-teal",
        isSelected && "ring-2 ring-cm-blue ring-inset bg-cm-blue-light"
      )}
      onClick={handleClick}
    >
      {editing ? (
        <input
          ref={inputRef}
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => setEditing(false)}
          className="w-14 text-center border border-cm-blue rounded px-1 py-0.5 text-cm-body outline-none"
          min={0}
          max={pointsPossible}
        />
      ) : (
        <span>
          {displayValue}
          {cell.rawScore !== null && !cell.isMissing && (
            <span className="text-cm-caption text-cm-text-hint ml-0.5">
              /{pointsPossible}
            </span>
          )}
        </span>
      )}
    </td>
  );
}
