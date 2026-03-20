import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createPortalSession } from "@/lib/stripe";
import { getSubscription } from "@/lib/subscription";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sub = await getSubscription(supabase, user.id);
  if (!sub?.stripe_customer_id) {
    return NextResponse.json({ error: "No active subscription to manage" }, { status: 400 });
  }

  const origin = new URL(request.url).origin;

  try {
    const url = await createPortalSession({
      customerId: sub.stripe_customer_id,
      returnUrl: `${origin}/settings`,
    });

    return NextResponse.json({ url });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
