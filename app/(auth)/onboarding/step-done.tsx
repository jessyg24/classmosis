"use client";

import { useRouter } from "next/navigation";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { createClient } from "@/lib/supabase/client";
import { useClassStore } from "@/stores/class-store";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export default function StepDone() {
  const router = useRouter();
  const { displayName, className, subject, gradeBand, gradingScaleType, classId, reset } =
    useOnboardingStore();
  const { setActiveClassId } = useClassStore();

  const handleFinish = async () => {
    const supabase = createClient();
    await supabase.auth.updateUser({
      data: { onboarding_completed: true },
    });

    if (classId) {
      setActiveClassId(classId);
    }

    reset();
    router.push("/dashboard");
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-12 h-12 bg-cm-teal-light rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="h-6 w-6 text-cm-teal" />
        </div>
        <h2 className="text-cm-section text-cm-text-primary">
          You&apos;re all set, {displayName}!
        </h2>
        <p className="text-cm-body text-cm-text-secondary mt-1">
          Your classroom is ready to go.
        </p>
      </div>

      <div className="bg-cm-white rounded-cm-card border border-cm-border p-4 space-y-3">
        <div className="flex justify-between text-cm-body">
          <span className="text-cm-text-secondary">Class</span>
          <span className="text-cm-text-primary font-medium">{className}</span>
        </div>
        <div className="flex justify-between text-cm-body">
          <span className="text-cm-text-secondary">Subject</span>
          <span className="text-cm-text-primary">{subject}</span>
        </div>
        <div className="flex justify-between text-cm-body">
          <span className="text-cm-text-secondary">Grade band</span>
          <span className="text-cm-text-primary">{gradeBand}</span>
        </div>
        <div className="flex justify-between text-cm-body">
          <span className="text-cm-text-secondary">Grading</span>
          <span className="text-cm-text-primary capitalize">{gradingScaleType}</span>
        </div>
      </div>

      <Button
        onClick={handleFinish}
        className="w-full bg-cm-teal hover:bg-cm-teal-dark text-white rounded-cm-button"
      >
        Go to your dashboard
      </Button>
    </div>
  );
}
