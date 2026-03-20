"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Coins } from "lucide-react";

interface WalletData {
  balance: number;
  currencyName: string;
  currencyIcon: string;
  recentTransactions: Array<{
    id: string;
    amount: number;
    reason: string;
    created_at: string;
  }>;
  pendingPurchases: Array<{
    id: string;
    reward_store_items?: { title: string; icon: string };
  }>;
}

interface MyWalletProps {
  studentId: string;
}

export default function MyWallet({ studentId }: MyWalletProps) {
  const [data, setData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;

    const stored = localStorage.getItem("classmosis_student");
    const headers: Record<string, string> = {};
    if (stored) {
      try {
        const session = JSON.parse(stored);
        if (session.token) headers["Authorization"] = `Bearer ${session.token}`;
      } catch { /* ignore */ }
    }

    fetch("/api/v1/student/economy", { headers })
      .then((res) => (res.ok ? res.json() : null))
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [studentId]);

  return (
    <Card className="p-cm-6 bg-cm-surface rounded-cm-card border-cm-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-cm-3">
          <div className="w-8 h-8 bg-cm-amber-light rounded-cm-badge flex items-center justify-center">
            <Coins className="h-4 w-4 text-cm-amber" />
          </div>
          <span className="text-cm-overline text-cm-text-hint uppercase">My Wallet</span>
        </div>
        <Link href="/portal/store" className="text-cm-caption text-cm-amber hover:underline">
          Browse Store
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-4">
          <div className="h-6 w-6 border-2 border-cm-amber border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !data ? (
        <p className="text-cm-body text-cm-text-secondary">
          Your wallet will show up here once your teacher sets up the economy.
        </p>
      ) : (
        <div className="space-y-4">
          {/* Balance */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">{data.currencyIcon}</span>
            <span className="text-cm-section text-cm-amber-dark font-medium">
              {data.balance} {data.currencyName}
            </span>
          </div>

          {/* Pending purchases */}
          {data.pendingPurchases.length > 0 && (
            <div className="bg-cm-amber-light rounded-cm-badge px-3 py-2">
              <p className="text-cm-caption text-cm-amber-dark">
                Waiting for teacher: {data.pendingPurchases.map((p) =>
                  `${p.reward_store_items?.icon || "🎁"} ${p.reward_store_items?.title || "item"}`
                ).join(", ")}
              </p>
            </div>
          )}

          {/* Recent transactions */}
          {data.recentTransactions.length > 0 && (
            <div className="space-y-1">
              <p className="text-cm-overline text-cm-text-hint uppercase">Recent</p>
              {data.recentTransactions.slice(0, 3).map((txn) => (
                <div key={txn.id} className="flex items-center justify-between">
                  <span className="text-cm-caption text-cm-text-secondary truncate">{txn.reason}</span>
                  <span className={`shrink-0 text-cm-caption font-medium ${txn.amount > 0 ? "text-cm-green" : "text-cm-coral"}`}>
                    {txn.amount > 0 ? "+" : ""}{txn.amount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
