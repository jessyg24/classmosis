"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useClassStore } from "@/stores/class-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, BookOpen, Sparkles, Copy, Check, Calendar } from "lucide-react";

export default function DashboardPage() {
  const { activeClassId } = useClassStore();
  const [teacherName, setTeacherName] = useState("");
  const [classCount, setClassCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [todayCode, setTodayCode] = useState<string | null>(null);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [scheduleSummary, setScheduleSummary] = useState<{ blockCount: number; totalMinutes: number } | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setTeacherName(user.user_metadata?.display_name || "Teacher");
      }

      const { count: cc } = await supabase
        .from("classes")
        .select("*", { count: "exact", head: true })
        .is("archived_at", null);
      setClassCount(cc || 0);

      if (activeClassId) {
        const { count: sc } = await supabase
          .from("students")
          .select("*", { count: "exact", head: true })
          .eq("class_id", activeClassId)
          .is("archived_at", null);
        setStudentCount(sc || 0);

        // Check for today's code
        const today = new Date().toISOString().split("T")[0];
        const { data: codes } = await supabase
          .from("class_codes")
          .select("code")
          .eq("class_id", activeClassId)
          .eq("date", today)
          .limit(1);

        if (codes && codes.length > 0) {
          setTodayCode(codes[0].code);
        } else {
          setTodayCode(null);
        }

        // Check for published schedule
        const { data: schedule } = await supabase
          .from("schedules")
          .select("id, published, class_code")
          .eq("class_id", activeClassId)
          .eq("date", today)
          .eq("published", true)
          .maybeSingle();

        if (schedule) {
          const { count: blockCount } = await supabase
            .from("blocks")
            .select("*", { count: "exact", head: true })
            .eq("schedule_id", schedule.id);

          const { data: blockDurations } = await supabase
            .from("blocks")
            .select("duration_minutes")
            .eq("schedule_id", schedule.id);

          const totalMinutes = (blockDurations || []).reduce(
            (sum: number, b: { duration_minutes: number }) => sum + b.duration_minutes,
            0
          );

          setScheduleSummary({ blockCount: blockCount || 0, totalMinutes });

          // If schedule has a class code and we don't have one yet, use it
          if (schedule.class_code && !codes?.length) {
            setTodayCode(schedule.class_code);
          }
        } else {
          setScheduleSummary(null);
        }
      }
    }
    load();
  }, [activeClassId]);

  const handleGenerateCode = async () => {
    if (!activeClassId) return;
    setGeneratingCode(true);

    const res = await fetch(`/api/v1/classes/${activeClassId}/code`, {
      method: "POST",
    });
    const data = await res.json();

    if (data.code) {
      setTodayCode(data.code);
    }
    setGeneratingCode(false);
  };

  const handleCopyCode = async () => {
    if (!todayCode) return;
    await navigator.clipboard.writeText(todayCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-cm-title text-cm-text-primary">
          Good morning, {teacherName}
        </h1>
        <p className="text-cm-body text-cm-text-secondary mt-1">
          Here&apos;s your classroom at a glance.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-cm-5 bg-cm-surface rounded-cm-card border-cm-border">
          <div className="flex items-center gap-cm-3">
            <div className="w-10 h-10 bg-cm-purple-light rounded-cm-button flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-cm-purple" />
            </div>
            <div>
              <p className="text-cm-caption text-cm-text-hint uppercase tracking-wider">
                Classes
              </p>
              <p className="text-cm-section text-cm-text-primary">{classCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-cm-5 bg-cm-surface rounded-cm-card border-cm-border">
          <div className="flex items-center gap-cm-3">
            <div className="w-10 h-10 bg-cm-teal-light rounded-cm-button flex items-center justify-center">
              <Users className="h-5 w-5 text-cm-teal" />
            </div>
            <div>
              <p className="text-cm-caption text-cm-text-hint uppercase tracking-wider">
                Students
              </p>
              <p className="text-cm-section text-cm-text-primary">{studentCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-cm-5 bg-cm-surface rounded-cm-card border-cm-border">
          <div className="flex items-center gap-cm-3">
            <div className="w-10 h-10 bg-cm-amber-light rounded-cm-button flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-cm-amber" />
            </div>
            <div>
              <p className="text-cm-caption text-cm-text-hint uppercase tracking-wider">
                Today&apos;s Code
              </p>
              {todayCode ? (
                <div className="flex items-center gap-2">
                  <p className="text-cm-section text-cm-text-primary font-mono">
                    {todayCode}
                  </p>
                  <button onClick={handleCopyCode} className="text-cm-text-hint hover:text-cm-teal">
                    {codeCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              ) : (
                <p className="text-cm-caption text-cm-text-hint">Not generated</p>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Class Code Generator */}
      {!todayCode && activeClassId && (
        <Card className="p-cm-6 bg-cm-surface rounded-cm-card border-cm-border">
          <h2 className="text-cm-label text-cm-text-primary mb-2">
            Generate today&apos;s class code
          </h2>
          <p className="text-cm-body text-cm-text-secondary mb-4">
            Students use this code to access the portal. A new code is needed each day.
          </p>
          <Button
            onClick={handleGenerateCode}
            disabled={generatingCode}
            className="bg-cm-teal hover:bg-cm-teal-dark text-white rounded-cm-button"
          >
            {generatingCode ? "Generating..." : "Generate code"}
          </Button>
        </Card>
      )}

      {/* Today's Schedule Summary */}
      {scheduleSummary && (
        <Card className="p-cm-6 bg-cm-surface rounded-cm-card border-cm-border">
          <div className="flex items-center gap-cm-3">
            <div className="w-10 h-10 bg-cm-teal-light rounded-cm-button flex items-center justify-center">
              <Calendar className="h-5 w-5 text-cm-teal" />
            </div>
            <div>
              <h2 className="text-cm-label text-cm-text-primary">
                Today&apos;s Schedule
              </h2>
              <p className="text-cm-body text-cm-text-secondary">
                {scheduleSummary.blockCount} blocks,{" "}
                {Math.floor(scheduleSummary.totalMinutes / 60)}h{" "}
                {scheduleSummary.totalMinutes % 60}m total
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Morning Brief Placeholder */}
      <Card className="p-cm-6 bg-cm-surface rounded-cm-card border-cm-border">
        <div className="flex items-start gap-cm-3">
          <div className="w-10 h-10 bg-cm-pink-light rounded-cm-button flex items-center justify-center shrink-0">
            <Sparkles className="h-5 w-5 text-cm-pink" />
          </div>
          <div>
            <h2 className="text-cm-label text-cm-text-primary">Morning Brief</h2>
            <p className="text-cm-body text-cm-text-secondary mt-1">
              Your AI-powered morning brief will appear here once you start using
              Classmosis — tracking assignments, grades, and student progress.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
