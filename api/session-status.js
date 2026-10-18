/* ============================================================
   CARD CHECKOUT  ·  Vercel function  ·  GET /api/session-status?session_id=...
   ------------------------------------------------------------
   After Stripe sends the client back to checkout.html, the page
   asks this endpoint whether the payment actually went through.
   ============================================================ */
const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-03-25.dahlia" });

module.exports = async (req, res) => {
  const id = req.query.session_id;
  if (!id || !/^cs_/.test(id)) return res.status(400).json({ error: "Missing session_id" });
  try {
    const s = await stripe.checkout.sessions.retrieve(id);
    res.status(200).json({
      status: s.status,                    // "complete" | "open" | "expired"
      payment_status: s.payment_status,    // "paid" | "unpaid" | ...
      order: s.client_reference_id,
      email: s.customer_details?.email || s.customer_email,
      amount_total: s.amount_total,
    });
  } catch (err) {
    console.error("Stripe session lookup error:", err.message);
    res.status(500).json({ error: "Couldn't look up that payment.", code: err.code || err.type || "unknown" });
  }
};
