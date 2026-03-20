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
import { useCreatePracticeSet } from "@/hooks/use-practice";
import { useClassStandards } from "@/hooks/use-standards";

interface FormData {
  title: string;
  description: string;
  coins_reward: number;
}

interface PracticeSetFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
}

export default function PracticeSetForm({ open, onOpenChange, classId }: PracticeSetFormProps) {
  const createMutation = useCreatePracticeSet(classId);
  const { data: standards } = useClassStandards(classId);
  const [saving, setSaving] = useState(false);
  const [selectedStandardIds, setSelectedStandardIds] = useState<Set<string>>(new Set());
  const [standardsExpanded, setStandardsExpanded] = useState(false);
  const [publishNow, setPublishNow] = useState(false);

  const { register, handleSubmit, reset } = useForm<FormData>({
    defaultValues: { title: "", description: "", coins_reward: 0 },
  });

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      await createMutation.mutateAsync({
        title: data.title,
        description: data.description || undefined,
        coins_reward: Number(data.coins_reward),
        standard_ids: Array.from(selectedStandardIds),
        published: publishNow,
      });
      toast.success("Practice set created");
      reset();
      setSelectedStandardIds(new Set());
      setStandardsExpanded(false);
      setPublishNow(false);
      onOpenChange(false);
    } catch {
      toast.error("Failed to create practice set");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Practice Set</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ps-title">Title</Label>
            <Input id="ps-title" {...register("title", { required: true })} placeholder="e.g. Fractions Review" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ps-desc">Description (optional)</Label>
            <textarea
              id="ps-desc"
              {...register("description")}
              className="flex w-full rounded-cm-button border border-cm-border bg-transparent px-3 py-2 text-cm-body placeholder:text-cm-text-hint focus:outline-none focus:ring-2 focus:ring-cm-pink resize-y min-h-[60px]"
              placeholder="What will students practice?"
            />
          </div>

          {/* Standards */}
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
              <div className="max-h-36 overflow-y-auto border border-cm-border rounded-cm-button p-2 space-y-1">
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
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ps-coins">Coin Reward (0 = none)</Label>
            <Input id="ps-coins" type="number" min={0} {...register("coins_reward", { valueAsNumber: true })} />
          </div>

          <label className="flex items-center gap-2 text-cm-body cursor-pointer">
            <input type="checkbox" checked={publishNow} onChange={(e) => setPublishNow(e.target.checked)} className="rounded" />
            Publish immediately
          </label>

          <DialogFooter>
            <Button type="submit" disabled={saving} className="bg-cm-pink hover:bg-cm-pink-dark text-white">
              {saving ? "Creating..." : "Create Practice Set"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
