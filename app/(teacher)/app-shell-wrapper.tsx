"use client";

import { useEffect } from "react";
import AppShell from "@/components/shared/app-shell";
import { useClassStore } from "@/stores/class-store";

export default function AppShellWrapper({
  children,
  teacherName,
  classes,
}: {
  children: React.ReactNode;
  teacherName: string;
  classes: Array<{ id: string; name: string }>;
}) {
  const { activeClassId, setActiveClassId } = useClassStore();

  // Set default active class if none selected
  useEffect(() => {
    if (!activeClassId && classes.length > 0) {
      setActiveClassId(classes[0].id);
    }
  }, [activeClassId, classes, setActiveClassId]);

  return (
    <AppShell teacherName={teacherName} classes={classes}>
      {children}
    </AppShell>
  );
}
