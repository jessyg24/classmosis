import { NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { constructWebhookEvent } from "@/lib/stripe";
import type Stripe from "stripe";

export const dynamic = "force-dynamic";

type ServiceClient = SupabaseClient;

function getServiceClient(): ServiceClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = constructWebhookEvent(body, signature);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = getServiceClient();

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(supabase, event.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(supabase, event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(supabase, event.data.object as Stripe.Subscription);
        break;
      case "invoice.payment_failed":
        await handlePaymentFailed(supabase, event.data.object as Stripe.Invoice);
        break;
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    // Still return 200 to prevent Stripe from retrying
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(
  supabase: ServiceClient,
  session: Stripe.Checkout.Session
) {
  const teacherId = session.metadata?.teacher_id;
  if (!teacherId) return;

  const subscriptionId = typeof session.subscription === "string"
    ? session.subscription
    : session.subscription?.id;

  const customerId = typeof session.customer === "string"
    ? session.customer
    : session.customer?.id;

  await supabase
    .from("subscriptions")
    .upsert({
      teacher_id: teacherId,
      tier: "pro",
      status: "active",
      stripe_customer_id: customerId || null,
      stripe_subscription_id: subscriptionId || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "teacher_id" });
}

async function handleSubscriptionUpdated(
  supabase: ServiceClient,
  subscription: Stripe.Subscription
) {
  const teacherId = subscription.metadata?.teacher_id;

  // Find by stripe_subscription_id if no metadata
  const lookupField = teacherId ? "teacher_id" : "stripe_subscription_id";
  const lookupValue = teacherId || subscription.id;

  const status = subscription.status;
  const tier = (status === "active" || status === "trialing") ? "pro" : "free";
  const priceId = subscription.items?.data?.[0]?.price?.id || null;
  const interval = subscription.items?.data?.[0]?.price?.recurring?.interval || null;

  // Access period fields via raw object (SDK version may vary)
  const raw = subscription as unknown as Record<string, unknown>;
  const periodStart = typeof raw.current_period_start === "number" ? raw.current_period_start : null;
  const periodEnd = typeof raw.current_period_end === "number" ? raw.current_period_end : null;
  const trialEnd = typeof raw.trial_end === "number" ? raw.trial_end : null;

  await supabase
    .from("subscriptions")
    .update({
      tier,
      status,
      stripe_price_id: priceId,
      billing_interval: interval,
      current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      cancel_at_period_end: subscription.cancel_at_period_end ?? false,
      trial_ends_at: trialEnd ? new Date(trialEnd * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq(lookupField, lookupValue);
}

async function handleSubscriptionDeleted(
  supabase: ServiceClient,
  subscription: Stripe.Subscription
) {
  await supabase
    .from("subscriptions")
    .update({
      tier: "free",
      status: "canceled",
      cancel_at_period_end: false,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", subscription.id);
}

async function handlePaymentFailed(
  supabase: ServiceClient,
  invoice: Stripe.Invoice
) {
  const rawInvoice = invoice as unknown as Record<string, unknown>;
  const sub = rawInvoice.subscription;
  const subscriptionId = typeof sub === "string" ? sub : (sub as { id?: string })?.id;

  if (!subscriptionId) return;

  await supabase
    .from("subscriptions")
    .update({
      status: "past_due",
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", subscriptionId);
}
