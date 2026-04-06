import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PRICE_IDS: Record<string, string> = {
  standard: process.env.STRIPE_STANDARD_PRICE_ID!,
  pro: process.env.STRIPE_PRO_PRICE_ID!,
};

export async function POST(req: NextRequest) {
  const { planType } = await req.json().catch(() => ({}));

  if (planType !== "standard" && planType !== "pro") {
    return NextResponse.json({ error: "invalid planType" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const priceId = PRICE_IDS[planType];
  if (!priceId || priceId.startsWith("price_YOUR")) {
    return NextResponse.json({ error: "price not configured" }, { status: 500 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/pricing?success=true`,
      cancel_url: `${baseUrl}/pricing`,
      customer_email: user.email,
      metadata: { userId: user.id, planType },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Stripe error";
    console.error("Stripe checkout error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }

  if (!session.url) {
    return NextResponse.json({ error: "checkout URL not available" }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
