"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PortalShell from "@/components/shared/portal-shell";
import { Card } from "@/components/ui/card";
import { Target } from "lucide-react";
import CurrentBlock from "@/components/portal/current-block";
import MyWork from "@/components/portal/my-work";
import MyGrades from "@/components/portal/my-grades";
import type { Block } from "@/types/database";

interface StudentData {
  id: string;
  displayName: string;
  className: string;
  classId: string;
  coinBalance: number;
}

export default function PortalHomePage() {
  const router = useRouter();
  const [student, setStudent] = useState<StudentData | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("classmosis_portal");
    if (!stored) {
      router.push("/portal");
      return;
    }
    try {
      setStudent(JSON.parse(stored));
    } catch {
      router.push("/portal");
    }
  }, [router]);

  // Fetch today's published schedule blocks
  const fetchBlocks = useCallback(async () => {
    if (!student?.classId) return;
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const today = new Date().toISOString().split("T")[0];

      const { data: schedule } = await supabase
        .from("schedules")
        .select("id")
        .eq("class_id", student.classId)
        .eq("date", today)
        .eq("published", true)
        .single();

      if (schedule) {
        const { data: fetchedBlocks } = await supabase
          .from("blocks")
          .select("*")
          .eq("schedule_id", schedule.id)
          .order("order_index");
        setBlocks(fetchedBlocks || []);
      } else {
        setBlocks([]);
      }
    } catch {
      setBlocks([]);
    }
  }, [student?.classId]);

  useEffect(() => {
    fetchBlocks();
    // Poll every 30 seconds for schedule updates
    const interval = setInterval(fetchBlocks, 30000);
    return () => clearInterval(interval);
  }, [fetchBlocks]);

  const handleLogout = () => {
    localStorage.removeItem("classmosis_portal");
    localStorage.removeItem("classmosis_student");
    // Clear the session cookie
    document.cookie = "student_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    router.push("/portal");
  };

  if (!student) {
    return (
      <div className="min-h-screen bg-cm-white flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-cm-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <PortalShell
      studentName={student.displayName}
      className={student.className}
      coinBalance={student.coinBalance}
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        {/* Now Section — Live Block View */}
        <Card className="p-cm-6 bg-cm-surface rounded-cm-card border-cm-border">
          <CurrentBlock blocks={blocks} />
        </Card>

        {/* My Work */}
        <MyWork />

        {/* My Grades */}
        <MyGrades />

        {/* My Goals */}
        <Card className="p-cm-6 bg-cm-surface rounded-cm-card border-cm-border">
          <div className="flex items-center gap-cm-3 mb-3">
            <div className="w-8 h-8 bg-cm-purple-light rounded-cm-badge flex items-center justify-center">
              <Target className="h-4 w-4 text-cm-purple" />
            </div>
            <span className="text-cm-overline text-cm-text-hint uppercase">My Goals</span>
          </div>
          <p className="text-cm-body text-cm-text-secondary">
            Your goals and progress will show up here. Keep going!
          </p>
        </Card>
      </div>
    </PortalShell>
  );
}
