"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Send, Upload, FileText, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface SubmissionFormProps {
  assignment: {
    id: string;
    title: string;
    type: string;
    instructions: string | null;
    points_possible: number;
    rubrics: { id: string; title: string; rubric_categories: Array<{ name: string; max_points: number }> } | null;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SubmissionForm({ assignment, open, onOpenChange }: SubmissionFormProps) {
  const [textContent, setTextContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitText = async () => {
    if (!textContent.trim()) {
      toast.error("Please write something before submitting.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/student/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignment_id: assignment.id,
          content_type: "text",
          content: textContent,
        }),
      });
      if (!res.ok) throw new Error("Failed to submit");
      setSubmitted(true);
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitFile = async () => {
    if (!file) {
      toast.error("Please choose a file first.");
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("assignment_id", assignment.id);
      formData.append("content_type", "file");
      formData.append("file", file);

      const res = await fetch("/api/v1/student/submissions", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to submit");
      setSubmitted(true);
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-sm text-center">
          <div className="py-6 space-y-4">
            <div className="w-16 h-16 bg-cm-teal-light rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8 text-cm-teal" />
            </div>
            <h2 className="text-cm-section text-cm-text-primary">Nice work!</h2>
            <p className="text-cm-body text-cm-text-secondary">
              Your teacher will review this soon. Keep up the great effort!
            </p>
            <Button
              onClick={() => onOpenChange(false)}
              className="bg-cm-teal hover:bg-cm-teal-dark text-white"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{assignment.title}</DialogTitle>
        </DialogHeader>

        {/* Instructions */}
        {assignment.instructions && (
          <div className="p-3 bg-cm-blue-light/30 rounded-cm-card border border-cm-blue/20">
            <Label className="text-cm-caption text-cm-blue mb-1 block">Instructions</Label>
            <p className="text-cm-body text-cm-text-primary whitespace-pre-wrap">
              {assignment.instructions}
            </p>
          </div>
        )}

        {/* Rubric preview */}
        {assignment.rubrics && (
          <div className="space-y-2">
            <Label className="text-cm-caption text-cm-text-hint">
              Rubric: {assignment.rubrics.title}
            </Label>
            <div className="flex flex-wrap gap-1">
              {assignment.rubrics.rubric_categories.map((cat, i) => (
                <Badge key={i} variant="secondary" className="bg-cm-surface text-cm-text-secondary text-xs">
                  {cat.name} ({cat.max_points} pts)
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Text submission */}
        <div className="space-y-2">
          <Label>Your Work</Label>
          <textarea
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            className="flex w-full rounded-cm-button border border-cm-border bg-transparent px-3 py-2 text-cm-body placeholder:text-cm-text-hint focus:outline-none focus:ring-2 focus:ring-cm-blue resize-y min-h-[120px]"
            placeholder="Type your answer here..."
          />
        </div>

        {/* File upload */}
        <div className="space-y-2">
          <Label className="text-cm-caption text-cm-text-hint">Or upload a file</Label>
          <label className="flex items-center gap-2 p-3 border border-dashed border-cm-border rounded-cm-card cursor-pointer hover:bg-cm-surface transition-colors">
            <Upload className="h-4 w-4 text-cm-text-hint" />
            <span className="text-cm-body text-cm-text-secondary">
              {file ? file.name : "Choose file..."}
            </span>
            <input
              type="file"
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>
        </div>

        <DialogFooter>
          {file ? (
            <Button
              onClick={handleSubmitFile}
              disabled={submitting}
              className="w-full bg-cm-blue hover:bg-cm-blue-dark text-white"
            >
              <FileText className="h-4 w-4 mr-1" />
              {submitting ? "Submitting..." : "Submit File"}
            </Button>
          ) : (
            <Button
              onClick={handleSubmitText}
              disabled={submitting || !textContent.trim()}
              className="w-full bg-cm-blue hover:bg-cm-blue-dark text-white"
            >
              <Send className="h-4 w-4 mr-1" />
              {submitting ? "Submitting..." : "Submit"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
