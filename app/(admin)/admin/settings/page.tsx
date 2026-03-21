"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Setting {
  key: string;
  value: unknown;
  description: string | null;
  category: string;
}

const CATEGORIES = [
  { key: "pricing", label: "Pricing", fields: [
    { key: "monthly_price", label: "Monthly Price (USD)", type: "number" },
    { key: "annual_price", label: "Annual Price (USD)", type: "number" },
    { key: "trial_days", label: "Trial Duration (days)", type: "number" },
  ]},
  { key: "limits", label: "Free Tier Limits", fields: [
    { key: "max_classes_free", label: "Max Classes (Free)", type: "number" },
    { key: "max_students_per_class_free", label: "Max Students/Class (Free)", type: "number" },
    { key: "daily_ai_limit", label: "Daily AI Calls/Teacher", type: "number" },
    { key: "monthly_ai_limit", label: "Monthly AI Calls/Class", type: "number" },
  ]},
  { key: "economy", label: "Economy Defaults", fields: [
    { key: "default_coins_per_assignment", label: "Coins per Assignment", type: "number" },
    { key: "default_coins_per_practice", label: "Coins per Correct Practice", type: "number" },
    { key: "default_mystery_multiplier", label: "Mystery Student Multiplier", type: "number" },
  ]},
  { key: "site", label: "Site", fields: [
    { key: "site_name", label: "Site Name", type: "text" },
    { key: "support_email", label: "Support Email", type: "text" },
  ]},
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/admin/settings")
      .then((r) => r.json())
      .then((data: Setting[]) => {
        const map: Record<string, unknown> = {};
        for (const s of data) map[s.key] = s.value;
        setSettings(map);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const saveCategory = async (categoryKey: string, fields: Array<{ key: string }>) => {
    setSaving(categoryKey);
    try {
      const settingsToSave = fields.map((f) => ({
        key: f.key,
        value: settings[f.key],
        category: categoryKey,
      }));
      const res = await fetch("/api/v1/admin/settings/bulk", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: settingsToSave }),
      });
      if (res.ok) toast.success("Settings saved");
      else toast.error("Failed to save");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 border-2 border-cm-coral border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-cm-title text-cm-text-primary">Platform Settings</h1>

      {CATEGORIES.map((cat) => (
        <Card key={cat.key} className="p-cm-6 bg-cm-surface rounded-cm-card border-cm-border">
          <h2 className="text-cm-label text-cm-text-primary mb-4">{cat.label}</h2>
          <div className="grid grid-cols-2 gap-4">
            {cat.fields.map((field) => (
              <div key={field.key} className="space-y-1">
                <Label className="text-cm-caption">{field.label}</Label>
                <Input
                  type={field.type}
                  value={typeof settings[field.key] === "string" ? (settings[field.key] as string).replace(/"/g, "") : String(settings[field.key] ?? "")}
                  onChange={(e) => {
                    const val = field.type === "number" ? Number(e.target.value) : e.target.value;
                    setSettings((prev) => ({ ...prev, [field.key]: val }));
                  }}
                  className="h-8 text-cm-body"
                />
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button
              size="sm"
              onClick={() => saveCategory(cat.key, cat.fields)}
              disabled={saving === cat.key}
              className="bg-cm-coral hover:bg-cm-coral-dark text-white"
            >
              {saving === cat.key ? "Saving..." : "Save"}
            </Button>
          </div>
        </Card>
      ))}

      {/* Feature Gates */}
      <Card className="p-cm-6 bg-cm-surface rounded-cm-card border-cm-border">
        <h2 className="text-cm-label text-cm-text-primary mb-4">Feature Gates (Pro vs Free)</h2>
        <div className="space-y-2">
          {Object.entries((settings.feature_tier_map as Record<string, string>) || {}).map(([feature, tier]) => (
            <div key={feature} className="flex items-center justify-between py-1">
              <span className="text-cm-body text-cm-text-secondary">{feature.replace(/_/g, " ")}</span>
              <select
                value={tier}
                onChange={(e) => {
                  const map = { ...(settings.feature_tier_map as Record<string, string>), [feature]: e.target.value };
                  setSettings((prev) => ({ ...prev, feature_tier_map: map }));
                }}
                className="px-2 py-0.5 rounded-cm-badge text-cm-caption border border-cm-border"
              >
                <option value="free">Free</option>
                <option value="pro">Pro</option>
              </select>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Button
            size="sm"
            onClick={() => saveCategory("features", [{ key: "feature_tier_map" }])}
            disabled={saving === "features"}
            className="bg-cm-coral hover:bg-cm-coral-dark text-white"
          >
            {saving === "features" ? "Saving..." : "Save Feature Gates"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
