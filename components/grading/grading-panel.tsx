"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { X, Send, CornerDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useGradebookStore } from "@/stores/gradebook-store";
import { useClassStore } from "@/stores/class-store";
import { useGradeSubmission, useReturnSubmission } from "@/hooks/use-gradebook";
import type { Submission, Assignment, RubricCategory } from "@/types/database";

export default function GradingPanel() {
  const { activeClassId } = useClassStore();
  const { selectedCell, gradingPanelOpen, closeGradingPanel } = useGradebookStore();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [categories, setCategories] = useState<RubricCategory[]>([]);
  const [categoryScores, setCategoryScores] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const gradeMutation = useGradeSubmission(activeClassId, selectedCell?.assignmentId || "");
  const returnMutation = useReturnSubmission(activeClassId, selectedCell?.assignmentId || "");

  // Fetch assignment + submission when cell is selected
  useEffect(() => {
    if (!gradingPanelOpen || !selectedCell || !activeClassId) return;

    const load = async () => {
      setLoading(true);
      try {
        // Fetch assignment with rubric
        const aRes = await fetch(
          `/api/v1/classes/${activeClassId}/assignments/${selectedCell.assignmentId}`
        );
        if (aRes.ok) {
          const aData = await aRes.json();
          setAssignment(aData);
          const cats = aData.rubrics?.rubric_categories || [];
          const sorted = [...cats].sort(
            (a: RubricCategory, b: RubricCategory) => a.order_index - b.order_index
          );
          setCategories(sorted);
          // Initialize scores to 0
          const scores: Record<string, number> = {};
          sorted.forEach((c: RubricCategory) => {
            scores[c.id] = 0;
          });
          setCategoryScores(scores);
        }

        // Fetch submissions for this assignment
        const sRes = await fetch(
          `/api/v1/classes/${activeClassId}/assignments/${selectedCell.assignmentId}/submissions`
        );
        if (sRes.ok) {
          const subs = await sRes.json();
          const match = subs.find(
            (s: Submission) => s.student_id === selectedCell.studentId
          );
          setSubmission(match || null);

          // If already graded, load existing scores
          if (match?.teacher_grade) {
            const grade = match.teacher_grade;
            setFeedback(grade.overall_feedback || "");
            if (grade.category_scores) {
              const scores: Record<string, number> = {};
              grade.category_scores.forEach(
                (cs: { category_id: string; score: number }) => {
                  scores[cs.category_id] = cs.score;
                }
              );
              setCategoryScores(scores);
            }
          } else {
            setFeedback("");
          }
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [gradingPanelOpen, selectedCell, activeClassId]);

  if (!gradingPanelOpen) return null;

  const totalRaw = categories.length > 0
    ? Object.values(categoryScores).reduce((sum, v) => sum + (v || 0), 0)
    : 0;
  const totalMax = categories.reduce((sum, c) => sum + c.max_points, 0) || assignment?.points_possible || 100;
  const totalPct = totalMax > 0 ? (totalRaw / totalMax) * 100 : 0;

  const handleSaveGrade = async () => {
    if (!submission || !activeClassId) return;

    const grade = {
      category_scores: categories.map((c) => ({
        category_id: c.id,
        name: c.name,
        score: categoryScores[c.id] || 0,
        max: c.max_points,
      })),
      total_raw: totalRaw,
      total_pct: Math.round(totalPct * 100) / 100,
      overall_feedback: feedback || undefined,
    };

    try {
      await gradeMutation.mutateAsync({ submissionId: submission.id, grade });
      toast.success("Grade saved");
    } catch {
      toast.error("Failed to save grade");
    }
  };

  const handleReturn = async () => {
    if (!submission) return;
    try {
      await returnMutation.mutateAsync(submission.id);
      toast.success("Returned to student");
    } catch {
      toast.error("Failed to return");
    }
  };

  const studentName = submission?.student?.display_name || "Student";

  return (
    <div className="fixed top-0 right-0 h-full w-96 bg-cm-surface border-l border-cm-border shadow-lg z-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-cm-border">
        <div className="min-w-0">
          <h2 className="text-cm-label font-medium text-cm-text-primary truncate">
            {studentName}
          </h2>
          <p className="text-cm-caption text-cm-text-secondary truncate">
            {assignment?.title || "Assignment"}
          </p>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={closeGradingPanel}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <>
            {/* Submission content */}
            {submission ? (
              <div className="space-y-2">
                <Label className="text-cm-text-hint">Submission</Label>
                {submission.content_type === "text" && submission.content && (
                  <div className="p-3 bg-cm-white rounded-cm-card border border-cm-border text-cm-body max-h-40 overflow-y-auto whitespace-pre-wrap">
                    {submission.content}
                  </div>
                )}
                {submission.file_url && (
                  <a
                    href={submission.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cm-blue hover:underline text-cm-body block"
                  >
                    View uploaded file
                  </a>
                )}
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-xs",
                      submission.status === "graded" && "bg-cm-teal-light text-cm-teal",
                      submission.status === "returned" && "bg-cm-green-light text-cm-green",
                      submission.status === "submitted" && "bg-cm-blue-light text-cm-blue",
                    )}
                  >
                    {submission.status}
                  </Badge>
                  {submission.is_late && (
                    <Badge variant="secondary" className="bg-cm-amber-light text-cm-amber text-xs">
                      Late
                    </Badge>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-cm-white rounded-cm-card border border-cm-border text-cm-body text-cm-text-hint text-center">
                No submission yet
              </div>
            )}

            {/* Rubric scoring */}
            {categories.length > 0 && (
              <div className="space-y-3">
                <Label className="text-cm-text-hint">Rubric Scores</Label>
                {categories.map((cat) => (
                  <div key={cat.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-cm-body text-cm-text-primary">{cat.name}</span>
                      <span className="text-cm-caption text-cm-text-hint">/ {cat.max_points}</span>
                    </div>
                    <Input
                      type="number"
                      min={0}
                      max={cat.max_points}
                      value={categoryScores[cat.id] ?? 0}
                      onChange={(e) =>
                        setCategoryScores((prev) => ({
                          ...prev,
                          [cat.id]: Math.min(Number(e.target.value) || 0, cat.max_points),
                        }))
                      }
                    />
                    {cat.descriptors && Object.keys(cat.descriptors).length > 0 && (
                      <p className="text-cm-caption text-cm-text-hint">
                        {Object.entries(cat.descriptors)
                          .map(([level, desc]) => `${level}: ${desc}`)
                          .join(" | ")}
                      </p>
                    )}
                  </div>
                ))}

                <div className="flex items-center justify-between p-3 bg-cm-blue-light rounded-cm-card">
                  <span className="text-cm-body font-medium text-cm-blue">Total</span>
                  <span className="text-cm-body font-medium text-cm-blue">
                    {totalRaw} / {totalMax} ({totalPct.toFixed(0)}%)
                  </span>
                </div>
              </div>
            )}

            {/* Feedback */}
            <div className="space-y-2">
              <Label className="text-cm-text-hint">Feedback</Label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="flex w-full rounded-cm-button border border-cm-border bg-transparent px-3 py-2 text-cm-body placeholder:text-cm-text-hint focus:outline-none focus:ring-2 focus:ring-cm-blue resize-y min-h-[80px]"
                placeholder="What went well? What can improve?"
              />
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      {submission && !loading && (
        <div className="p-4 border-t border-cm-border flex gap-2">
          <Button
            onClick={handleSaveGrade}
            disabled={gradeMutation.isPending}
            className="flex-1 bg-cm-blue hover:bg-cm-blue-dark text-white"
          >
            <Send className="h-4 w-4 mr-1" />
            {gradeMutation.isPending ? "Saving..." : "Save Grade"}
          </Button>
          {submission.status === "graded" && (
            <Button
              onClick={handleReturn}
              disabled={returnMutation.isPending}
              variant="outline"
              className="border-cm-teal text-cm-teal hover:bg-cm-teal-light"
            >
              <CornerDownLeft className="h-4 w-4 mr-1" />
              Return
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
