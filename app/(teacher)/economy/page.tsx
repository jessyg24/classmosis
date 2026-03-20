"use client";

import { useEffect, useState } from "react";
import { Coins, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useClassStore } from "@/stores/class-store";
import { createClient } from "@/lib/supabase/client";
import TransactionList from "@/components/economy/transaction-list";
import StoreManager from "@/components/economy/store-manager";
import PurchaseRequestsList from "@/components/economy/purchase-requests-list";
import EconomySettingsForm from "@/components/economy/economy-settings-form";
import AwardDialog from "@/components/economy/award-dialog";

export default function EconomyPage() {
  const { activeClassId } = useClassStore();
  const [awardOpen, setAwardOpen] = useState(false);
  const [students, setStudents] = useState<Array<{ id: string; display_name: string }>>([]);

  useEffect(() => {
    if (!activeClassId) return;
    const supabase = createClient();
    supabase
      .from("students")
      .select("id, display_name")
      .eq("class_id", activeClassId)
      .is("archived_at", null)
      .order("display_name")
      .then(({ data }) => setStudents(data || []));
  }, [activeClassId]);

  if (!activeClassId) {
    return (
      <div className="text-cm-body text-cm-text-secondary">
        Select a class to manage the economy.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-cm-3">
          <div className="w-10 h-10 bg-cm-amber-light rounded-cm-button flex items-center justify-center">
            <Coins className="h-5 w-5 text-cm-amber" />
          </div>
          <h1 className="text-cm-title text-cm-text-primary">Economy</h1>
        </div>
        <Button
          onClick={() => setAwardOpen(true)}
          className="bg-cm-amber hover:bg-cm-amber-dark text-white rounded-cm-button"
        >
          <Plus className="h-4 w-4 mr-1" />
          Award Coins
        </Button>
      </div>

      {/* Tabs */}
      <Card className="bg-cm-surface rounded-cm-card border-cm-border">
        <Tabs defaultValue="transactions" className="w-full">
          <TabsList className="w-full border-b border-cm-border rounded-none bg-transparent px-cm-4 pt-cm-2">
            <TabsTrigger
              value="transactions"
              className="data-[state=active]:border-b-2 data-[state=active]:border-cm-amber data-[state=active]:text-cm-amber-dark rounded-none"
            >
              Transactions
            </TabsTrigger>
            <TabsTrigger
              value="store"
              className="data-[state=active]:border-b-2 data-[state=active]:border-cm-amber data-[state=active]:text-cm-amber-dark rounded-none"
            >
              Store
            </TabsTrigger>
            <TabsTrigger
              value="requests"
              className="data-[state=active]:border-b-2 data-[state=active]:border-cm-amber data-[state=active]:text-cm-amber-dark rounded-none"
            >
              Requests
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:border-b-2 data-[state=active]:border-cm-amber data-[state=active]:text-cm-amber-dark rounded-none"
            >
              Settings
            </TabsTrigger>
          </TabsList>

          <div className="p-cm-5">
            <TabsContent value="transactions" className="mt-0">
              <TransactionList classId={activeClassId} />
            </TabsContent>

            <TabsContent value="store" className="mt-0">
              <StoreManager classId={activeClassId} />
            </TabsContent>

            <TabsContent value="requests" className="mt-0">
              <PurchaseRequestsList classId={activeClassId} />
            </TabsContent>

            <TabsContent value="settings" className="mt-0">
              <EconomySettingsForm classId={activeClassId} />
            </TabsContent>
          </div>
        </Tabs>
      </Card>

      {/* Award Dialog */}
      <AwardDialog
        open={awardOpen}
        onOpenChange={setAwardOpen}
        classId={activeClassId}
        students={students}
      />
    </div>
  );
}
