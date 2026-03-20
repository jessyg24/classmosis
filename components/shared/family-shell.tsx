"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FamilyShell({
  children,
  parentName,
  childName,
  onLogout,
}: {
  children: React.ReactNode;
  parentName: string;
  childName?: string;
  onLogout: () => void;
}) {
  return (
    <div className="min-h-screen bg-cm-white">
      {/* Header */}
      <header className="bg-cm-surface border-b border-cm-border px-cm-6 py-cm-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-cm-label text-cm-purple">Family Portal</h1>
            <p className="text-cm-caption text-cm-text-secondary">
              {parentName}
              {childName && <span> &middot; {childName}</span>}
            </p>
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
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto p-cm-6">
        {children}
      </main>
    </div>
  );
}
