"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, Coins, Target, ClipboardList, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import FamilyShell from "@/components/shared/family-shell";
import { useChildGrades, useChildEconomy, useChildMastery, useChildTodos } from "@/hooks/use-parent";
import { createClient } from "@/lib/supabase/client";

const MASTERY_COLORS: Record<string, string> = {
  building: "bg-cm-coral-light text-cm-coral",
  almost_there: "bg-cm-amber-light text-cm-amber",
  got_it: "bg-cm-green-light text-cm-green",
  crushed_it: "bg-cm-green-light text-cm-green-dark",
};

export default function ChildDetailPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const router = useRouter();
  const { data: gradesData, isLoading: gradesLoading } = useChildGrades(studentId);
  const { data: economyData } = useChildEconomy(studentId);
  const { data: masteryData } = useChildMastery(studentId);
  const { data: todosData } = useChildTodos(studentId);
  const [parentName, setParentName] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setParentName(user?.user_metadata?.display_name || "Parent");
    });
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <FamilyShell parentName={parentName} onLogout={handleLogout}>
      <div className="space-y-6">
        <Link href="/family" className="flex items-center gap-2 text-cm-caption text-cm-text-hint hover:text-cm-purple">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        {/* Grades */}
        <Card className="p-cm-6 bg-cm-surface rounded-cm-card border-cm-border">
          <div className="flex items-center gap-cm-3 mb-4">
            <div className="w-8 h-8 bg-cm-blue-light rounded-cm-badge flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-cm-blue" />
            </div>
            <span className="text-cm-label text-cm-text-primary">Grades</span>
            {gradesData?.average !== null && gradesData?.average !== undefined && (
              <span className="ml-auto text-cm-body text-cm-blue font-medium">{gradesData.average}% average</span>
            )}
          </div>

          {gradesLoading ? (
            <div className="flex justify-center py-4">
              <div className="h-6 w-6 border-2 border-cm-blue border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !gradesData?.grades?.length ? (
            <p className="text-cm-body text-cm-text-secondary">No grades yet. Check back after assignments are graded!</p>
          ) : (
            <div className="space-y-2">
              {gradesData.grades.slice(0, 10).map((g) => (
                <div key={g.id} className="flex items-center justify-between py-cm-2 border-b border-cm-border last:border-0">
                  <div>
                    <p className="text-cm-body text-cm-text-primary">{g.title}</p>
                    <p className="text-cm-caption text-cm-text-hint">{g.type}</p>
                  </div>
                  {g.is_missing ? (
                    <span className="flex items-center gap-1 text-cm-caption text-cm-coral">
                      <AlertCircle className="h-3 w-3" />
                      Missing
                    </span>
                  ) : g.percentage !== null ? (
                    <span className="text-cm-body text-cm-text-primary font-medium">{Math.round(g.percentage)}%</span>
                  ) : (
                    <span className="text-cm-caption text-cm-text-hint">Not graded</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Economy */}
        {economyData && !economyData.restricted && (
          <Card className="p-cm-6 bg-cm-surface rounded-cm-card border-cm-border">
            <div className="flex items-center gap-cm-3 mb-4">
              <div className="w-8 h-8 bg-cm-amber-light rounded-cm-badge flex items-center justify-center">
                <Coins className="h-4 w-4 text-cm-amber" />
              </div>
              <span className="text-cm-label text-cm-text-primary">Classroom Economy</span>
              <span className="ml-auto text-cm-body text-cm-amber font-medium">🪙 {economyData.balance}</span>
            </div>
            {economyData.activeJob && (
              <p className="text-cm-caption text-cm-text-secondary mb-2">
                Current job: <span className="font-medium text-cm-amber">{economyData.activeJob.title} ({economyData.activeJob.coin_multiplier}x)</span>
              </p>
            )}
            {economyData.transactions?.length > 0 && (
              <div className="space-y-1">
                <p className="text-cm-overline text-cm-text-hint uppercase">Recent Activity</p>
                {economyData.transactions.slice(0, 5).map((t: { id: string; amount: number; reason: string }) => (
                  <div key={t.id} className="flex items-center justify-between">
                    <span className="text-cm-caption text-cm-text-secondary truncate">{t.reason}</span>
                    <span className={`text-cm-caption font-medium ${t.amount > 0 ? "text-cm-green" : "text-cm-coral"}`}>
                      {t.amount > 0 ? "+" : ""}{t.amount}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Skills / Mastery */}
        {masteryData && Object.keys(masteryData).length > 0 && (
          <Card className="p-cm-6 bg-cm-surface rounded-cm-card border-cm-border">
            <div className="flex items-center gap-cm-3 mb-4">
              <div className="w-8 h-8 bg-cm-purple-light rounded-cm-badge flex items-center justify-center">
                <Target className="h-4 w-4 text-cm-purple" />
              </div>
              <span className="text-cm-label text-cm-text-primary">Skills Progress</span>
            </div>
            <div className="space-y-4">
              {Object.entries(masteryData).map(([domain, skills]) => (
                <div key={domain}>
                  <p className="text-cm-overline text-cm-text-hint uppercase mb-2">{domain}</p>
                  <div className="space-y-1">
                    {skills.map((skill, i) => (
                      <div key={i} className="flex items-center gap-cm-3">
                        <span className="flex-1 text-cm-caption text-cm-text-secondary">{skill.description}</span>
                        <span className={`shrink-0 px-2 py-0.5 rounded-cm-badge text-cm-overline font-medium ${MASTERY_COLORS[skill.level] || ""}`}>
                          {skill.plain_level}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Todos & Missing Work */}
        {todosData && !todosData.restricted && (
          <Card className="p-cm-6 bg-cm-surface rounded-cm-card border-cm-border">
            <div className="flex items-center gap-cm-3 mb-4">
              <div className="w-8 h-8 bg-cm-amber-light rounded-cm-badge flex items-center justify-center">
                <ClipboardList className="h-4 w-4 text-cm-amber" />
              </div>
              <span className="text-cm-label text-cm-text-primary">Tasks & Missing Work</span>
            </div>
            {todosData.missing_work?.length > 0 && (
              <div className="mb-4">
                <p className="text-cm-overline text-cm-coral uppercase mb-2">Missing Assignments</p>
                {todosData.missing_work.map((m: { title: string; due_at: string | null }, i: number) => (
                  <div key={i} className="flex items-center gap-2 py-1">
                    <AlertCircle className="h-3 w-3 text-cm-coral shrink-0" />
                    <span className="text-cm-caption text-cm-text-secondary">{m.title}</span>
                    {m.due_at && (
                      <span className="text-cm-caption text-cm-text-hint ml-auto">
                        Due {new Date(m.due_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
            {todosData.todos?.length > 0 ? (
              <div>
                <p className="text-cm-overline text-cm-text-hint uppercase mb-2">Active Tasks</p>
                {todosData.todos.map((t: { id: string; title: string; due_date: string | null }) => (
                  <div key={t.id} className="flex items-center justify-between py-1">
                    <span className="text-cm-caption text-cm-text-secondary">{t.title}</span>
                    {t.due_date && (
                      <span className="text-cm-caption text-cm-text-hint">
                        {new Date(t.due_date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : todosData.missing_work?.length === 0 ? (
              <p className="text-cm-body text-cm-text-secondary">All caught up — great work!</p>
            ) : null}
          </Card>
        )}
      </div>
    </FamilyShell>
  );
}
