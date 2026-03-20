"use client";

import { Maximize2, Minimize2 } from "lucide-react";
import { usePortalStore } from "@/stores/portal-store";

export default function ViewToggle() {
  const { viewMode, setViewMode } = usePortalStore();

  return (
    <button
      onClick={() => setViewMode(viewMode === "focused" ? "full_day" : "focused")}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-cm-badge bg-cm-white border border-cm-border text-cm-caption text-cm-text-secondary hover:bg-cm-teal-light hover:text-cm-teal-dark transition-colors"
    >
      {viewMode === "focused" ? (
        <>
          <Maximize2 className="h-3 w-3" />
          <span>See full day</span>
        </>
      ) : (
        <>
          <Minimize2 className="h-3 w-3" />
          <span>Back to now</span>
        </>
      )}
    </button>
  );
}
