"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateQuestion } from "@/hooks/use-practice";
import { QUESTION_TYPES } from "@/types/practice";
import type { QuestionType } from "@/types/database";

interface FormData {
  prompt: string;
  explanation: string;
}

interface QuestionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  practiceSetId: string;
}

export default function QuestionForm({ open, onOpenChange, classId, practiceSetId }: QuestionFormProps) {
  const createMutation = useCreateQuestion(classId, practiceSetId);
  const [saving, setSaving] = useState(false);
  const [questionType, setQuestionType] = useState<QuestionType>("multiple_choice");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [shortAnswer, setShortAnswer] = useState("");
  const [tfAnswer, setTfAnswer] = useState("True");

  const { register, handleSubmit, reset } = useForm<FormData>({
    defaultValues: { prompt: "", explanation: "" },
  });

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      let correct_answer: string;
      let questionOptions: string[] | undefined;

      if (questionType === "multiple_choice") {
        const filtered = options.filter((o) => o.trim() !== "");
        if (filtered.length < 2) {
          toast.error("Add at least 2 options");
          setSaving(false);
          return;
        }
        correct_answer = filtered[correctIndex] || filtered[0];
        questionOptions = filtered;
      } else if (questionType === "true_false") {
        correct_answer = tfAnswer;
        questionOptions = ["True", "False"];
      } else {
        if (!shortAnswer.trim()) {
          toast.error("Enter an accepted answer");
          setSaving(false);
          return;
        }
        correct_answer = shortAnswer.trim();
      }

      await createMutation.mutateAsync({
        question_type: questionType,
        prompt: data.prompt,
        options: questionOptions,
        correct_answer,
        explanation: data.explanation || undefined,
      });

      toast.success("Question added");
      reset();
      setOptions(["", "", "", ""]);
      setCorrectIndex(0);
      setShortAnswer("");
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add question");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Question</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={questionType} onValueChange={(v) => setQuestionType(v as QuestionType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {QUESTION_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="q-prompt">Question</Label>
            <textarea
              id="q-prompt"
              {...register("prompt", { required: true })}
              className="flex w-full rounded-cm-button border border-cm-border bg-transparent px-3 py-2 text-cm-body placeholder:text-cm-text-hint focus:outline-none focus:ring-2 focus:ring-cm-pink resize-y min-h-[80px]"
              placeholder="Enter the question..."
            />
          </div>

          {/* MC options */}
          {questionType === "multiple_choice" && (
            <div className="space-y-2">
              <Label>Options (select the correct one)</Label>
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correct"
                    checked={correctIndex === i}
                    onChange={() => setCorrectIndex(i)}
                  />
                  <Input
                    value={opt}
                    onChange={(e) => {
                      const next = [...options];
                      next[i] = e.target.value;
                      setOptions(next);
                    }}
                    placeholder={`Option ${String.fromCharCode(65 + i)}`}
                  />
                </div>
              ))}
              {options.length < 6 && (
                <button
                  type="button"
                  onClick={() => setOptions([...options, ""])}
                  className="text-cm-caption text-cm-pink hover:underline"
                >
                  + Add option
                </button>
              )}
            </div>
          )}

          {/* T/F */}
          {questionType === "true_false" && (
            <div className="space-y-2">
              <Label>Correct Answer</Label>
              <div className="flex gap-4">
                {["True", "False"].map((v) => (
                  <label key={v} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={tfAnswer === v} onChange={() => setTfAnswer(v)} />
                    <span className="text-cm-body">{v}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Short answer */}
          {questionType === "short_answer" && (
            <div className="space-y-2">
              <Label htmlFor="q-short">Accepted Answer</Label>
              <Input
                id="q-short"
                value={shortAnswer}
                onChange={(e) => setShortAnswer(e.target.value)}
                placeholder="The answer students should type"
              />
              <p className="text-cm-caption text-cm-text-hint">Case-insensitive matching</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="q-explanation">Explanation (optional)</Label>
            <Input id="q-explanation" {...register("explanation")} placeholder="Why is this the answer?" />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={saving} className="bg-cm-pink hover:bg-cm-pink-dark text-white">
              {saving ? "Adding..." : "Add Question"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
