"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useClassStore } from "@/stores/class-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, BookOpen, Sparkles, Copy, Check, Calendar, Target, Coins } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { useMorningBrief } from "@/hooks/use-ai";

export default function DashboardPage() {
  const { activeClassId } = useClassStore();
  const [teacherName, setTeacherName] = useState("");
  const [classCount, setClassCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [todayCode, setTodayCode] = useState<string | null>(null);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [scheduleSummary, setScheduleSummary] = useState<{ blockCount: number; totalMinutes: number } | null>(null);
  const [topStandards, setTopStandards] = useState<Array<{ code: string; description: string; avgPct: number }>>([]);
  const [economySummary, setEconomySummary] = useState<{ pendingCount: number; todayAwarded: number } | null>(null);
  const { data: morningBrief } = useMorningBrief(activeClassId);

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

        // Fetch top standards with recent mastery data
        const { data: studentsForMastery } = await supabase
          .from("students")
          .select("id")
          .eq("class_id", activeClassId)
          .is("archived_at", null);

        const sIds = (studentsForMastery || []).map((s: { id: string }) => s.id);
        if (sIds.length > 0) {
          const { data: masteryRows } = await supabase
            .from("student_mastery")
            .select("standard_id, avg_pct, standards(code, description)")
            .in("student_id", sIds)
            .order("updated_at", { ascending: false })
            .limit(50);

          if (masteryRows && masteryRows.length > 0) {
            // Aggregate by standard
            const agg: Record<string, { code: string; description: string; total: number; count: number; latest: number }> = {};
            for (const r of masteryRows as unknown as Array<{ standard_id: string; avg_pct: number | null; standards: { code: string; description: string } | null }>) {
              if (r.avg_pct === null || !r.standards) continue;
              if (!agg[r.standard_id]) {
                agg[r.standard_id] = { code: r.standards.code, description: r.standards.description, total: 0, count: 0, latest: 0 };
              }
              agg[r.standard_id].total += r.avg_pct;
              agg[r.standard_id].count += 1;
            }
            const top = Object.values(agg)
              .map((a) => ({ code: a.code, description: a.description, avgPct: Math.round(a.total / a.count) }))
              .sort((a, b) => b.avgPct - a.avgPct)
              .slice(0, 5);
            setTopStandards(top);
          } else {
            setTopStandards([]);
          }
        }

        // Economy summary
        const { count: pendingCount } = await supabase
          .from("purchase_requests")
          .select("*", { count: "exact", head: true })
          .eq("class_id", activeClassId)
          .eq("status", "pending");

        const todayStr = new Date().toISOString().split("T")[0];
        const { data: todayTxns } = await supabase
          .from("economy_transactions")
          .select("amount")
          .eq("class_id", activeClassId)
          .gt("created_at", todayStr)
          .gt("amount", 0);

        const todayAwarded = (todayTxns || []).reduce((sum: number, t: { amount: number }) => sum + t.amount, 0);
        setEconomySummary({ pendingCount: pendingCount || 0, todayAwarded });
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

      {/* Economy Summary */}
      {economySummary && (economySummary.pendingCount > 0 || economySummary.todayAwarded > 0) && (
        <Card className="p-cm-6 bg-cm-surface rounded-cm-card border-cm-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-cm-3">
              <div className="w-10 h-10 bg-cm-amber-light rounded-cm-button flex items-center justify-center">
                <Coins className="h-5 w-5 text-cm-amber" />
              </div>
              <div>
                <h2 className="text-cm-label text-cm-text-primary">Economy</h2>
                <p className="text-cm-body text-cm-text-secondary">
                  {economySummary.pendingCount > 0 && `${economySummary.pendingCount} pending request${economySummary.pendingCount !== 1 ? "s" : ""}`}
                  {economySummary.pendingCount > 0 && economySummary.todayAwarded > 0 && " · "}
                  {economySummary.todayAwarded > 0 && `${economySummary.todayAwarded} coins awarded today`}
                </p>
              </div>
            </div>
            <Link href="/economy" className="text-cm-caption text-cm-amber hover:underline">
              Manage
            </Link>
          </div>
        </Card>
      )}

      {/* Standards This Week */}
      {topStandards.length > 0 && (
        <Card className="p-cm-6 bg-cm-surface rounded-cm-card border-cm-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-cm-3">
              <div className="w-10 h-10 bg-cm-purple-light rounded-cm-button flex items-center justify-center">
                <Target className="h-5 w-5 text-cm-purple" />
              </div>
              <h2 className="text-cm-label text-cm-text-primary">Standards This Week</h2>
            </div>
            <Link href="/standards" className="text-cm-caption text-cm-purple hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {topStandards.map((std) => (
              <div key={std.code} className="flex items-center gap-cm-3">
                <span className="shrink-0 px-2 py-0.5 rounded-cm-badge bg-cm-purple-light text-cm-purple text-cm-overline font-medium">
                  {std.code}
                </span>
                <span className="flex-1 text-cm-caption text-cm-text-secondary truncate">
                  {std.description}
                </span>
                <div className="shrink-0 w-24 flex items-center gap-2">
                  <Progress value={std.avgPct} className="h-2 flex-1" />
                  <span className="text-cm-caption text-cm-purple font-medium">{std.avgPct}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Morning Brief */}
      <Card className="p-cm-6 bg-cm-surface rounded-cm-card border-cm-border">
        <div className="flex items-start gap-cm-3">
          <div className="w-10 h-10 bg-cm-pink-light rounded-cm-button flex items-center justify-center shrink-0">
            <Sparkles className="h-5 w-5 text-cm-pink" />
          </div>
          <div>
            <h2 className="text-cm-label text-cm-text-primary">Morning Brief</h2>
            {morningBrief?.brief ? (
              <p className="text-cm-body text-cm-text-secondary mt-1 whitespace-pre-line">
                {morningBrief.brief}
              </p>
            ) : (
              <p className="text-cm-body text-cm-text-secondary mt-1">
                Your AI-powered morning brief will appear here once you add your
                Anthropic API key and start tracking assignments, grades, and student progress.
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
