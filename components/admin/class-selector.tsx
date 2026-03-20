"use client";

import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminStore } from "@/stores/admin-store";

interface ClassOption {
  id: string;
  name: string;
  teacher_name: string;
}

export default function ClassSelector() {
  const { selectedClassId, setSelectedClassId } = useAdminStore();
  const [classes, setClasses] = useState<ClassOption[]>([]);

  useEffect(() => {
    fetch("/api/v1/admin/classes")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setClasses(data))
      .catch(() => {});
  }, []);

  return (
    <Select value={selectedClassId || ""} onValueChange={(v) => { if (v) setSelectedClassId(v); }}>
      <SelectTrigger className="w-72">
        <SelectValue placeholder="Select a class..." />
      </SelectTrigger>
      <SelectContent>
        {classes.map((c) => (
          <SelectItem key={c.id} value={c.id}>
            {c.name} — {c.teacher_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
