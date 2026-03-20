"use client";

import { useEffect, useState } from "react";
import { Users, School, BookOpen, FileText, Brain, CreditCard } from "lucide-react";
import StatCard from "@/components/admin/stat-card";

interface Overview {
  teachers: number;
  classes: number;
  students: number;
  assignments: number;
  submissions: number;
  practice_sessions: number;
  tiers: { free: number; pro: number };
}

export default function AdminOverviewPage() {
  const [data, setData] = useState<Overview | null>(null);

  useEffect(() => {
    fetch("/api/v1/admin/overview")
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 border-2 border-cm-coral border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-cm-title text-cm-text-primary">Platform Overview</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard label="Teachers" value={data.teachers} icon={Users} />
        <StatCard label="Classes" value={data.classes} icon={School} />
        <StatCard label="Students" value={data.students} icon={Users} />
        <StatCard label="Assignments" value={data.assignments} icon={BookOpen} />
        <StatCard label="Submissions" value={data.submissions} icon={FileText} />
        <StatCard label="Practice Sessions" value={data.practice_sessions} icon={Brain} />
        <StatCard label="Free Tier" value={data.tiers.free} icon={CreditCard} />
        <StatCard label="Pro Tier" value={data.tiers.pro} icon={CreditCard} />
      </div>
    </div>
  );
}
