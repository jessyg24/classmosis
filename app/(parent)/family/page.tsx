"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ChevronRight, AlertCircle } from "lucide-react";
import FamilyShell from "@/components/shared/family-shell";
import { useChildren } from "@/hooks/use-parent";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export default function FamilyDashboard() {
  const router = useRouter();
  const { data: children, isLoading } = useChildren();
  const [parentName, setParentName] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setParentName(user?.user_metadata?.display_name || "Parent");
    });
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <FamilyShell parentName={parentName} onLogout={handleLogout}>
      <div className="space-y-6">
        <h2 className="text-cm-section text-cm-text-primary">Your Children</h2>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 border-2 border-cm-purple border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !children || children.length === 0 ? (
          <Card className="p-cm-8 bg-cm-surface rounded-cm-card border-cm-border text-center">
            <p className="text-cm-body text-cm-text-secondary">
              No children linked to your account yet. Your child&apos;s teacher will send you an invite link.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {children.map((child) => (
              <Link key={child.student_id} href={`/family/${child.student_id}`}>
                <Card className="p-cm-5 bg-cm-surface rounded-cm-card border-cm-border hover:border-cm-purple transition-colors cursor-pointer">
                  <div className="flex items-center gap-cm-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-cm-label text-cm-text-primary">{child.student_name}</p>
                        <span className="text-cm-caption text-cm-text-hint">{child.class_name}</span>
                      </div>

                      <div className="flex items-center gap-4 mt-2">
                        {child.avg_grade !== null && (
                          <span className="text-cm-caption text-cm-text-secondary">
                            Grade: <span className="font-medium text-cm-text-primary">{child.avg_grade}%</span>
                          </span>
                        )}
                        {child.coin_balance !== null && (
                          <span className="text-cm-caption text-cm-amber">
                            🪙 {child.coin_balance}
                          </span>
                        )}
                        {(child.missing_count || 0) > 0 && (
                          <span className="flex items-center gap-1 text-cm-caption text-cm-coral">
                            <AlertCircle className="h-3 w-3" />
                            {child.missing_count} missing
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-cm-text-hint shrink-0" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </FamilyShell>
  );
}
