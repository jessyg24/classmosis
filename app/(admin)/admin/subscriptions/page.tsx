"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface Sub {
  id: string;
  teacher_id: string;
  teacher_email: string;
  teacher_name: string;
  tier: string;
  status: string;
  billing_interval: string | null;
  stripe_customer_id: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

export default function AdminSubscriptionsPage() {
  const [subs, setSubs] = useState<Sub[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/admin/subscriptions")
      .then((r) => r.json())
      .then(setSubs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const overrideTier = async (subId: string, tier: string) => {
    const res = await fetch(`/api/v1/admin/subscriptions/${subId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier }),
    });
    if (res.ok) {
      setSubs((prev) => prev.map((s) => s.id === subId ? { ...s, tier } : s));
      toast.success(`Tier overridden to ${tier}`);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-cm-title text-cm-text-primary">Subscriptions & Billing</h1>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 border-2 border-cm-coral border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <Card className="bg-cm-surface rounded-cm-card border-cm-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-cm-caption">
              <thead>
                <tr className="border-b border-cm-border bg-cm-white">
                  <th className="text-left px-4 py-3 text-cm-text-hint font-medium">Teacher</th>
                  <th className="text-left px-4 py-3 text-cm-text-hint font-medium">Email</th>
                  <th className="text-left px-4 py-3 text-cm-text-hint font-medium">Tier</th>
                  <th className="text-left px-4 py-3 text-cm-text-hint font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-cm-text-hint font-medium">Interval</th>
                  <th className="text-left px-4 py-3 text-cm-text-hint font-medium">Stripe ID</th>
                  <th className="text-left px-4 py-3 text-cm-text-hint font-medium">Period End</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cm-border">
                {subs.map((s) => (
                  <tr key={s.id} className="hover:bg-cm-white">
                    <td className="px-4 py-3 font-medium text-cm-text-primary">{s.teacher_name}</td>
                    <td className="px-4 py-3 text-cm-text-secondary">{s.teacher_email}</td>
                    <td className="px-4 py-3">
                      <select
                        value={s.tier}
                        onChange={(e) => overrideTier(s.id, e.target.value)}
                        className={`px-2 py-0.5 rounded-cm-badge text-[10px] font-medium border-0 cursor-pointer ${
                          s.tier === "pro" ? "bg-cm-teal-light text-cm-teal-dark" : "bg-cm-white text-cm-text-hint"
                        }`}
                      >
                        <option value="free">Free</option>
                        <option value="pro">Pro</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                        s.status === "active" ? "bg-cm-green-light text-cm-green" :
                        s.status === "trialing" ? "bg-cm-amber-light text-cm-amber" :
                        "bg-cm-coral-light text-cm-coral"
                      }`}>{s.status}</span>
                    </td>
                    <td className="px-4 py-3 text-cm-text-hint">{s.billing_interval || "—"}</td>
                    <td className="px-4 py-3 text-cm-text-hint font-mono text-[10px]">{s.stripe_customer_id?.slice(0, 12) || "—"}</td>
                    <td className="px-4 py-3 text-cm-text-hint">
                      {s.current_period_end ? new Date(s.current_period_end).toLocaleDateString() : "—"}
                      {s.cancel_at_period_end && <span className="text-cm-coral ml-1">(canceling)</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
