"use client";

import { useState } from "react";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Subject, GradeBand } from "@/types/database";

const subjects: Subject[] = ["ELA", "Math", "Science", "Social Studies", "Multi-subject", "Other"];
const gradeBands: GradeBand[] = ["K-2", "3-5", "6-8"];

export default function StepClass() {
  const { className, subject, gradeBand, setClassData, nextStep, prevStep } =
    useOnboardingStore();
  const [name, setName] = useState(className);
  const [sub, setSub] = useState(subject);
  const [band, setBand] = useState(gradeBand);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNext = async () => {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error: insertError } = await supabase
      .from("classes")
      .insert({
        teacher_id: user.id,
        name: name.trim(),
        subject: sub,
        grade_band: band,
      })
      .select("id")
      .single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setClassData({
      classId: data.id,
      className: name.trim(),
      subject: sub,
      gradeBand: band,
    });
    nextStep();
  };

  const valid = name.trim() && sub && band;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-cm-section text-cm-text-primary">Create your first class</h2>
        <p className="text-cm-body text-cm-text-secondary mt-1">
          You can always add more classes later.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="className">Class name</Label>
          <Input
            id="className"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="3rd Grade Math"
          />
        </div>

        <div className="space-y-2">
          <Label>Subject</Label>
          <div className="grid grid-cols-2 gap-2">
            {subjects.map((s) => (
              <button
                key={s}
                onClick={() => setSub(s)}
                className={`px-3 py-2 rounded-cm-button text-cm-body border transition-colors ${
                  sub === s
                    ? "border-cm-teal bg-cm-teal-light text-cm-teal-dark font-medium"
                    : "border-cm-border text-cm-text-secondary hover:border-cm-border-med"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Grade band</Label>
          <div className="grid grid-cols-3 gap-2">
            {gradeBands.map((g) => (
              <button
                key={g}
                onClick={() => setBand(g)}
                className={`px-3 py-2 rounded-cm-button text-cm-body border transition-colors ${
                  band === g
                    ? "border-cm-teal bg-cm-teal-light text-cm-teal-dark font-medium"
                    : "border-cm-border text-cm-text-secondary hover:border-cm-border-med"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
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
          onClick={handleNext}
          disabled={!valid || loading}
          className="flex-1 bg-cm-teal hover:bg-cm-teal-dark text-white rounded-cm-button"
        >
          {loading ? "Creating..." : "Next"}
        </Button>
      </div>
    </div>
  );
}
