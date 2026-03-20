"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useEconomySettings, useUpdateEconomySettings } from "@/hooks/use-economy";

interface EconomySettingsFormProps {
  classId: string;
}

export default function EconomySettingsForm({ classId }: EconomySettingsFormProps) {
  const { data: settings, isLoading } = useEconomySettings(classId);
  const updateMutation = useUpdateEconomySettings(classId);

  // Ensure settings exist on mount
  useEffect(() => {
    // GET will auto-create defaults if none exist
  }, [classId]);

  const toggle = async (key: "leaderboard_visible" | "negative_balance" | "auto_approve", value: boolean) => {
    try {
      await updateMutation.mutateAsync({ [key]: value });
      toast.success("Settings updated");
    } catch {
      toast.error("Failed to update settings");
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-6 w-6 border-2 border-cm-amber border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const toggles: Array<{ key: "leaderboard_visible" | "negative_balance" | "auto_approve"; label: string; description: string }> = [
    {
      key: "leaderboard_visible",
      label: "Show leaderboard",
      description: "Students can see class coin standings in the portal",
    },
    {
      key: "negative_balance",
      label: "Allow negative balance",
      description: "Students can go below zero coins (for deductions)",
    },
    {
      key: "auto_approve",
      label: "Auto-approve purchases",
      description: "Store purchases are applied immediately without teacher review",
    },
  ];

  return (
    <div className="space-y-4">
      {toggles.map((t) => (
        <div key={t.key} className="flex items-center justify-between py-cm-3">
          <div>
            <p className="text-cm-body text-cm-text-primary">{t.label}</p>
            <p className="text-cm-caption text-cm-text-hint">{t.description}</p>
          </div>
          <button
            onClick={() => toggle(t.key, !settings[t.key])}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              settings[t.key] ? "bg-cm-amber" : "bg-cm-border"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                settings[t.key] ? "translate-x-5" : ""
              }`}
            />
          </button>
        </div>
      ))}
    </div>
  );
}
