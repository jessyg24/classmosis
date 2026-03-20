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
import { useCreateStoreItem } from "@/hooks/use-economy";

interface FormData {
  title: string;
  description: string;
  price: number;
  icon: string;
  stock: string;
}

interface StoreItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
}

export default function StoreItemDialog({ open, onOpenChange, classId }: StoreItemDialogProps) {
  const createMutation = useCreateStoreItem(classId);
  const [saving, setSaving] = useState(false);
  const [unlimited, setUnlimited] = useState(true);

  const { register, handleSubmit, reset } = useForm<FormData>({
    defaultValues: { title: "", description: "", price: 10, icon: "🎁", stock: "" },
  });

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      await createMutation.mutateAsync({
        title: data.title,
        description: data.description || undefined,
        price: Number(data.price),
        icon: data.icon || "🎁",
        stock: unlimited ? null : Number(data.stock) || null,
      });
      toast.success("Reward added to store");
      reset();
      setUnlimited(true);
      onOpenChange(false);
    } catch {
      toast.error("Failed to create reward");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Reward</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="item-title">Title</Label>
            <Input id="item-title" {...register("title", { required: true })} placeholder="e.g. Homework Pass" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="item-desc">Description (optional)</Label>
            <Input id="item-desc" {...register("description")} placeholder="Skip one homework assignment" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="item-price">Price</Label>
              <Input id="item-price" type="number" min={1} {...register("price", { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-icon">Icon</Label>
              <Input id="item-icon" {...register("icon")} className="text-center text-lg" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-stock">Stock</Label>
              {unlimited ? (
                <button
                  type="button"
                  onClick={() => setUnlimited(false)}
                  className="w-full h-9 rounded-cm-button border border-cm-border text-cm-caption text-cm-text-hint hover:bg-cm-white"
                >
                  Unlimited
                </button>
              ) : (
                <Input id="item-stock" type="number" min={0} {...register("stock")} />
              )}
            </div>
          </div>

          {!unlimited && (
            <button type="button" onClick={() => setUnlimited(true)} className="text-cm-caption text-cm-amber hover:underline">
              Set to unlimited
            </button>
          )}

          <DialogFooter>
            <Button type="submit" disabled={saving} className="bg-cm-amber hover:bg-cm-amber-dark text-white">
              {saving ? "Creating..." : "Add Reward"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
