"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Step = "code" | "name" | "pin";

interface StudentOption {
  id: string;
  display_name: string;
}

export default function PortalLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("code");
  const [classCode, setClassCode] = useState("");
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentOption | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Check for remembered student
  useEffect(() => {
    const remembered = localStorage.getItem("classmosis_student");
    if (remembered) {
      try {
        const data = JSON.parse(remembered);
        setSelectedStudent(data);
        // Still need class code
      } catch {
        localStorage.removeItem("classmosis_student");
      }
    }
  }, []);

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

    // Get students for this class
    const { data: studentList } = await supabase
      .from("students")
      .select("id, display_name")
      .eq("class_id", codeRow.class_id)
      .is("archived_at", null)
      .order("display_name");

    setStudents(studentList || []);
    setLoading(false);

    // If we have a remembered student, skip to PIN
    const remembered = localStorage.getItem("classmosis_student");
    if (remembered) {
      try {
        const data = JSON.parse(remembered);
        const found = studentList?.find((s) => s.id === data.id);
        if (found) {
          setSelectedStudent(found);
          setStep("pin");
          return;
        }
      } catch {
        // ignore
      }
    }

    setStep("name");
  };

  const handleNameSelect = (student: StudentOption) => {
    setSelectedStudent(student);
    localStorage.setItem("classmosis_student", JSON.stringify(student));
    setStep("pin");
  };

  const handlePinSubmit = async () => {
    if (!selectedStudent || pin.length !== 4) return;
    setLoading(true);
    setError(null);

    const res = await fetch("/api/v1/auth/student", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        classCode,
        studentId: selectedStudent.id,
        pin,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error?.message || "Something went wrong.");
      setPin("");
      setLoading(false);
      return;
    }

    // Store student info for portal
    localStorage.setItem(
      "classmosis_portal",
      JSON.stringify(data.student)
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
                    className="w-full text-left px-4 py-3 rounded-cm-button text-cm-body text-cm-text-primary hover:bg-cm-teal-light transition-colors"
                  >
                    {s.display_name}
                  </button>
                ))}
              </div>

              <Button
                variant="outline"
                onClick={() => { setStep("code"); setClassCode(""); setError(null); }}
                className="w-full rounded-cm-button"
              >
                Back
              </Button>
            </div>
          )}

          {step === "pin" && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-cm-section text-cm-text-primary">
                  Hi, {selectedStudent?.display_name}!
                </h2>
                <p className="text-cm-body text-cm-text-secondary mt-1">
                  Enter your PIN
                </p>
              </div>

              <Input
                value={pin}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 4);
                  setPin(v);
                }}
                type="password"
                placeholder="••••"
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
                onClick={handlePinSubmit}
                disabled={pin.length !== 4 || loading}
                className="w-full bg-cm-teal hover:bg-cm-teal-dark text-white rounded-cm-button h-12"
              >
                {loading ? "Signing in..." : "Go!"}
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setStep("name");
                    setPin("");
                    setError(null);
                    localStorage.removeItem("classmosis_student");
                    setSelectedStudent(null);
                  }}
                  className="flex-1 rounded-cm-button text-cm-caption"
                >
                  Not me
                </Button>
                <Button
                  variant="outline"
                  onClick={() => { setStep("code"); setClassCode(""); setPin(""); setError(null); }}
                  className="flex-1 rounded-cm-button text-cm-caption"
                >
                  Different class
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
