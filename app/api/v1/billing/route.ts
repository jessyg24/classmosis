import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSubscription } from "@/lib/subscription";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sub = await getSubscription(supabase, user.id);

  return NextResponse.json(sub || {
    tier: "free",
    status: "active",
    stripe_customer_id: null,
    stripe_subscription_id: null,
    billing_interval: null,
    current_period_end: null,
    cancel_at_period_end: false,
  });
}
