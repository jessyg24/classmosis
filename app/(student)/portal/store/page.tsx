"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PortalShell from "@/components/shared/portal-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface StudentData {
  id: string;
  displayName: string;
  className: string;
  classId: string;
  coinBalance: number;
}

interface StoreItem {
  id: string;
  title: string;
  description: string | null;
  price: number;
  icon: string;
  stock: number | null;
}

interface EconomyData {
  balance: number;
  currencyName: string;
  currencyIcon: string;
  storeItems: StoreItem[];
  pendingPurchases: Array<{ id: string; item_id: string }>;
}

export default function StorePage() {
  const router = useRouter();
  const [student, setStudent] = useState<StudentData | null>(null);
  const [data, setData] = useState<EconomyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState<string | null>(null);

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
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [student]);

  const handlePurchase = async (item: StoreItem) => {
    if (!student || !data) return;
    setRequesting(item.id);

    try {
      const res = await fetch(`/api/v1/classes/${student.classId}/economy/purchases`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: student.id, item_id: item.id }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Could not request purchase");
        return;
      }

      toast.success("Purchase requested! Your teacher will review it.");
      // Refresh data
      const storedSession = localStorage.getItem("classmosis_student");
      const headers: Record<string, string> = {};
      if (storedSession) {
        try {
          const session = JSON.parse(storedSession);
          if (session.token) headers["Authorization"] = `Bearer ${session.token}`;
        } catch { /* ignore */ }
      }
      const refreshRes = await fetch("/api/v1/student/economy", { headers });
      if (refreshRes.ok) setData(await refreshRes.json());
    } catch {
      toast.error("Something went wrong");
    } finally {
      setRequesting(null);
    }
  };

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

  const pendingItemIds = new Set((data?.pendingPurchases || []).map((p) => p.item_id));

  return (
    <PortalShell
      studentName={student.displayName}
      className={student.className}
      coinBalance={data?.balance ?? student.coinBalance}
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-cm-section text-cm-text-primary">Reward Store</h2>
          <span className="text-cm-body text-cm-amber font-medium">
            {data?.currencyIcon || "🪙"} {data?.balance ?? 0} {data?.currencyName || "coins"}
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 border-2 border-cm-amber border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !data || data.storeItems.length === 0 ? (
          <Card className="p-cm-8 bg-cm-surface rounded-cm-card border-cm-border text-center">
            <p className="text-cm-body text-cm-text-secondary">
              No rewards available yet. Check back soon!
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.storeItems.map((item) => {
              const canAfford = data.balance >= item.price;
              const isPending = pendingItemIds.has(item.id);
              const outOfStock = item.stock !== null && item.stock <= 0;

              return (
                <Card key={item.id} className="p-cm-5 bg-cm-surface rounded-cm-card border-cm-border">
                  <div className="flex items-start gap-cm-3">
                    <span className="text-3xl">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-cm-label text-cm-text-primary">{item.title}</p>
                      {item.description && (
                        <p className="text-cm-caption text-cm-text-hint mt-0.5">{item.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-0.5 rounded-cm-badge bg-cm-amber-light text-cm-amber text-cm-overline font-medium">
                          {item.price} {data.currencyName}
                        </span>
                        {item.stock !== null && (
                          <span className="text-cm-caption text-cm-text-hint">{item.stock} left</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    {isPending ? (
                      <p className="text-cm-caption text-cm-amber">Waiting for teacher approval...</p>
                    ) : outOfStock ? (
                      <p className="text-cm-caption text-cm-text-hint">Out of stock</p>
                    ) : (
                      <Button
                        size="sm"
                        disabled={!canAfford || requesting === item.id}
                        onClick={() => handlePurchase(item)}
                        className="bg-cm-amber hover:bg-cm-amber-dark text-white"
                      >
                        {requesting === item.id ? "Requesting..." : canAfford ? "Request" : `Need ${item.price - data.balance} more!`}
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </PortalShell>
  );
}
