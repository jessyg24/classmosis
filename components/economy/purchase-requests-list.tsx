"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { usePurchaseRequests, useResolvePurchase, useFulfillPurchase } from "@/hooks/use-economy";
import type { PurchaseRequest } from "@/types/database";

interface PurchaseRequestsListProps {
  classId: string;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-cm-amber-light text-cm-amber",
  approved: "bg-cm-green-light text-cm-green",
  denied: "bg-cm-coral-light text-cm-coral",
  cancelled: "bg-cm-white text-cm-text-hint",
};

export default function PurchaseRequestsList({ classId }: PurchaseRequestsListProps) {
  const { data: requests, isLoading } = usePurchaseRequests(classId);
  const resolveMutation = useResolvePurchase(classId);
  const fulfillMutation = useFulfillPurchase(classId);

  const handleResolve = async (purchaseId: string, status: "approved" | "denied") => {
    try {
      await resolveMutation.mutateAsync({ purchaseId, status });
      toast.success(status === "approved" ? "Purchase approved!" : "Not this time");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to resolve");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-6 w-6 border-2 border-cm-amber border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <p className="text-cm-body text-cm-text-secondary py-8 text-center">
        No purchase requests yet.
      </p>
    );
  }

  return (
    <div className="divide-y divide-cm-border">
      {(requests as (PurchaseRequest & { students?: { display_name: string }; reward_store_items?: { title: string; icon: string } })[]).map((req) => (
        <div key={req.id} className="flex items-center gap-cm-3 py-cm-3">
          <span className="text-lg">{req.reward_store_items?.icon || "🎁"}</span>
          <div className="flex-1 min-w-0">
            <p className="text-cm-body text-cm-text-primary">
              {req.students?.display_name || "Student"} wants{" "}
              <span className="font-medium">{req.reward_store_items?.title || "item"}</span>
            </p>
            <p className="text-cm-caption text-cm-text-hint">
              {req.price_at_request} coins &middot;{" "}
              {new Date(req.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
            </p>
          </div>
          <span className={`shrink-0 px-2 py-0.5 rounded-cm-badge text-cm-overline font-medium ${STATUS_STYLES[req.status] || ""}`}>
            {req.status === "denied" ? "Not this time" : req.status}
          </span>
          {req.status === "approved" && !(req as unknown as { fulfilled: boolean }).fulfilled && (
            <Button
              size="sm"
              onClick={async () => {
                try { await fulfillMutation.mutateAsync(req.id); toast.success("Marked as fulfilled"); }
                catch { toast.error("Failed"); }
              }}
              disabled={fulfillMutation.isPending}
              className="shrink-0 bg-cm-green hover:bg-cm-green-dark text-white h-7 px-2 text-cm-caption"
            >
              Fulfill
            </Button>
          )}
          {req.status === "approved" && (req as unknown as { fulfilled: boolean }).fulfilled && (
            <span className="shrink-0 px-2 py-0.5 rounded-cm-badge bg-cm-green-light text-cm-green text-cm-overline font-medium">
              Fulfilled
            </span>
          )}
          {req.status === "pending" && (
            <div className="shrink-0 flex gap-1">
              <Button
                size="sm"
                onClick={() => handleResolve(req.id, "approved")}
                disabled={resolveMutation.isPending}
                className="bg-cm-amber hover:bg-cm-amber-dark text-white h-7 px-2 text-cm-caption"
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleResolve(req.id, "denied")}
                disabled={resolveMutation.isPending}
                className="border-cm-coral text-cm-coral hover:bg-cm-coral-light h-7 px-2 text-cm-caption"
              >
                Deny
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
