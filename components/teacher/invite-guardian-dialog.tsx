"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Copy, Check } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface FormData {
  guardian_email: string;
}

interface InviteGuardianDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  studentId: string;
  studentName: string;
}

export default function InviteGuardianDialog({
  open,
  onOpenChange,
  classId,
  studentId,
  studentName,
}: InviteGuardianDialogProps) {
  const [saving, setSaving] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [relationship, setRelationship] = useState("Parent");
  const [custodyRestricted, setCustodyRestricted] = useState(false);

  const { register, handleSubmit, reset } = useForm<FormData>({
    defaultValues: { guardian_email: "" },
  });

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/v1/classes/${classId}/guardians/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: studentId,
          guardian_email: data.guardian_email,
          relationship,
          custody_restricted: custodyRestricted,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Failed to create invite");
        return;
      }

      const result = await res.json();
      setInviteLink(result.invite_link);
      toast.success("Invite created! Share the link with the guardian.");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async () => {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setInviteLink(null);
      reset();
      setCustodyRestricted(false);
      setRelationship("Parent");
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Guardian for {studentName}</DialogTitle>
        </DialogHeader>

        {inviteLink ? (
          <div className="space-y-4">
            <p className="text-cm-body text-cm-text-secondary">
              Share this link with the guardian. It expires in 7 days.
            </p>
            <div className="flex items-center gap-2 p-3 bg-cm-purple-light rounded-cm-button">
              <code className="flex-1 text-cm-caption text-cm-purple-dark break-all">
                {inviteLink}
              </code>
              <button onClick={handleCopy} className="shrink-0 text-cm-purple hover:text-cm-purple-dark">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <DialogFooter>
              <Button onClick={() => handleClose(false)} className="bg-cm-purple hover:bg-cm-purple-dark text-white">
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="g-email">Guardian Email</Label>
              <Input id="g-email" type="email" {...register("guardian_email", { required: true })} placeholder="parent@email.com" />
            </div>
            <div className="space-y-2">
              <Label>Relationship</Label>
              <Select value={relationship} onValueChange={(v) => { if (v) setRelationship(v); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Parent">Parent</SelectItem>
                  <SelectItem value="Guardian">Guardian</SelectItem>
                  <SelectItem value="Grandparent">Grandparent</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <label className="flex items-center gap-2 text-cm-body cursor-pointer">
              <input
                type="checkbox"
                checked={custodyRestricted}
                onChange={(e) => setCustodyRestricted(e.target.checked)}
                className="rounded"
              />
              Custody restricted (academics only, no economy/todos)
            </label>
            <DialogFooter>
              <Button type="submit" disabled={saving} className="bg-cm-purple hover:bg-cm-purple-dark text-white">
                {saving ? "Creating..." : "Create Invite"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
