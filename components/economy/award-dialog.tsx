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
import { useAwardCoins, useBulkAward } from "@/hooks/use-economy";

interface FormData {
  amount: number;
  reason: string;
}

interface AwardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  students: Array<{ id: string; display_name: string }>;
}

export default function AwardDialog({ open, onOpenChange, classId, students }: AwardDialogProps) {
  const awardMutation = useAwardCoins(classId);
  const bulkMutation = useBulkAward(classId);
  const [saving, setSaving] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [deductMode, setDeductMode] = useState(false);

  const { register, handleSubmit, reset } = useForm<FormData>({
    defaultValues: { amount: 5, reason: "" },
  });

  const onSubmit = async (data: FormData) => {
    const amount = deductMode ? -Math.abs(data.amount) : Math.abs(data.amount);
    setSaving(true);

    try {
      if (selectAll) {
        await bulkMutation.mutateAsync({ amount, reason: data.reason });
        toast.success(`${deductMode ? "Deducted from" : "Awarded to"} all students`);
      } else if (selectedIds.size > 0) {
        await awardMutation.mutateAsync({
          student_ids: Array.from(selectedIds),
          amount,
          reason: data.reason,
        });
        toast.success(`${deductMode ? "Deducted from" : "Awarded to"} ${selectedIds.size} student${selectedIds.size !== 1 ? "s" : ""}`);
      }

      reset();
      setSelectedIds(new Set());
      setSelectAll(false);
      setDeductMode(false);
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectAll(false);
      setSelectedIds(new Set());
    } else {
      setSelectAll(true);
      setSelectedIds(new Set(students.map((s) => s.id)));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{deductMode ? "Deduct Coins" : "Award Coins"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Mode toggle */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setDeductMode(false)}
              className={`flex-1 py-2 rounded-cm-button text-cm-body font-medium transition-colors ${
                !deductMode ? "bg-cm-amber-light text-cm-amber-dark" : "bg-cm-white text-cm-text-hint"
              }`}
            >
              Award
            </button>
            <button
              type="button"
              onClick={() => setDeductMode(true)}
              className={`flex-1 py-2 rounded-cm-button text-cm-body font-medium transition-colors ${
                deductMode ? "bg-cm-coral-light text-cm-coral-dark" : "bg-cm-white text-cm-text-hint"
              }`}
            >
              Deduct
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="award-amount">Amount</Label>
              <Input
                id="award-amount"
                type="number"
                min={1}
                {...register("amount", { valueAsNumber: true, min: 1 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="award-reason">Reason</Label>
              <Input
                id="award-reason"
                {...register("reason", { required: true })}
                placeholder="e.g. Great participation"
              />
            </div>
          </div>

          {/* Student selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Students</Label>
              <button
                type="button"
                onClick={toggleSelectAll}
                className="text-cm-caption text-cm-amber hover:underline"
              >
                {selectAll ? "Deselect all" : "Select all"}
              </button>
            </div>
            <div className="max-h-40 overflow-y-auto border border-cm-border rounded-cm-button p-2 space-y-1">
              {students.map((s) => (
                <label key={s.id} className="flex items-center gap-2 px-1 py-1 hover:bg-cm-white rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(s.id)}
                    onChange={(e) => {
                      setSelectedIds((prev) => {
                        const next = new Set(prev);
                        if (e.target.checked) next.add(s.id);
                        else next.delete(s.id);
                        return next;
                      });
                      setSelectAll(false);
                    }}
                    className="rounded"
                  />
                  <span className="text-cm-body text-cm-text-secondary">{s.display_name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Preview */}
          {(selectedIds.size > 0 || selectAll) && (
            <p className="text-cm-caption text-cm-text-hint">
              {deductMode ? "Deduct" : "Award"}{" "}
              <span className="font-medium text-cm-amber">{Math.abs(Number(register("amount").name ? 5 : 5))} coins</span>{" "}
              {selectAll ? `to all ${students.length} students` : `to ${selectedIds.size} student${selectedIds.size !== 1 ? "s" : ""}`}
            </p>
          )}

          <DialogFooter>
            <Button
              type="submit"
              disabled={saving || (selectedIds.size === 0 && !selectAll)}
              className={`text-white ${deductMode ? "bg-cm-coral hover:bg-cm-coral-dark" : "bg-cm-amber hover:bg-cm-amber-dark"}`}
            >
              {saving ? "Processing..." : deductMode ? "Deduct" : "Award"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
