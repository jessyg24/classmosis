"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
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
  BLOCK_COLORS,
  DAY_TYPES,
  formatDuration,
  type BlockType,
} from "@/types/schedule";
import type { Block, DayType } from "@/types/database";

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
  const [templates, setTemplates] = useState<Array<{ id: string; name: string }>>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);

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
      }));

      const res = await fetch(`/api/v1/classes/${activeClassId}/templates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: templateName.trim(), blocks: blocksForTemplate }),
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

  // DnD handlers
  const handleDragStart = (event: DragStartEvent) => {
    setDragActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setDragActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;

    // Drop from library
    if (activeData?.fromLibrary) {
      const blockType = activeData.type as BlockType;
      const config = BLOCK_COLORS[blockType];
      const newBlock: Block = {
        id: crypto.randomUUID(),
        schedule_id: scheduleId || "",
        type: blockType,
        label: config.defaultLabel,
        duration_minutes: config.defaultDuration,
        order_index: blocks.length,
        start_time: null,
        notes: null,
        timer_behavior: "none",
        timer_warning_minutes: 5,
        external_link: null,
        economy_trigger: null,
        visible_to_students: true,
        created_at: new Date().toISOString(),
      };
      addBlock(newBlock);
      return;
    }

    // Reorder within canvas
    if (active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderBlocks(oldIndex, newIndex);
      }
    }
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
            <div className="absolute right-0 top-full mt-1 bg-cm-surface border border-cm-border rounded-cm-button shadow-lg p-cm-3 z-20 w-56">
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
            <div className="absolute right-0 top-full mt-1 bg-cm-surface border border-cm-border rounded-cm-button shadow-lg z-20 w-56 max-h-48 overflow-y-auto">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleLoadTemplate(t.id)}
                  className="w-full text-left px-cm-3 py-cm-2 text-cm-body hover:bg-cm-white transition-colors"
                >
                  {t.name}
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
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex-1 flex overflow-hidden">
            <BlockLibrary />
            <DayCanvas />
            <BlockProperties />
          </div>
          <DragOverlay>
            {dragActiveId ? (
              <div className="bg-cm-surface shadow-lg rounded-cm-button px-cm-4 py-cm-3 text-cm-body text-cm-text-primary border border-cm-border opacity-90">
                Dragging...
              </div>
            ) : null}
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
