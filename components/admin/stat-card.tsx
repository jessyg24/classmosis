"use client";

import { Card } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
}

export default function StatCard({ label, value, icon: Icon }: StatCardProps) {
  return (
    <Card className="p-cm-5 bg-cm-surface rounded-cm-card border-cm-border">
      <div className="flex items-center gap-cm-3">
        <div className="w-10 h-10 bg-cm-coral-light rounded-cm-button flex items-center justify-center">
          <Icon className="h-5 w-5 text-cm-coral" />
        </div>
        <div>
          <p className="text-cm-caption text-cm-text-hint uppercase tracking-wider">{label}</p>
          <p className="text-cm-section text-cm-text-primary">{value}</p>
        </div>
      </div>
    </Card>
  );
}
