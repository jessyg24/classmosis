"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import ClassSelector from "@/components/admin/class-selector";
import { useAdminStore } from "@/stores/admin-store";

interface Block {
  id: string;
  type: string;
  label: string;
  duration_minutes: number;
  order_index: number;
  start_time: string | null;
  timer_behavior: string;
  timer_warning_minutes: number;
  external_link: { url: string; platform_name: string } | null;
  economy_trigger: { coins: number; trigger_type: string } | null;
  visible_to_students: boolean;
  notes: string | null;
  inserts: Array<{ id: string; type: string; label: string; duration_minutes: number | null }>;
}

interface ScheduleData {
  id: string;
  date: string;
  day_type: string;
  published: boolean;
  blocks: Block[];
}

const BLOCK_COLORS: Record<string, string> = {
  routine: "border-cm-teal bg-cm-teal-light",
  academic: "border-cm-blue bg-cm-blue-light",
  assessment: "border-cm-amber bg-cm-amber-light",
  economy: "border-cm-purple bg-cm-purple-light",
  flex: "border-cm-coral bg-cm-coral-light",
  rotation: "border-cm-pink bg-cm-pink-light",
};

export default function AdminSchedulesPage() {
  const { selectedClassId } = useAdminStore();
  const [schedules, setSchedules] = useState<Array<{ id: string; date: string; day_type: string; published: boolean }>>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleData | null>(null);

  useEffect(() => {
    if (!selectedClassId) return;
    fetch(`/api/v1/admin/classes/${selectedClassId}/schedules`)
      .then((r) => r.json())
      .then(setSchedules)
      .catch(() => {});
  }, [selectedClassId]);

  const loadSchedule = async (scheduleId: string) => {
    const res = await fetch(`/api/v1/admin/classes/${selectedClassId}/schedules/${scheduleId}`);
    if (res.ok) setSelectedSchedule(await res.json());
  };

  const updateBlock = async (blockId: string, field: string, value: unknown) => {
    if (!selectedClassId || !selectedSchedule) return;
    const res = await fetch(`/api/v1/admin/classes/${selectedClassId}/schedules/${selectedSchedule.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ block: { id: blockId, [field]: value } }),
    });
    if (res.ok) {
      setSelectedSchedule((prev) => prev ? {
        ...prev,
        blocks: prev.blocks.map((b) => b.id === blockId ? { ...b, [field]: value } : b),
      } : null);
      toast.success("Block updated");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-cm-title text-cm-text-primary">Schedule Inspector</h1>
        <ClassSelector />
      </div>

      {!selectedClassId ? (
        <p className="text-cm-body text-cm-text-secondary">Select a class to inspect schedules.</p>
      ) : (
        <div className="grid grid-cols-4 gap-6">
          {/* Schedule list */}
          <div className="space-y-2">
            <p className="text-cm-overline text-cm-text-hint uppercase">Schedules</p>
            {schedules.map((s) => (
              <button
                key={s.id}
                onClick={() => loadSchedule(s.id)}
                className={`w-full text-left px-3 py-2 rounded-cm-button text-cm-caption transition-colors ${
                  selectedSchedule?.id === s.id ? "bg-cm-coral-light text-cm-coral-dark" : "hover:bg-cm-white text-cm-text-secondary"
                }`}
              >
                {s.date} {s.published ? "" : "(Draft)"}
              </button>
            ))}
            {schedules.length === 0 && <p className="text-cm-caption text-cm-text-hint">No schedules found</p>}
          </div>

          {/* Block inspector */}
          <div className="col-span-3 space-y-3">
            {selectedSchedule ? (
              <>
                <div className="flex items-center gap-2 text-cm-caption text-cm-text-hint">
                  <span>{selectedSchedule.date}</span>
                  <span>·</span>
                  <span>{selectedSchedule.day_type}</span>
                  <span>·</span>
                  <span>{selectedSchedule.published ? "Published" : "Draft"}</span>
                  <span>·</span>
                  <span>{selectedSchedule.blocks.length} blocks</span>
                </div>

                {selectedSchedule.blocks.map((block) => (
                  <Card key={block.id} className={`p-cm-4 rounded-cm-card border-l-4 ${BLOCK_COLORS[block.type] || "border-cm-border bg-cm-surface"}`}>
                    <div className="grid grid-cols-4 gap-3 text-cm-caption">
                      {/* Row 1: Core info */}
                      <div className="col-span-2">
                        <label className="text-cm-text-hint text-[10px] uppercase">Label</label>
                        <input
                          defaultValue={block.label}
                          className="w-full px-2 py-1 border border-cm-border rounded text-cm-body font-medium bg-transparent"
                          onBlur={(e) => updateBlock(block.id, "label", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-cm-text-hint text-[10px] uppercase">Duration</label>
                        <input
                          type="number"
                          defaultValue={block.duration_minutes}
                          className="w-full px-2 py-1 border border-cm-border rounded bg-transparent"
                          onBlur={(e) => updateBlock(block.id, "duration_minutes", parseInt(e.target.value))}
                        />
                      </div>
                      <div>
                        <label className="text-cm-text-hint text-[10px] uppercase">Type</label>
                        <p className="px-2 py-1 text-cm-body">{block.type}</p>
                      </div>

                      {/* Row 2: Properties */}
                      <div>
                        <label className="text-cm-text-hint text-[10px] uppercase">Timer</label>
                        <p className="px-2 py-1">{block.timer_behavior} ({block.timer_warning_minutes}m warn)</p>
                      </div>
                      <div>
                        <label className="text-cm-text-hint text-[10px] uppercase">Visible</label>
                        <p className="px-2 py-1">{block.visible_to_students ? "Yes" : "No"}</p>
                      </div>
                      <div>
                        <label className="text-cm-text-hint text-[10px] uppercase">Economy</label>
                        <p className="px-2 py-1">{block.economy_trigger ? `${block.economy_trigger.coins} coins` : "None"}</p>
                      </div>
                      <div>
                        <label className="text-cm-text-hint text-[10px] uppercase">External</label>
                        <p className="px-2 py-1 truncate">{block.external_link ? block.external_link.platform_name : "None"}</p>
                      </div>

                      {/* Notes */}
                      {block.notes && (
                        <div className="col-span-4">
                          <label className="text-cm-text-hint text-[10px] uppercase">Notes</label>
                          <p className="px-2 py-1 text-cm-text-secondary italic">{block.notes}</p>
                        </div>
                      )}

                      {/* Inserts */}
                      {block.inserts && block.inserts.length > 0 && (
                        <div className="col-span-4 border-t border-cm-border pt-2 mt-1">
                          <label className="text-cm-text-hint text-[10px] uppercase mb-1 block">Inserts ({block.inserts.length})</label>
                          <div className="space-y-1">
                            {block.inserts.map((ins) => (
                              <div key={ins.id} className="flex items-center gap-2 px-2 py-1 bg-white/50 rounded">
                                <span className="px-1.5 py-0.5 rounded bg-cm-white text-[9px] text-cm-text-hint font-medium uppercase">{ins.type}</span>
                                <span className="text-cm-caption text-cm-text-secondary">{ins.label}</span>
                                {ins.duration_minutes && <span className="text-cm-caption text-cm-text-hint ml-auto">{ins.duration_minutes}m</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </>
            ) : (
              <p className="text-cm-body text-cm-text-secondary py-8">Select a schedule to inspect blocks and inserts.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
