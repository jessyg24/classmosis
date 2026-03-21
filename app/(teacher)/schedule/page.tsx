"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DndContext,
  DragOverlay,
  rectIntersection,
  pointerWithin,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type CollisionDetection,
} from "@dnd-kit/core";
import { useScheduleStore } from "@/stores/schedule-store";
import { useClassStore } from "@/stores/class-store";
import BlockLibrary from "@/components/schedule/block-library";
import DayCanvas from "@/components/schedule/day-canvas";
import BlockProperties from "@/components/schedule/block-properties";
import PublishDialog from "@/components/schedule/publish-dialog";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Save,
  Rocket,
  BookmarkPlus,
  FolderOpen,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  DAY_TYPES,
  formatDuration,
} from "@/types/schedule";
import type { Block, DayType, Insert } from "@/types/database";
import { INSERT_CONFIG, type InsertType } from "@/types/schedule";
import { getBlockDef } from "@/types/block-catalog";
import { getSubRoutineDef } from "@/types/subroutine-catalog";
import { InsertPaletteChip, WoodInsertChip } from "@/components/schedule/wood-block";

export default function SchedulePage() {
  const { activeClassId } = useClassStore();
  const store = useScheduleStore();
  const {
    selectedDate,
    scheduleId,
    blocks,
    isDirty,
    isPublished,
    dayType,
    setDate,
    setScheduleId,
    setBlocks,
    addBlock,
    reorderBlocks,
    setDayType,
    markClean,
    loadFromServer,
  } = store;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const [dragActiveId, setDragActiveId] = useState<string | null>(null);

  // Template state
  const [templates, setTemplates] = useState<Array<{ id: string; name: string; days_of_week?: string[] }>>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [templateDays, setTemplateDays] = useState<Set<string>>(new Set());

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Load schedule for selected date
  const loadSchedule = useCallback(async () => {
    if (!activeClassId) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/v1/classes/${activeClassId}/schedules?date=${selectedDate}`
      );
      const data = await res.json();
      if (data.schedule) {
        loadFromServer({
          scheduleId: data.schedule.id,
          blocks: data.blocks,
          published: data.schedule.published,
          dayType: data.schedule.day_type,
        });
        setScheduleId(data.schedule.id);
      }
    } catch {
      toast.error("Failed to load schedule");
    } finally {
      setLoading(false);
    }
  }, [activeClassId, selectedDate, loadFromServer, setScheduleId]);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  // Auto-save every 30 seconds when dirty
  useEffect(() => {
    if (!isDirty || !activeClassId || !scheduleId) return;
    const timer = setInterval(() => {
      handleSave();
    }, 30_000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDirty, activeClassId, scheduleId]);

  // Load templates
  useEffect(() => {
    if (!activeClassId) return;
    fetch(`/api/v1/classes/${activeClassId}/templates`)
      .then((r) => r.json())
      .then((d) => setTemplates(d.templates || []))
      .catch(() => {});
  }, [activeClassId]);

  // Date navigation
  const navigateDate = (delta: number) => {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() + delta);
    setDate(d.toISOString().split("T")[0]);
  };

  const goToToday = () => {
    setDate(new Date().toISOString().split("T")[0]);
  };

  const isToday = selectedDate === new Date().toISOString().split("T")[0];

  // Save handler
  const handleSave = async () => {
    if (!activeClassId || !scheduleId) return;
    setSaving(true);
    try {
      const res = await fetch(
        `/api/v1/classes/${activeClassId}/schedules/${scheduleId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ blocks, dayType }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to save");
        return;
      }
      setBlocks(data.blocks);
      markClean();
      toast.success("Schedule saved");
    } catch {
      toast.error("Failed to save schedule");
    } finally {
      setSaving(false);
    }
  };

  // Save as template
  const handleSaveTemplate = async () => {
    if (!activeClassId || !templateName.trim()) return;
    try {
      const blocksForTemplate = blocks.map((b) => ({
        type: b.type,
        label: b.label,
        duration_minutes: b.duration_minutes,
        order_index: b.order_index,
        notes: b.notes,
        timer_behavior: b.timer_behavior,
        timer_warning_minutes: b.timer_warning_minutes,
        external_link: b.external_link,
        economy_trigger: b.economy_trigger,
        visible_to_students: b.visible_to_students,
        inserts: b.inserts || [],
      }));

      const res = await fetch(`/api/v1/classes/${activeClassId}/templates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: templateName.trim(), blocks: blocksForTemplate, days_of_week: Array.from(templateDays) }),
      });
      const data = await res.json();
      if (data.template) {
        setTemplates((prev) => [data.template, ...prev]);
        toast.success(`Template "${templateName.trim()}" saved`);
      }
    } catch {
      toast.error("Failed to save template");
    }
    setTemplateName("");
    setTemplateDays(new Set());
    setShowSaveTemplate(false);
  };

  // Load from template
  const handleLoadTemplate = async (templateId: string) => {
    if (!activeClassId || !scheduleId) return;
    try {
      const res = await fetch(
        `/api/v1/classes/${activeClassId}/schedules/${scheduleId}/from-template`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ templateId }),
        }
      );
      const data = await res.json();
      if (data.blocks) {
        setBlocks(data.blocks);
        markClean();
        toast.success("Template loaded");
      }
    } catch {
      toast.error("Failed to load template");
    }
    setShowTemplates(false);
  };

  // Custom collision detection: prefer insert wells over canvas
  const collisionDetection: CollisionDetection = (args) => {
    // First check pointer-within (more precise for nested containers)
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
      // Prefer wells over the canvas
      const wellHit = pointerCollisions.find((c) => String(c.id).startsWith("well-"));
      if (wellHit) return [wellHit];
      return pointerCollisions;
    }
    // Fallback to rect intersection
    return rectIntersection(args);
  };

  // DnD handlers
  const handleDragStart = (event: DragStartEvent) => {
    setDragActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setDragActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;
    const overId = String(over.id);

    // ─── 1. Block library → canvas ──────────────────────────
    if (activeData?.fromLibrary) {
      const blockType = activeData.type as string;
      const catalogDef = getBlockDef(blockType);
      const newBlock: Block = {
        id: crypto.randomUUID(),
        schedule_id: scheduleId || "",
        type: blockType,
        label: catalogDef.label,
        duration_minutes: catalogDef.defaultDurationMin,
        order_index: blocks.length,
        start_time: null,
        notes: null,
        timer_behavior: "none",
        timer_warning_minutes: 5,
        external_link: null,
        economy_trigger: null,
        visible_to_students: true,
        inserts: [],
        is_instructional: catalogDef.isInstructional,
        non_instructional_message: catalogDef.nonInstructionalMessage,
        subject_description: catalogDef.subjectDescription || null,
        student_view_settings: { show_sub_routines_in_full_day: true, student_can_see_ahead: "all", full_day_view_available: true },
        category: catalogDef.category,
        created_at: new Date().toISOString(),
      };
      addBlock(newBlock);
      return;
    }

    // ─── 2. Insert library → block well ─────────────────────
    if (activeData?.fromInsertLibrary) {
      const insertType = activeData.insertType as InsertType;
      const targetBlockId = overData?.blockId as string | undefined
        ?? (overId.startsWith("well-") ? overId.replace("well-", "") : null);

      if (!targetBlockId) return;

      const config = INSERT_CONFIG[insertType];
      const subDef = !config ? getSubRoutineDef(insertType) : null;
      const newInsert: Insert = {
        id: crypto.randomUUID(),
        type: insertType,
        label: config?.defaultLabel || subDef?.label || insertType,
        duration_minutes: config?.defaultDuration ?? subDef?.defaultDurationMin ?? null,
        order_index: 0,
        settings: null,
      };
      store.addInsert(targetBlockId, newInsert);
      return;
    }

    // ─── 3. Reorder/move inserts ────────────────────────────
    if (activeData?.type === "insert") {
      const fromBlockId = activeData.blockId as string;
      const insertId = activeData.insertId as string;

      // Determine target block and position
      let toBlockId: string | null = null;
      let toIndex = 0;

      if (overData?.type === "insert") {
        // Dropped on another insert
        toBlockId = overData.blockId as string;
        const targetBlock = blocks.find((b) => b.id === toBlockId);
        toIndex = targetBlock?.inserts.findIndex((ins) => ins.id === over.id) ?? 0;
      } else if (overData?.isWell || overId.startsWith("well-")) {
        // Dropped on a well
        toBlockId = overData?.blockId as string ?? overId.replace("well-", "");
        const targetBlock = blocks.find((b) => b.id === toBlockId);
        toIndex = targetBlock?.inserts.length ?? 0;
      }

      if (!toBlockId) return;

      if (fromBlockId === toBlockId) {
        // Reorder within same block
        const block = blocks.find((b) => b.id === fromBlockId);
        if (!block) return;
        const fromIndex = block.inserts.findIndex((ins) => ins.id === insertId);
        if (fromIndex !== -1 && fromIndex !== toIndex) {
          store.reorderInserts(fromBlockId, fromIndex, toIndex);
        }
      } else {
        // Move between blocks
        store.moveInsert(fromBlockId, toBlockId, insertId, toIndex);
      }
      return;
    }

    // ─── 4. Reorder blocks on canvas ────────────────────────
    if (active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderBlocks(oldIndex, newIndex);
      }
    }
  };

  // Find the active drag item for the overlay
  const getDragOverlayContent = () => {
    if (!dragActiveId) return null;
    const idStr = String(dragActiveId);

    // Insert from library
    if (idStr.startsWith("insert-library-")) {
      const insertType = idStr.replace("insert-library-", "") as InsertType;
      return <InsertPaletteChip type={insertType} index={0} />;
    }

    // Insert being moved
    for (const block of blocks) {
      const insert = block.inserts?.find((ins) => ins.id === idStr);
      if (insert) {
        const idx = block.inserts.indexOf(insert);
        return <WoodInsertChip insert={insert} index={idx} />;
      }
    }

    // Block being dragged (generic)
    return (
      <div className="bg-cm-surface shadow-lg rounded-[4px] px-cm-4 py-cm-3 text-cm-body text-cm-text-primary border border-cm-border opacity-90">
        Moving block...
      </div>
    );
  };

  const totalMinutes = blocks.reduce((sum, b) => sum + b.duration_minutes, 0);

  // Format the display date
  const displayDate = new Date(selectedDate + "T12:00:00").toLocaleDateString(
    "en-US",
    { weekday: "short", month: "short", day: "numeric" }
  );

  if (!activeClassId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-cm-body text-cm-text-secondary">
          Select a class to view the schedule builder.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Top Toolbar */}
      <div className="shrink-0 bg-cm-surface border-b border-cm-border px-cm-4 py-cm-3 flex items-center gap-cm-3 flex-wrap">
        {/* Date Navigation */}
        <div className="flex items-center gap-cm-1">
          <button
            onClick={() => navigateDate(-1)}
            className="p-1.5 rounded-cm-button hover:bg-cm-white text-cm-text-secondary"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={goToToday}
            className={`px-cm-3 py-cm-1 rounded-cm-button text-cm-body font-medium ${
              isToday
                ? "bg-cm-teal-light text-cm-teal-dark"
                : "hover:bg-cm-white text-cm-text-primary"
            }`}
          >
            {displayDate}
          </button>
          <button
            onClick={() => navigateDate(1)}
            className="p-1.5 rounded-cm-button hover:bg-cm-white text-cm-text-secondary"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Day Type */}
        <select
          value={dayType}
          onChange={(e) => setDayType(e.target.value as DayType)}
          className="px-cm-3 py-cm-1 text-cm-caption border border-cm-border rounded-cm-button bg-cm-white"
        >
          {DAY_TYPES.map((dt) => (
            <option key={dt.value} value={dt.value}>
              {dt.label}
            </option>
          ))}
        </select>

        {/* Total duration */}
        <span className="text-cm-caption text-cm-text-hint">
          {formatDuration(totalMinutes)}
        </span>

        {/* Published badge */}
        {isPublished && (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-cm-teal-light text-cm-teal-dark uppercase">
            Published
          </span>
        )}

        <div className="flex-1" />

        {/* Template buttons */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSaveTemplate(!showSaveTemplate)}
            className="text-cm-text-secondary rounded-cm-button"
            disabled={blocks.length === 0}
          >
            <BookmarkPlus className="h-4 w-4 mr-1" />
            Save as
          </Button>
          {showSaveTemplate && (
            <div className="absolute right-0 top-full mt-1 bg-cm-surface border border-cm-border rounded-cm-button shadow-lg p-cm-3 z-20 w-64">
              <input
                type="text"
                placeholder="Template name..."
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="w-full px-cm-2 py-cm-1 text-cm-body border border-cm-border rounded-cm-button mb-2"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveTemplate();
                  if (e.key === "Escape") setShowSaveTemplate(false);
                }}
              />
              <p className="text-[10px] text-cm-text-hint uppercase tracking-wider mb-1">Days this template applies to</p>
              <div className="flex flex-wrap gap-1 mb-2">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setTemplateDays((prev) => {
                      const next = new Set(prev);
                      if (next.has(day)) next.delete(day);
                      else next.add(day);
                      return next;
                    })}
                    className={`px-2 py-0.5 rounded-cm-badge text-[10px] font-medium transition-colors ${
                      templateDays.has(day)
                        ? "bg-cm-teal text-white"
                        : "bg-cm-white text-cm-text-hint border border-cm-border"
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
              <Button
                size="sm"
                onClick={handleSaveTemplate}
                disabled={!templateName.trim()}
                className="w-full bg-cm-teal hover:bg-cm-teal-dark text-white rounded-cm-button"
              >
                Save
              </Button>
            </div>
          )}
        </div>

        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTemplates(!showTemplates)}
            className="text-cm-text-secondary rounded-cm-button"
            disabled={templates.length === 0}
          >
            <FolderOpen className="h-4 w-4 mr-1" />
            Load
          </Button>
          {showTemplates && templates.length > 0 && (
            <div className="absolute right-0 top-full mt-1 bg-cm-surface border border-cm-border rounded-cm-button shadow-lg z-20 w-64 max-h-56 overflow-y-auto">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleLoadTemplate(t.id)}
                  className="w-full text-left px-cm-3 py-cm-2 hover:bg-cm-white transition-colors"
                >
                  <p className="text-cm-body text-cm-text-primary">{t.name}</p>
                  {t.days_of_week && t.days_of_week.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5">
                      {t.days_of_week.map((d) => (
                        <span key={d} className="px-1 py-0 rounded bg-cm-teal-light text-cm-teal text-[9px] font-medium">
                          {d.slice(0, 3)}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Save */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleSave}
          disabled={!isDirty || saving}
          className="rounded-cm-button"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-1" />
          ) : (
            <Save className="h-4 w-4 mr-1" />
          )}
          {isDirty ? "Save" : "Saved"}
        </Button>

        {/* Publish */}
        <Button
          onClick={() => setShowPublish(true)}
          className="bg-cm-teal hover:bg-cm-teal-dark text-white rounded-cm-button"
          size="sm"
        >
          <Rocket className="h-4 w-4 mr-1" />
          Publish
        </Button>
      </div>

      {/* Three-panel layout */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-cm-teal" />
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={collisionDetection}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex-1 flex overflow-hidden">
            <BlockLibrary />
            <DayCanvas />
            <BlockProperties />
          </div>
          <DragOverlay dropAnimation={null}>
            {getDragOverlayContent()}
          </DragOverlay>
        </DndContext>
      )}

      {/* Publish dialog */}
      <PublishDialog
        open={showPublish}
        onClose={() => setShowPublish(false)}
      />
    </div>
  );
}
