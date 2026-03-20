"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PortalShell from "@/components/shared/portal-shell";
import { Card } from "@/components/ui/card";

interface StudentData {
  id: string;
  displayName: string;
  className: string;
  classId: string;
  coinBalance: number;
}

interface Transaction {
  id: string;
  amount: number;
  balance_after: number;
  reason: string;
  category: string;
  created_at: string;
}

export default function TransactionsPage() {
  const router = useRouter();
  const [student, setStudent] = useState<StudentData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState(0);
  const [currencyIcon, setCurrencyIcon] = useState("🪙");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("classmosis_portal");
    if (!stored) { router.push("/portal"); return; }
    try { setStudent(JSON.parse(stored)); } catch { router.push("/portal"); }
  }, [router]);

  useEffect(() => {
    if (!student) return;
    const storedSession = localStorage.getItem("classmosis_student");
    const headers: Record<string, string> = {};
    if (storedSession) {
      try {
        const session = JSON.parse(storedSession);
        if (session.token) headers["Authorization"] = `Bearer ${session.token}`;
      } catch { /* ignore */ }
    }

    fetch("/api/v1/student/economy", { headers })
      .then((res) => (res.ok ? res.json() : null))
      .then((d) => {
        if (d) {
          setTransactions(d.recentTransactions || []);
          setBalance(d.balance);
          setCurrencyIcon(d.currencyIcon || "🪙");
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [student]);

  const handleLogout = () => {
    localStorage.removeItem("classmosis_portal");
    localStorage.removeItem("classmosis_student");
    document.cookie = "student_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    router.push("/portal");
  };

  if (!student) {
    return (
      <div className="min-h-screen bg-cm-white flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-cm-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <PortalShell
      studentName={student.displayName}
      className={student.className}
      coinBalance={balance}
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        <h2 className="text-cm-section text-cm-text-primary">Transaction History</h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 border-2 border-cm-amber border-t-transparent rounded-full animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <Card className="p-cm-8 bg-cm-surface rounded-cm-card border-cm-border text-center">
            <p className="text-cm-body text-cm-text-secondary">
              No transactions yet. Start earning coins!
            </p>
          </Card>
        ) : (
          <Card className="bg-cm-surface rounded-cm-card border-cm-border divide-y divide-cm-border">
            {transactions.map((txn) => (
              <div key={txn.id} className="flex items-center gap-cm-3 px-cm-5 py-cm-3">
                <div className="flex-1 min-w-0">
                  <p className="text-cm-body text-cm-text-primary">{txn.reason}</p>
                  <p className="text-cm-caption text-cm-text-hint">
                    {new Date(txn.created_at).toLocaleDateString(undefined, {
                      month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
                    })}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-cm-label font-medium tabular-nums ${
                    txn.amount > 0 ? "text-cm-green" : "text-cm-coral"
                  }`}
                >
                  {txn.amount > 0 ? "+" : ""}{txn.amount}
                </span>
                <span className="shrink-0 text-cm-caption text-cm-text-hint">
                  {currencyIcon} {txn.balance_after}
                </span>
              </div>
            ))}
          </Card>
        )}
      </div>
    </PortalShell>
  );
}
