"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ClassSelector from "@/components/admin/class-selector";
import { useAdminStore } from "@/stores/admin-store";

const tabStyle = "data-[state=active]:border-b-2 data-[state=active]:border-cm-coral data-[state=active]:text-cm-coral rounded-none";

export default function AdminEconomyPage() {
  const { selectedClassId } = useAdminStore();
  const [transactions, setTransactions] = useState<Array<Record<string, unknown>>>([]);
  const [store, setStore] = useState<Array<Record<string, unknown>>>([]);
  const [jobs, setJobs] = useState<Array<Record<string, unknown>>>([]);
  const [mystery, setMystery] = useState<Array<Record<string, unknown>>>([]);
  const [todos, setTodos] = useState<Array<Record<string, unknown>>>([]);

  useEffect(() => {
    if (!selectedClassId) return;
    const base = `/api/v1/admin/classes/${selectedClassId}/economy`;
    fetch(`${base}?section=transactions`).then((r) => r.json()).then(setTransactions).catch(() => {});
    fetch(`${base}?section=store`).then((r) => r.json()).then(setStore).catch(() => {});
    fetch(`${base}?section=jobs`).then((r) => r.json()).then(setJobs).catch(() => {});
    fetch(`${base}?section=mystery`).then((r) => r.json()).then(setMystery).catch(() => {});
    fetch(`${base}?section=todos`).then((r) => r.json()).then(setTodos).catch(() => {});
  }, [selectedClassId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-cm-title text-cm-text-primary">Economy Inspector</h1>
        <ClassSelector />
      </div>

      {!selectedClassId ? (
        <p className="text-cm-body text-cm-text-secondary">Select a class to inspect economy data.</p>
      ) : (
        <Card className="bg-cm-surface rounded-cm-card border-cm-border">
          <Tabs defaultValue="transactions" className="w-full">
            <TabsList className="w-full flex-wrap h-auto border-b border-cm-border rounded-none bg-transparent px-cm-4 pt-cm-2 gap-0">
              <TabsTrigger value="transactions" className={tabStyle}>Transactions ({transactions.length})</TabsTrigger>
              <TabsTrigger value="store" className={tabStyle}>Store ({store.length})</TabsTrigger>
              <TabsTrigger value="jobs" className={tabStyle}>Jobs ({jobs.length})</TabsTrigger>
              <TabsTrigger value="mystery" className={tabStyle}>Mystery ({mystery.length})</TabsTrigger>
              <TabsTrigger value="todos" className={tabStyle}>Todos ({todos.length})</TabsTrigger>
            </TabsList>
            <div className="p-cm-5 max-h-[600px] overflow-y-auto">
              <TabsContent value="transactions" className="mt-0">
                {transactions.map((t) => (
                  <div key={t.id as string} className="flex items-center gap-3 py-2 border-b border-cm-border last:border-0">
                    <span className="w-28 text-cm-caption text-cm-text-hint">{new Date(t.created_at as string).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span>
                    <span className="flex-1 text-cm-caption truncate">{(t.students as { display_name: string })?.display_name || "?"}</span>
                    <span className="text-cm-caption text-cm-text-hint truncate max-w-[200px]">{t.reason as string}</span>
                    <span className={`text-cm-caption font-medium tabular-nums ${(t.amount as number) > 0 ? "text-cm-green" : "text-cm-coral"}`}>{(t.amount as number) > 0 ? "+" : ""}{t.amount as number}</span>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="store" className="mt-0">
                {store.map((s) => (
                  <div key={s.id as string} className="flex items-center gap-3 py-2 border-b border-cm-border last:border-0">
                    <span className="text-lg">{s.icon as string}</span>
                    <span className="flex-1 text-cm-caption">{s.title as string}</span>
                    <span className="px-2 py-0.5 rounded-cm-badge bg-cm-amber-light text-cm-amber text-[10px] font-medium">{s.price as number} coins</span>
                    <span className="text-cm-caption text-cm-text-hint">{s.stock !== null ? `${s.stock} left` : "Unlimited"}</span>
                    <span className={`text-[10px] ${s.active ? "text-cm-green" : "text-cm-text-hint"}`}>{s.active ? "Active" : "Inactive"}</span>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="jobs" className="mt-0">
                {jobs.map((j) => (
                  <div key={j.id as string} className="flex items-center gap-3 py-2 border-b border-cm-border last:border-0">
                    <span className="flex-1 text-cm-caption font-medium">{j.title as string}</span>
                    <span className="px-2 py-0.5 rounded-cm-badge bg-cm-amber-light text-cm-amber text-[10px]">{j.coin_multiplier as number}x</span>
                    <span className="text-cm-caption text-cm-text-secondary">{(j.students as { display_name: string })?.display_name || "Unassigned"}</span>
                    <span className="text-[10px] text-cm-text-hint">{j.rotation as string}</span>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="mystery" className="mt-0">
                {mystery.map((m) => (
                  <div key={m.id as string} className="flex items-center gap-3 py-2 border-b border-cm-border last:border-0">
                    <span className="w-20 text-cm-caption text-cm-text-hint">{m.date as string}</span>
                    <span className="flex-1 text-cm-caption">{(m.students as { display_name: string })?.display_name || "?"}</span>
                    <span className="text-cm-caption text-cm-amber">{m.multiplier as number}x</span>
                    <span className="text-cm-caption text-cm-green font-medium">+{m.bonus_payout as number}</span>
                    <span className="text-[10px] text-cm-text-hint">{m.revealed_at ? "Revealed" : "Hidden"}</span>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="todos" className="mt-0">
                {todos.map((t) => (
                  <div key={t.id as string} className="flex items-center gap-3 py-2 border-b border-cm-border last:border-0">
                    <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${Boolean(t.completed) ? "border-cm-green bg-cm-green-light" : "border-cm-border"}`}>
                      {Boolean(t.completed) && <span className="w-2 h-2 rounded-full bg-cm-green" />}
                    </span>
                    <span className="flex-1 text-cm-caption">{String(t.title)}</span>
                    <span className="text-cm-caption text-cm-text-hint">{(t.students as { display_name: string })?.display_name || "?"}</span>
                    {Boolean(t.coin_eligible) && <span className="text-cm-caption text-cm-amber">🪙 {String(t.coins_on_complete)}</span>}
                  </div>
                ))}
              </TabsContent>
            </div>
          </Tabs>
        </Card>
      )}
    </div>
  );
}
