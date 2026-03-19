"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { Progress } from "@/components/ui/progress";
import StepWelcome from "./step-welcome";
import StepClass from "./step-class";
import StepGrading from "./step-grading";
import StepStudents from "./step-students";
import StepDone from "./step-done";

export default function OnboardingPage() {
  const router = useRouter();
  const { step, setDisplayName, setSchoolName } = useOnboardingStore();
  const [loaded, setLoaded] = useState(false);

  // Load user data on mount
  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const meta = user.user_metadata;
      if (meta.display_name) setDisplayName(meta.display_name);
      if (meta.school_name) setSchoolName(meta.school_name);

      setLoaded(true);
    }
    loadUser();
  }, [router, setDisplayName, setSchoolName]);

  if (!loaded) {
    return (
      <div className="space-y-4">
        <div className="h-6 bg-cm-white rounded animate-pulse" />
        <div className="h-40 bg-cm-white rounded animate-pulse" />
      </div>
    );
  }

  const steps = [
    { component: StepWelcome, label: "Welcome" },
    { component: StepClass, label: "Class" },
    { component: StepGrading, label: "Grading" },
    { component: StepStudents, label: "Students" },
    { component: StepDone, label: "Done" },
  ];

  const CurrentStep = steps[step - 1].component;

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-cm-caption text-cm-text-hint">
          <span>Step {step} of 5</span>
          <span>{steps[step - 1].label}</span>
        </div>
        <Progress value={(step / 5) * 100} className="h-1.5" />
      </div>

      <CurrentStep />
    </div>
  );
}
