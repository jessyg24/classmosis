"use client";

import { useState } from "react";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { createClient } from "@/lib/supabase/client";
import { generatePin, hashPin } from "@/lib/utils/pin";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Copy, Check } from "lucide-react";

interface StudentWithPin {
  name: string;
  pin: string;
}

export default function StepStudents() {
  const { classId, nextStep, prevStep } = useOnboardingStore();
  const [nameInput, setNameInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdStudents, setCreatedStudents] = useState<StudentWithPin[]>([]);
  const [copied, setCopied] = useState(false);

  const handleAddStudents = async () => {
    if (!classId) return;
    const names = nameInput
      .split("\n")
      .map((n) => n.trim())
      .filter((n) => n.length > 0);

    if (names.length === 0) return;

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const studentsWithPins: StudentWithPin[] = [];

    for (const name of names) {
      const pin = generatePin();
      const pinHash = await hashPin(pin);

      const { error: insertError } = await supabase.from("students").insert({
        class_id: classId,
        display_name: name,
        pin_hash: pinHash,
      });

      if (insertError) {
        setError(`Failed to add ${name}: ${insertError.message}`);
        setLoading(false);
        return;
      }

      studentsWithPins.push({ name, pin });
    }

    setCreatedStudents(studentsWithPins);
    setLoading(false);
  };

  const handleCopyPins = async () => {
    const text = createdStudents
      .map((s) => `${s.name}\t${s.pin}`)
      .join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-cm-section text-cm-text-primary">Add your students</h2>
        <p className="text-cm-body text-cm-text-secondary mt-1">
          Paste one name per line. PINs are generated automatically.
        </p>
      </div>

      {createdStudents.length === 0 ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="names">Student names (one per line)</Label>
            <textarea
              id="names"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder={"Emma Rodriguez\nLiam Chen\nSophia Patel\nNoah Williams"}
              rows={8}
              className="w-full px-3 py-2 rounded-cm-button border border-cm-border text-cm-body placeholder:text-cm-text-hint focus:outline-none focus:ring-2 focus:ring-cm-teal/30 focus:border-cm-teal resize-none"
            />
            <p className="text-cm-caption text-cm-text-hint">
              {nameInput.split("\n").filter((n) => n.trim()).length} students
            </p>
          </div>

          {error && (
            <p className="text-cm-caption text-cm-coral bg-cm-coral-light p-3 rounded-cm-button">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={prevStep} className="rounded-cm-button">
              Back
            </Button>
            <Button
              onClick={handleAddStudents}
              disabled={loading || !nameInput.trim()}
              className="flex-1 bg-cm-teal hover:bg-cm-teal-dark text-white rounded-cm-button"
            >
              {loading ? "Adding students..." : "Add students"}
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="bg-cm-teal-light border border-cm-teal/20 rounded-cm-card p-4">
            <p className="text-cm-body text-cm-teal-dark font-medium mb-1">
              {createdStudents.length} students added!
            </p>
            <p className="text-cm-caption text-cm-teal-dark/80">
              Copy or print these PINs — they won&apos;t be shown again.
            </p>
          </div>

          <div className="border border-cm-border rounded-cm-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-cm-white border-b border-cm-border">
              <span className="text-cm-caption text-cm-text-hint font-medium uppercase tracking-wider">
                Student PINs
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyPins}
                className="text-cm-caption"
              >
                {copied ? (
                  <><Check className="h-3 w-3 mr-1" /> Copied</>
                ) : (
                  <><Copy className="h-3 w-3 mr-1" /> Copy all</>
                )}
              </Button>
            </div>
            <div className="divide-y divide-cm-border max-h-64 overflow-y-auto">
              {createdStudents.map((s, i) => (
                <div key={i} className="flex justify-between px-4 py-2">
                  <span className="text-cm-body text-cm-text-primary">{s.name}</span>
                  <span className="text-cm-body font-mono text-cm-purple font-medium">
                    {s.pin}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={nextStep}
            className="w-full bg-cm-teal hover:bg-cm-teal-dark text-white rounded-cm-button"
          >
            Next
          </Button>
        </>
      )}
    </div>
  );
}
