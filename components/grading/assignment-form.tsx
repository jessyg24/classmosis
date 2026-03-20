"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useClassStore } from "@/stores/class-store";
import { useRubrics, usePublishAssignment } from "@/hooks/use-gradebook";
import { useClassStandards, useLinkStandards } from "@/hooks/use-standards";
import { useQueryClient } from "@tanstack/react-query";
import { ASSIGNMENT_TYPES, GRADEBOOK_CATEGORIES } from "@/types/grading";
import type { AssignmentType } from "@/types/database";

interface AssignmentFormData {
  title: string;
  instructions: string;
  points_possible: number;
  due_at: string;
}

interface AssignmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AssignmentForm({ open, onOpenChange }: AssignmentFormProps) {
  const { activeClassId } = useClassStore();
  const { data: rubrics } = useRubrics(activeClassId);
  const { data: standards } = useClassStandards(activeClassId);
  const publishMutation = usePublishAssignment(activeClassId);
  const linkStandardsMutation = useLinkStandards(activeClassId);
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [type, setType] = useState<AssignmentType>("classwork");
  const [category, setCategory] = useState("classwork");
  const [rubricId, setRubricId] = useState<string>("");
  const [publishNow, setPublishNow] = useState(false);
  const [extraCredit, setExtraCredit] = useState(false);
  const [selectedStandardIds, setSelectedStandardIds] = useState<Set<string>>(new Set());
  const [standardsExpanded, setStandardsExpanded] = useState(false);

  const { register, handleSubmit, reset } = useForm<AssignmentFormData>({
    defaultValues: {
      title: "",
      instructions: "",
      points_possible: 100,
      due_at: "",
    },
  });

  const onSubmit = async (data: AssignmentFormData) => {
    if (!activeClassId) return;
    setSaving(true);

    try {
      const payload = {
        title: data.title,
        instructions: data.instructions || undefined,
        type,
        category,
        rubric_id: rubricId || undefined,
        points_possible: Number(data.points_possible),
        due_at: data.due_at || undefined,
        extra_credit: extraCredit,
        published: false,
      };

      const res = await fetch(`/api/v1/classes/${activeClassId}/assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create assignment");

      const assignment = await res.json();

      // Link standards if any selected
      if (selectedStandardIds.size > 0) {
        await linkStandardsMutation.mutateAsync({
          assignmentId: assignment.id,
          standardIds: Array.from(selectedStandardIds),
        });
      }

      if (publishNow) {
        await publishMutation.mutateAsync(assignment.id);
        toast.success("Assignment created and published");
      } else {
        toast.success("Assignment created (draft)");
      }

      qc.invalidateQueries({ queryKey: ["assignments", activeClassId] });
      reset();
      setType("classwork");
      setCategory("classwork");
      setRubricId("");
      setPublishNow(false);
      setExtraCredit(false);
      setSelectedStandardIds(new Set());
      setStandardsExpanded(false);
      onOpenChange(false);
    } catch {
      toast.error("Something went wrong creating the assignment");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Assignment</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="asgn-title">Title</Label>
            <Input id="asgn-title" {...register("title", { required: true })} placeholder="e.g. Chapter 5 Questions" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => { if (v) setType(v as AssignmentType); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ASSIGNMENT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => { if (v) setCategory(v); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {GRADEBOOK_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="asgn-instructions">Instructions</Label>
            <textarea
              id="asgn-instructions"
              {...register("instructions")}
              className="flex w-full rounded-cm-button border border-cm-border bg-transparent px-3 py-2 text-cm-body placeholder:text-cm-text-hint focus:outline-none focus:ring-2 focus:ring-cm-blue resize-y min-h-[80px]"
              placeholder="What should students do?"
            />
          </div>

          <div className="space-y-2">
            <Label>Rubric (optional)</Label>
            <Select value={rubricId} onValueChange={(v) => setRubricId(v ?? "")}>
              <SelectTrigger><SelectValue placeholder="No rubric — points only" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">No rubric — points only</SelectItem>
                {(rubrics || []).map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.title} ({r.total_points} pts)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Standards Multi-Select */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setStandardsExpanded(!standardsExpanded)}
              className="flex items-center gap-2 text-cm-label text-cm-text-primary"
            >
              <span>Standards</span>
              {selectedStandardIds.size > 0 && (
                <span className="px-1.5 py-0.5 rounded-cm-badge bg-cm-purple-light text-cm-purple text-cm-overline">
                  {selectedStandardIds.size}
                </span>
              )}
              <span className="text-cm-caption text-cm-text-hint">(optional)</span>
            </button>
            {standardsExpanded && (
              <div className="max-h-48 overflow-y-auto border border-cm-border rounded-cm-button p-2 space-y-1">
                {(() => {
                  const grouped: Record<string, typeof standards> = {};
                  for (const std of standards || []) {
                    if (!grouped[std.domain]) grouped[std.domain] = [];
                    grouped[std.domain]!.push(std);
                  }
                  return Object.entries(grouped).map(([domain, stds]) => (
                    <div key={domain}>
                      <p className="text-cm-overline text-cm-text-hint uppercase px-1 pt-1">{domain}</p>
                      {(stds || []).map((std) => (
                        <label key={std.id} className="flex items-center gap-2 px-1 py-1 hover:bg-cm-white rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedStandardIds.has(std.id)}
                            onChange={(e) => {
                              setSelectedStandardIds((prev) => {
                                const next = new Set(prev);
                                if (e.target.checked) next.add(std.id);
                                else next.delete(std.id);
                                return next;
                              });
                            }}
                            className="rounded"
                          />
                          <span className="px-1.5 py-0.5 rounded-cm-badge bg-cm-purple-light text-cm-purple text-[10px] font-medium shrink-0">
                            {std.code}
                          </span>
                          <span className="text-cm-caption text-cm-text-secondary truncate">{std.description}</span>
                        </label>
                      ))}
                    </div>
                  ));
                })()}
                {(!standards || standards.length === 0) && (
                  <p className="text-cm-caption text-cm-text-hint px-1 py-2">No standards available for this class.</p>
                )}
              </div>
            )}
            {/* Selected standards badges */}
            {selectedStandardIds.size > 0 && !standardsExpanded && (
              <div className="flex flex-wrap gap-1">
                {(standards || [])
                  .filter((s) => selectedStandardIds.has(s.id))
                  .map((s) => (
                    <span key={s.id} className="px-2 py-0.5 rounded-cm-badge bg-cm-purple-light text-cm-purple text-cm-overline font-medium">
                      {s.code}
                    </span>
                  ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="asgn-points">Points</Label>
              <Input
                id="asgn-points"
                type="number"
                {...register("points_possible", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="asgn-due">Due Date</Label>
              <Input id="asgn-due" type="datetime-local" {...register("due_at")} />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-cm-body cursor-pointer">
              <input
                type="checkbox"
                checked={extraCredit}
                onChange={(e) => setExtraCredit(e.target.checked)}
                className="rounded"
              />
              Extra credit
            </label>
            <label className="flex items-center gap-2 text-cm-body cursor-pointer">
              <input
                type="checkbox"
                checked={publishNow}
                onChange={(e) => setPublishNow(e.target.checked)}
                className="rounded"
              />
              Publish immediately
            </label>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={saving} className="bg-cm-blue hover:bg-cm-blue-dark text-white">
              {saving ? "Creating..." : "Create Assignment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
