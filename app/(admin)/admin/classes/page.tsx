"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

interface AdminClass {
  id: string;
  name: string;
  subject: string;
  grade_band: string;
  teacher_name: string;
  student_count: number;
  created_at: string;
}

export default function AdminClassesPage() {
  const [classes, setClasses] = useState<AdminClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/admin/classes")
      .then((r) => (r.ok ? r.json() : []))
      .then(setClasses)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-cm-title text-cm-text-primary">Classes</h1>

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
                  <th className="text-left px-4 py-3 text-cm-text-hint font-medium">Class</th>
                  <th className="text-left px-4 py-3 text-cm-text-hint font-medium">Teacher</th>
                  <th className="text-left px-4 py-3 text-cm-text-hint font-medium">Subject</th>
                  <th className="text-left px-4 py-3 text-cm-text-hint font-medium">Grade</th>
                  <th className="text-left px-4 py-3 text-cm-text-hint font-medium">Students</th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cm-border">
                {classes.map((c) => (
                  <tr key={c.id} className="hover:bg-cm-white">
                    <td className="px-4 py-3">
                      <Link href={`/admin/classes/${c.id}`} className="text-cm-text-primary font-medium hover:text-cm-coral">
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-cm-text-secondary">{c.teacher_name}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-cm-badge bg-cm-blue-light text-cm-blue text-[10px] font-medium">{c.subject}</span>
                    </td>
                    <td className="px-4 py-3 text-cm-text-secondary">{c.grade_band}</td>
                    <td className="px-4 py-3">{c.student_count}</td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/classes/${c.id}`}>
                        <ChevronRight className="h-4 w-4 text-cm-text-hint" />
                      </Link>
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
