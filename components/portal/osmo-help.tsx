"use client";

import { useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";

/**
 * Osmo Help Bubble — floating help button on the student portal.
 * Students can ask Osmo for help, explanations, or encouragement.
 */
export default function OsmoHelp() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating Osmo button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50 overflow-hidden border-2 border-cm-pink"
        title="Ask Osmo for help"
      >
        <Image src="/osmo.png" alt="Ask Osmo" width={56} height={56} className="w-full h-full object-cover" />
      </button>

      {/* Help panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-72">
          <Card className="p-cm-5 bg-cm-surface rounded-cm-card border-cm-border shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Image src="/osmo.png" alt="Osmo" width={28} height={28} className="rounded-full" />
                <span className="text-cm-label text-cm-pink">Osmo</span>
              </div>
              <button onClick={() => setOpen(false)} className="text-cm-text-hint hover:text-cm-text-primary">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-cm-body text-cm-text-secondary mb-3">
              Hey there! I&apos;m Osmo, your learning buddy. How can I help?
            </p>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 rounded-cm-button bg-cm-pink-light text-cm-pink-dark text-cm-caption hover:bg-cm-pink/20 transition-colors">
                I don&apos;t understand this question
              </button>
              <button className="w-full text-left px-3 py-2 rounded-cm-button bg-cm-pink-light text-cm-pink-dark text-cm-caption hover:bg-cm-pink/20 transition-colors">
                Can you explain this differently?
              </button>
              <button className="w-full text-left px-3 py-2 rounded-cm-button bg-cm-pink-light text-cm-pink-dark text-cm-caption hover:bg-cm-pink/20 transition-colors">
                Give me a hint
              </button>
              <button className="w-full text-left px-3 py-2 rounded-cm-button bg-cm-pink-light text-cm-pink-dark text-cm-caption hover:bg-cm-pink/20 transition-colors">
                I need encouragement
              </button>
            </div>
            <p className="text-[10px] text-cm-text-hint mt-3 text-center">
              Osmo is here to help you learn — not give you answers!
            </p>
          </Card>
        </div>
      )}
    </>
  );
}
