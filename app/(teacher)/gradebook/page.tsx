"use client";

import { useMemo, useState } from "react";
import { Plus, ListChecks, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useClassStore } from "@/stores/class-store";
import { useGradebookStore } from "@/stores/gradebook-store";
import { useGradebook, useUpdateGradebookEntry } from "@/hooks/use-gradebook";
import QuickGradeCell from "@/components/grading/quick-grade-cell";
import GradingPanel from "@/components/grading/grading-panel";
import AssignmentForm from "@/components/grading/assignment-form";
import RubricList from "@/components/grading/rubric-list";
import type { GradebookCell, GradebookRow } from "@/types/grading";

const TYPE_COLORS: Record<string, string> = {
  classwork: "bg-cm-blue-light text-cm-blue",
  homework: "bg-cm-purple-light text-cm-purple",
  quiz: "bg-cm-amber-light text-cm-amber",
  project: "bg-cm-teal-light text-cm-teal",
  exit_ticket: "bg-cm-coral-light text-cm-coral",
};

export default function GradebookPage() {
  const { activeClassId } = useClassStore();
  const { activePeriodId, selectedCell, openGradingPanel } = useGradebookStore();
  const { data, isLoading } = useGradebook(activeClassId, activePeriodId);
  const updateEntry = useUpdateGradebookEntry(activeClassId);
  const [assignmentFormOpen, setAssignmentFormOpen] = useState(false);
  const [rubricListOpen, setRubricListOpen] = useState(false);

  // Build grid rows
  const rows: GradebookRow[] = useMemo(() => {
    if (!data) return [];
    const entryMap = new Map<string, typeof data.entries[0]>();
    data.entries.forEach((e) => {
      entryMap.set(`${e.student_id}::${e.assignment_id}`, e);
    });

    return data.students.map((student) => {
      const cells: Record<string, GradebookCell> = {};
      let totalScore = 0;
      let totalPossible = 0;

      data.assignments.forEach((a) => {
        const entry = entryMap.get(`${student.id}::${a.id}`);
        cells[a.id] = {
          entryId: entry?.id || null,
          studentId: student.id,
          assignmentId: a.id,
          rawScore: entry?.raw_score ?? null,
          pctScore: entry?.pct_score ?? null,
          displayLabel: entry?.display_label ?? null,
          isMissing: entry?.is_missing ?? true,
          isExtraCredit: entry?.is_extra_credit ?? false,
          isDropped: entry?.is_dropped ?? false,
        };

        if (entry && !entry.is_missing && !entry.is_dropped && entry.raw_score !== null) {
          if (entry.is_extra_credit) {
            totalScore += entry.raw_score;
          } else {
            totalScore += entry.raw_score;
            totalPossible += a.points_possible;
          }
        } else if (entry && !entry.is_dropped && !entry.is_extra_credit) {
          totalPossible += a.points_possible;
        }
      });

      const periodAverage = totalPossible > 0 ? (totalScore / totalPossible) * 100 : null;

      return { student, cells, periodAverage };
    });
  }, [data]);

  // Column averages
  const colAverages = useMemo(() => {
    if (!data) return {};
    const avgs: Record<string, number | null> = {};
    data.assignments.forEach((a) => {
      let sum = 0;
      let count = 0;
      rows.forEach((row) => {
        const cell = row.cells[a.id];
        if (cell && !cell.isMissing && cell.rawScore !== null) {
          sum += cell.rawScore;
          count++;
        }
      });
      avgs[a.id] = count > 0 ? sum / count : null;
    });
    return avgs;
  }, [data, rows]);

  const handleInlineGrade = (cell: GradebookCell, score: number, pointsPossible: number) => {
    if (!cell.entryId) return;
    const pctScore = pointsPossible > 0 ? (score / pointsPossible) * 100 : 0;
    updateEntry.mutate({
      entryId: cell.entryId,
      data: {
        raw_score: score,
        pct_score: Math.round(pctScore * 100) / 100,
      },
    });
  };

  if (!activeClassId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-cm-body text-cm-text-secondary">Select a class to view the gradebook.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-cm-border bg-cm-surface shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-cm-blue-light rounded-cm-badge flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-cm-blue" />
          </div>
          <h1 className="text-cm-section text-cm-text-primary">Gradebook</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRubricListOpen(true)}
            className="border-cm-border"
          >
            <ListChecks className="h-4 w-4 mr-1" /> Rubrics
          </Button>
          <Button
            size="sm"
            onClick={() => setAssignmentFormOpen(true)}
            className="bg-cm-blue hover:bg-cm-blue-dark text-white"
          >
            <Plus className="h-4 w-4 mr-1" /> New Assignment
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : !data || data.assignments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <p className="text-cm-body text-cm-text-secondary">
              No assignments yet. Create one to start grading.
            </p>
            <Button
              size="sm"
              onClick={() => setAssignmentFormOpen(true)}
              className="bg-cm-blue hover:bg-cm-blue-dark text-white"
            >
              <Plus className="h-4 w-4 mr-1" /> New Assignment
            </Button>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-cm-surface border-b border-cm-border">
                {/* Frozen student name column */}
                <th className="sticky left-0 z-20 bg-cm-surface px-4 py-2 text-left text-cm-overline text-cm-text-hint uppercase border-r border-cm-border min-w-[180px]">
                  Student
                </th>
                {/* Assignment columns */}
                {data.assignments.map((a) => (
                  <th
                    key={a.id}
                    className="px-3 py-2 text-center border-r border-cm-border min-w-[100px]"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-cm-caption text-cm-text-primary font-medium truncate max-w-[120px]">
                        {a.title}
                      </span>
                      <Badge variant="secondary" className={cn("text-[10px]", TYPE_COLORS[a.type] || "")}>
                        {a.type}
                      </Badge>
                      {colAverages[a.id] !== null && colAverages[a.id] !== undefined && (
                        <span className="text-[10px] text-cm-text-hint">
                          avg: {colAverages[a.id]!.toFixed(0)}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                {/* Period average column */}
                <th className="sticky right-0 z-20 bg-cm-surface px-4 py-2 text-center text-cm-overline text-cm-text-hint uppercase border-l border-cm-border min-w-[80px]">
                  Avg
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.student.id} className="border-b border-cm-border hover:bg-cm-white/50">
                  {/* Frozen student name */}
                  <td className="sticky left-0 z-10 bg-cm-surface px-4 py-2 text-cm-body text-cm-text-primary border-r border-cm-border font-medium">
                    {row.student.display_name}
                  </td>
                  {/* Grade cells */}
                  {data.assignments.map((a) => {
                    const cell = row.cells[a.id];
                    if (!cell) return <td key={a.id} className="px-3 py-2 border-r border-cm-border" />;
                    return (
                      <QuickGradeCell
                        key={a.id}
                        cell={cell}
                        pointsPossible={a.points_possible}
                        hasRubric={!!a.rubric_id}
                        isSelected={
                          selectedCell?.studentId === row.student.id &&
                          selectedCell?.assignmentId === a.id
                        }
                        onSelect={() =>
                          openGradingPanel({ studentId: row.student.id, assignmentId: a.id })
                        }
                        onInlineGrade={(score) => handleInlineGrade(cell, score, a.points_possible)}
                      />
                    );
                  })}
                  {/* Period average */}
                  <td className="sticky right-0 z-10 bg-cm-surface px-4 py-2 text-center text-cm-body font-medium border-l border-cm-border">
                    {row.periodAverage !== null ? (
                      <span className={cn(
                        row.periodAverage >= 70 ? "text-cm-teal" : "text-cm-coral"
                      )}>
                        {row.periodAverage.toFixed(0)}%
                      </span>
                    ) : (
                      <span className="text-cm-text-hint">--</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Grading panel */}
      <GradingPanel />

      {/* Dialogs */}
      <AssignmentForm open={assignmentFormOpen} onOpenChange={setAssignmentFormOpen} />
      <RubricList open={rubricListOpen} onOpenChange={setRubricListOpen} />
    </div>
  );
}
