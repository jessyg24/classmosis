"use client";

import { Card } from "@/components/ui/card";

interface LeaderboardProps {
  entries: Array<{ id: string; display_name: string; coin_balance: number }> | null;
  currentStudentId: string;
  currencyIcon: string;
}

export default function Leaderboard({ entries, currentStudentId, currencyIcon }: LeaderboardProps) {
  if (!entries || entries.length === 0) return null;

  return (
    <Card className="p-cm-6 bg-cm-surface rounded-cm-card border-cm-border">
      <p className="text-cm-overline text-cm-text-hint uppercase mb-3">Class Standings</p>
      <div className="space-y-2">
        {entries.map((entry, i) => {
          const isMe = entry.id === currentStudentId;
          return (
            <div
              key={entry.id}
              className={`flex items-center gap-cm-3 px-cm-3 py-cm-2 rounded-cm-button ${
                isMe ? "bg-cm-amber-light" : ""
              }`}
            >
              <span className="w-6 text-cm-caption text-cm-text-hint text-center font-medium">
                {i + 1}
              </span>
              <span className={`flex-1 text-cm-body ${isMe ? "text-cm-amber-dark font-medium" : "text-cm-text-secondary"}`}>
                {entry.display_name}
                {isMe && " (you)"}
              </span>
              <span className="text-cm-caption text-cm-amber font-medium">
                {currencyIcon} {entry.coin_balance}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
