"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useClassStore } from "@/stores/class-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Sparkles } from "lucide-react";
import type { Class, Subject, GradeBand, Subscription } from "@/types/database";

const subjects: Subject[] = ["ELA", "Math", "Science", "Social Studies", "Multi-subject", "Other"];
const gradeBands: GradeBand[] = ["K-2", "3-5", "6-8"];

export default function SettingsPage() {
  const { activeClassId, setActiveClassId } = useClassStore();
  const [, setCls] = useState<Class | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  // Edit fields
  const [name, setName] = useState("");
  const [subject, setSubject] = useState<Subject>("ELA");
  const [gradeBand, setGradeBand] = useState<GradeBand>("K-2");
  const [currencyName, setCurrencyName] = useState("coins");
  const [currencyIcon, setCurrencyIcon] = useState("🪙");

  // Create class fields
  const [newName, setNewName] = useState("");
  const [newSubject, setNewSubject] = useState<Subject>("ELA");
  const [newGradeBand, setNewGradeBand] = useState<GradeBand>("K-2");
  const [creating, setCreating] = useState(false);
  const [subscription, setSubscription] = useState<Partial<Subscription> | null>(null);
  const [billingLoading, setBillingLoading] = useState(false);

  const loadClass = useCallback(async () => {
    if (!activeClassId) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("classes")
      .select("*")
      .eq("id", activeClassId)
      .single();

    if (data) {
      const c = data as Class;
      setCls(c);
      setName(c.name);
      setSubject(c.subject);
      setGradeBand(c.grade_band);
      setCurrencyName(c.currency_name);
      setCurrencyIcon(c.currency_icon);
    }
  }, [activeClassId]);

  useEffect(() => {
    loadClass();
  }, [loadClass]);

  // Load subscription
  useEffect(() => {
    fetch("/api/v1/billing")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setSubscription(data))
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    if (!activeClassId) return;
    setSaving(true);
    const supabase = createClient();

    await supabase.from("classes").update({
      name,
      subject,
      grade_band: gradeBand,
      currency_name: currencyName,
      currency_icon: currencyIcon,
    }).eq("id", activeClassId);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCreateClass = async () => {
    setCreating(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase.from("classes").insert({
      teacher_id: user.id,
      name: newName,
      subject: newSubject,
      grade_band: newGradeBand,
    }).select("id").single();

    if (data) {
      setActiveClassId(data.id);
    }

    setCreating(false);
    setCreateOpen(false);
    setNewName("");
  };

  const handleArchive = async () => {
    if (!activeClassId || !confirm("Archive this class? You can restore it later.")) return;
    const supabase = createClient();
    await supabase.from("classes").update({ archived_at: new Date().toISOString() }).eq("id", activeClassId);
    // Reset active class
    const { data: remaining } = await supabase
      .from("classes")
      .select("id")
      .is("archived_at", null)
      .limit(1);
    setActiveClassId(remaining?.[0]?.id || null);
  };

  if (!activeClassId) {
    return (
      <div className="space-y-6">
        <h1 className="text-cm-title text-cm-text-primary">Settings</h1>
        <p className="text-cm-body text-cm-text-secondary">No class selected.</p>
        <Button
          onClick={() => setCreateOpen(true)}
          className="bg-cm-teal hover:bg-cm-teal-dark text-white rounded-cm-button"
        >
          <Plus className="h-4 w-4 mr-2" /> Create class
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-cm-title text-cm-text-primary">Class Settings</h1>
        <Button
          onClick={() => setCreateOpen(true)}
          variant="outline"
          className="rounded-cm-button"
        >
          <Plus className="h-4 w-4 mr-2" /> New class
        </Button>
      </div>

      <Card className="p-cm-6 bg-cm-surface rounded-cm-card border-cm-border space-y-5">
        <div className="space-y-2">
          <Label>Class name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Subject</Label>
          <div className="grid grid-cols-3 gap-2">
            {subjects.map((s) => (
              <button
                key={s}
                onClick={() => setSubject(s)}
                className={`px-3 py-2 rounded-cm-button text-cm-body border transition-colors ${
                  subject === s
                    ? "border-cm-teal bg-cm-teal-light text-cm-teal-dark font-medium"
                    : "border-cm-border text-cm-text-secondary hover:border-cm-border-med"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Grade band</Label>
          <div className="grid grid-cols-3 gap-2">
            {gradeBands.map((g) => (
              <button
                key={g}
                onClick={() => setGradeBand(g)}
                className={`px-3 py-2 rounded-cm-button text-cm-body border transition-colors ${
                  gradeBand === g
                    ? "border-cm-teal bg-cm-teal-light text-cm-teal-dark font-medium"
                    : "border-cm-border text-cm-text-secondary hover:border-cm-border-med"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Currency name</Label>
            <Input value={currencyName} onChange={(e) => setCurrencyName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Currency icon</Label>
            <Input value={currencyIcon} onChange={(e) => setCurrencyIcon(e.target.value)} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-cm-teal hover:bg-cm-teal-dark text-white rounded-cm-button"
          >
            {saving ? "Saving..." : saved ? "Saved!" : "Save changes"}
          </Button>
          <Button
            variant="outline"
            onClick={handleArchive}
            className="text-cm-coral border-cm-coral/30 hover:bg-cm-coral-light rounded-cm-button"
          >
            Archive class
          </Button>
        </div>
      </Card>

      {/* Billing */}
      <Card className="p-cm-6 bg-cm-surface rounded-cm-card border-cm-border space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-cm-3">
            <Sparkles className="h-5 w-5 text-cm-teal" />
            <h2 className="text-cm-label text-cm-text-primary">Subscription</h2>
          </div>
          <span className={`px-2 py-0.5 rounded-cm-badge text-cm-overline font-medium ${
            subscription?.tier === "pro"
              ? "bg-cm-teal-light text-cm-teal-dark"
              : "bg-cm-white text-cm-text-hint border border-cm-border"
          }`}>
            {subscription?.tier === "pro" ? "Pro" : "Free"}
          </span>
        </div>

        {subscription?.tier === "pro" ? (
          <div className="space-y-3">
            <p className="text-cm-body text-cm-text-secondary">
              You&apos;re on the Pro plan.
              {subscription.billing_interval && ` Billed ${subscription.billing_interval}ly.`}
              {subscription.current_period_end && ` Next billing: ${new Date(subscription.current_period_end).toLocaleDateString()}.`}
            </p>
            {subscription.cancel_at_period_end && (
              <p className="text-cm-caption text-cm-amber bg-cm-amber-light px-3 py-2 rounded-cm-button">
                Your subscription will cancel at the end of the current period.
              </p>
            )}
            <Button
              onClick={async () => {
                setBillingLoading(true);
                try {
                  const res = await fetch("/api/v1/billing/portal", { method: "POST" });
                  const data = await res.json();
                  if (data.url) window.location.href = data.url;
                } catch {} finally { setBillingLoading(false); }
              }}
              disabled={billingLoading}
              variant="outline"
              className="rounded-cm-button"
            >
              {billingLoading ? "Loading..." : "Manage Subscription"}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-cm-body text-cm-text-secondary">
              Upgrade to Pro for AI grading, unlimited classes, parent portal, advanced economy, and more.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={async () => {
                  setBillingLoading(true);
                  try {
                    const priceId = process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID || "pro_monthly";
                    const res = await fetch("/api/v1/billing/checkout", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ price_id: priceId }),
                    });
                    const data = await res.json();
                    if (data.url) window.location.href = data.url;
                  } catch {} finally { setBillingLoading(false); }
                }}
                disabled={billingLoading}
                className="bg-cm-teal hover:bg-cm-teal-dark text-white rounded-cm-button"
              >
                {billingLoading ? "Loading..." : "Upgrade to Pro — $19.99/mo"}
              </Button>
              <Button
                onClick={async () => {
                  setBillingLoading(true);
                  try {
                    const priceId = process.env.NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID || "pro_annual";
                    const res = await fetch("/api/v1/billing/checkout", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ price_id: priceId }),
                    });
                    const data = await res.json();
                    if (data.url) window.location.href = data.url;
                  } catch {} finally { setBillingLoading(false); }
                }}
                disabled={billingLoading}
                variant="outline"
                className="rounded-cm-button border-cm-teal text-cm-teal"
              >
                $119/year (save 50%)
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Create Class Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="rounded-cm-modal">
          <DialogHeader>
            <DialogTitle>Create new class</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Class name</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="4th Grade Science" />
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <div className="grid grid-cols-2 gap-2">
                {subjects.map((s) => (
                  <button
                    key={s}
                    onClick={() => setNewSubject(s)}
                    className={`px-3 py-2 rounded-cm-button text-cm-body border transition-colors ${
                      newSubject === s
                        ? "border-cm-teal bg-cm-teal-light text-cm-teal-dark font-medium"
                        : "border-cm-border text-cm-text-secondary"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Grade band</Label>
              <div className="grid grid-cols-3 gap-2">
                {gradeBands.map((g) => (
                  <button
                    key={g}
                    onClick={() => setNewGradeBand(g)}
                    className={`px-3 py-2 rounded-cm-button text-cm-body border transition-colors ${
                      newGradeBand === g
                        ? "border-cm-teal bg-cm-teal-light text-cm-teal-dark font-medium"
                        : "border-cm-border text-cm-text-secondary"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <Button
              onClick={handleCreateClass}
              disabled={!newName.trim() || creating}
              className="w-full bg-cm-teal hover:bg-cm-teal-dark text-white rounded-cm-button"
            >
              {creating ? "Creating..." : "Create class"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
