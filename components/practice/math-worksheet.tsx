"use client";

import { useState, useRef, useEffect } from "react";
import {
  generateMathWorksheet,
  gradeWorksheet,
  MATH_PRESETS,
  type MathFactsConfig,
  type GeneratedWorksheet,
  type GradedWorksheet,
  type MathOperation,
} from "@/lib/generators/math-facts";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Check,
  X,
  RotateCcw,
  Trophy,
  ChevronDown,
  Lightbulb,
  ArrowRight,
  Minus,
} from "lucide-react";

type Phase = "config" | "working" | "results";

interface Props {
  /** If provided, skips the config phase and generates immediately */
  initialConfig?: MathFactsConfig;
  /** Called when worksheet is graded — parent can award coins, save to gradebook */
  onComplete?: (result: GradedWorksheet, worksheet: GeneratedWorksheet) => void;
  /** Student name for the header */
  studentName?: string;
  /** If true, saves result to server (practice session + coins + gradebook) */
  saveToServer?: boolean;
}

export default function MathWorksheet({ initialConfig, onComplete, studentName, saveToServer }: Props) {
  const [phase, setPhase] = useState<Phase>(initialConfig ? "working" : "config");
  const [worksheet, setWorksheet] = useState<GeneratedWorksheet | null>(
    initialConfig ? generateMathWorksheet(initialConfig) : null
  );
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [graded, setGraded] = useState<GradedWorksheet | null>(null);
  const [showHints, setShowHints] = useState<Record<string, boolean>>({});
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // ── Config phase state ──────────────────────────────────────
  const [selectedPreset, setSelectedPreset] = useState<string>("mixed-easy");
  const [customOps, setCustomOps] = useState<MathOperation[]>(["addition", "subtraction"]);
  const [customDifficulty, setCustomDifficulty] = useState<number>(2);
  const [customCount, setCustomCount] = useState<number>(15);
  const [showCustom, setShowCustom] = useState(false);

  // Focus first input when worksheet generates
  useEffect(() => {
    if (phase === "working" && worksheet) {
      const firstId = worksheet.problems[0]?.id;
      if (firstId) {
        setTimeout(() => inputRefs.current[firstId]?.focus(), 100);
      }
    }
  }, [phase, worksheet]);

  const handleGenerate = (config: MathFactsConfig) => {
    const ws = generateMathWorksheet(config);
    setWorksheet(ws);
    setAnswers({});
    setGraded(null);
    setShowHints({});
    setServerResult(null);
    setPhase("working");
  };

  const [serverResult, setServerResult] = useState<{ coinsAwarded: number; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!worksheet) return;
    setSubmitting(true);

    const result = gradeWorksheet(worksheet, answers);
    setGraded(result);

    // Save to server if in student portal context
    if (saveToServer) {
      try {
        const res = await fetch("/api/v1/student/practice/worksheet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            worksheetId: worksheet.id,
            title: worksheet.title,
            config: worksheet.config,
            totalProblems: result.totalProblems,
            correctCount: result.correctCount,
            incorrectCount: result.incorrectCount,
            skippedCount: result.skippedCount,
            pctScore: result.pctScore,
            results: result.results,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setServerResult({ coinsAwarded: data.coinsAwarded, message: data.message });
        }
      } catch {
        // Non-fatal — local grading still works
      }
    }

    setPhase("results");
    setSubmitting(false);
    onComplete?.(result, worksheet);
  };

  const handleRetry = () => {
    if (!worksheet) return;
    handleGenerate(worksheet.config);
  };

  const handleNewWorksheet = () => {
    setPhase("config");
    setWorksheet(null);
    setGraded(null);
    setAnswers({});
  };

  const answeredCount = Object.values(answers).filter((a) => a.trim() !== "").length;
  const totalCount = worksheet?.problems.length ?? 0;

  // ── Config Phase ────────────────────────────────────────────
  if (phase === "config") {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <div className="text-center">
          <h2 className="text-cm-section text-cm-text-primary">Math Practice</h2>
          <p className="text-cm-body text-cm-text-secondary mt-1">
            Choose a preset or build your own
          </p>
        </div>

        {/* Presets */}
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(MATH_PRESETS).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => setSelectedPreset(key)}
              className={`text-left px-3 py-2.5 rounded-cm-button border transition-colors ${
                selectedPreset === key
                  ? "border-cm-teal bg-cm-teal-light text-cm-teal-dark"
                  : "border-cm-border bg-cm-surface text-cm-text-secondary hover:bg-cm-white"
              }`}
            >
              <p className="text-cm-caption font-medium">{preset.label}</p>
              <p className="text-[10px] text-cm-text-hint mt-0.5">
                {preset.config.problemCount} problems
              </p>
            </button>
          ))}
        </div>

        {/* Custom toggle */}
        <button
          onClick={() => setShowCustom(!showCustom)}
          className="flex items-center gap-1.5 text-cm-caption text-cm-text-hint hover:text-cm-text-secondary"
        >
          <ChevronDown className={`h-3 w-3 transition-transform ${showCustom ? "rotate-180" : ""}`} />
          Custom settings
        </button>

        {showCustom && (
          <div className="space-y-4 p-4 bg-cm-surface rounded-cm-card border border-cm-border">
            {/* Operations */}
            <div>
              <label className="text-cm-caption text-cm-text-secondary block mb-1.5">Operations</label>
              <div className="flex flex-wrap gap-2">
                {(["addition", "subtraction", "multiplication", "division"] as MathOperation[]).map((op) => (
                  <button
                    key={op}
                    onClick={() =>
                      setCustomOps((prev) =>
                        prev.includes(op) ? prev.filter((o) => o !== op) : [...prev, op]
                      )
                    }
                    className={`px-3 py-1.5 rounded-cm-badge text-cm-caption font-medium transition-colors ${
                      customOps.includes(op)
                        ? "bg-cm-teal-light text-cm-teal-dark border border-cm-teal/30"
                        : "bg-cm-white text-cm-text-hint border border-cm-border"
                    }`}
                  >
                    {op.charAt(0).toUpperCase() + op.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="text-cm-caption text-cm-text-secondary block mb-1.5">
                Difficulty: {customDifficulty}
              </label>
              <input
                type="range"
                min={1}
                max={5}
                value={customDifficulty}
                onChange={(e) => setCustomDifficulty(Number(e.target.value))}
                className="w-full accent-cm-teal"
              />
              <div className="flex justify-between text-[10px] text-cm-text-hint">
                <span>Easy</span>
                <span>Hard</span>
              </div>
            </div>

            {/* Problem count */}
            <div>
              <label className="text-cm-caption text-cm-text-secondary block mb-1.5">
                Problems: {customCount}
              </label>
              <input
                type="range"
                min={5}
                max={30}
                step={5}
                value={customCount}
                onChange={(e) => setCustomCount(Number(e.target.value))}
                className="w-full accent-cm-teal"
              />
            </div>
          </div>
        )}

        <Button
          onClick={() => {
            if (showCustom && customOps.length > 0) {
              handleGenerate({
                operations: customOps,
                difficulty: customDifficulty as 1 | 2 | 3 | 4 | 5,
                problemCount: customCount,
                allowNegatives: false,
                includeWordProblems: false,
              });
            } else {
              handleGenerate(MATH_PRESETS[selectedPreset].config);
            }
          }}
          className="w-full bg-cm-teal hover:bg-cm-teal-dark text-white rounded-cm-button h-11"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Generate Practice
        </Button>
      </div>
    );
  }

  // ── Working Phase ───────────────────────────────────────────
  if (phase === "working" && worksheet) {
    return (
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-cm-label font-semibold text-cm-text-primary">
              {worksheet.title}
            </h2>
            {studentName && (
              <p className="text-cm-caption text-cm-text-hint">{studentName}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-cm-caption text-cm-text-hint">
              {answeredCount}/{totalCount} answered
            </span>
            <Button
              onClick={handleSubmit}
              disabled={answeredCount === 0 || submitting}
              className="bg-cm-teal hover:bg-cm-teal-dark text-white rounded-cm-button"
              size="sm"
            >
              {submitting ? "Grading..." : "Submit"}
              {!submitting && <ArrowRight className="h-3.5 w-3.5 ml-1" />}
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 w-full rounded-full bg-cm-teal-light mb-6">
          <div
            className="h-1.5 rounded-full bg-cm-teal transition-all"
            style={{ width: `${totalCount > 0 ? (answeredCount / totalCount) * 100 : 0}%` }}
          />
        </div>

        {/* Problems */}
        <div className="space-y-3">
          {worksheet.problems.map((problem, idx) => (
            <div
              key={problem.id}
              className="flex items-start gap-4 p-4 rounded-cm-card border border-cm-border bg-cm-surface"
            >
              {/* Number */}
              <span className="text-cm-caption text-cm-text-hint font-medium w-6 shrink-0 pt-2">
                {idx + 1}.
              </span>

              <div className="flex-1">
                {/* Word problem if present */}
                {problem.wordProblem && (
                  <p className="text-cm-body text-cm-text-primary mb-2 leading-relaxed">
                    {problem.wordProblem}
                  </p>
                )}

                {/* Expression */}
                <div className="flex items-center gap-3">
                  <span className="text-lg font-mono font-semibold text-cm-text-primary">
                    {problem.displayExpression.replace("___", "")}
                  </span>
                  <input
                    ref={(el) => { inputRefs.current[problem.id] = el; }}
                    type="text"
                    inputMode="numeric"
                    value={answers[problem.id] || ""}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^\d.\-]/g, "");
                      setAnswers((prev) => ({ ...prev, [problem.id]: val }));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        // Focus next input
                        const nextProblem = worksheet.problems[idx + 1];
                        if (nextProblem) {
                          inputRefs.current[nextProblem.id]?.focus();
                        } else {
                          handleSubmit();
                        }
                      }
                    }}
                    placeholder="?"
                    className="w-20 h-10 text-center text-lg font-mono font-semibold border-2 border-cm-border rounded-cm-button bg-cm-white focus:outline-none focus:border-cm-teal focus:ring-2 focus:ring-cm-teal/20"
                  />
                </div>

                {/* Hint toggle */}
                {problem.hint && (
                  <button
                    onClick={() => setShowHints((prev) => ({ ...prev, [problem.id]: !prev[problem.id] }))}
                    className="flex items-center gap-1 mt-2 text-cm-caption text-cm-text-hint hover:text-cm-amber"
                  >
                    <Lightbulb className="h-3 w-3" />
                    {showHints[problem.id] ? "Hide hint" : "Need a hint?"}
                  </button>
                )}
                {showHints[problem.id] && problem.hint && (
                  <p className="mt-1 text-cm-caption text-cm-amber bg-cm-amber-light px-3 py-1.5 rounded-cm-badge">
                    {problem.hint}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Submit button at bottom too */}
        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={answeredCount === 0 || submitting}
            className="bg-cm-teal hover:bg-cm-teal-dark text-white rounded-cm-button h-11 px-8"
          >
            {submitting ? "Grading..." : "Submit Worksheet"}
          </Button>
        </div>
      </div>
    );
  }

  // ── Results Phase ───────────────────────────────────────────
  if (phase === "results" && graded && worksheet) {
    const emoji = graded.pctScore >= 90 ? "🌟" : graded.pctScore >= 70 ? "💪" : graded.pctScore >= 50 ? "👍" : "📚";
    const message = graded.pctScore >= 90
      ? "Outstanding work!"
      : graded.pctScore >= 70
      ? "Great effort — keep it up!"
      : graded.pctScore >= 50
      ? "Good start — practice makes progress!"
      : "Keep trying — you're building skills!";

    return (
      <div className="max-w-2xl mx-auto">
        {/* Score card */}
        <div className="bg-cm-teal-light rounded-cm-card p-6 text-center mb-6">
          <span className="text-4xl mb-2 block">{emoji}</span>
          <p className="text-3xl font-bold text-cm-teal-dark">
            {graded.correctCount}/{graded.totalProblems}
          </p>
          <p className="text-cm-body text-cm-teal-dark mt-1">
            {serverResult?.message || message}
          </p>
          {serverResult && serverResult.coinsAwarded > 0 && (
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-cm-amber-light px-3 py-1">
              <span className="text-sm">🪙</span>
              <span className="text-sm font-bold text-cm-amber-dark">+{serverResult.coinsAwarded} coins</span>
            </div>
          )}
          <div className="flex items-center justify-center gap-4 mt-3 text-cm-caption">
            <span className="flex items-center gap-1 text-cm-teal-dark">
              <Check className="h-3.5 w-3.5" /> {graded.correctCount} correct
            </span>
            <span className="flex items-center gap-1 text-cm-coral">
              <X className="h-3.5 w-3.5" /> {graded.incorrectCount} incorrect
            </span>
            {graded.skippedCount > 0 && (
              <span className="flex items-center gap-1 text-cm-text-hint">
                <Minus className="h-3.5 w-3.5" /> {graded.skippedCount} skipped
              </span>
            )}
          </div>
        </div>

        {/* Detailed results */}
        <div className="space-y-2 mb-6">
          {graded.results.map((result, idx) => (
            <div
              key={result.problemId}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-cm-button ${
                result.isCorrect ? "bg-cm-teal-light/30" : result.studentAnswer === "" ? "bg-cm-surface" : "bg-cm-coral-light/30"
              }`}
            >
              <span className="text-cm-caption text-cm-text-hint w-6">{idx + 1}.</span>
              {result.isCorrect ? (
                <Check className="h-4 w-4 text-cm-teal shrink-0" />
              ) : (
                <X className="h-4 w-4 text-cm-coral shrink-0" />
              )}
              <span className="font-mono text-cm-body text-cm-text-primary">
                {result.displayExpression.replace("___", String(result.correctAnswer))}
              </span>
              {!result.isCorrect && result.studentAnswer && (
                <span className="ml-auto text-cm-caption text-cm-coral">
                  You wrote: {result.studentAnswer}
                </span>
              )}
              {!result.isCorrect && !result.studentAnswer && (
                <span className="ml-auto text-cm-caption text-cm-text-hint">
                  Skipped
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleRetry}
            className="flex-1 rounded-cm-button"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Try Again (Same Type)
          </Button>
          <Button
            onClick={handleNewWorksheet}
            className="flex-1 bg-cm-teal hover:bg-cm-teal-dark text-white rounded-cm-button"
          >
            <Trophy className="h-4 w-4 mr-2" />
            New Worksheet
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
