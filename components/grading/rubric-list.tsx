"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Edit2, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useRubrics } from "@/hooks/use-gradebook";
import { useClassStore } from "@/stores/class-store";
import { useQueryClient } from "@tanstack/react-query";
import RubricBuilder from "./rubric-builder";
import type { Rubric } from "@/types/database";

interface RubricListProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function RubricList({ open, onOpenChange }: RubricListProps) {
  const { activeClassId } = useClassStore();
  const { data: rubrics, isLoading } = useRubrics(activeClassId);
  const qc = useQueryClient();
  const [editRubric, setEditRubric] = useState<Rubric | null>(null);
  const [builderOpen, setBuilderOpen] = useState(false);

  const handleDelete = async (rubricId: string) => {
    if (!activeClassId) return;
    const res = await fetch(`/api/v1/classes/${activeClassId}/rubrics/${rubricId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const body = await res.json();
      toast.error(body.error || "Failed to delete rubric");
      return;
    }
    toast.success("Rubric deleted");
    qc.invalidateQueries({ queryKey: ["rubrics", activeClassId] });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Rubrics</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            {isLoading && (
              <>
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </>
            )}

            {!isLoading && (!rubrics || rubrics.length === 0) && (
              <p className="text-cm-body text-cm-text-secondary text-center py-6">
                No rubrics yet. Create one to get started.
              </p>
            )}

            {(rubrics || []).map((rubric) => (
              <Card key={rubric.id} className="p-4 border-cm-border">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-cm-body font-medium text-cm-text-primary truncate">
                      {rubric.title}
                    </h3>
                    {rubric.description && (
                      <p className="text-cm-caption text-cm-text-secondary mt-1 line-clamp-2">
                        {rubric.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="bg-cm-blue-light text-cm-blue text-xs">
                        {rubric.total_points} pts
                      </Badge>
                      <span className="text-cm-caption text-cm-text-hint">
                        {rubric.categories?.length || 0} categories
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => {
                        setEditRubric(rubric);
                        setBuilderOpen(true);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDelete(rubric.id)}
                      className="text-cm-coral"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            <Button
              onClick={() => {
                setEditRubric(null);
                setBuilderOpen(true);
              }}
              className="w-full bg-cm-blue hover:bg-cm-blue-dark text-white"
            >
              New Rubric
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <RubricBuilder
        open={builderOpen}
        onOpenChange={setBuilderOpen}
        editRubric={editRubric}
      />
    </>
  );
}
