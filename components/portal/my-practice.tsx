"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Brain } from "lucide-react";
import { getMasteryConfig } from "@/types/standards";
import { getMasteryLevel } from "@/types/standards";

interface PracticeSetInfo {
  id: string;
  title: string;
  description: string | null;
  question_count: number;
  best_score: number | null;
  has_completed: boolean;
  in_progress: boolean;
  can_retry: boolean;
  coins_reward: number;
}

interface MyPracticeProps {
  studentId: string;
}

export default function MyPractice({ studentId }: MyPracticeProps) {
  const [sets, setSets] = useState<PracticeSetInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;

    const stored = localStorage.getItem("classmosis_student");
    const headers: Record<string, string> = {};
    if (stored) {
      try {
        const session = JSON.parse(stored);
        if (session.token) headers["Authorization"] = `Bearer ${session.token}`;
      } catch { /* ignore */ }
    }

    fetch("/api/v1/student/practice", { headers })
      .then((res) => (res.ok ? res.json() : []))
      .then((d) => setSets(d))
      .catch(() => setSets([]))
      .finally(() => setLoading(false));
  }, [studentId]);

  return (
    <Card className="p-cm-6 bg-cm-surface rounded-cm-card border-cm-border">
      <div className="flex items-center gap-cm-3 mb-4">
        <div className="w-8 h-8 bg-cm-pink-light rounded-cm-badge flex items-center justify-center">
          <Brain className="h-4 w-4 text-cm-pink" />
        </div>
        <span className="text-cm-overline text-cm-text-hint uppercase">My Practice</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-4">
          <div className="h-6 w-6 border-2 border-cm-pink border-t-transparent rounded-full animate-spin" />
        </div>
      ) : sets.length === 0 ? (
        <p className="text-cm-body text-cm-text-secondary">
          Practice sets will appear here when your teacher creates them. Stay tuned!
        </p>
      ) : (
        <div className="space-y-3">
          {sets.map((set) => {
            const masteryLevel = set.best_score !== null ? getMasteryLevel(set.best_score) : null;
            const config = masteryLevel ? getMasteryConfig(masteryLevel) : null;

            return (
              <Link key={set.id} href={`/portal/practice/${set.id}`}>
                <div className="flex items-center gap-cm-3 p-cm-3 rounded-cm-button hover:bg-cm-white transition-colors cursor-pointer">
                  <div className="flex-1 min-w-0">
                    <p className="text-cm-body text-cm-text-primary">{set.title}</p>
                    <p className="text-cm-caption text-cm-text-hint">
                      {set.question_count} question{set.question_count !== 1 ? "s" : ""}
                      {set.coins_reward > 0 && ` · 🪙 ${set.coins_reward}`}
                    </p>
                  </div>
                  {set.in_progress ? (
                    <span className="shrink-0 px-2 py-0.5 rounded-cm-badge bg-cm-amber-light text-cm-amber text-cm-overline font-medium">
                      In progress
                    </span>
                  ) : config && masteryLevel ? (
                    <span className={`shrink-0 px-2 py-0.5 rounded-cm-badge text-cm-overline font-medium ${config.bgColor} ${config.color}`}>
                      {config.label}
                    </span>
                  ) : (
                    <span className="shrink-0 px-2 py-0.5 rounded-cm-badge bg-cm-pink-light text-cm-pink text-cm-overline font-medium">
                      {set.can_retry ? "Start" : "Start"}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </Card>
  );
}
