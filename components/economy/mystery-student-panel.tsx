"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTodayMystery, useSelectMystery, useRevealMystery, useMysteryHistory } from "@/hooks/use-economy";

interface MysteryStudentPanelProps {
  classId: string;
}

export default function MysteryStudentPanel({ classId }: MysteryStudentPanelProps) {
  const { data: todayRecord, isLoading } = useTodayMystery(classId);
  const { data: history } = useMysteryHistory(classId);
  const selectMutation = useSelectMystery(classId);
  const revealMutation = useRevealMystery(classId);
  const [teacherNote, setTeacherNote] = useState("");

  const handleSelect = async () => {
    try {
      await selectMutation.mutateAsync(3);
      toast.success("Mystery student selected!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to select");
    }
  };

  const handleReveal = async () => {
    try {
      await revealMutation.mutateAsync(teacherNote || undefined);
      toast.success("Mystery student revealed!");
      setTeacherNote("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reveal");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-6 w-6 border-2 border-cm-amber border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Today's Mystery */}
      {!todayRecord ? (
        <div className="text-center py-8">
          <div className="text-5xl mb-4">🕵️</div>
          <p className="text-cm-body text-cm-text-secondary mb-4">
            No mystery student selected yet today.
          </p>
          <Button
            onClick={handleSelect}
            disabled={selectMutation.isPending}
            className="bg-cm-amber hover:bg-cm-amber-dark text-white"
          >
            {selectMutation.isPending ? "Selecting..." : "Select Mystery Student"}
          </Button>
        </div>
      ) : !todayRecord.revealed_at ? (
        <div className="text-center py-8">
          <div className="text-6xl mb-4 animate-pulse">❓</div>
          <p className="text-cm-section text-cm-amber-dark font-medium mb-2">
            Mystery Student is active!
          </p>
          <p className="text-cm-body text-cm-text-secondary mb-4">
            Someone is earning {todayRecord.multiplier}x coins today...
          </p>
          <div className="max-w-xs mx-auto space-y-3">
            <Input
              value={teacherNote}
              onChange={(e) => setTeacherNote(e.target.value)}
              placeholder="Add a note for the reveal (optional)"
              className="text-center"
            />
            <Button
              onClick={handleReveal}
              disabled={revealMutation.isPending}
              className="bg-cm-amber hover:bg-cm-amber-dark text-white w-full"
            >
              {revealMutation.isPending ? "Revealing..." : "Reveal Mystery Student"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-5xl mb-4">🎉</div>
          <p className="text-cm-section text-cm-text-primary mb-1">
            {todayRecord.student?.display_name || "Student"}
          </p>
          <p className="text-cm-body text-cm-amber font-medium mb-3">
            Today&apos;s Mystery Student!
          </p>
          <div className="flex justify-center gap-6 text-center">
            <div>
              <p className="text-cm-caption text-cm-text-hint">Day&apos;s Earnings</p>
              <p className="text-cm-label text-cm-text-primary">{todayRecord.day_earnings_before}</p>
            </div>
            <div>
              <p className="text-cm-caption text-cm-text-hint">Multiplier</p>
              <p className="text-cm-label text-cm-amber">{todayRecord.multiplier}x</p>
            </div>
            <div>
              <p className="text-cm-caption text-cm-text-hint">Bonus</p>
              <p className="text-cm-label text-cm-green">+{todayRecord.bonus_payout}</p>
            </div>
          </div>
          {todayRecord.teacher_note && (
            <p className="text-cm-caption text-cm-text-hint mt-3 italic">&ldquo;{todayRecord.teacher_note}&rdquo;</p>
          )}
        </div>
      )}

      {/* History */}
      {history && history.length > 0 && (
        <div>
          <p className="text-cm-overline text-cm-text-hint uppercase mb-2">Recent History</p>
          <div className="divide-y divide-cm-border">
            {history.slice(0, 7).map((r) => (
              <div key={r.id} className="flex items-center gap-cm-3 py-cm-2">
                <span className="text-cm-caption text-cm-text-hint w-16">
                  {new Date(r.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </span>
                <span className="flex-1 text-cm-body text-cm-text-secondary">
                  {r.student?.display_name || "Student"}
                </span>
                <span className="text-cm-caption text-cm-green font-medium">+{r.bonus_payout}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
