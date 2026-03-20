"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useStoreItems, useUpdateStoreItem } from "@/hooks/use-economy";
import StoreItemDialog from "./store-item-dialog";

interface StoreManagerProps {
  classId: string;
}

export default function StoreManager({ classId }: StoreManagerProps) {
  const { data: items, isLoading } = useStoreItems(classId);
  const updateMutation = useUpdateStoreItem(classId);
  const [addOpen, setAddOpen] = useState(false);

  const toggleActive = async (itemId: string, active: boolean) => {
    try {
      await updateMutation.mutateAsync({ itemId, data: { active } });
      toast.success(active ? "Reward activated" : "Reward deactivated");
    } catch {
      toast.error("Failed to update reward");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-6 w-6 border-2 border-cm-amber border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => setAddOpen(true)}
          className="bg-cm-amber hover:bg-cm-amber-dark text-white rounded-cm-button"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Reward
        </Button>
      </div>

      {(!items || items.length === 0) ? (
        <p className="text-cm-body text-cm-text-secondary py-8 text-center">
          No rewards yet. Create store items for students to spend their coins on!
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <Card
              key={item.id}
              className={`p-cm-5 rounded-cm-card border-cm-border transition-opacity ${
                item.active ? "bg-cm-surface" : "bg-cm-white opacity-60"
              }`}
            >
              <div className="flex items-start gap-cm-3">
                <span className="text-2xl">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-cm-label text-cm-text-primary">{item.title}</p>
                  {item.description && (
                    <p className="text-cm-caption text-cm-text-hint mt-0.5 truncate">{item.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 rounded-cm-badge bg-cm-amber-light text-cm-amber text-cm-overline font-medium">
                      {item.price} coins
                    </span>
                    {item.stock !== null && (
                      <span className="text-cm-caption text-cm-text-hint">
                        {item.stock} left
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => toggleActive(item.id, !item.active)}
                  className={`text-cm-caption hover:underline ${
                    item.active ? "text-cm-text-hint" : "text-cm-amber"
                  }`}
                >
                  {item.active ? "Deactivate" : "Activate"}
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <StoreItemDialog open={addOpen} onOpenChange={setAddOpen} classId={classId} />
    </div>
  );
}
