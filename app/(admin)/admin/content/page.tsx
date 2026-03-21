"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

const tabStyle = "data-[state=active]:border-b-2 data-[state=active]:border-cm-coral data-[state=active]:text-cm-coral rounded-none";

function ContentTable({ endpoint, columns }: { endpoint: string; columns: Array<{ key: string; label: string }> }) {
  const [items, setItems] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/v1/admin/content/${endpoint}`)
      .then((r) => r.json())
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [endpoint]);

  const deleteItem = async (id: string) => {
    const res = await fetch(`/api/v1/admin/content/${endpoint}/${id}`, { method: "DELETE" });
    if (res.ok) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success("Deleted");
    }
  };

  const updateItem = async (id: string, field: string, value: unknown) => {
    const res = await fetch(`/api/v1/admin/content/${endpoint}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    if (res.ok) {
      setItems((prev) => prev.map((i) => i.id === id ? { ...i, [field]: value } : i));
      toast.success("Updated");
    }
  };

  if (loading) {
    return <div className="flex justify-center py-8"><div className="h-6 w-6 border-2 border-cm-coral border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-cm-caption">
        <thead>
          <tr className="border-b border-cm-border bg-cm-white">
            {columns.map((col) => (
              <th key={col.key} className="text-left px-3 py-2 text-cm-text-hint font-medium">{col.label}</th>
            ))}
            <th className="w-10"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-cm-border">
          {items.map((item) => (
            <tr key={String(item.id)} className="hover:bg-cm-white">
              {columns.map((col) => (
                <td key={col.key} className="px-3 py-2">
                  <input
                    defaultValue={String(item[col.key] ?? "")}
                    className="w-full bg-transparent text-cm-caption border-b border-transparent hover:border-cm-border focus:border-cm-coral focus:outline-none"
                    onBlur={(e) => {
                      if (e.target.value !== String(item[col.key] ?? "")) {
                        updateItem(String(item.id), col.key, e.target.value);
                      }
                    }}
                  />
                </td>
              ))}
              <td className="px-3 py-2">
                <button onClick={() => deleteItem(String(item.id))} className="text-cm-text-hint hover:text-cm-coral">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {items.length === 0 && <p className="text-cm-body text-cm-text-hint text-center py-8">No items yet</p>}
    </div>
  );
}

export default function AdminContentPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-cm-title text-cm-text-primary">Content Banks</h1>
      <Card className="bg-cm-surface rounded-cm-card border-cm-border">
        <Tabs defaultValue="problems" className="w-full">
          <TabsList className="w-full flex-wrap h-auto border-b border-cm-border rounded-none bg-transparent px-cm-4 pt-cm-2 gap-0">
            <TabsTrigger value="problems" className={tabStyle}>Problem Bank</TabsTrigger>
            <TabsTrigger value="rubrics" className={tabStyle}>Rubric Templates</TabsTrigger>
            <TabsTrigger value="brain-breaks" className={tabStyle}>Brain Breaks</TabsTrigger>
            <TabsTrigger value="feedback" className={tabStyle}>Feedback Templates</TabsTrigger>
          </TabsList>
          <div className="p-cm-5">
            <TabsContent value="problems" className="mt-0">
              <ContentTable
                endpoint="problem-bank"
                columns={[
                  { key: "prompt", label: "Prompt" },
                  { key: "subject", label: "Subject" },
                  { key: "grade_band", label: "Grade" },
                  { key: "question_type", label: "Type" },
                  { key: "difficulty", label: "Difficulty" },
                  { key: "correct_answer", label: "Answer" },
                ]}
              />
            </TabsContent>
            <TabsContent value="rubrics" className="mt-0">
              <ContentTable
                endpoint="rubric-templates"
                columns={[
                  { key: "title", label: "Title" },
                  { key: "subject", label: "Subject" },
                  { key: "grade_band", label: "Grade" },
                  { key: "assignment_type", label: "Type" },
                  { key: "total_points", label: "Points" },
                ]}
              />
            </TabsContent>
            <TabsContent value="brain-breaks" className="mt-0">
              <ContentTable
                endpoint="brain-breaks"
                columns={[
                  { key: "title", label: "Title" },
                  { key: "description", label: "Description" },
                  { key: "category", label: "Category" },
                  { key: "duration_minutes", label: "Duration" },
                ]}
              />
            </TabsContent>
            <TabsContent value="feedback" className="mt-0">
              <ContentTable
                endpoint="feedback-templates"
                columns={[
                  { key: "template", label: "Template Text" },
                  { key: "subject", label: "Subject" },
                  { key: "grade_band", label: "Grade" },
                  { key: "score_range", label: "Score Range" },
                ]}
              />
            </TabsContent>
          </div>
        </Tabs>
      </Card>
    </div>
  );
}
