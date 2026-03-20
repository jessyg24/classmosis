"use client";

import { useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { parseStudentCsv } from "@/lib/utils/csv-parser";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  FileSpreadsheet,
  Upload,
  Check,
  AlertCircle,
  RefreshCw,
  UserPlus,
  UserMinus,
} from "lucide-react";

// Google Classroom icon as inline SVG
function GoogleClassroomIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
    </svg>
  );
}

type ImportMethod = "csv" | "paste" | "google";
type SyncAction = { name: string; action: "add" | "remove" | "keep" };

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  existingStudents: Array<{ id: string; display_name: string }>;
  onComplete: () => void;
  /** Show Google Classroom sync tab */
  showGoogleSync?: boolean;
}

export default function ImportRosterDialog({
  open,
  onOpenChange,
  classId,
  existingStudents,
  onComplete,
  showGoogleSync = true,
}: Props) {
  const [method, setMethod] = useState<ImportMethod>("csv");
  const [step, setStep] = useState<"choose" | "preview" | "done">("choose");
  const [syncActions, setSyncActions] = useState<SyncAction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [resultCount, setResultCount] = useState(0);
  const [pasteText, setPasteText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Google Classroom state
  const [gcLoading, setGcLoading] = useState(false);
  const [gcCourses, setGcCourses] = useState<Array<{ id: string; name: string }> | null>(null);
  const [gcConnected, setGcConnected] = useState(false);

  const reset = () => {
    setStep("choose");
    setSyncActions([]);
    setError(null);
    setImporting(false);
    setResultCount(0);
    setPasteText("");
    setGcCourses(null);
  };

  const handleClose = (open: boolean) => {
    if (!open) reset();
    onOpenChange(open);
  };

  // ── CSV upload ──────────────────────────────────────────────

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const { names, error: parseError } = parseStudentCsv(text);
      if (parseError) {
        setError(parseError);
        return;
      }
      buildSyncActions(names);
      setStep("preview");
    };
    reader.readAsText(file);

    // Reset file input so same file can be re-selected
    e.target.value = "";
  }, [existingStudents]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Paste names ─────────────────────────────────────────────

  const handlePasteSubmit = () => {
    const names = pasteText.split("\n").map((n) => n.trim()).filter((n) => n.length > 0);
    if (names.length === 0) {
      setError("No names found. Enter one name per line.");
      return;
    }
    buildSyncActions(names);
    setStep("preview");
  };

  // ── Google Classroom ────────────────────────────────────────

  const handleGoogleConnect = async () => {
    setGcLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/auth/google-classroom/courses");
      if (!res.ok) {
        const data = await res.json();
        if (data.authUrl) {
          // Need to authorize — open popup
          const popup = window.open(data.authUrl, "google-auth", "width=500,height=600,popup=yes");
          // Listen for completion
          const checkClosed = setInterval(async () => {
            if (popup?.closed) {
              clearInterval(checkClosed);
              // Retry fetching courses after auth
              const retry = await fetch("/api/v1/auth/google-classroom/courses");
              if (retry.ok) {
                const retryData = await retry.json();
                setGcCourses(retryData.courses);
                setGcConnected(true);
              } else {
                setError("Could not connect to Google Classroom. Try again.");
              }
              setGcLoading(false);
            }
          }, 500);
          return;
        }
        setError(data.error || "Could not connect to Google Classroom.");
        setGcLoading(false);
        return;
      }
      const data = await res.json();
      setGcCourses(data.courses);
      setGcConnected(true);
    } catch {
      setError("Could not connect to Google Classroom.");
    }
    setGcLoading(false);
  };

  const handleGoogleCourseSelect = async (courseId: string) => {
    setGcLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/auth/google-classroom/roster?courseId=${courseId}`);
      if (!res.ok) {
        setError("Could not load roster from Google Classroom.");
        setGcLoading(false);
        return;
      }
      const data = await res.json();
      const names: string[] = data.students.map((s: { name: string }) => s.name);
      buildSyncActions(names);
      setStep("preview");
    } catch {
      setError("Could not load roster from Google Classroom.");
    }
    setGcLoading(false);
  };

  // ── Sync logic ──────────────────────────────────────────────

  const buildSyncActions = (newNames: string[]) => {
    const existingSet = new Set(existingStudents.map((s) => s.display_name.toLowerCase()));
    const newSet = new Set(newNames.map((n) => n.toLowerCase()));
    const actions: SyncAction[] = [];

    // New students to add
    for (const name of newNames) {
      if (!existingSet.has(name.toLowerCase())) {
        actions.push({ name, action: "add" });
      } else {
        actions.push({ name, action: "keep" });
      }
    }

    // Existing students not in import — suggest removal (only for Google Classroom sync)
    if (method === "google") {
      for (const s of existingStudents) {
        if (!newSet.has(s.display_name.toLowerCase())) {
          actions.push({ name: s.display_name, action: "remove" });
        }
      }
    }

    setSyncActions(actions);
  };

  const handleImport = async () => {
    setImporting(true);
    const supabase = createClient();

    const toAdd = syncActions.filter((a) => a.action === "add");
    const toRemove = syncActions.filter((a) => a.action === "remove");

    // Add new students
    if (toAdd.length > 0) {
      const rows = toAdd.map((a) => ({
        class_id: classId,
        display_name: a.name,
      }));
      await supabase.from("students").insert(rows);
    }

    // Archive removed students (Google sync only)
    if (toRemove.length > 0) {
      const removeNames = new Set(toRemove.map((a) => a.name.toLowerCase()));
      const idsToArchive = existingStudents
        .filter((s) => removeNames.has(s.display_name.toLowerCase()))
        .map((s) => s.id);

      if (idsToArchive.length > 0) {
        await supabase
          .from("students")
          .update({ archived_at: new Date().toISOString() })
          .in("id", idsToArchive);
      }
    }

    setResultCount(toAdd.length);
    setStep("done");
    setImporting(false);
    onComplete();
  };

  const addCount = syncActions.filter((a) => a.action === "add").length;
  const removeCount = syncActions.filter((a) => a.action === "remove").length;
  const keepCount = syncActions.filter((a) => a.action === "keep").length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="rounded-cm-modal max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {step === "preview" ? "Review roster changes" : step === "done" ? "Import complete" : "Import students"}
          </DialogTitle>
        </DialogHeader>

        {/* ── Step: Choose method ──────────────────────────── */}
        {step === "choose" && (
          <div className="space-y-4">
            {/* Method tabs */}
            <div className="flex gap-1 rounded-cm-button bg-cm-white p-1 border border-cm-border">
              <button
                onClick={() => { setMethod("csv"); setError(null); }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-cm-badge text-cm-caption font-medium transition-colors ${
                  method === "csv" ? "bg-cm-teal-light text-cm-teal-dark" : "text-cm-text-hint hover:text-cm-text-secondary"
                }`}
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                CSV File
              </button>
              <button
                onClick={() => { setMethod("paste"); setError(null); }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-cm-badge text-cm-caption font-medium transition-colors ${
                  method === "paste" ? "bg-cm-teal-light text-cm-teal-dark" : "text-cm-text-hint hover:text-cm-text-secondary"
                }`}
              >
                <Upload className="h-3.5 w-3.5" />
                Paste Names
              </button>
              {showGoogleSync && (
                <button
                  onClick={() => { setMethod("google"); setError(null); }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-cm-badge text-cm-caption font-medium transition-colors ${
                    method === "google" ? "bg-cm-blue-light text-cm-blue-dark" : "text-cm-text-hint hover:text-cm-text-secondary"
                  }`}
                >
                  <GoogleClassroomIcon className="h-3.5 w-3.5" />
                  Google
                </button>
              )}
            </div>

            {/* CSV upload */}
            {method === "csv" && (
              <div className="space-y-3">
                <div
                  onClick={() => fileRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 p-8 border-2 border-dashed border-cm-border rounded-cm-card cursor-pointer hover:border-cm-teal hover:bg-cm-teal-light/20 transition-colors"
                >
                  <FileSpreadsheet className="h-8 w-8 text-cm-text-hint" />
                  <p className="text-cm-body text-cm-text-secondary">
                    Click to upload a CSV file
                  </p>
                  <p className="text-cm-caption text-cm-text-hint">
                    Supports Google Classroom, Clever, Aeries, PowerSchool exports
                  </p>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            )}

            {/* Paste names */}
            {method === "paste" && (
              <div className="space-y-3">
                <textarea
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  rows={8}
                  placeholder={"Emma Rodriguez\nLiam Chen\nSophia Patel\nNoah Williams"}
                  className="w-full px-3 py-2 rounded-cm-button border border-cm-border text-cm-body placeholder:text-cm-text-hint focus:outline-none focus:ring-2 focus:ring-cm-teal/30 focus:border-cm-teal resize-none"
                />
                <div className="flex items-center justify-between">
                  <p className="text-cm-caption text-cm-text-hint">
                    {pasteText.split("\n").filter((n) => n.trim()).length} names
                  </p>
                  <Button
                    onClick={handlePasteSubmit}
                    disabled={!pasteText.trim()}
                    className="bg-cm-teal hover:bg-cm-teal-dark text-white rounded-cm-button"
                    size="sm"
                  >
                    Preview
                  </Button>
                </div>
              </div>
            )}

            {/* Google Classroom */}
            {method === "google" && (
              <div className="space-y-3">
                {!gcConnected ? (
                  <div className="flex flex-col items-center gap-3 p-6">
                    <GoogleClassroomIcon className="h-10 w-10 text-cm-blue" />
                    <p className="text-cm-body text-cm-text-secondary text-center">
                      Connect your Google Classroom to import and sync your roster automatically.
                    </p>
                    <Button
                      onClick={handleGoogleConnect}
                      disabled={gcLoading}
                      className="bg-cm-blue hover:bg-cm-blue-dark text-white rounded-cm-button"
                    >
                      {gcLoading ? (
                        <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Connecting...</>
                      ) : (
                        <><GoogleClassroomIcon className="h-4 w-4 mr-2" /> Connect Google Classroom</>
                      )}
                    </Button>
                    <p className="text-[10px] text-cm-text-hint text-center max-w-xs">
                      We only read your class roster. We never post, modify, or store your Google data.
                    </p>
                  </div>
                ) : gcCourses ? (
                  <div className="space-y-2">
                    <p className="text-cm-caption text-cm-text-secondary">
                      Select a class to sync:
                    </p>
                    <div className="max-h-48 overflow-y-auto space-y-1">
                      {gcCourses.map((course) => (
                        <button
                          key={course.id}
                          onClick={() => handleGoogleCourseSelect(course.id)}
                          disabled={gcLoading}
                          className="w-full text-left px-4 py-3 rounded-cm-button text-cm-body text-cm-text-primary hover:bg-cm-blue-light transition-colors disabled:opacity-50"
                        >
                          {course.name}
                        </button>
                      ))}
                    </div>
                    {gcCourses.length === 0 && (
                      <p className="text-cm-body text-cm-text-hint text-center py-4">
                        No courses found in your Google Classroom.
                      </p>
                    )}
                  </div>
                ) : null}
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-cm-button bg-cm-coral-light">
                <AlertCircle className="h-4 w-4 text-cm-coral shrink-0 mt-0.5" />
                <p className="text-cm-caption text-cm-coral-dark">{error}</p>
              </div>
            )}
          </div>
        )}

        {/* ── Step: Preview sync ───────────────────────────── */}
        {step === "preview" && (
          <div className="space-y-4">
            {/* Summary badges */}
            <div className="flex gap-2">
              {addCount > 0 && (
                <span className="flex items-center gap-1 text-cm-caption font-medium px-2.5 py-1 rounded-cm-badge bg-cm-teal-light text-cm-teal-dark">
                  <UserPlus className="h-3 w-3" /> {addCount} new
                </span>
              )}
              {keepCount > 0 && (
                <span className="flex items-center gap-1 text-cm-caption font-medium px-2.5 py-1 rounded-cm-badge bg-cm-surface text-cm-text-secondary">
                  <Check className="h-3 w-3" /> {keepCount} already in roster
                </span>
              )}
              {removeCount > 0 && (
                <span className="flex items-center gap-1 text-cm-caption font-medium px-2.5 py-1 rounded-cm-badge bg-cm-coral-light text-cm-coral-dark">
                  <UserMinus className="h-3 w-3" /> {removeCount} to archive
                </span>
              )}
            </div>

            {/* Student list */}
            <div className="border border-cm-border rounded-cm-card overflow-hidden max-h-64 overflow-y-auto">
              {syncActions.map((a, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between px-3 py-2 border-b border-cm-border last:border-0 ${
                    a.action === "add" ? "bg-cm-teal-light/30" :
                    a.action === "remove" ? "bg-cm-coral-light/30" : ""
                  }`}
                >
                  <span className={`text-cm-body ${a.action === "remove" ? "line-through text-cm-text-hint" : "text-cm-text-primary"}`}>
                    {a.name}
                  </span>
                  <span className={`text-[10px] font-medium uppercase ${
                    a.action === "add" ? "text-cm-teal" :
                    a.action === "remove" ? "text-cm-coral" :
                    "text-cm-text-hint"
                  }`}>
                    {a.action === "add" ? "New" : a.action === "remove" ? "Archive" : "Exists"}
                  </span>
                </div>
              ))}
            </div>

            {addCount === 0 && removeCount === 0 && (
              <p className="text-cm-body text-cm-text-secondary text-center py-2">
                All students are already in your roster. Nothing to change.
              </p>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={reset} className="rounded-cm-button">
                Back
              </Button>
              <Button
                onClick={handleImport}
                disabled={importing || (addCount === 0 && removeCount === 0)}
                className="flex-1 bg-cm-teal hover:bg-cm-teal-dark text-white rounded-cm-button"
              >
                {importing ? "Importing..." : `Import ${addCount} student${addCount !== 1 ? "s" : ""}`}
              </Button>
            </div>
          </div>
        )}

        {/* ── Step: Done ───────────────────────────────────── */}
        {step === "done" && (
          <div className="space-y-4">
            <div className="bg-cm-teal-light p-4 rounded-cm-button text-center">
              <p className="text-cm-body text-cm-teal-dark font-medium">
                {resultCount > 0
                  ? `${resultCount} student${resultCount !== 1 ? "s" : ""} added!`
                  : "Roster synced!"}
              </p>
              {removeCount > 0 && (
                <p className="text-cm-caption text-cm-teal-dark/80 mt-1">
                  {removeCount} student{removeCount !== 1 ? "s" : ""} archived.
                </p>
              )}
            </div>
            <p className="text-cm-caption text-cm-text-hint text-center">
              Students join by entering today&apos;s class code and picking their name.
            </p>
            <Button onClick={() => handleClose(false)} className="w-full rounded-cm-button">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
