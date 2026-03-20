"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import PortalShell from "@/components/shared/portal-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Check, X } from "lucide-react";

interface StudentData {
  id: string;
  displayName: string;
  className: string;
  classId: string;
  coinBalance: number;
}

interface Question {
  id: string;
  question_type: string;
  prompt: string;
  options: string[] | null;
  order_index: number;
}

interface AnswerResult {
  is_correct: boolean;
  correct_answer?: string;
  explanation?: string;
}

interface CompletionResult {
  correct_count: number;
  total_questions: number;
  pct_score: number;
  coins_awarded: number;
  message: string;
}

export default function PracticePlayerPage() {
  const { practiceSetId } = useParams<{ practiceSetId: string }>();
  const router = useRouter();
  const [student, setStudent] = useState<StudentData | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answeredIds, setAnsweredIds] = useState<Set<string>>(new Set());
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [shortInput, setShortInput] = useState("");
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState<CompletionResult | null>(null);
  const [loading, setLoading] = useState(true);

  const getHeaders = useCallback(() => {
    const stored = localStorage.getItem("classmosis_student");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (stored) {
      try {
        const session = JSON.parse(stored);
        if (session.token) headers["Authorization"] = `Bearer ${session.token}`;
      } catch { /* ignore */ }
    }
    return headers;
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("classmosis_portal");
    if (!stored) { router.push("/portal"); return; }
    try { setStudent(JSON.parse(stored)); } catch { router.push("/portal"); }
  }, [router]);

  // Start/resume session
  useEffect(() => {
    if (!student || !practiceSetId) return;

    fetch(`/api/v1/student/practice/${practiceSetId}/session`, {
      method: "POST",
      headers: getHeaders(),
    })
      .then((res) => res.json())
      .then((data) => {
        setSessionId(data.session_id);
        setQuestions(data.questions || []);
        setAnsweredIds(new Set(data.answered_ids || []));
        // Start at first unanswered question
        const firstUnanswered = (data.questions || []).findIndex(
          (q: Question) => !(data.answered_ids || []).includes(q.id)
        );
        setCurrentIdx(firstUnanswered >= 0 ? firstUnanswered : 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [student, practiceSetId, getHeaders]);

  const currentQ = questions[currentIdx];
  const progress = questions.length > 0 ? Math.round((answeredIds.size / questions.length) * 100) : 0;

  const submitAnswer = async () => {
    if (!sessionId || !currentQ) return;
    const answer = currentQ.question_type === "short_answer" ? shortInput : selectedAnswer;
    if (!answer) return;

    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/v1/student/practice/${practiceSetId}/session/${sessionId}/answer`,
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ question_id: currentQ.id, student_answer: answer }),
        }
      );
      const data = await res.json();
      setResult(data);
      setAnsweredIds((prev) => new Set(prev).add(currentQ.id));
    } catch { /* ignore */ }
    finally { setSubmitting(false); }
  };

  const nextQuestion = () => {
    setResult(null);
    setSelectedAnswer("");
    setShortInput("");

    if (currentIdx + 1 >= questions.length) {
      // Complete session
      completeSession();
    } else {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const completeSession = async () => {
    if (!sessionId) return;
    try {
      const res = await fetch(
        `/api/v1/student/practice/${practiceSetId}/session/${sessionId}/complete`,
        { method: "POST", headers: getHeaders() }
      );
      const data = await res.json();
      setCompleted(data);
    } catch { /* ignore */ }
  };

  const handleLogout = () => {
    localStorage.removeItem("classmosis_portal");
    localStorage.removeItem("classmosis_student");
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
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 border-2 border-cm-pink border-t-transparent rounded-full animate-spin" />
        </div>
      ) : completed ? (
        /* Completion screen */
        <Card className="p-cm-8 bg-cm-surface rounded-cm-card border-cm-border text-center space-y-4">
          <div className="text-4xl">
            {completed.pct_score >= 85 ? "🎉" : completed.pct_score >= 50 ? "💪" : "📚"}
          </div>
          <p className="text-cm-section text-cm-text-primary">
            {completed.correct_count} / {completed.total_questions} correct
          </p>
          <p className="text-cm-body text-cm-pink font-medium">
            {completed.message}
          </p>
          {completed.coins_awarded > 0 && (
            <p className="text-cm-body text-cm-amber font-medium">
              🪙 +{completed.coins_awarded} coins earned!
            </p>
          )}
          <div className="flex justify-center gap-3 pt-2">
            <Button
              onClick={() => router.push("/portal/home")}
              variant="outline"
              className="border-cm-border"
            >
              Back to Portal
            </Button>
            <Button
              onClick={() => {
                setCompleted(null);
                setSessionId(null);
                setAnsweredIds(new Set());
                setCurrentIdx(0);
                setResult(null);
                setLoading(true);
                // Re-trigger session start
                fetch(`/api/v1/student/practice/${practiceSetId}/session`, {
                  method: "POST",
                  headers: getHeaders(),
                })
                  .then((r) => r.json())
                  .then((d) => {
                    setSessionId(d.session_id);
                    setQuestions(d.questions || []);
                    setAnsweredIds(new Set(d.answered_ids || []));
                    setCurrentIdx(0);
                  })
                  .finally(() => setLoading(false));
              }}
              className="bg-cm-pink hover:bg-cm-pink-dark text-white"
            >
              Practice Again
            </Button>
          </div>
        </Card>
      ) : currentQ ? (
        <div className="space-y-6">
          {/* Progress */}
          <div className="flex items-center gap-3">
            <Progress value={progress} className="flex-1 h-2" />
            <span className="text-cm-caption text-cm-text-hint shrink-0">
              {answeredIds.size}/{questions.length}
            </span>
          </div>

          {/* Question */}
          <Card className="p-cm-6 bg-cm-surface rounded-cm-card border-cm-border space-y-4">
            <p className="text-cm-section text-cm-text-primary">{currentQ.prompt}</p>

            {/* MC / TF options */}
            {currentQ.options && !result && (
              <div className="space-y-2">
                {(currentQ.options as string[]).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setSelectedAnswer(opt)}
                    className={`w-full text-left px-cm-4 py-cm-3 rounded-cm-button border transition-colors text-cm-body ${
                      selectedAnswer === opt
                        ? "border-cm-pink bg-cm-pink-light text-cm-pink-dark"
                        : "border-cm-border hover:bg-cm-white text-cm-text-secondary"
                    }`}
                    style={{ minHeight: 44 }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {/* Short answer */}
            {currentQ.question_type === "short_answer" && !result && (
              <Input
                value={shortInput}
                onChange={(e) => setShortInput(e.target.value)}
                placeholder="Type your answer..."
                className="text-cm-body"
              />
            )}

            {/* Result feedback */}
            {result && (
              <div className={`flex items-start gap-3 p-cm-4 rounded-cm-button ${
                result.is_correct ? "bg-cm-green-light" : "bg-cm-coral-light"
              }`}>
                {result.is_correct ? (
                  <Check className="h-5 w-5 text-cm-green shrink-0 mt-0.5" />
                ) : (
                  <X className="h-5 w-5 text-cm-coral shrink-0 mt-0.5" />
                )}
                <div>
                  <p className={`text-cm-body font-medium ${result.is_correct ? "text-cm-green-dark" : "text-cm-coral-dark"}`}>
                    {result.is_correct ? "Nice!" : "Not quite — keep going!"}
                  </p>
                  {result.correct_answer && !result.is_correct && (
                    <p className="text-cm-caption text-cm-text-secondary mt-1">
                      The answer is: <span className="font-medium">{result.correct_answer}</span>
                    </p>
                  )}
                  {result.explanation && (
                    <p className="text-cm-caption text-cm-text-hint mt-1">{result.explanation}</p>
                  )}
                </div>
              </div>
            )}

            {/* Action button */}
            <div className="flex justify-end">
              {result ? (
                <Button onClick={nextQuestion} className="bg-cm-pink hover:bg-cm-pink-dark text-white">
                  {currentIdx + 1 >= questions.length ? "Finish" : "Next"}
                </Button>
              ) : (
                <Button
                  onClick={submitAnswer}
                  disabled={submitting || (!selectedAnswer && !shortInput)}
                  className="bg-cm-pink hover:bg-cm-pink-dark text-white"
                >
                  {submitting ? "Checking..." : "Submit"}
                </Button>
              )}
            </div>
          </Card>
        </div>
      ) : (
        <p className="text-cm-body text-cm-text-secondary text-center py-12">
          No questions found in this practice set.
        </p>
      )}
    </PortalShell>
  );
}
