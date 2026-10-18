# Stripe card checkout — setup and next steps

Checkout now takes **credit/debit cards** through Stripe's embedded payment form. **Zelle** is still there as the second option. This file lists everything left to do before cards work on the live site.

---

## Values to Replace

These values are placeholders. Update them before going live.

**Files containing placeholders:**
- [api/create-checkout-session.js](api/create-checkout-session.js)
- [.env.example](.env.example) (template only; put the real keys in Vercel)

| Field | Current Value | What to Set |
|-------|--------------|-------------|
| mode | payment | Keep `"payment"`: all three coaching tiers are one-time charges. Change it to `"subscription"` only if you later sell recurring plans. In that case also add `payment_method_collection: "always"` and use recurring Prices. |
| line_items[].price → `PRICES.single` | price_... | The Stripe Price ID for **Single Session ($110)**. |
| line_items[].price → `PRICES.twelve` | price_... | The Stripe Price ID for **The Twelve ($1,200)**. |
| line_items[].price → `PRICES.circle` | price_... | The Stripe Price ID for **Coaching Circle ($10)**. |
| STRIPE_PUBLISHABLE_KEY | pk_test_... | Your publishable key (https://dashboard.stripe.com/test/apikeys). |
| STRIPE_SECRET_KEY | sk_test_... | Your secret key, from the same page. |

**Creating the Prices:** in the Stripe Dashboard go to **Product catalog → + Add product** (https://dashboard.stripe.com/products). Create one product per tier and give each a **one-time** price. Copy each Price ID (it starts with `price_`) into `PRICES` in `api/create-checkout-session.js`.

> ⚠️ The prices in `content/coaching.js` are only what the site *displays*. What the client is actually charged comes from the Stripe Price. If you change a price, change it in **both** places.

---

## Configured Parameters

These parameters were set in Checkout Studio and are already correct.

**Files containing these parameters:**
- [api/create-checkout-session.js](api/create-checkout-session.js)

| Parameter | Value |
|-----------|-------|
| ui_mode | form |
| billing_address_collection | auto |
| phone_number_collection | `{ enabled: false }` |
| automatic_tax | `{ enabled: false }` |
| submit_type | auto |
| integration_identifier | custom_embedded_web_0001 |
| payment_method_collection | always (left out because `mode` is `payment`; it only applies to subscriptions) |

The endpoint also sets `return_url`, `customer_email`, `client_reference_id` (the LH order number) and `metadata` (name, phone, note). Together these tie each Stripe payment to the order in the Google Sheet.

Client-side appearance (theme `stripe`, spaced inputs, `#0570de` primary color) is set in [assets/js/render.js](assets/js/render.js) under `appearance`.

---

## Setup

1. **Add the keys to Vercel:** Project → **Settings → Environment Variables**.
   - `STRIPE_PUBLISHABLE_KEY` = `pk_test_…`
   - `STRIPE_SECRET_KEY` = `sk_test_…`

   Use the **test** keys first. Switch both to the `pk_live_` / `sk_live_` keys once a test payment works end to end. Redeploy after changing environment variables.
2. **Fill in the Price IDs** (see the table above), then commit and push. Vercel installs the `stripe` dependency from `package.json` automatically.
3. **Optional local testing:** install the Vercel CLI (`npm i -g vercel`), copy `.env.example` to `.env.local`, fill in the keys, then run `vercel dev` and open http://localhost:3000/checkout.html. Opening the HTML file directly won't work, because the card form needs the `/api` functions running.

Nothing to install for Stripe.js: `checkout.html` loads it from `https://js.stripe.com/dahlia/stripe.js`. Stripe requires that; never bundle or self-host it.

Versions: Stripe Node SDK `^23.0.0`, server API version pinned to `2026-03-25.dahlia` to match Stripe.js Dahlia.

---

## New and changed files

```
api/
  create-checkout-session.js   NEW  POST: builds the Checkout Session, returns { client_secret, publishable_key }
  session-status.js            NEW  GET ?session_id=…: confirms the payment after Stripe redirects back
package.json                   NEW  declares the stripe dependency for Vercel
.env.example                   NEW  which environment variables to set
.gitignore                     NEW  keeps node_modules and .env files out of git
checkout.html                  CHANGED  loads Stripe.js
assets/js/render.js            CHANGED  card/Zelle choice, embedded card form, return handling, card receipt
assets/css/styles.css          CHANGED  payment-option selection, card icon, white panel for the card form
content/site.js                CHANGED  added cardThanksBody (thank-you text after a card payment)
```

---

## How it works

1. **Cart → Checkout, step 1:** the client enters their details and picks **Credit or debit card** (the default) or **Zelle**.
2. **Card, step 2:** the page sends the cart (tier IDs and quantities only) to `/api/create-checkout-session`. The server looks up the Stripe Price for each tier, creates a Checkout Session and returns its client secret. The page mounts Stripe's form inside a Stripe-hosted iframe. Card numbers never reach this site.
3. **Pay:** Stripe handles 3-D Secure if needed, then redirects to `checkout.html?session_id=…`.
4. **Confirm:** the page asks `/api/session-status` whether the session is `complete`. If it is, the order goes to the Google Sheet with status **paid (card)**, the cart clears and the client sees the receipt. If not, the card form comes back with an error.
5. **Zelle** works exactly as before.

Every card payment also appears in the Stripe Dashboard under **Payments**, with the LH order number as the client reference.

---

## Testing

Use your **test** keys, any future expiry date, any 3-digit CVC and any postal code:

| Card | Result |
|------|--------|
| 4242 4242 4242 4242 | Succeeds |
| 4000 0025 0000 3155 | Asks for 3-D Secure authentication |
| 4000 0000 0000 9995 | Declined (insufficient funds) |
| 4000 0000 0000 0002 | Declined (generic) |

More test cards: https://docs.stripe.com/testing

Check that each test payment shows up in **Dashboard → Payments** (test mode) and as a row in the Google Sheet.

---

## Next steps

- **Receipts:** turn on **Settings → Customer emails → Successful payments** in Stripe so clients get an emailed receipt. The thank-you screen says one is on its way.
- **Fulfillment you can rely on:** the Sheet row is written by the client's browser after the redirect, so a client who closes the tab mid-redirect won't produce a row, though the payment still shows in Stripe. For guaranteed records, add a webhook (`/api/stripe-webhook` listening for `checkout.session.completed`) that writes to the Sheet or emails Nicole.
- **Order tracking:** reconcile the Sheet against Stripe → Payments weekly. Search by the LH order number.
- **Price changes:** update both the Stripe Price and `content/coaching.js`.
- **Going live:** activate the Stripe account (business details and bank account), then swap in the live keys in Vercel.

## Resources

- Stripe support: https://support.stripe.com
- Stripe MCP (let an AI assistant work with your Stripe account): https://docs.stripe.com/mcp
- Embedded form docs: https://docs.stripe.com/payments/checkout
