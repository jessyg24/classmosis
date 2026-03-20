import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod/v4";
import { createCheckoutSession } from "@/lib/stripe";
import { getSubscription } from "@/lib/subscription";

const checkoutSchema = z.object({
  price_id: z.string().min(1),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues }, { status: 400 });

  const sub = await getSubscription(supabase, user.id);
  const origin = new URL(request.url).origin;

  try {
    const url = await createCheckoutSession({
      customerId: sub?.stripe_customer_id || undefined,
      customerEmail: user.email || "",
      priceId: parsed.data.price_id,
      teacherId: user.id,
      successUrl: `${origin}/settings?checkout=success`,
      cancelUrl: `${origin}/settings?checkout=canceled`,
    });

    return NextResponse.json({ url });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
