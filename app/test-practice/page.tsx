"use client";

import { useState } from "react";
import MathWorksheet from "@/components/practice/math-worksheet";
import type { GradedWorksheet, GeneratedWorksheet } from "@/lib/generators/math-facts";
import { Coins } from "lucide-react";

export default function TestPracticePage() {
  const [view, setView] = useState<"choose" | "teacher" | "student">("choose");
  const [, setLastResult] = useState<{ graded: GradedWorksheet; worksheet: GeneratedWorksheet } | null>(null);
  const [coinsEarned, setCoinsEarned] = useState(0);

  const handleComplete = (result: GradedWorksheet, worksheet: GeneratedWorksheet) => {
    setLastResult({ graded: result, worksheet });
    // Simulate coin award: 1 coin per correct answer + 3 bonus for 80%+
    const coins = result.correctCount + (result.pctScore >= 80 ? 3 : 0);
    setCoinsEarned((prev) => prev + coins);
  };

  if (view === "choose") {
    return (
      <div className="min-h-screen bg-cm-white flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6 text-center">
          <h1 className="text-cm-title text-cm-text-primary">Math Practice Test</h1>
          <p className="text-cm-body text-cm-text-secondary">
            Test the algorithmic worksheet generator
          </p>
          <div className="space-y-3">
            <button
              onClick={() => setView("teacher")}
              className="w-full p-4 rounded-cm-card border-2 border-cm-blue bg-cm-blue-light text-left hover:shadow-md transition-shadow"
            >
              <p className="text-cm-label font-semibold text-cm-blue-dark">Teacher View</p>
              <p className="text-cm-caption text-cm-blue-dark/70 mt-0.5">
                Configure worksheet settings, choose presets, customize difficulty
              </p>
            </button>
            <button
              onClick={() => setView("student")}
              className="w-full p-4 rounded-cm-card border-2 border-cm-teal bg-cm-teal-light text-left hover:shadow-md transition-shadow"
            >
              <p className="text-cm-label font-semibold text-cm-teal-dark">Student View</p>
              <p className="text-cm-caption text-cm-teal-dark/70 mt-0.5">
                Quick-start with Mixed Facts (Easy) — just like a student would see
              </p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cm-white">
      {/* Header */}
      <div className="border-b border-cm-border bg-cm-surface px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setView("choose"); setLastResult(null); }}
            className="text-cm-caption text-cm-text-hint hover:text-cm-text-primary"
          >
            &larr; Back
          </button>
          <span className="text-cm-label font-medium text-cm-text-primary">
            {view === "teacher" ? "Teacher: Configure Practice" : "Student: Maya Rodriguez"}
          </span>
        </div>
        {view === "student" && (
          <div className="flex items-center gap-1.5 rounded-full bg-cm-amber-light px-3 py-1">
            <Coins className="h-4 w-4 text-cm-amber" />
            <span className="text-sm font-semibold text-cm-amber-dark">{coinsEarned}</span>
          </div>
        )}
      </div>

      {/* Worksheet */}
      <div className="p-6">
        {view === "teacher" ? (
          <MathWorksheet
            onComplete={handleComplete}
          />
        ) : (
          <MathWorksheet
            initialConfig={{
              operations: ["addition", "subtraction"],
              difficulty: 1,
              problemCount: 10,
              allowNegatives: false,
              includeWordProblems: false,
            }}
            onComplete={handleComplete}
            studentName="Maya Rodriguez"
          />
        )}
      </div>
    </div>
  );
}
