"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Target } from "lucide-react";
import { getMasteryConfig } from "@/types/standards";
import type { MasteryLevel } from "@/types/database";

interface MasteryRow {
  id: string;
  mastery_level: MasteryLevel;
  avg_pct: number | null;
  standards: {
    id: string;
    code: string;
    description: string;
    domain: string;
    sort_key: string;
  } | null;
}

interface MySkillsProps {
  studentId: string;
}

export default function MySkills({ studentId }: MySkillsProps) {
  const [data, setData] = useState<Record<string, MasteryRow[]> | null>(null);
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

    fetch("/api/v1/student/mastery", { headers })
      .then((res) => (res.ok ? res.json() : null))
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [studentId]);

  const domains = data ? Object.entries(data).sort(([a], [b]) => a.localeCompare(b)) : [];
  const hasData = domains.some(([, rows]) => rows.length > 0);

  return (
    <Card className="p-cm-6 bg-cm-surface rounded-cm-card border-cm-border">
      <div className="flex items-center gap-cm-3 mb-4">
        <div className="w-8 h-8 bg-cm-purple-light rounded-cm-badge flex items-center justify-center">
          <Target className="h-4 w-4 text-cm-purple" />
        </div>
        <span className="text-cm-overline text-cm-text-hint uppercase">My Skills</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-4">
          <div className="h-6 w-6 border-2 border-cm-purple border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !hasData ? (
        <p className="text-cm-body text-cm-text-secondary">
          Your skills will show up here as you complete assignments. Keep going!
        </p>
      ) : (
        <div className="space-y-4">
          {domains.map(([domain, rows]) => {
            if (rows.length === 0) return null;
            return (
              <div key={domain}>
                <p className="text-cm-overline text-cm-text-hint uppercase mb-2">{domain}</p>
                <div className="space-y-2">
                  {rows.map((row) => {
                    const config = getMasteryConfig(row.mastery_level);
                    return (
                      <div key={row.id} className="flex items-center gap-cm-3">
                        <span className="shrink-0 px-1.5 py-0.5 rounded-cm-badge bg-cm-purple-light text-cm-purple text-[10px] font-medium">
                          {row.standards?.code}
                        </span>
                        <span className="flex-1 text-cm-caption text-cm-text-secondary truncate">
                          {row.standards?.description}
                        </span>
                        <span
                          className={`shrink-0 px-2 py-0.5 rounded-cm-badge text-cm-overline font-medium ${config.bgColor} ${config.color}`}
                        >
                          {config.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
