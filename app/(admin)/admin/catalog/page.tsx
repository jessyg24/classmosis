"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const tabStyle = "data-[state=active]:border-b-2 data-[state=active]:border-cm-coral data-[state=active]:text-cm-coral rounded-none";

interface CatalogItem {
  id: string;
  key: string;
  label: string;
  category: string;
  icon: string;
  active: boolean;
  sort_order: number;
  [k: string]: unknown;
}

function CatalogTable({ type }: { type: "block-types" | "subroutine-types" }) {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/v1/admin/catalog/${type}`)
      .then((r) => r.json())
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [type]);

  const updateItem = async (id: string, field: string, value: unknown) => {
    const res = await fetch(`/api/v1/admin/catalog/${type}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    if (res.ok) {
      setItems((prev) => prev.map((i) => i.id === id ? { ...i, [field]: value } : i));
      toast.success("Updated");
    }
  };

  const toggleActive = async (id: string, active: boolean) => {
    if (!active) {
      await fetch(`/api/v1/admin/catalog/${type}/${id}`, { method: "DELETE" });
      setItems((prev) => prev.map((i) => i.id === id ? { ...i, active: false } : i));
      toast.success("Deactivated");
    } else {
      await updateItem(id, "active", true);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-8"><div className="h-6 w-6 border-2 border-cm-coral border-t-transparent rounded-full animate-spin" /></div>;
  }

  // Group by category
  const grouped: Record<string, CatalogItem[]> = {};
  for (const item of items) {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  }

  return (
    <div className="space-y-4">
      {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([category, categoryItems]) => (
        <div key={category}>
          <p className="text-cm-overline text-cm-text-hint uppercase mb-2">{category.replace(/_/g, " ")}</p>
          <div className="border border-cm-border rounded-cm-card divide-y divide-cm-border overflow-hidden">
            {categoryItems.map((item) => (
              <div key={item.id} className={`flex items-center gap-3 px-4 py-2 ${item.active ? "" : "opacity-40"}`}>
                <input
                  defaultValue={item.label}
                  className="flex-1 text-cm-body bg-transparent border-b border-transparent hover:border-cm-border focus:border-cm-coral focus:outline-none px-0 py-0.5"
                  onBlur={(e) => { if (e.target.value !== item.label) updateItem(item.id, "label", e.target.value); }}
                />
                <span className="text-[10px] text-cm-text-hint font-mono w-24 truncate">{item.key}</span>
                <input
                  defaultValue={item.icon}
                  className="w-20 text-cm-caption bg-transparent border-b border-transparent hover:border-cm-border focus:border-cm-coral focus:outline-none text-center"
                  onBlur={(e) => { if (e.target.value !== item.icon) updateItem(item.id, "icon", e.target.value); }}
                />
                <button
                  onClick={() => toggleActive(item.id, !item.active)}
                  className={`text-[10px] px-2 py-0.5 rounded-cm-badge ${item.active ? "bg-cm-green-light text-cm-green" : "bg-cm-coral-light text-cm-coral"}`}
                >
                  {item.active ? "Active" : "Inactive"}
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminCatalogPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-cm-title text-cm-text-primary">Block & Sub-routine Catalog</h1>
      <Card className="bg-cm-surface rounded-cm-card border-cm-border">
        <Tabs defaultValue="block-types" className="w-full">
          <TabsList className="w-full border-b border-cm-border rounded-none bg-transparent px-cm-4 pt-cm-2 gap-0">
            <TabsTrigger value="block-types" className={tabStyle}>Block Types</TabsTrigger>
            <TabsTrigger value="subroutine-types" className={tabStyle}>Sub-routine Types</TabsTrigger>
          </TabsList>
          <div className="p-cm-5">
            <TabsContent value="block-types" className="mt-0">
              <CatalogTable type="block-types" />
            </TabsContent>
            <TabsContent value="subroutine-types" className="mt-0">
              <CatalogTable type="subroutine-types" />
            </TabsContent>
          </div>
        </Tabs>
      </Card>
    </div>
  );
}
