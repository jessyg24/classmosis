"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import ClassSelector from "@/components/admin/class-selector";
import { useAdminStore } from "@/stores/admin-store";

export default function AdminPracticePage() {
  const { selectedClassId } = useAdminStore();
  const [sets, setSets] = useState<Array<Record<string, unknown>>>([]);
  const [selectedSet, setSelectedSet] = useState<Record<string, unknown> | null>(null);
  const [questions, setQuestions] = useState<Array<Record<string, unknown>>>([]);
  const [sessions, setSessions] = useState<Array<Record<string, unknown>>>([]);

  useEffect(() => {
    if (!selectedClassId) return;
    fetch(`/api/v1/admin/classes/${selectedClassId}/practice-sets`)
      .then((r) => r.json())
      .then(setSets)
      .catch(() => {});
  }, [selectedClassId]);

  const loadSet = async (setId: string) => {
    if (!selectedClassId) return;
    const res = await fetch(`/api/v1/admin/classes/${selectedClassId}/practice-sets/${setId}`);
    if (res.ok) {
      const data = await res.json();
      setSelectedSet(data.set);
      setQuestions(data.questions || []);
      setSessions(data.sessions || []);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-cm-title text-cm-text-primary">Practice Inspector</h1>
        <ClassSelector />
      </div>

      {!selectedClassId ? (
        <p className="text-cm-body text-cm-text-secondary">Select a class to inspect practice sets.</p>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          <div className="space-y-2">
            <p className="text-cm-overline text-cm-text-hint uppercase">Practice Sets</p>
            {sets.map((s) => (
              <button
                key={s.id as string}
                onClick={() => loadSet(s.id as string)}
                className={`w-full text-left px-3 py-2 rounded-cm-button text-cm-caption transition-colors ${
                  selectedSet?.id === s.id ? "bg-cm-coral-light text-cm-coral-dark" : "hover:bg-cm-white text-cm-text-secondary"
                }`}
              >
                <p className="font-medium">{s.title as string}</p>
                <p className="text-[10px] text-cm-text-hint">{s.published ? "Published" : "Draft"}</p>
              </button>
            ))}
          </div>

          <div className="col-span-2 space-y-4">
            {selectedSet ? (
              <>
                <Card className="p-4 bg-cm-surface rounded-cm-card border-cm-border">
                  <p className="text-cm-label text-cm-text-primary">{selectedSet.title as string}</p>
                  <p className="text-cm-caption text-cm-text-hint">{questions.length} questions · {sessions.length} sessions</p>
                </Card>

                <p className="text-cm-overline text-cm-text-hint uppercase">Questions</p>
                {questions.map((q, i) => (
                  <Card key={q.id as string} className="p-3 bg-cm-surface rounded-cm-card border-cm-border">
                    <div className="flex items-start gap-2">
                      <span className="shrink-0 w-6 h-6 rounded-full bg-cm-pink-light text-cm-pink text-[10px] font-medium flex items-center justify-center">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-1.5 py-0.5 rounded bg-cm-white text-[9px] text-cm-text-hint font-medium uppercase">{q.question_type as string}</span>
                          {Boolean(q.ai_generated) && <span className="px-1.5 py-0.5 rounded bg-cm-pink-light text-cm-pink text-[9px]">AI</span>}
                        </div>
                        <p className="text-cm-caption text-cm-text-primary">{q.prompt as string}</p>
                        {Array.isArray(q.options) && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {(q.options as string[]).map((opt, j) => (
                              <span key={j} className={`px-1.5 py-0.5 rounded text-[10px] ${opt === String(q.correct_answer) ? "bg-cm-green-light text-cm-green font-medium" : "bg-cm-white text-cm-text-hint"}`}>{opt}</span>
                            ))}
                          </div>
                        )}
                        {String(q.question_type) === "short_answer" && (
                          <p className="text-[10px] text-cm-green mt-1">Answer: {String(q.correct_answer)}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}

                {sessions.length > 0 && (
                  <>
                    <p className="text-cm-overline text-cm-text-hint uppercase mt-4">Recent Sessions</p>
                    {sessions.slice(0, 10).map((s) => (
                      <div key={s.id as string} className="flex items-center gap-3 py-2 border-b border-cm-border last:border-0">
                        <span className="text-cm-caption">{(s.students as { display_name: string })?.display_name || "?"}</span>
                        <span className="text-cm-caption text-cm-text-hint">{s.status as string}</span>
                        <span className="text-cm-caption font-medium ml-auto">{s.pct_score !== null ? `${Math.round(s.pct_score as number)}%` : "—"}</span>
                      </div>
                    ))}
                  </>
                )}
              </>
            ) : (
              <p className="text-cm-body text-cm-text-secondary py-8">Select a practice set.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
