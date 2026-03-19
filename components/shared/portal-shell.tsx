"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PortalShell({
  children,
  studentName,
  className,
  coinBalance,
  onLogout,
}: {
  children: React.ReactNode;
  studentName: string;
  className: string;
  coinBalance: number;
  onLogout: () => void;
}) {
  return (
    <div className="min-h-screen bg-cm-white">
      {/* Header */}
      <header className="bg-cm-surface border-b border-cm-border px-cm-6 py-cm-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-cm-label text-cm-text-primary">{studentName}</h1>
            <p className="text-cm-caption text-cm-text-secondary">{className}</p>
          </div>
          <div className="flex items-center gap-cm-4">
            <div className="flex items-center gap-cm-2 bg-cm-amber-light px-cm-3 py-cm-1 rounded-full">
              <span className="text-cm-caption font-medium text-cm-amber-dark">
                {coinBalance} coins
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onLogout}
              className="h-8 w-8 text-cm-text-hint hover:text-cm-coral"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto p-cm-6">
        {children}
      </main>
    </div>
  );
}
