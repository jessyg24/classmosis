"use client";

import { useOnboardingStore } from "@/stores/onboarding-store";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function StepWelcome() {
  const { displayName, schoolName, state, setDisplayName, setSchoolName, setState, nextStep } =
    useOnboardingStore();

  const handleNext = async () => {
    // Update user metadata
    const supabase = createClient();
    await supabase.auth.updateUser({
      data: {
        display_name: displayName,
        school_name: schoolName || null,
        state: state || null,
      },
    });
    nextStep();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-cm-section text-cm-text-primary">
          Welcome to Classmosis
        </h2>
        <p className="text-cm-body text-cm-text-secondary mt-1">
          Let&apos;s get your classroom set up. This takes about 5 minutes.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">What should we call you?</Label>
          <Input
            id="name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Ms. Johnson"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="school">School name (optional)</Label>
          <Input
            id="school"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            placeholder="Taylor Elementary"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">State (optional)</Label>
          <Input
            id="state"
            value={state}
            onChange={(e) => setState(e.target.value)}
            placeholder="California"
          />
        </div>
      </div>

      <Button
        onClick={handleNext}
        disabled={!displayName.trim()}
        className="w-full bg-cm-teal hover:bg-cm-teal-dark text-white rounded-cm-button"
      >
        Next
      </Button>
    </div>
  );
}
