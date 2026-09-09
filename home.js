/* ============================================================
   HOME PAGE CONTENT  ·  index.html
   ------------------------------------------------------------
   The headline is a three-line cascade. Each line steps to the
   right and gets smaller. Edit the words inside the quotes.
   ============================================================ */

window.CONTENT = window.CONTENT || {}; window.CONTENT.home = {
  /* Hero image — drop a file at this path and it appears. Recommended 2400×1400, landscape. */
  image: "assets/img/hero.jpg",
  /* The small word ticker at the bottom of the hero. */
  ticker: ["Presence", "Intention", "Abundance", "Community"],

  /* The cascading headline — three lines */
  cascade: {
    line1: "Reimagined",
    line2: "health coaching.",
    line3: "Unlock your healing.",
  },

  /* The two calls-to-action under the headline */
  primaryCtaLabel: "Step inside",     // italic link with arrow
  primaryCtaHref: "#begin",
  secondaryCtaLabel: "Our philosophy",
  secondaryCtaHref: "#approach",
};
