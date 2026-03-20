"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useClassStore } from "@/stores/class-store";
import { usePracticeQuestions, useDeleteQuestion, usePublishPracticeSet } from "@/hooks/use-practice";
import QuestionForm from "@/components/practice/question-form";

const TYPE_LABELS: Record<string, string> = {
  multiple_choice: "MC",
  true_false: "T/F",
  short_answer: "SA",
};

export default function PracticeSetDetailPage() {
  const { practiceSetId } = useParams<{ practiceSetId: string }>();
  const { activeClassId } = useClassStore();
  const { data: questions, isLoading } = usePracticeQuestions(activeClassId, practiceSetId);
  const deleteMutation = useDeleteQuestion(activeClassId, practiceSetId);
  const publishMutation = usePublishPracticeSet(activeClassId);
  const [addOpen, setAddOpen] = useState(false);


  const handleDelete = async (questionId: string) => {
    try {
      await deleteMutation.mutateAsync(questionId);
      toast.success("Question removed");
    } catch {
      toast.error("Failed to remove question");
    }
  };

  const handlePublish = async () => {
    try {
      await publishMutation.mutateAsync(practiceSetId);
      toast.success("Practice set published");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to publish");
    }
  };

  if (!activeClassId) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-cm-3">
          <Link href="/practice" className="text-cm-text-hint hover:text-cm-text-primary">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-cm-title text-cm-text-primary">Questions</h1>
          <span className="text-cm-caption text-cm-text-hint">
            {questions?.length || 0} total
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setAddOpen(true)}
            className="bg-cm-pink hover:bg-cm-pink-dark text-white rounded-cm-button"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Question
          </Button>
          {(questions?.length || 0) > 0 && (
            <Button
              onClick={handlePublish}
              className="bg-cm-green hover:bg-cm-green-dark text-white rounded-cm-button"
            >
              Publish
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 border-2 border-cm-pink border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !questions || questions.length === 0 ? (
        <Card className="p-cm-8 bg-cm-surface rounded-cm-card border-cm-border text-center">
          <p className="text-cm-body text-cm-text-secondary">
            No questions yet. Add questions to build this practice set.
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {questions.map((q, i) => (
            <Card key={q.id} className="p-cm-4 bg-cm-surface rounded-cm-card border-cm-border">
              <div className="flex items-start gap-cm-3">
                <span className="shrink-0 w-7 h-7 rounded-cm-badge bg-cm-pink-light text-cm-pink text-cm-caption font-medium flex items-center justify-center">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-1.5 py-0.5 rounded-cm-badge bg-cm-white text-cm-text-hint text-[10px] font-medium">
                      {TYPE_LABELS[q.question_type] || q.question_type}
                    </span>
                  </div>
                  <p className="text-cm-body text-cm-text-primary">{q.prompt}</p>
                  {q.options && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(q.options as string[]).map((opt, j) => (
                        <span
                          key={j}
                          className={`px-2 py-0.5 rounded-cm-badge text-cm-caption ${
                            opt === q.correct_answer
                              ? "bg-cm-green-light text-cm-green font-medium"
                              : "bg-cm-white text-cm-text-hint"
                          }`}
                        >
                          {opt}
                        </span>
                      ))}
                    </div>
                  )}
                  {q.question_type === "short_answer" && (
                    <p className="text-cm-caption text-cm-green mt-1">Answer: {q.correct_answer}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(q.id)}
                  className="shrink-0 p-1 text-cm-text-hint hover:text-cm-coral transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <QuestionForm
        open={addOpen}
        onOpenChange={setAddOpen}
        classId={activeClassId}
        practiceSetId={practiceSetId}
      />
    </div>
  );
}
