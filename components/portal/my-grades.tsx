"use client";

import { useEffect, useState, useCallback } from "react";
import { Star, ChevronDown, ChevronUp, Heart, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface GradeItem {
  id: string;
  assignment_id: string;
  status: string;
  assignment: { id: string; title: string; type: string; points_possible: number };
  teacher_grade: {
    total_raw: number;
    total_pct: number;
    scale_label: string | null;
    overall_feedback: string | null;
    category_scores: Array<{ name: string; score: number; max: number }>;
  } | null;
  feedback: Array<{
    id: string;
    proud_flag: boolean;
    student_reply: string | null;
  }> | null;
}

export default function MyGrades() {
  const [grades, setGrades] = useState<GradeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<Record<string, string>>({});

  const fetchGrades = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/student/submissions");
      if (res.ok) {
        const data = await res.json();
        // Only show returned submissions with grades
        setGrades(data.filter((s: GradeItem) => s.status === "returned" && s.teacher_grade));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);

  const handleProud = async () => {
    toast.success("You're proud of this work!");
  };

  if (loading) {
    return (
      <Card className="p-cm-6 bg-cm-surface rounded-cm-card border-cm-border">
        <div className="flex items-center gap-cm-3 mb-3">
          <div className="w-8 h-8 bg-cm-green-light rounded-cm-badge flex items-center justify-center">
            <Star className="h-4 w-4 text-cm-green" />
          </div>
          <span className="text-cm-overline text-cm-text-hint uppercase">My Grades</span>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-cm-6 bg-cm-surface rounded-cm-card border-cm-border">
      <div className="flex items-center gap-cm-3 mb-4">
        <div className="w-8 h-8 bg-cm-green-light rounded-cm-badge flex items-center justify-center">
          <Star className="h-4 w-4 text-cm-green" />
        </div>
        <span className="text-cm-overline text-cm-text-hint uppercase">My Grades</span>
      </div>

      {grades.length === 0 ? (
        <p className="text-cm-body text-cm-text-secondary">
          Your grades and feedback will appear here as you complete work.
        </p>
      ) : (
        <div className="space-y-2">
          {grades.map((item) => {
            const grade = item.teacher_grade!;
            const isExpanded = expandedId === item.id;
            const fb = item.feedback?.[0];

            return (
              <div
                key={item.id}
                className="border border-cm-border rounded-cm-card bg-cm-white overflow-hidden"
              >
                {/* Header — always visible */}
                <button
                  className="w-full flex items-center gap-3 p-3 text-left hover:bg-cm-surface/50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-cm-body font-medium text-cm-text-primary truncate">
                      {item.assignment.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="bg-cm-blue-light text-cm-blue text-[10px]">
                        {item.assignment.type}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={cn(
                      "text-cm-body font-medium",
                      grade.total_pct >= 70 ? "text-cm-teal" : "text-cm-coral"
                    )}>
                      {grade.total_raw}/{item.assignment.points_possible}
                    </p>
                    {grade.scale_label && (
                      <p className="text-cm-caption text-cm-text-hint">{grade.scale_label}</p>
                    )}
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-cm-text-hint shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-cm-text-hint shrink-0" />
                  )}
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-3 pb-3 space-y-3 border-t border-cm-border pt-3">
                    {/* Teacher feedback — prominent, first */}
                    {grade.overall_feedback && (
                      <div className="p-3 bg-cm-teal-light/30 rounded-cm-card border border-cm-teal/20">
                        <Label className="text-cm-caption text-cm-teal mb-1 block">
                          Teacher Feedback
                        </Label>
                        <p className="text-cm-body text-cm-text-primary whitespace-pre-wrap">
                          {grade.overall_feedback}
                        </p>
                      </div>
                    )}

                    {/* Score breakdown */}
                    {grade.category_scores.length > 0 && (
                      <div className="space-y-1">
                        {grade.category_scores.map((cs, i) => (
                          <div key={i} className="flex items-center justify-between text-cm-caption">
                            <span className="text-cm-text-secondary">{cs.name}</span>
                            <span className="text-cm-text-primary font-medium">
                              {cs.score}/{cs.max}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {fb && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleProud()}
                          className={cn(
                            "text-xs",
                            fb.proud_flag
                              ? "bg-cm-pink-light text-cm-pink border-cm-pink"
                              : "border-cm-border"
                          )}
                        >
                          <Heart className="h-3 w-3 mr-1" />
                          {fb.proud_flag ? "Proud!" : "Proud of this!"}
                        </Button>
                      )}
                    </div>

                    {/* Student reply */}
                    {fb && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3 text-cm-text-hint" />
                          <span className="text-cm-caption text-cm-text-hint">Your reflection</span>
                        </div>
                        <textarea
                          value={replyText[item.id] ?? fb.student_reply ?? ""}
                          onChange={(e) =>
                            setReplyText((prev) => ({ ...prev, [item.id]: e.target.value }))
                          }
                          className="flex w-full rounded-cm-button border border-cm-border bg-transparent px-2 py-1.5 text-cm-caption placeholder:text-cm-text-hint focus:outline-none focus:ring-1 focus:ring-cm-blue resize-y min-h-[40px]"
                          placeholder="What did you learn? What are you proud of?"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function Label({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={cn("text-cm-caption text-cm-text-hint", className)} {...props}>
      {children}
    </label>
  );
}
