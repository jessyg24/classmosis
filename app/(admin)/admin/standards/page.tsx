"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Standard {
  id: string;
  code: string;
  description: string;
  subject: string;
  grade_band: string;
  domain: string;
  class_id: string | null;
}

export default function AdminStandardsPage() {
  const [standards, setStandards] = useState<Standard[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState("all");
  const [gradeBand, setGradeBand] = useState("all");

  useEffect(() => {
    const params = new URLSearchParams();
    if (subject !== "all") params.set("subject", subject);
    if (gradeBand !== "all") params.set("grade_band", gradeBand);
    fetch(`/api/v1/admin/standards?${params}`)
      .then((r) => r.json())
      .then(setStandards)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [subject, gradeBand]);

  // Group by domain
  const grouped: Record<string, Standard[]> = {};
  for (const s of standards) {
    if (!grouped[s.domain]) grouped[s.domain] = [];
    grouped[s.domain].push(s);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-cm-title text-cm-text-primary">Standards Inspector</h1>
        <div className="flex gap-2">
          <Select value={subject} onValueChange={(v) => { if (v) setSubject(v); }}>
            <SelectTrigger className="w-32"><SelectValue placeholder="Subject" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              <SelectItem value="ELA">ELA</SelectItem>
              <SelectItem value="Math">Math</SelectItem>
              <SelectItem value="Science">Science</SelectItem>
            </SelectContent>
          </Select>
          <Select value={gradeBand} onValueChange={(v) => { if (v) setGradeBand(v); }}>
            <SelectTrigger className="w-28"><SelectValue placeholder="Grade" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Grades</SelectItem>
              <SelectItem value="K-2">K-2</SelectItem>
              <SelectItem value="3-5">3-5</SelectItem>
              <SelectItem value="6-8">6-8</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="text-cm-caption text-cm-text-hint">{standards.length} standards loaded</p>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 border-2 border-cm-coral border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([domain, stds]) => (
            <Card key={domain} className="bg-cm-surface rounded-cm-card border-cm-border overflow-hidden">
              <div className="px-4 py-3 bg-cm-white border-b border-cm-border">
                <p className="text-cm-label text-cm-text-primary">{domain}</p>
                <p className="text-cm-caption text-cm-text-hint">{stds.length} standards</p>
              </div>
              <div className="divide-y divide-cm-border">
                {stds.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 px-4 py-2 hover:bg-cm-white">
                    <span className="shrink-0 px-2 py-0.5 rounded-cm-badge bg-cm-purple-light text-cm-purple text-[10px] font-medium">{s.code}</span>
                    <span className="flex-1 text-cm-caption text-cm-text-secondary">{s.description}</span>
                    <span className="text-[10px] text-cm-text-hint">{s.subject} · {s.grade_band}</span>
                    {s.class_id && <span className="text-[10px] text-cm-amber">Custom</span>}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
