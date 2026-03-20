"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import ClassSelector from "@/components/admin/class-selector";
import { useAdminStore } from "@/stores/admin-store";

export default function AdminGradebookPage() {
  const { selectedClassId } = useAdminStore();
  const [assignments, setAssignments] = useState<Array<Record<string, unknown>>>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Record<string, unknown> | null>(null);
  const [submissions, setSubmissions] = useState<Array<Record<string, unknown>>>([]);

  useEffect(() => {
    if (!selectedClassId) return;
    fetch(`/api/v1/admin/classes/${selectedClassId}/assignments`)
      .then((r) => r.json())
      .then(setAssignments)
      .catch(() => {});
  }, [selectedClassId]);

  const loadAssignment = async (assignmentId: string) => {
    if (!selectedClassId) return;
    const res = await fetch(`/api/v1/admin/classes/${selectedClassId}/assignments/${assignmentId}`);
    if (res.ok) {
      const data = await res.json();
      setSelectedAssignment(data.assignment);
      setSubmissions(data.submissions || []);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-cm-title text-cm-text-primary">Gradebook Inspector</h1>
        <ClassSelector />
      </div>

      {!selectedClassId ? (
        <p className="text-cm-body text-cm-text-secondary">Select a class to inspect grades.</p>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          <div className="space-y-2">
            <p className="text-cm-overline text-cm-text-hint uppercase">Assignments</p>
            {assignments.map((a) => (
              <button
                key={a.id as string}
                onClick={() => loadAssignment(a.id as string)}
                className={`w-full text-left px-3 py-2 rounded-cm-button text-cm-caption transition-colors ${
                  selectedAssignment?.id === a.id ? "bg-cm-coral-light text-cm-coral-dark" : "hover:bg-cm-white text-cm-text-secondary"
                }`}
              >
                <p className="font-medium truncate">{a.title as string}</p>
                <p className="text-[10px] text-cm-text-hint">{a.type as string} · {a.points_possible as number} pts</p>
              </button>
            ))}
          </div>

          <div className="col-span-2">
            {selectedAssignment ? (
              <Card className="bg-cm-surface rounded-cm-card border-cm-border overflow-hidden">
                <div className="p-4 border-b border-cm-border">
                  <p className="text-cm-label text-cm-text-primary">{selectedAssignment.title as string}</p>
                  <p className="text-cm-caption text-cm-text-hint">{submissions.length} submissions</p>
                </div>
                <table className="w-full text-cm-caption">
                  <thead>
                    <tr className="border-b border-cm-border bg-cm-white">
                      <th className="text-left px-4 py-2 text-cm-text-hint font-medium">Student</th>
                      <th className="text-left px-4 py-2 text-cm-text-hint font-medium">Status</th>
                      <th className="text-left px-4 py-2 text-cm-text-hint font-medium">Score</th>
                      <th className="text-left px-4 py-2 text-cm-text-hint font-medium">AI Draft</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cm-border">
                    {submissions.map((s) => (
                      <tr key={s.id as string} className="hover:bg-cm-white">
                        <td className="px-4 py-2">{(s.students as { display_name: string })?.display_name || "Student"}</td>
                        <td className="px-4 py-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                            s.status === "graded" ? "bg-cm-green-light text-cm-green" :
                            s.status === "submitted" ? "bg-cm-amber-light text-cm-amber" :
                            "bg-cm-white text-cm-text-hint"
                          }`}>{s.status as string}</span>
                        </td>
                        <td className="px-4 py-2">
                          {(s.teacher_grades as { total_pct: number })?.total_pct !== undefined
                            ? `${Math.round((s.teacher_grades as { total_pct: number }).total_pct)}%`
                            : "—"}
                        </td>
                        <td className="px-4 py-2 text-cm-text-hint">
                          {(s.teacher_grades as { ai_draft_id: string | null })?.ai_draft_id ? "AI" : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            ) : (
              <p className="text-cm-body text-cm-text-secondary py-8">Select an assignment to view submissions.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
