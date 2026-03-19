"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PortalShell from "@/components/shared/portal-shell";
import { Card } from "@/components/ui/card";
import { BookOpen, Target, Star, Clock } from "lucide-react";

interface StudentData {
  id: string;
  displayName: string;
  className: string;
  coinBalance: number;
}

export default function PortalHomePage() {
  const router = useRouter();
  const [student, setStudent] = useState<StudentData | null>(null);

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
        {/* Now Section */}
        <Card className="p-cm-6 bg-cm-surface rounded-cm-card border-cm-border">
          <div className="flex items-center gap-cm-3 mb-3">
            <div className="w-8 h-8 bg-cm-teal-light rounded-cm-badge flex items-center justify-center">
              <Clock className="h-4 w-4 text-cm-teal" />
            </div>
            <span className="text-cm-overline text-cm-text-hint uppercase">Now</span>
          </div>
          <p className="text-cm-body text-cm-text-secondary">
            No active block right now. Check back when class starts!
          </p>
        </Card>

        {/* My Work */}
        <Card className="p-cm-6 bg-cm-surface rounded-cm-card border-cm-border">
          <div className="flex items-center gap-cm-3 mb-3">
            <div className="w-8 h-8 bg-cm-blue-light rounded-cm-badge flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-cm-blue" />
            </div>
            <span className="text-cm-overline text-cm-text-hint uppercase">My Work</span>
          </div>
          <p className="text-cm-body text-cm-text-secondary">
            Nothing here yet! Your assignments will show up when your teacher adds them.
          </p>
        </Card>

        {/* My Grades */}
        <Card className="p-cm-6 bg-cm-surface rounded-cm-card border-cm-border">
          <div className="flex items-center gap-cm-3 mb-3">
            <div className="w-8 h-8 bg-cm-green-light rounded-cm-badge flex items-center justify-center">
              <Star className="h-4 w-4 text-cm-green" />
            </div>
            <span className="text-cm-overline text-cm-text-hint uppercase">My Grades</span>
          </div>
          <p className="text-cm-body text-cm-text-secondary">
            Your grades and feedback will appear here as you complete work.
          </p>
        </Card>

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
