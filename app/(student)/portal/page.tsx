"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Step = "code" | "name";

interface StudentOption {
  id: string;
  display_name: string;
}

export default function PortalLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("code");
  const [classCode, setClassCode] = useState("");
  const [classId, setClassId] = useState<string | null>(null);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Check for remembered student — skip straight to portal if code is still valid
  useEffect(() => {
    const portal = localStorage.getItem("classmosis_portal");
    if (portal) {
      try {
        const data = JSON.parse(portal);
        // Check if session is from today
        if (data.date === new Date().toISOString().split("T")[0]) {
          router.push("/portal/home");
        } else {
          // Expired — clear it
          localStorage.removeItem("classmosis_portal");
        }
      } catch {
        localStorage.removeItem("classmosis_portal");
      }
    }
  }, [router]);

  const handleCodeSubmit = async () => {
    if (classCode.length !== 4) return;
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const today = new Date().toISOString().split("T")[0];

    // Find class for this code
    const { data: codeRow } = await supabase
      .from("class_codes")
      .select("class_id")
      .eq("code", classCode)
      .eq("date", today)
      .single();

    if (!codeRow) {
      setError("That code isn't active today. Ask your teacher for today's code.");
      setLoading(false);
      return;
    }

    setClassId(codeRow.class_id);

    // Get students for this class
    const { data: studentList } = await supabase
      .from("students")
      .select("id, display_name")
      .eq("class_id", codeRow.class_id)
      .is("archived_at", null)
      .order("display_name");

    setStudents(studentList || []);
    setLoading(false);
    setStep("name");
  };

  const handleNameSelect = async (student: StudentOption) => {
    if (!classId) return;
    setLoading(true);
    setError(null);

    // Call auth endpoint — no PIN needed
    const res = await fetch("/api/v1/auth/student", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        classCode,
        studentId: student.id,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error?.message || "Something went wrong.");
      setLoading(false);
      return;
    }

    // Store student info for portal — includes today's date for session expiry
    localStorage.setItem(
      "classmosis_portal",
      JSON.stringify({
        ...data.student,
        date: new Date().toISOString().split("T")[0],
      })
    );

    router.push("/portal/home");
  };

  return (
    <div className="min-h-screen bg-cm-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-cm-title text-cm-text-primary">Classmosis</h1>
          <p className="text-cm-body text-cm-text-secondary mt-1">
            Student Portal
          </p>
        </div>

        <div className="bg-cm-surface rounded-cm-modal border border-cm-border p-8 shadow-sm">
          {step === "code" && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-cm-section text-cm-text-primary">
                  Enter class code
                </h2>
                <p className="text-cm-body text-cm-text-secondary mt-1">
                  Your teacher has today&apos;s code
                </p>
              </div>

              <Input
                value={classCode}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 4);
                  setClassCode(v);
                }}
                placeholder="0000"
                className="text-center text-2xl font-mono tracking-[0.3em] h-14"
                maxLength={4}
                inputMode="numeric"
                autoFocus
              />

              {error && (
                <p className="text-cm-caption text-cm-coral bg-cm-coral-light p-3 rounded-cm-button text-center">
                  {error}
                </p>
              )}

              <Button
                onClick={handleCodeSubmit}
                disabled={classCode.length !== 4 || loading}
                className="w-full bg-cm-teal hover:bg-cm-teal-dark text-white rounded-cm-button h-12"
              >
                {loading ? "Checking..." : "Next"}
              </Button>
            </div>
          )}

          {step === "name" && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-cm-section text-cm-text-primary">
                  Who are you?
                </h2>
                <p className="text-cm-body text-cm-text-secondary mt-1">
                  Pick your name
                </p>
              </div>

              <div className="space-y-1 max-h-64 overflow-y-auto">
                {students.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleNameSelect(s)}
                    disabled={loading}
                    className="w-full text-left px-4 py-3 rounded-cm-button text-cm-body text-cm-text-primary hover:bg-cm-teal-light transition-colors disabled:opacity-50"
                  >
                    {s.display_name}
                  </button>
                ))}
              </div>

              {error && (
                <p className="text-cm-caption text-cm-coral bg-cm-coral-light p-3 rounded-cm-button text-center">
                  {error}
                </p>
              )}

              <Button
                variant="outline"
                onClick={() => { setStep("code"); setClassCode(""); setError(null); }}
                className="w-full rounded-cm-button"
              >
                Back
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
