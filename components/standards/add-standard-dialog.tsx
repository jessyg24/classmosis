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
import { useCreateStandard } from "@/hooks/use-standards";
import type { Subject, GradeBand } from "@/types/database";

interface FormData {
  code: string;
  description: string;
  domain: string;
}

interface AddStandardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  classSubject: Subject;
  classGradeBand: GradeBand;
}

export default function AddStandardDialog({
  open,
  onOpenChange,
  classId,
  classSubject,
  classGradeBand,
}: AddStandardDialogProps) {
  const createMutation = useCreateStandard(classId);
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset } = useForm<FormData>({
    defaultValues: { code: "", description: "", domain: "" },
  });
  const [subject, setSubject] = useState<Subject>(classSubject);
  const [gradeBand, setGradeBand] = useState<GradeBand>(classGradeBand);

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      await createMutation.mutateAsync({
        code: data.code,
        description: data.description,
        subject,
        grade_band: gradeBand,
        domain: data.domain,
      });
      toast.success("Custom standard created");
      reset();
      onOpenChange(false);
    } catch {
      toast.error("Failed to create standard");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Custom Standard</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="std-code">Code</Label>
            <Input
              id="std-code"
              {...register("code", { required: true })}
              placeholder="e.g. CUSTOM.3.1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="std-description">Description</Label>
            <textarea
              id="std-description"
              {...register("description", { required: true })}
              className="flex w-full rounded-cm-button border border-cm-border bg-transparent px-3 py-2 text-cm-body placeholder:text-cm-text-hint focus:outline-none focus:ring-2 focus:ring-cm-purple resize-y min-h-[80px]"
              placeholder="What should students be able to do?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="std-domain">Domain</Label>
            <Input
              id="std-domain"
              {...register("domain", { required: true })}
              placeholder="e.g. Reading Literature"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select value={subject} onValueChange={(v) => setSubject(v as Subject)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ELA">ELA</SelectItem>
                  <SelectItem value="Math">Math</SelectItem>
                  <SelectItem value="Science">Science</SelectItem>
                  <SelectItem value="Social Studies">Social Studies</SelectItem>
                  <SelectItem value="Multi-subject">Multi-subject</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Grade Band</Label>
              <Select value={gradeBand} onValueChange={(v) => setGradeBand(v as GradeBand)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="K-2">K-2</SelectItem>
                  <SelectItem value="3-5">3-5</SelectItem>
                  <SelectItem value="6-8">6-8</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={saving}
              className="bg-cm-purple hover:bg-cm-purple-dark text-white"
            >
              {saving ? "Creating..." : "Add Standard"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
