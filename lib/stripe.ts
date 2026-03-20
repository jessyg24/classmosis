import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY not configured");
    _stripe = new Stripe(key);
  }
  return _stripe;
}

export async function createCheckoutSession(params: {
  customerId?: string;
  customerEmail: string;
  priceId: string;
  teacherId: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<string> {
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: params.customerId || undefined,
    customer_email: params.customerId ? undefined : params.customerEmail,
    line_items: [{ price: params.priceId, quantity: 1 }],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    subscription_data: {
      trial_period_days: 7,
      metadata: { teacher_id: params.teacherId },
    },
    metadata: { teacher_id: params.teacherId },
  });

  if (!session.url) throw new Error("Failed to create checkout session");
  return session.url;
}

export async function createPortalSession(params: {
  customerId: string;
  returnUrl: string;
}): Promise<string> {
  const stripe = getStripe();

  const session = await stripe.billingPortal.sessions.create({
    customer: params.customerId,
    return_url: params.returnUrl,
  });

  return session.url;
}

export function constructWebhookEvent(
  body: string,
  signature: string
): Stripe.Event {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET not configured");
  return stripe.webhooks.constructEvent(body, signature, secret);
}
