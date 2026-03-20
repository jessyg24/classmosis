"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { useClassJobs, useCreateJob, useAssignJob, useUnassignJob, useRotateJobs } from "@/hooks/use-economy";

interface JobsManagerProps {
  classId: string;
}

interface FormData {
  title: string;
  description: string;
  coin_multiplier: number;
}

export default function JobsManager({ classId }: JobsManagerProps) {
  const { data: jobs, isLoading } = useClassJobs(classId);
  const createMutation = useCreateJob(classId);
  const assignMutation = useAssignJob(classId);
  const unassignMutation = useUnassignJob(classId);
  const rotateMutation = useRotateJobs(classId);
  const [addOpen, setAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rotation, setRotation] = useState("teacher_assigned");
  const [students, setStudents] = useState<Array<{ id: string; display_name: string }>>([]);

  const { register, handleSubmit, reset } = useForm<FormData>({
    defaultValues: { title: "", description: "", coin_multiplier: 1.5 },
  });

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("students")
      .select("id, display_name")
      .eq("class_id", classId)
      .is("archived_at", null)
      .order("display_name")
      .then(({ data }) => setStudents(data || []));
  }, [classId]);

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      await createMutation.mutateAsync({
        title: data.title,
        description: data.description || undefined,
        coin_multiplier: Number(data.coin_multiplier),
        rotation,
      });
      toast.success("Job created");
      reset();
      setRotation("teacher_assigned");
      setAddOpen(false);
    } catch {
      toast.error("Failed to create job");
    } finally {
      setSaving(false);
    }
  };

  const handleAssign = async (jobId: string, studentId: string) => {
    try {
      await assignMutation.mutateAsync({ jobId, studentId });
      toast.success("Job assigned");
    } catch {
      toast.error("Failed to assign");
    }
  };

  const handleUnassign = async (jobId: string) => {
    try {
      await unassignMutation.mutateAsync(jobId);
      toast.success("Job unassigned");
    } catch {
      toast.error("Failed to unassign");
    }
  };

  const handleRotate = async () => {
    try {
      await rotateMutation.mutateAsync();
      toast.success("Jobs rotated");
    } catch {
      toast.error("Failed to rotate");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-6 w-6 border-2 border-cm-amber border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleRotate} className="border-cm-amber text-cm-amber">
          <RefreshCw className="h-4 w-4 mr-1" />
          Rotate All
        </Button>
        <Button onClick={() => setAddOpen(true)} className="bg-cm-amber hover:bg-cm-amber-dark text-white">
          <Plus className="h-4 w-4 mr-1" />
          Create Job
        </Button>
      </div>

      {(!jobs || jobs.length === 0) ? (
        <p className="text-cm-body text-cm-text-secondary py-8 text-center">
          No jobs yet. Create classroom jobs to motivate students with coin multipliers!
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {jobs.filter((j) => j.active).map((job) => (
            <Card key={job.id} className="p-cm-5 bg-cm-surface rounded-cm-card border-cm-border">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-cm-label text-cm-text-primary">{job.title}</p>
                  {job.description && (
                    <p className="text-cm-caption text-cm-text-hint mt-0.5">{job.description}</p>
                  )}
                </div>
                <span className="px-2 py-0.5 rounded-cm-badge bg-cm-amber-light text-cm-amber text-cm-overline font-medium">
                  {job.coin_multiplier}x
                </span>
              </div>
              <div className="flex items-center justify-between">
                {job.current_holder ? (
                  <div className="flex items-center gap-2">
                    <span className="text-cm-body text-cm-text-secondary">{job.current_holder.display_name}</span>
                    <button onClick={() => handleUnassign(job.id)} className="text-cm-caption text-cm-text-hint hover:text-cm-coral">
                      Remove
                    </button>
                  </div>
                ) : (
                  <Select onValueChange={(v) => { if (v) handleAssign(job.id, v as string); }}>
                    <SelectTrigger className="w-40 h-8 text-cm-caption">
                      <SelectValue placeholder="Assign student..." />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.display_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <span className="text-[10px] text-cm-text-hint uppercase">{job.rotation.replace("_", " ")}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Create Job</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="job-title">Title</Label>
              <Input id="job-title" {...register("title", { required: true })} placeholder="e.g. Line Leader" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="job-desc">Description (optional)</Label>
              <Input id="job-desc" {...register("description")} placeholder="What does this job do?" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="job-mult">Multiplier</Label>
                <Input id="job-mult" type="number" min={1} max={5} step={0.25} {...register("coin_multiplier", { valueAsNumber: true })} />
              </div>
              <div className="space-y-2">
                <Label>Rotation</Label>
                <Select value={rotation} onValueChange={(v) => { if (v) setRotation(v); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="teacher_assigned">Teacher Assigned</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="random">Random</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={saving} className="bg-cm-amber hover:bg-cm-amber-dark text-white">
                {saving ? "Creating..." : "Create Job"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
