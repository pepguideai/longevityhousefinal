/* ============================================================
   CARD CHECKOUT  ·  Vercel function  ·  POST /api/create-checkout-session
   ------------------------------------------------------------
   Takes the cart from checkout.html, creates a Stripe Checkout
   Session for the embedded card form, and returns its client secret.
   Prices are looked up HERE (never trusted from the browser).
   ============================================================ */
const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-03-25.dahlia" });

/* One Stripe Price ID per coaching tier (ids match content/coaching.js).
   These are TEST-mode prices. Swap in the live-mode Price IDs when going live. */
const PRICES = {
  single: "price_1URyCXI5XoBOVWrEOiT3WM0Y",   // Single Session · $110
  twelve: "price_1URyFcI5XoBOVWrEEww2YaAG",   // The Twelve · $1,200
  circle: "price_1URyITI5XoBOVWrEMiiNVlNc",   // Coaching Circle · $10 per person
};

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { items, order = {} } = req.body || {};
  const line_items = (Array.isArray(items) ? items : [])
    .filter(i => PRICES[i.id] && Number.isInteger(i.qty) && i.qty > 0 && i.qty <= 20)
    .map(i => ({ price: PRICES[i.id], quantity: i.qty }));
  if (!line_items.length) return res.status(400).json({ error: "Your cart is empty." });

  const proto = req.headers["x-forwarded-proto"] || "https";
  const origin = `${proto}://${req.headers.host}`;
  const clip = v => String(v || "").slice(0, 490);   // Stripe metadata values max 500 chars

  try {
    const session = await stripe.checkout.sessions.create({
      ui_mode: "form",
      mode: "payment",
      line_items,
      billing_address_collection: "auto",
      phone_number_collection: { enabled: false },
      automatic_tax: { enabled: false },
      submit_type: "auto",
      integration_identifier: "custom_embedded_web_0001",
      return_url: `${origin}/checkout.html?session_id={CHECKOUT_SESSION_ID}`,
      customer_email: order.email || undefined,
      client_reference_id: clip(order.id) || undefined,
      metadata: { order: clip(order.id), name: clip(order.name), phone: clip(order.phone), note: clip(order.note) },
    });
    res.status(200).json({ client_secret: session.client_secret, publishable_key: process.env.STRIPE_PUBLISHABLE_KEY });
  } catch (err) {
    console.error("Stripe checkout session error:", err.message);
    /* err.code (e.g. "resource_missing") is safe to expose and makes problems diagnosable */
    res.status(500).json({ error: "We couldn’t start card checkout.", code: err.code || err.type || "unknown", param: err.param });
  }
};
