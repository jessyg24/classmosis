"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useClassStore } from "@/stores/class-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import type { Class, Subject, GradeBand } from "@/types/database";

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
