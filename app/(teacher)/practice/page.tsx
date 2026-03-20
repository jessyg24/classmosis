"use client";

import { useState } from "react";
import { Brain, Plus, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useClassStore } from "@/stores/class-store";
import { usePracticeSets, usePublishPracticeSet } from "@/hooks/use-practice";
import PracticeSetForm from "@/components/practice/practice-set-form";
import { toast } from "sonner";

export default function PracticePage() {
  const { activeClassId } = useClassStore();
  const { data: sets, isLoading } = usePracticeSets(activeClassId);
  const publishMutation = usePublishPracticeSet(activeClassId);
  const [formOpen, setFormOpen] = useState(false);

  const handlePublish = async (setId: string) => {
    try {
      await publishMutation.mutateAsync(setId);
      toast.success("Practice set published");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to publish");
    }
  };

  if (!activeClassId) {
    return (
      <div className="text-cm-body text-cm-text-secondary">
        Select a class to manage practice.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-cm-3">
          <div className="w-10 h-10 bg-cm-pink-light rounded-cm-button flex items-center justify-center">
            <Brain className="h-5 w-5 text-cm-pink" />
          </div>
          <h1 className="text-cm-title text-cm-text-primary">Practice</h1>
        </div>
        <Button
          onClick={() => setFormOpen(true)}
          className="bg-cm-pink hover:bg-cm-pink-dark text-white rounded-cm-button"
        >
          <Plus className="h-4 w-4 mr-1" />
          New Practice Set
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 border-2 border-cm-pink border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !sets || sets.length === 0 ? (
        <Card className="p-cm-8 bg-cm-surface rounded-cm-card border-cm-border text-center">
          <Brain className="h-12 w-12 text-cm-text-hint mx-auto mb-3" />
          <p className="text-cm-body text-cm-text-secondary mb-2">
            No practice sets yet
          </p>
          <p className="text-cm-caption text-cm-text-hint">
            Create practice sets with questions for students to work through at their own pace.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {sets.map((set) => {
            const standards = (set as unknown as Record<string, unknown>).practice_set_standards as
              Array<{ standards: { code: string } }> | undefined;

            return (
              <Link key={set.id} href={`/practice/${set.id}`}>
                <Card className="p-cm-5 bg-cm-surface rounded-cm-card border-cm-border hover:border-cm-pink transition-colors cursor-pointer">
                  <div className="flex items-center gap-cm-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-cm-label text-cm-text-primary">{set.title}</p>
                        {set.published ? (
                          <span className="px-1.5 py-0.5 rounded-cm-badge bg-cm-green-light text-cm-green text-[10px] font-medium">
                            Published
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded-cm-badge bg-cm-white text-cm-text-hint text-[10px] font-medium">
                            Draft
                          </span>
                        )}
                      </div>
                      {set.description && (
                        <p className="text-cm-caption text-cm-text-hint mt-0.5 truncate">{set.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-cm-caption text-cm-text-hint">
                          {set.question_count || 0} question{(set.question_count || 0) !== 1 ? "s" : ""}
                        </span>
                        {set.coins_reward > 0 && (
                          <span className="px-1.5 py-0.5 rounded-cm-badge bg-cm-amber-light text-cm-amber text-[10px] font-medium">
                            🪙 {set.coins_reward}
                          </span>
                        )}
                        {standards && standards.length > 0 && (
                          <div className="flex gap-1">
                            {standards.slice(0, 3).map((s, i) => (
                              <span key={i} className="px-1.5 py-0.5 rounded-cm-badge bg-cm-purple-light text-cm-purple text-[10px] font-medium">
                                {s.standards?.code}
                              </span>
                            ))}
                            {standards.length > 3 && (
                              <span className="text-cm-caption text-cm-text-hint">+{standards.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    {!set.published && (set.question_count || 0) > 0 && (
                      <Button
                        size="sm"
                        onClick={(e) => { e.preventDefault(); handlePublish(set.id); }}
                        className="bg-cm-green hover:bg-cm-green-dark text-white h-7 px-3 text-cm-caption"
                      >
                        Publish
                      </Button>
                    )}
                    <ChevronRight className="h-4 w-4 text-cm-text-hint shrink-0" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      <PracticeSetForm open={formOpen} onOpenChange={setFormOpen} classId={activeClassId} />
    </div>
  );
}
