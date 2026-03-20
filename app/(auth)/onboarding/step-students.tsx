"use client";

import { useState, useEffect, useCallback } from "react";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Upload, Check } from "lucide-react";
import ImportRosterDialog from "@/components/teacher/import-roster-dialog";

export default function StepStudents() {
  const { classId, nextStep, prevStep } = useOnboardingStore();
  const [importOpen, setImportOpen] = useState(false);
  const [students, setStudents] = useState<Array<{ id: string; display_name: string }>>([]);

  const loadStudents = useCallback(async () => {
    if (!classId) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("students")
      .select("id, display_name")
      .eq("class_id", classId)
      .is("archived_at", null)
      .order("display_name");
    setStudents(data || []);
  }, [classId]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-cm-section text-cm-text-primary">Add your students</h2>
        <p className="text-cm-body text-cm-text-secondary mt-1">
          Import from Google Classroom, upload a CSV, or paste names. You can always sync again later.
        </p>
      </div>

      {/* Current roster count */}
      {students.length > 0 && (
        <div className="bg-cm-teal-light border border-cm-teal/20 rounded-cm-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Check className="h-4 w-4 text-cm-teal" />
            <p className="text-cm-body text-cm-teal-dark font-medium">
              {students.length} student{students.length !== 1 ? "s" : ""} on roster
            </p>
          </div>
          <div className="max-h-32 overflow-y-auto">
            <div className="flex flex-wrap gap-1">
              {students.map((s) => (
                <span
                  key={s.id}
                  className="text-cm-caption text-cm-teal-dark bg-cm-teal-light px-2 py-0.5 rounded-cm-badge border border-cm-teal/20"
                >
                  {s.display_name}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Import button */}
      <button
        onClick={() => setImportOpen(true)}
        className="w-full flex items-center gap-4 p-5 rounded-cm-card border-2 border-dashed border-cm-border hover:border-cm-teal hover:bg-cm-teal-light/10 transition-colors text-left"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-cm-button bg-cm-teal-light">
          <Upload className="h-6 w-6 text-cm-teal" />
        </div>
        <div>
          <p className="text-cm-label font-medium text-cm-text-primary">
            {students.length > 0 ? "Import more students" : "Import your roster"}
          </p>
          <p className="text-cm-caption text-cm-text-hint mt-0.5">
            Google Classroom, CSV file, or paste names
          </p>
        </div>
      </button>

      <div className="flex gap-3">
        <Button variant="outline" onClick={prevStep} className="rounded-cm-button">
          Back
        </Button>
        <Button
          onClick={nextStep}
          className="flex-1 bg-cm-teal hover:bg-cm-teal-dark text-white rounded-cm-button"
        >
          {students.length > 0 ? "Next" : "Skip for now"}
        </Button>
      </div>

      {/* Import dialog — same one used in the dashboard */}
      {classId && (
        <ImportRosterDialog
          open={importOpen}
          onOpenChange={setImportOpen}
          classId={classId}
          existingStudents={students}
          onComplete={loadStudents}
          showGoogleSync={false}
        />
      )}
    </div>
  );
}
