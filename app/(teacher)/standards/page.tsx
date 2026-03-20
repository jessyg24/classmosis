"use client";

import { useEffect, useMemo, useState } from "react";
import { Target, Plus, ChevronDown, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useClassStore } from "@/stores/class-store";
import { useClassStandards, useClassMastery } from "@/hooks/use-standards";
import { createClient } from "@/lib/supabase/client";
import { getMasteryConfig } from "@/types/standards";
import AddStandardDialog from "@/components/standards/add-standard-dialog";
import type { Subject, GradeBand, Standard, StudentMastery } from "@/types/database";

export default function StandardsPage() {
  const { activeClassId } = useClassStore();
  const { data: standards, isLoading } = useClassStandards(activeClassId);
  const { data: mastery } = useClassMastery(activeClassId);
  const [addOpen, setAddOpen] = useState(false);
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(new Set());
  const [classInfo, setClassInfo] = useState<{ subject: Subject; grade_band: GradeBand } | null>(null);

  useEffect(() => {
    if (!activeClassId) return;
    const supabase = createClient();
    supabase
      .from("classes")
      .select("subject, grade_band")
      .eq("id", activeClassId)
      .single()
      .then(({ data }) => {
        if (data) setClassInfo({ subject: data.subject as Subject, grade_band: data.grade_band as GradeBand });
      });
  }, [activeClassId]);

  // Group standards by domain
  const grouped = useMemo(() => {
    const map: Record<string, Standard[]> = {};
    for (const std of standards || []) {
      if (!map[std.domain]) map[std.domain] = [];
      map[std.domain].push(std);
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [standards]);

  // Expand all domains by default once loaded
  useEffect(() => {
    if (grouped.length > 0 && expandedDomains.size === 0) {
      setExpandedDomains(new Set(grouped.map(([d]) => d)));
    }
  }, [grouped, expandedDomains.size]);

  // Calculate class average mastery per standard
  const classMasteryByStandard = useMemo(() => {
    const map: Record<string, { total: number; count: number }> = {};
    for (const m of (mastery || []) as StudentMastery[]) {
      if (m.avg_pct === null) continue;
      if (!map[m.standard_id]) map[m.standard_id] = { total: 0, count: 0 };
      map[m.standard_id].total += m.avg_pct;
      map[m.standard_id].count += 1;
    }
    const result: Record<string, number> = {};
    for (const [id, { total, count }] of Object.entries(map)) {
      result[id] = Math.round(total / count);
    }
    return result;
  }, [mastery]);

  const toggleDomain = (domain: string) => {
    setExpandedDomains((prev) => {
      const next = new Set(prev);
      if (next.has(domain)) next.delete(domain);
      else next.add(domain);
      return next;
    });
  };

  if (!activeClassId) {
    return (
      <div className="text-cm-body text-cm-text-secondary">
        Select a class to view standards.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-cm-3">
          <div className="w-10 h-10 bg-cm-purple-light rounded-cm-button flex items-center justify-center">
            <Target className="h-5 w-5 text-cm-purple" />
          </div>
          <h1 className="text-cm-title text-cm-text-primary">Standards</h1>
        </div>
        <Button
          onClick={() => setAddOpen(true)}
          className="bg-cm-purple hover:bg-cm-purple-dark text-white rounded-cm-button"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Custom Standard
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 border-2 border-cm-purple border-t-transparent rounded-full animate-spin" />
        </div>
      ) : grouped.length === 0 ? (
        <Card className="p-cm-8 bg-cm-surface rounded-cm-card border-cm-border text-center">
          <p className="text-cm-body text-cm-text-secondary">
            No standards found for this class&apos;s subject and grade band.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {grouped.map(([domain, stds]) => (
            <Card key={domain} className="bg-cm-surface rounded-cm-card border-cm-border overflow-hidden">
              {/* Domain header */}
              <button
                onClick={() => toggleDomain(domain)}
                className="w-full flex items-center justify-between p-cm-5 hover:bg-cm-white transition-colors text-left"
              >
                <div className="flex items-center gap-cm-3">
                  {expandedDomains.has(domain) ? (
                    <ChevronDown className="h-4 w-4 text-cm-text-hint" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-cm-text-hint" />
                  )}
                  <span className="text-cm-label text-cm-text-primary">{domain}</span>
                  <span className="text-cm-caption text-cm-text-hint">
                    {stds.length} standard{stds.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </button>

              {/* Standards list */}
              {expandedDomains.has(domain) && (
                <div className="border-t border-cm-border divide-y divide-cm-border">
                  {stds.map((std) => {
                    const avgPct = classMasteryByStandard[std.id];
                    const config = avgPct !== undefined
                      ? getMasteryConfig(avgPct >= 90 ? "crushed_it" : avgPct >= 75 ? "got_it" : avgPct >= 50 ? "almost_there" : "building")
                      : null;

                    return (
                      <div key={std.id} className="px-cm-5 py-cm-4 flex items-center gap-cm-4">
                        <span className="shrink-0 px-2 py-0.5 rounded-cm-badge bg-cm-purple-light text-cm-purple text-cm-overline font-medium">
                          {std.code}
                        </span>
                        <span className="flex-1 text-cm-body text-cm-text-secondary">
                          {std.description}
                        </span>
                        {config && avgPct !== undefined ? (
                          <div className="shrink-0 w-32 flex items-center gap-2">
                            <Progress
                              value={avgPct}
                              className="h-2 flex-1"
                            />
                            <span className={`text-cm-caption font-medium ${config.color}`}>
                              {avgPct}%
                            </span>
                          </div>
                        ) : (
                          <span className="shrink-0 text-cm-caption text-cm-text-hint">
                            No data
                          </span>
                        )}
                        {std.class_id && (
                          <span className="shrink-0 text-[10px] text-cm-purple uppercase tracking-wider">
                            Custom
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {classInfo && activeClassId && (
        <AddStandardDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          classId={activeClassId}
          classSubject={classInfo.subject}
          classGradeBand={classInfo.grade_band}
        />
      )}
    </div>
  );
}
