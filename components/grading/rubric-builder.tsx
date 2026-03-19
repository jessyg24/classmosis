"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "sonner";
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from "lucide-react";
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
import { useClassStore } from "@/stores/class-store";
import { useQueryClient } from "@tanstack/react-query";
import type { Rubric } from "@/types/database";

interface CategoryForm {
  name: string;
  max_points: number;
  weight_pct: number;
  descriptors: Record<string, string>;
}

interface RubricForm {
  title: string;
  description: string;
  categories: CategoryForm[];
}

interface RubricBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editRubric?: Rubric | null;
}

export default function RubricBuilder({ open, onOpenChange, editRubric }: RubricBuilderProps) {
  const { activeClassId } = useClassStore();
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const { register, control, handleSubmit, watch, reset } = useForm<RubricForm>({
    defaultValues: editRubric
      ? {
          title: editRubric.title,
          description: editRubric.description || "",
          categories: (editRubric.categories || []).map((c) => ({
            name: c.name,
            max_points: c.max_points,
            weight_pct: c.weight_pct,
            descriptors: c.descriptors || {},
          })),
        }
      : {
          title: "",
          description: "",
          categories: [{ name: "", max_points: 25, weight_pct: 100, descriptors: {} }],
        },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "categories" });
  const categories = watch("categories");

  const totalPoints = categories.reduce((sum, c) => sum + (Number(c.max_points) || 0), 0);
  const totalWeight = categories.reduce((sum, c) => sum + (Number(c.weight_pct) || 0), 0);

  const onSubmit = async (data: RubricForm) => {
    if (!activeClassId) return;
    if (Math.abs(totalWeight - 100) > 0.01) {
      toast.error("Category weights must sum to 100%");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: data.title,
        description: data.description || undefined,
        categories: data.categories.map((c, i) => ({
          name: c.name,
          max_points: Number(c.max_points),
          weight_pct: Number(c.weight_pct),
          descriptors: c.descriptors,
          order_index: i,
        })),
      };

      const url = editRubric
        ? `/api/v1/classes/${activeClassId}/rubrics/${editRubric.id}`
        : `/api/v1/classes/${activeClassId}/rubrics`;

      const res = await fetch(url, {
        method: editRubric ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save rubric");

      toast.success(editRubric ? "Rubric updated" : "Rubric created");
      qc.invalidateQueries({ queryKey: ["rubrics", activeClassId] });
      reset();
      onOpenChange(false);
    } catch {
      toast.error("Something went wrong saving the rubric");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editRubric ? "Edit Rubric" : "New Rubric"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register("title", { required: true })} placeholder="e.g. Essay Writing Rubric" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input id="description" {...register("description")} placeholder="Brief description..." />
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Categories</Label>
              <span className="text-cm-caption text-cm-text-hint">
                {totalPoints} pts | {totalWeight.toFixed(0)}% weight
              </span>
            </div>

            <div className="space-y-2">
              {fields.map((field, idx) => (
                <div key={field.id} className="border border-cm-border rounded-cm-card p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-cm-text-hint shrink-0" />
                    <Input
                      {...register(`categories.${idx}.name`, { required: true })}
                      placeholder="Category name"
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      {...register(`categories.${idx}.max_points`, { valueAsNumber: true })}
                      className="w-20"
                      placeholder="Pts"
                    />
                    <Input
                      type="number"
                      {...register(`categories.${idx}.weight_pct`, { valueAsNumber: true })}
                      className="w-20"
                      placeholder="%"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                    >
                      {expandedIdx === idx ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => remove(idx)}
                        className="text-cm-coral"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Descriptor fields when expanded */}
                  {expandedIdx === idx && (
                    <div className="pl-6 space-y-1 text-cm-caption">
                      {["Excellent", "Good", "Developing", "Beginning"].map((level) => (
                        <div key={level} className="flex items-center gap-2">
                          <span className="w-20 text-cm-text-hint">{level}:</span>
                          <Input
                            className="text-sm"
                            placeholder={`Describe ${level.toLowerCase()} performance...`}
                            defaultValue={categories[idx]?.descriptors?.[level] || ""}
                            onChange={(e) => {
                              const current = categories[idx]?.descriptors || {};
                              current[level] = e.target.value;
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ name: "", max_points: 25, weight_pct: 0, descriptors: {} })}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Category
            </Button>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={saving} className="bg-cm-blue hover:bg-cm-blue-dark text-white">
              {saving ? "Saving..." : editRubric ? "Update Rubric" : "Create Rubric"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
