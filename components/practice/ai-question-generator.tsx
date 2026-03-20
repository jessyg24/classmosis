"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useClassStandards } from "@/hooks/use-standards";
import { useGeneratePracticeProblems } from "@/hooks/use-ai";
import { QUESTION_TYPES } from "@/types/practice";
import type { QuestionType } from "@/types/database";

interface FormData {
  count: number;
  context_guidance: string;
  avoid_guidance: string;
}

interface AiQuestionGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  practiceSetId: string;
}

export default function AiQuestionGenerator({ open, onOpenChange, classId, practiceSetId }: AiQuestionGeneratorProps) {
  const { data: standards } = useClassStandards(classId);
  const generateMutation = useGeneratePracticeProblems(classId, practiceSetId);
  const [questionType, setQuestionType] = useState<QuestionType>("multiple_choice");
  const [standardCode, setStandardCode] = useState("");
  const [standardDesc, setStandardDesc] = useState("");
  const [difficulty, setDifficulty] = useState(3);
  const [generating, setGenerating] = useState(false);

  const { register, handleSubmit, reset } = useForm<FormData>({
    defaultValues: { count: 5, context_guidance: "", avoid_guidance: "" },
  });

  const onSubmit = async (data: FormData) => {
    if (!standardCode) { toast.error("Select a standard"); return; }
    setGenerating(true);

    try {
      const result = await generateMutation.mutateAsync({
        count: Number(data.count),
        problem_type: questionType,
        standard_code: standardCode,
        standard_description: standardDesc,
        grade: "3-5",
        difficulty,
        context_guidance: data.context_guidance || undefined,
        avoid_guidance: data.avoid_guidance || undefined,
      });

      const count = result.questions?.length || 0;
      toast.success(`${count} question${count !== 1 ? "s" : ""} generated and added!`);
      if (result.remaining !== undefined) {
        toast.info(`${result.remaining} AI generations remaining today`);
      }
      reset();
      setStandardCode("");
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-cm-pink" />
            AI Generate Questions
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={questionType} onValueChange={(v) => { if (v) setQuestionType(v as QuestionType); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {QUESTION_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ai-count">Count (1-10)</Label>
              <Input id="ai-count" type="number" min={1} max={10} {...register("count", { valueAsNumber: true })} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Standard</Label>
            <Select
              value={standardCode}
              onValueChange={(v) => {
                if (!v) return;
                setStandardCode(v);
                const std = (standards || []).find((s) => s.code === v);
                setStandardDesc(std?.description || "");
              }}
            >
              <SelectTrigger><SelectValue placeholder="Select a standard..." /></SelectTrigger>
              <SelectContent>
                {(standards || []).map((s) => (
                  <SelectItem key={s.id} value={s.code}>
                    {s.code} — {s.description.slice(0, 60)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Difficulty: {difficulty}/5</Label>
            <input
              type="range"
              min={1}
              max={5}
              value={difficulty}
              onChange={(e) => setDifficulty(Number(e.target.value))}
              className="w-full accent-cm-pink"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ai-context">Context guidance (optional)</Label>
            <Input id="ai-context" {...register("context_guidance")} placeholder="e.g. Use real-world examples about animals" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ai-avoid">Avoid (optional)</Label>
            <Input id="ai-avoid" {...register("avoid_guidance")} placeholder="e.g. No questions about fractions" />
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={generating || !standardCode}
              className="bg-cm-pink hover:bg-cm-pink-dark text-white"
            >
              {generating ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Generate
                </span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
