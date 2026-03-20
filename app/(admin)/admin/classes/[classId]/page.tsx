"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const tabStyle = "data-[state=active]:border-b-2 data-[state=active]:border-cm-coral data-[state=active]:text-cm-coral rounded-none";

export default function AdminClassDetailPage() {
  const { classId } = useParams<{ classId: string }>();
  const [cls, setCls] = useState<Record<string, unknown> | null>(null);
  const [students, setStudents] = useState<Array<Record<string, unknown>>>([]);
  const [assignments, setAssignments] = useState<Array<Record<string, unknown>>>([]);
  const [schedules, setSchedules] = useState<Array<Record<string, unknown>>>([]);
  const [economy, setEconomy] = useState<Array<Record<string, unknown>>>([]);
  const [practice, setPractice] = useState<Array<Record<string, unknown>>>([]);

  useEffect(() => {
    if (!classId) return;
    fetch(`/api/v1/admin/classes/${classId}`).then((r) => r.json()).then(setCls).catch(() => {});
    fetch(`/api/v1/admin/classes/${classId}/students`).then((r) => r.json()).then(setStudents).catch(() => {});
    fetch(`/api/v1/admin/classes/${classId}/assignments`).then((r) => r.json()).then(setAssignments).catch(() => {});
    fetch(`/api/v1/admin/classes/${classId}/schedules`).then((r) => r.json()).then(setSchedules).catch(() => {});
    fetch(`/api/v1/admin/classes/${classId}/economy?section=transactions`).then((r) => r.json()).then(setEconomy).catch(() => {});
    fetch(`/api/v1/admin/classes/${classId}/practice-sets`).then((r) => r.json()).then(setPractice).catch(() => {});
  }, [classId]);

  const updateStudent = async (studentId: string, field: string, value: unknown) => {
    const res = await fetch(`/api/v1/admin/classes/${classId}/students/${studentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    if (res.ok) {
      setStudents((prev) => prev.map((s) => (s.id === studentId ? { ...s, [field]: value } : s)));
      toast.success("Updated");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/classes" className="text-cm-text-hint hover:text-cm-coral">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-cm-title text-cm-text-primary">{(cls?.name as string) || "Class"}</h1>
        <span className="text-cm-caption text-cm-text-hint">{cls?.subject as string} · {cls?.grade_band as string}</span>
      </div>

      <Card className="bg-cm-surface rounded-cm-card border-cm-border">
        <Tabs defaultValue="students" className="w-full">
          <TabsList className="w-full flex-wrap h-auto border-b border-cm-border rounded-none bg-transparent px-cm-4 pt-cm-2 gap-0">
            <TabsTrigger value="students" className={tabStyle}>Students ({students.length})</TabsTrigger>
            <TabsTrigger value="assignments" className={tabStyle}>Assignments ({assignments.length})</TabsTrigger>
            <TabsTrigger value="schedules" className={tabStyle}>Schedules ({schedules.length})</TabsTrigger>
            <TabsTrigger value="economy" className={tabStyle}>Economy ({economy.length})</TabsTrigger>
            <TabsTrigger value="practice" className={tabStyle}>Practice ({practice.length})</TabsTrigger>
          </TabsList>

          <div className="p-cm-5">
            <TabsContent value="students" className="mt-0">
              <div className="overflow-x-auto">
                <table className="w-full text-cm-caption">
                  <thead>
                    <tr className="border-b border-cm-border">
                      <th className="text-left px-3 py-2 text-cm-text-hint font-medium">Name</th>
                      <th className="text-left px-3 py-2 text-cm-text-hint font-medium">Coins</th>
                      <th className="text-left px-3 py-2 text-cm-text-hint font-medium">Streak</th>
                      <th className="text-left px-3 py-2 text-cm-text-hint font-medium">Status</th>
                      <th className="text-left px-3 py-2 text-cm-text-hint font-medium">Flags</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cm-border">
                    {students.map((s) => (
                      <tr key={s.id as string} className="hover:bg-cm-white">
                        <td className="px-3 py-2 font-medium text-cm-text-primary">{s.display_name as string}</td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            defaultValue={s.coin_balance as number}
                            className="w-16 px-1 py-0.5 border border-cm-border rounded text-center text-cm-caption"
                            onBlur={(e) => updateStudent(s.id as string, "coin_balance", parseInt(e.target.value))}
                          />
                        </td>
                        <td className="px-3 py-2">{s.streak_count as number}</td>
                        <td className="px-3 py-2">{s.daily_status as string}</td>
                        <td className="px-3 py-2 flex gap-1">
                          {Boolean(s.iep_flag) && <span className="px-1 py-0.5 bg-cm-coral-light text-cm-coral text-[9px] rounded">IEP</span>}
                          {Boolean(s.flag_504) && <span className="px-1 py-0.5 bg-cm-purple-light text-cm-purple text-[9px] rounded">504</span>}
                          {Boolean(s.gate_flag) && <span className="px-1 py-0.5 bg-cm-amber-light text-cm-amber text-[9px] rounded">GATE</span>}
                          {Boolean(s.ell_flag) && <span className="px-1 py-0.5 bg-cm-blue-light text-cm-blue text-[9px] rounded">ELL</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="assignments" className="mt-0">
              <div className="divide-y divide-cm-border">
                {assignments.map((a) => (
                  <div key={a.id as string} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-cm-body text-cm-text-primary">{a.title as string}</p>
                      <p className="text-cm-caption text-cm-text-hint">{a.type as string} · {a.points_possible as number} pts · {a.published ? "Published" : "Draft"}</p>
                    </div>
                  </div>
                ))}
                {assignments.length === 0 && <p className="text-cm-body text-cm-text-hint py-4">No assignments</p>}
              </div>
            </TabsContent>

            <TabsContent value="schedules" className="mt-0">
              <div className="divide-y divide-cm-border">
                {schedules.map((s) => (
                  <Link key={s.id as string} href={`/admin/schedules?class=${classId}&schedule=${s.id as string}`}>
                    <div className="flex items-center justify-between py-3 hover:bg-cm-white cursor-pointer">
                      <div>
                        <p className="text-cm-body text-cm-text-primary">{s.date as string}</p>
                        <p className="text-cm-caption text-cm-text-hint">{s.day_type as string} · {s.published ? "Published" : "Draft"}</p>
                      </div>
                    </div>
                  </Link>
                ))}
                {schedules.length === 0 && <p className="text-cm-body text-cm-text-hint py-4">No schedules</p>}
              </div>
            </TabsContent>

            <TabsContent value="economy" className="mt-0">
              <div className="divide-y divide-cm-border">
                {economy.slice(0, 30).map((t) => (
                  <div key={t.id as string} className="flex items-center gap-3 py-2">
                    <span className="flex-1 text-cm-caption text-cm-text-secondary truncate">{(t.students as { display_name: string })?.display_name || "Student"}</span>
                    <span className="text-cm-caption text-cm-text-hint truncate max-w-[200px]">{t.reason as string}</span>
                    <span className={`text-cm-caption font-medium ${(t.amount as number) > 0 ? "text-cm-green" : "text-cm-coral"}`}>
                      {(t.amount as number) > 0 ? "+" : ""}{t.amount as number}
                    </span>
                  </div>
                ))}
                {economy.length === 0 && <p className="text-cm-body text-cm-text-hint py-4">No transactions</p>}
              </div>
            </TabsContent>

            <TabsContent value="practice" className="mt-0">
              <div className="divide-y divide-cm-border">
                {practice.map((p) => (
                  <div key={p.id as string} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-cm-body text-cm-text-primary">{p.title as string}</p>
                      <p className="text-cm-caption text-cm-text-hint">{p.published ? "Published" : "Draft"}</p>
                    </div>
                  </div>
                ))}
                {practice.length === 0 && <p className="text-cm-body text-cm-text-hint py-4">No practice sets</p>}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </Card>
    </div>
  );
}
