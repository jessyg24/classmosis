"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface Teacher {
  id: string;
  email: string;
  name: string;
  school: string | null;
  created_at: string;
  tier: string;
  class_count: number;
}

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/admin/teachers")
      .then((r) => (r.ok ? r.json() : []))
      .then(setTeachers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const changeTier = async (teacherId: string, tier: string) => {
    const res = await fetch(`/api/v1/admin/teachers/${teacherId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier }),
    });
    if (res.ok) {
      setTeachers((prev) => prev.map((t) => (t.id === teacherId ? { ...t, tier } : t)));
      toast.success(`Tier updated to ${tier}`);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-cm-title text-cm-text-primary">Teachers</h1>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 border-2 border-cm-coral border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <Card className="bg-cm-surface rounded-cm-card border-cm-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-cm-caption">
              <thead>
                <tr className="border-b border-cm-border bg-cm-white">
                  <th className="text-left px-4 py-3 text-cm-text-hint font-medium">Name</th>
                  <th className="text-left px-4 py-3 text-cm-text-hint font-medium">Email</th>
                  <th className="text-left px-4 py-3 text-cm-text-hint font-medium">School</th>
                  <th className="text-left px-4 py-3 text-cm-text-hint font-medium">Classes</th>
                  <th className="text-left px-4 py-3 text-cm-text-hint font-medium">Tier</th>
                  <th className="text-left px-4 py-3 text-cm-text-hint font-medium">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cm-border">
                {teachers.map((t) => (
                  <tr key={t.id} className="hover:bg-cm-white">
                    <td className="px-4 py-3 text-cm-text-primary font-medium">{t.name}</td>
                    <td className="px-4 py-3 text-cm-text-secondary">{t.email}</td>
                    <td className="px-4 py-3 text-cm-text-secondary">{t.school || "—"}</td>
                    <td className="px-4 py-3">{t.class_count}</td>
                    <td className="px-4 py-3">
                      <select
                        value={t.tier}
                        onChange={(e) => changeTier(t.id, e.target.value)}
                        className={`px-2 py-0.5 rounded-cm-badge text-[10px] font-medium border-0 cursor-pointer ${
                          t.tier === "pro" ? "bg-cm-teal-light text-cm-teal-dark" : "bg-cm-white text-cm-text-hint"
                        }`}
                      >
                        <option value="free">Free</option>
                        <option value="pro">Pro</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-cm-text-hint">
                      {new Date(t.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
