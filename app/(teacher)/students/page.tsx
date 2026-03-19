"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useClassStore } from "@/stores/class-store";
import { generatePin, hashPin } from "@/lib/utils/pin";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  UserPlus,
  Upload,
  RotateCcw,
  Pencil,
  Trash2,
  Copy,
  Check,
} from "lucide-react";
import type { Student } from "@/types/database";

export default function StudentsPage() {
  const { activeClassId } = useClassStore();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [addOpen, setAddOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [pinResetResult, setPinResetResult] = useState<{ name: string; pin: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Student | null>(null);

  // Add student form
  const [newName, setNewName] = useState("");
  const [newPin, setNewPin] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);

  // Bulk import
  const [bulkNames, setBulkNames] = useState("");
  const [bulkResults, setBulkResults] = useState<Array<{ name: string; pin: string }>>([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkCopied, setBulkCopied] = useState(false);

  // Edit form
  const [editName, setEditName] = useState("");
  const [editFlags, setEditFlags] = useState({ iep: false, f504: false, gate: false, ell: false });

  const loadStudents = useCallback(async () => {
    if (!activeClassId) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("students")
      .select("*")
      .eq("class_id", activeClassId)
      .is("archived_at", null)
      .order("display_name");
    setStudents((data as Student[]) || []);
    setLoading(false);
  }, [activeClassId]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const handleAddStudent = async () => {
    if (!activeClassId || !newName.trim()) return;
    setAddLoading(true);
    const pin = generatePin();
    const pinHash = await hashPin(pin);
    const supabase = createClient();

    await supabase.from("students").insert({
      class_id: activeClassId,
      display_name: newName.trim(),
      pin_hash: pinHash,
    });

    setNewPin(pin);
    setAddLoading(false);
    loadStudents();
  };

  const handleBulkImport = async () => {
    if (!activeClassId) return;
    const names = bulkNames.split("\n").map((n) => n.trim()).filter((n) => n);
    if (!names.length) return;

    setBulkLoading(true);
    const supabase = createClient();
    const results: Array<{ name: string; pin: string }> = [];

    for (const name of names) {
      const pin = generatePin();
      const pinHash = await hashPin(pin);
      await supabase.from("students").insert({
        class_id: activeClassId,
        display_name: name,
        pin_hash: pinHash,
      });
      results.push({ name, pin });
    }

    setBulkResults(results);
    setBulkLoading(false);
    loadStudents();
  };

  const handleResetPin = async (student: Student) => {
    const pin = generatePin();
    const pinHash = await hashPin(pin);
    const supabase = createClient();

    await supabase.from("students").update({ pin_hash: pinHash }).eq("id", student.id);
    setPinResetResult({ name: student.display_name, pin });
  };

  const handleEdit = async () => {
    if (!editStudent) return;
    const supabase = createClient();

    await supabase.from("students").update({
      display_name: editName,
      iep_flag: editFlags.iep,
      flag_504: editFlags.f504,
      gate_flag: editFlags.gate,
      ell_flag: editFlags.ell,
    }).eq("id", editStudent.id);

    setEditStudent(null);
    loadStudents();
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    const supabase = createClient();
    await supabase.from("students").update({ archived_at: new Date().toISOString() }).eq("id", deleteConfirm.id);
    setDeleteConfirm(null);
    loadStudents();
  };

  const openEdit = (s: Student) => {
    setEditStudent(s);
    setEditName(s.display_name);
    setEditFlags({
      iep: s.iep_flag,
      f504: s.flag_504,
      gate: s.gate_flag,
      ell: s.ell_flag,
    });
  };

  const handleCopyBulk = async () => {
    const text = bulkResults.map((r) => `${r.name}\t${r.pin}`).join("\n");
    await navigator.clipboard.writeText(text);
    setBulkCopied(true);
    setTimeout(() => setBulkCopied(false), 2000);
  };

  if (!activeClassId) {
    return (
      <div className="text-center py-16">
        <p className="text-cm-body text-cm-text-secondary">Select a class to view students.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-cm-title text-cm-text-primary">Students</h1>
          <p className="text-cm-body text-cm-text-secondary">
            {students.length} student{students.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => { setBulkOpen(true); setBulkNames(""); setBulkResults([]); }}
            className="rounded-cm-button"
          >
            <Upload className="h-4 w-4 mr-2" /> Bulk import
          </Button>
          <Button
            onClick={() => { setAddOpen(true); setNewName(""); setNewPin(null); }}
            className="bg-cm-teal hover:bg-cm-teal-dark text-white rounded-cm-button"
          >
            <UserPlus className="h-4 w-4 mr-2" /> Add student
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-cm-white rounded-cm-button animate-pulse" />
          ))}
        </div>
      ) : students.length === 0 ? (
        <Card className="p-cm-12 text-center bg-cm-surface rounded-cm-card border-cm-border">
          <Users className="h-10 w-10 text-cm-text-hint mx-auto mb-3" />
          <p className="text-cm-label text-cm-text-primary mb-1">No students yet</p>
          <p className="text-cm-body text-cm-text-secondary">
            Add students one at a time or use bulk import.
          </p>
        </Card>
      ) : (
        <div className="bg-cm-surface rounded-cm-card border border-cm-border overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-4 py-2 border-b border-cm-border bg-cm-white">
            <span className="text-cm-overline text-cm-text-hint">Name</span>
            <span className="text-cm-overline text-cm-text-hint">Flags</span>
            <span className="text-cm-overline text-cm-text-hint">Actions</span>
          </div>
          <div className="divide-y divide-cm-border">
            {students.map((s) => (
              <div key={s.id} className="grid grid-cols-[1fr_auto_auto] gap-4 items-center px-4 py-3">
                <span className="text-cm-body text-cm-text-primary font-medium">
                  {s.display_name}
                </span>
                <div className="flex gap-1">
                  {s.iep_flag && <Badge variant="outline" className="text-[10px] border-cm-pink text-cm-pink">IEP</Badge>}
                  {s.flag_504 && <Badge variant="outline" className="text-[10px] border-cm-purple text-cm-purple">504</Badge>}
                  {s.gate_flag && <Badge variant="outline" className="text-[10px] border-cm-amber text-cm-amber">GATE</Badge>}
                  {s.ell_flag && <Badge variant="outline" className="text-[10px] border-cm-blue text-cm-blue">ELL</Badge>}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(s)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleResetPin(s)}>
                    <RotateCcw className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-cm-coral" onClick={() => setDeleteConfirm(s)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Student Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="rounded-cm-modal">
          <DialogHeader>
            <DialogTitle>Add student</DialogTitle>
          </DialogHeader>
          {newPin ? (
            <div className="space-y-4">
              <div className="bg-cm-teal-light p-4 rounded-cm-button text-center">
                <p className="text-cm-body text-cm-teal-dark mb-1">
                  {newName}&apos;s PIN:
                </p>
                <p className="text-2xl font-mono font-bold text-cm-teal-dark">{newPin}</p>
              </div>
              <p className="text-cm-caption text-cm-text-hint text-center">
                This PIN won&apos;t be shown again. Copy it now.
              </p>
              <Button onClick={() => setAddOpen(false)} className="w-full rounded-cm-button">
                Done
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Student name</Label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Emma Rodriguez"
                />
              </div>
              <Button
                onClick={handleAddStudent}
                disabled={!newName.trim() || addLoading}
                className="w-full bg-cm-teal hover:bg-cm-teal-dark text-white rounded-cm-button"
              >
                {addLoading ? "Adding..." : "Add student"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Import Dialog */}
      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent className="rounded-cm-modal max-w-lg">
          <DialogHeader>
            <DialogTitle>Bulk import</DialogTitle>
          </DialogHeader>
          {bulkResults.length > 0 ? (
            <div className="space-y-4">
              <div className="bg-cm-teal-light p-3 rounded-cm-button">
                <p className="text-cm-body text-cm-teal-dark font-medium">
                  {bulkResults.length} students added!
                </p>
              </div>
              <div className="border border-cm-border rounded-cm-button overflow-hidden max-h-64 overflow-y-auto">
                <div className="flex justify-end px-3 py-1 bg-cm-white border-b border-cm-border">
                  <Button variant="ghost" size="sm" onClick={handleCopyBulk} className="text-cm-caption">
                    {bulkCopied ? <><Check className="h-3 w-3 mr-1" /> Copied</> : <><Copy className="h-3 w-3 mr-1" /> Copy all</>}
                  </Button>
                </div>
                {bulkResults.map((r, i) => (
                  <div key={i} className="flex justify-between px-3 py-1.5 border-b border-cm-border last:border-0">
                    <span className="text-cm-body">{r.name}</span>
                    <span className="text-cm-body font-mono text-cm-purple">{r.pin}</span>
                  </div>
                ))}
              </div>
              <Button onClick={() => setBulkOpen(false)} className="w-full rounded-cm-button">Done</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Paste names (one per line)</Label>
                <textarea
                  value={bulkNames}
                  onChange={(e) => setBulkNames(e.target.value)}
                  rows={8}
                  placeholder={"Emma Rodriguez\nLiam Chen\nSophia Patel"}
                  className="w-full px-3 py-2 rounded-cm-button border border-cm-border text-cm-body placeholder:text-cm-text-hint focus:outline-none focus:ring-2 focus:ring-cm-teal/30 focus:border-cm-teal resize-none"
                />
                <p className="text-cm-caption text-cm-text-hint">
                  {bulkNames.split("\n").filter((n) => n.trim()).length} names
                </p>
              </div>
              <Button
                onClick={handleBulkImport}
                disabled={!bulkNames.trim() || bulkLoading}
                className="w-full bg-cm-teal hover:bg-cm-teal-dark text-white rounded-cm-button"
              >
                {bulkLoading ? "Importing..." : "Import students"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={!!editStudent} onOpenChange={() => setEditStudent(null)}>
        <DialogContent className="rounded-cm-modal">
          <DialogHeader>
            <DialogTitle>Edit student</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Flags</Label>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { key: "iep" as const, label: "IEP", color: "cm-pink" },
                  { key: "f504" as const, label: "504", color: "cm-purple" },
                  { key: "gate" as const, label: "GATE", color: "cm-amber" },
                  { key: "ell" as const, label: "ELL", color: "cm-blue" },
                ]).map(({ key, label, color }) => (
                  <button
                    key={key}
                    onClick={() => setEditFlags((f) => ({ ...f, [key]: !f[key] }))}
                    className={`px-3 py-2 rounded-cm-button border text-cm-body transition-colors ${
                      editFlags[key]
                        ? `border-${color} bg-${color}-light text-${color}-dark font-medium`
                        : "border-cm-border text-cm-text-secondary"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={handleEdit} className="w-full bg-cm-teal hover:bg-cm-teal-dark text-white rounded-cm-button">
              Save changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* PIN Reset Result */}
      <Dialog open={!!pinResetResult} onOpenChange={() => setPinResetResult(null)}>
        <DialogContent className="rounded-cm-modal">
          <DialogHeader>
            <DialogTitle>PIN reset</DialogTitle>
          </DialogHeader>
          {pinResetResult && (
            <div className="space-y-4">
              <div className="bg-cm-teal-light p-4 rounded-cm-button text-center">
                <p className="text-cm-body text-cm-teal-dark mb-1">
                  {pinResetResult.name}&apos;s new PIN:
                </p>
                <p className="text-2xl font-mono font-bold text-cm-teal-dark">
                  {pinResetResult.pin}
                </p>
              </div>
              <p className="text-cm-caption text-cm-text-hint text-center">
                This PIN won&apos;t be shown again.
              </p>
              <Button onClick={() => setPinResetResult(null)} className="w-full rounded-cm-button">
                Done
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="rounded-cm-modal">
          <DialogHeader>
            <DialogTitle>Remove student</DialogTitle>
          </DialogHeader>
          <p className="text-cm-body text-cm-text-secondary">
            Are you sure you want to remove {deleteConfirm?.display_name}? Their data will be archived, not deleted.
          </p>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="flex-1 rounded-cm-button">
              Cancel
            </Button>
            <Button onClick={handleDelete} className="flex-1 bg-cm-coral hover:bg-cm-coral-dark text-white rounded-cm-button">
              Remove
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Users(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
