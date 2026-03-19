"use client";

import { useEffect, useState, useCallback } from "react";
import { BookOpen, Clock, CheckCircle2, Send, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import SubmissionForm from "./submission-form";

interface AssignmentItem {
  id: string;
  title: string;
  type: string;
  due_at: string | null;
  instructions: string | null;
  points_possible: number;
  rubrics: { id: string; title: string; rubric_categories: Array<{ name: string; max_points: number }> } | null;
  submission_status: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  submitted: { label: "Submitted", color: "bg-cm-blue-light text-cm-blue", icon: Send },
  graded: { label: "Graded", color: "bg-cm-teal-light text-cm-teal", icon: CheckCircle2 },
  returned: { label: "Returned", color: "bg-cm-green-light text-cm-green", icon: CheckCircle2 },
};

export default function MyWork() {
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentItem | null>(null);

  const fetchAssignments = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/student/assignments");
      if (res.ok) {
        setAssignments(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const formatDue = (dueAt: string) => {
    const d = new Date(dueAt);
    const now = new Date();
    const isOverdue = d < now;
    const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return { label, isOverdue };
  };

  if (loading) {
    return (
      <Card className="p-cm-6 bg-cm-surface rounded-cm-card border-cm-border">
        <div className="flex items-center gap-cm-3 mb-3">
          <div className="w-8 h-8 bg-cm-blue-light rounded-cm-badge flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-cm-blue" />
          </div>
          <span className="text-cm-overline text-cm-text-hint uppercase">My Work</span>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-cm-6 bg-cm-surface rounded-cm-card border-cm-border">
        <div className="flex items-center gap-cm-3 mb-4">
          <div className="w-8 h-8 bg-cm-blue-light rounded-cm-badge flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-cm-blue" />
          </div>
          <span className="text-cm-overline text-cm-text-hint uppercase">My Work</span>
        </div>

        {assignments.length === 0 ? (
          <p className="text-cm-body text-cm-text-secondary">
            Nothing here yet! Your assignments will show up when your teacher adds them.
          </p>
        ) : (
          <div className="space-y-2">
            {assignments.map((a) => {
              const status = a.submission_status;
              const statusConf = status ? STATUS_CONFIG[status] : null;
              const due = a.due_at ? formatDue(a.due_at) : null;

              return (
                <div
                  key={a.id}
                  className="flex items-center gap-3 p-3 rounded-cm-card border border-cm-border bg-cm-white hover:bg-cm-blue-light/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-cm-body font-medium text-cm-text-primary truncate">
                      {a.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="bg-cm-blue-light text-cm-blue text-[10px]">
                        {a.type}
                      </Badge>
                      {due && (
                        <span className={`text-cm-caption flex items-center gap-1 ${due.isOverdue && !status ? "text-cm-coral" : "text-cm-text-hint"}`}>
                          <Clock className="h-3 w-3" /> {due.label}
                        </span>
                      )}
                      {statusConf && (
                        <Badge variant="secondary" className={`text-[10px] ${statusConf.color}`}>
                          {statusConf.label}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {!status && (
                    <Button
                      size="sm"
                      onClick={() => setSelectedAssignment(a)}
                      className="bg-cm-blue hover:bg-cm-blue-dark text-white shrink-0"
                    >
                      Start <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  )}
                  {status === "returned" && (
                    <span className="text-cm-caption text-cm-green">View Feedback</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {selectedAssignment && (
        <SubmissionForm
          assignment={selectedAssignment}
          open={!!selectedAssignment}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedAssignment(null);
              fetchAssignments(); // Refresh after submit
            }
          }}
        />
      )}
    </>
  );
}
