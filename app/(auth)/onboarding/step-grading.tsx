"use client";

import { useState } from "react";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { GradingScaleType } from "@/types/database";

const scalePresets: Array<{
  type: GradingScaleType;
  label: string;
  description: string;
  thresholds: Array<{ min_pct: number; max_pct: number; label: string }>;
}> = [
  {
    type: "percentage",
    label: "Percentage",
    description: "90% A, 80% B, 70% C, 60% D, below F",
    thresholds: [
      { min_pct: 90, max_pct: 100, label: "A" },
      { min_pct: 80, max_pct: 89, label: "B" },
      { min_pct: 70, max_pct: 79, label: "C" },
      { min_pct: 60, max_pct: 69, label: "D" },
      { min_pct: 0, max_pct: 59, label: "F" },
    ],
  },
  {
    type: "points",
    label: "Total Points",
    description: "Raw point totals, no conversion",
    thresholds: [],
  },
  {
    type: "letter",
    label: "Letter Grades",
    description: "A through F with +/- modifiers",
    thresholds: [
      { min_pct: 97, max_pct: 100, label: "A+" },
      { min_pct: 93, max_pct: 96, label: "A" },
      { min_pct: 90, max_pct: 92, label: "A-" },
      { min_pct: 87, max_pct: 89, label: "B+" },
      { min_pct: 83, max_pct: 86, label: "B" },
      { min_pct: 80, max_pct: 82, label: "B-" },
      { min_pct: 77, max_pct: 79, label: "C+" },
      { min_pct: 73, max_pct: 76, label: "C" },
      { min_pct: 70, max_pct: 72, label: "C-" },
      { min_pct: 67, max_pct: 69, label: "D+" },
      { min_pct: 63, max_pct: 66, label: "D" },
      { min_pct: 60, max_pct: 62, label: "D-" },
      { min_pct: 0, max_pct: 59, label: "F" },
    ],
  },
  {
    type: "standards",
    label: "Standards-Based (1-4)",
    description: "1 Beginning, 2 Developing, 3 Proficient, 4 Advanced",
    thresholds: [
      { min_pct: 90, max_pct: 100, label: "4 - Advanced" },
      { min_pct: 70, max_pct: 89, label: "3 - Proficient" },
      { min_pct: 50, max_pct: 69, label: "2 - Developing" },
      { min_pct: 0, max_pct: 49, label: "1 - Beginning" },
    ],
  },
  {
    type: "mastery",
    label: "Mastery",
    description: "Not Yet, Approaching, Meets, Exceeds",
    thresholds: [
      { min_pct: 90, max_pct: 100, label: "Exceeds" },
      { min_pct: 70, max_pct: 89, label: "Meets" },
      { min_pct: 50, max_pct: 69, label: "Approaching" },
      { min_pct: 0, max_pct: 49, label: "Not Yet" },
    ],
  },
];

export default function StepGrading() {
  const { classId, gradingScaleType, setGradingScaleType, nextStep, prevStep } =
    useOnboardingStore();
  const [selected, setSelected] = useState(gradingScaleType || "percentage");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNext = async () => {
    if (!classId) return;
    setLoading(true);
    setError(null);

    const preset = scalePresets.find((p) => p.type === selected)!;
    const supabase = createClient();

    const { data, error: insertError } = await supabase
      .from("grading_scales")
      .insert({
        class_id: classId,
        type: preset.type,
        thresholds: preset.thresholds,
        labels: preset.thresholds.map((t) => t.label),
      })
      .select("id")
      .single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    // Link grading scale to class
    await supabase
      .from("classes")
      .update({ grading_scale_id: data.id })
      .eq("id", classId);

    setGradingScaleType(selected);
    nextStep();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-cm-section text-cm-text-primary">How do you grade?</h2>
        <p className="text-cm-body text-cm-text-secondary mt-1">
          Pick a scale. You can customize it anytime in settings.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Grading scale</Label>
        <div className="space-y-2">
          {scalePresets.map((preset) => (
            <button
              key={preset.type}
              onClick={() => setSelected(preset.type)}
              className={`w-full text-left px-4 py-3 rounded-cm-button border transition-colors ${
                selected === preset.type
                  ? "border-cm-teal bg-cm-teal-light"
                  : "border-cm-border hover:border-cm-border-med"
              }`}
            >
              <div className="text-cm-label text-cm-text-primary">{preset.label}</div>
              <div className="text-cm-caption text-cm-text-secondary">{preset.description}</div>
            </button>
          ))}
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
          disabled={loading}
          className="flex-1 bg-cm-teal hover:bg-cm-teal-dark text-white rounded-cm-button"
        >
          {loading ? "Saving..." : "Next"}
        </Button>
      </div>
    </div>
  );
}
