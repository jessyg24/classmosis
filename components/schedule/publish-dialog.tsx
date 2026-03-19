"use client";

import { useState } from "react";
import { useScheduleStore } from "@/stores/schedule-store";
import { useClassStore } from "@/stores/class-store";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Check, Copy, Rocket } from "lucide-react";
import { toast } from "sonner";

export default function PublishDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { scheduleId, blocks, setPublished, markClean } = useScheduleStore();
  const { activeClassId } = useClassStore();
  const [publishing, setPublishing] = useState(false);
  const [classCode, setClassCode] = useState<string | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);

  if (!open) return null;

  const warnings: string[] = [];
  const blockers: string[] = [];

  if (blocks.length === 0) {
    blockers.push("No blocks in schedule");
  }

  const zeroDuration = blocks.filter((b) => b.duration_minutes <= 0);
  if (zeroDuration.length > 0) {
    warnings.push(`${zeroDuration.length} block(s) with 0 duration`);
  }

  const totalMinutes = blocks.reduce((sum, b) => sum + b.duration_minutes, 0);
  if (totalMinutes > 480) {
    warnings.push(`Total day is ${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m (exceeds 8 hours)`);
  }

  const canPublish = blockers.length === 0;

  const handlePublish = async () => {
    if (!activeClassId || !scheduleId) return;
    setPublishing(true);

    try {
      const res = await fetch(
        `/api/v1/classes/${activeClassId}/schedules/${scheduleId}/publish`,
        { method: "POST" }
      );
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to publish");
        return;
      }

      setClassCode(data.classCode);
      setPublished(true);
      markClean();
      toast.success("Schedule published!");
    } catch {
      toast.error("Failed to publish schedule");
    } finally {
      setPublishing(false);
    }
  };

  const handleCopy = async () => {
    if (!classCode) return;
    await navigator.clipboard.writeText(classCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-cm-surface rounded-cm-modal shadow-xl w-full max-w-md mx-4 p-cm-6">
        {classCode ? (
          // Success state
          <div className="text-center">
            <div className="w-14 h-14 bg-cm-teal-light rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-7 w-7 text-cm-teal" />
            </div>
            <h2 className="text-cm-section text-cm-text-primary mb-1">
              Schedule Published!
            </h2>
            <p className="text-cm-body text-cm-text-secondary mb-4">
              Share this code with your students:
            </p>
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="text-4xl font-mono font-bold text-cm-text-primary tracking-wider">
                {classCode}
              </span>
              <button
                onClick={handleCopy}
                className="text-cm-text-hint hover:text-cm-teal transition-colors"
              >
                {codeCopied ? (
                  <Check className="h-5 w-5 text-cm-teal" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
              </button>
            </div>
            <Button
              onClick={onClose}
              className="bg-cm-teal hover:bg-cm-teal-dark text-white rounded-cm-button"
            >
              Done
            </Button>
          </div>
        ) : (
          // Pre-publish state
          <>
            <div className="flex items-center gap-cm-3 mb-4">
              <div className="w-10 h-10 bg-cm-teal-light rounded-cm-button flex items-center justify-center">
                <Rocket className="h-5 w-5 text-cm-teal" />
              </div>
              <div>
                <h2 className="text-cm-label text-cm-text-primary">
                  Publish Schedule
                </h2>
                <p className="text-cm-caption text-cm-text-secondary">
                  {blocks.length} blocks, {Math.floor(totalMinutes / 60)}h{" "}
                  {totalMinutes % 60}m total
                </p>
              </div>
            </div>

            {blockers.length > 0 && (
              <div className="bg-cm-coral-light border border-cm-coral/20 rounded-cm-button p-cm-3 mb-3">
                {blockers.map((b, i) => (
                  <p key={i} className="text-cm-body text-cm-coral-dark flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0" /> {b}
                  </p>
                ))}
              </div>
            )}

            {warnings.length > 0 && (
              <div className="bg-cm-amber-light border border-cm-amber/20 rounded-cm-button p-cm-3 mb-3">
                {warnings.map((w, i) => (
                  <p key={i} className="text-cm-body text-cm-amber-dark flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0" /> {w}
                  </p>
                ))}
              </div>
            )}

            <p className="text-cm-body text-cm-text-secondary mb-4">
              This will generate a class code and make the schedule visible to
              students. You can still make edits after publishing.
            </p>

            <div className="flex gap-cm-2 justify-end">
              <Button
                variant="ghost"
                onClick={onClose}
                className="rounded-cm-button"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePublish}
                disabled={!canPublish || publishing}
                className="bg-cm-teal hover:bg-cm-teal-dark text-white rounded-cm-button"
              >
                {publishing ? "Publishing..." : "Publish"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
