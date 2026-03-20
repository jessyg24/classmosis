"use client";

import { useTransactions } from "@/hooks/use-economy";
import type { EconomyTransaction } from "@/types/database";

interface TransactionListProps {
  classId: string;
}

export default function TransactionList({ classId }: TransactionListProps) {
  const { data: transactions, isLoading } = useTransactions(classId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-6 w-6 border-2 border-cm-amber border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <p className="text-cm-body text-cm-text-secondary py-8 text-center">
        No transactions yet. Award coins to get started!
      </p>
    );
  }

  return (
    <div className="divide-y divide-cm-border">
      {(transactions as (EconomyTransaction & { students?: { display_name: string } })[]).map((txn) => (
        <div key={txn.id} className="flex items-center gap-cm-3 py-cm-3">
          <div className="flex-1 min-w-0">
            <p className="text-cm-body text-cm-text-primary truncate">
              {txn.students?.display_name || "Student"}
            </p>
            <p className="text-cm-caption text-cm-text-hint truncate">{txn.reason}</p>
          </div>
          <span className="shrink-0 px-2 py-0.5 rounded-cm-badge text-cm-overline bg-cm-white text-cm-text-hint">
            {txn.category}
          </span>
          <span
            className={`shrink-0 text-cm-label font-medium tabular-nums ${
              txn.amount > 0 ? "text-cm-green" : "text-cm-coral"
            }`}
          >
            {txn.amount > 0 ? "+" : ""}{txn.amount}
          </span>
          <span className="shrink-0 text-cm-caption text-cm-text-hint w-16 text-right">
            {new Date(txn.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </span>
        </div>
      ))}
    </div>
  );
}
