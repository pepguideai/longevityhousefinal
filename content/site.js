/* ============================================================
   SITE-WIDE CONTENT  ·  Longevity House
   ------------------------------------------------------------
   This file controls things that appear on EVERY page:
   the brand name, the navigation menu, the footer, and your
   booking link. Edit the text inside the quotes. Don't remove
   the quotes, commas, or brackets.
   ============================================================ */

window.SITE = {

  /* ---- BRAND ---- */
  brandName: "Longevity House",
  brandMark: "L",                 // the single letter inside the circle logo
  established: "EST. 2026",
  tagline: "A practice in presence, presence in practice.",

  /* ---- NAVIGATION MENU ----
     label = what shows in the menu, href = the page file it links to.
     The CTA button on the right is set by ctaLabel / ctaHref. */
  nav: [
    { label: "Home",           href: "#home" },
    { label: "Approach",       href: "#approach" },
    { label: "The Roundtable", href: "#roundtable" },
    { label: "Coaching",       href: "#coaching" },
    { label: "Resources",      href: "#resources" },
  ],
  ctaLabel: "Step Inside",
  ctaHref: "#begin",

  /* ---- BOOKING ----
     When you have a Calendly / Acuity / Cal.com link, paste it here.
     Until then, leave it as "" and the Begin page shows a styled
     placeholder where the calendar will appear. */
  bookingUrl: "https://calendar.google.com/calendar/appointments/schedules/AcZssZ3vi4vaHTpli_GDJCqaGtC9o5DXxpKrnQpZh2TCPoo-nPjVnO2IbXqhvPHHHDPu6F4lWM6zU4Zb?gv=true",
  bookingHeadline: "Book your first session",
  bookingSubtitle: "Free 20-minute intro call",
  bookingDuration: "20 min",
  /* "link" = styled panel with a button that opens the booking page (recommended).
     "embed" = Google's calendar drawn inside the page (clashes with the dark design). */
  bookingMode: "link",
  bookingButton: "Reserve your call",
  bookingBlurb: "Twenty minutes, no preparation needed. We'll talk about where you are, what you're hoping to change, and whether the House is the right fit.",
  bookingPoints: ["Choose any open time", "Video or phone — your call", "Confirmation straight to your inbox"],

  /* ---- CHECKOUT / PAYMENTS ----
     Checkout is paid via Zelle. Fill in the Zelle details below.
     Orders are logged to a Google Sheet via sheetWebhook (see README). */
  checkout: {
    zelleEmail: "cole@longevityhousellc.com",                      // the email registered with Zelle, e.g. "cole@longevityhousellc.com"
    zelleName:  "Nicole Mathsen",   // the name Zelle shows the sender
    orderPrefix: "LH",                   // order numbers look like LH-7K2M9Q
    sheetWebhook: "https://script.google.com/macros/s/AKfycbz-QvBnBRwitIDxMaLZ0RY9wUxv8E73rtOlJ5ky27xjc99IwEs6TpyLEm2Oikp9aXPV/exec",                    // Google Apps Script web-app URL (leave "" until the sheet is set up)
    supportEmail: "cole@longevityhousellc.com",
    supportPhone: "",                    // optional, e.g. "+1 (615) 555-0100"
    steps: [
      "Open your banking app and choose Zelle.",
      "Send the exact amount to the email above.",
      "Type your order number in the memo or note field.",
      "Come back here and tap \u201cI\u2019ve sent my payment.\u201d",
    ],
    stepsNote: "Your sessions are confirmed once payment is verified. Include your order number so we can match your payment.",
    thanksHeadline: "Thank you. Your order is received.",
    thanksBody: "Payment pending verification. We\u2019ll email you once your Zelle payment is confirmed and reach out to schedule.",
  },

  /* ---- CONTACT (shown in the footer) ---- */
  contact: {
    email: "cole@longevityhousellc.com",
    location: "",   // add your city here when ready, e.g. "Austin, Texas"
    instagram: "@longevityhouse",
  },

  /* ---- FOOTER ---- */
  footerTagline: "Reimagined health coaching — a practice of presence, wherever you are.",
  footerCredit: "© 2026 Longevity House LLC",
};
