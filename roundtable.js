/* ============================================================
   THE ROUNDTABLE  ·  content
   ------------------------------------------------------------
   Edit the words between the quotes. Keep the commas.
   The four "seats" sit around the circle. Read-only display.
   ============================================================ */
window.CONTENT = window.CONTENT || {}; window.CONTENT.roundtable = {
  eyebrow: "Your curated network",
  headline: "The Roundtable.",
  headlineItalicWord: "Roundtable",
  lede: "Healing happens in community. The Roundtable is your circle of vetted holistic practitioners — every member personally sourced, used, and coordinated by Nicole, with you at the center.",

  centerLabel: "You",
  centerSub: "at the center",

  /* The four seats. position = n (top), e (right), s (bottom), w (left). */
  seats: [
    { position: "n", title: "Chiro Care & Massage",  sub: "structural & hands-on care" },
    { position: "e", title: "Wellness Clinics",      sub: "IV, hyperbaric, red light & salt" },
    { position: "s", title: "Functional Medicine",   sub: "root-cause practitioners" },
    { position: "w", title: "Longevity & Peptides",  sub: "vetted research companies" },
  ],

  /* Optional supporting list under the intro. Leave empty to hide. */
  modalitiesLabel: "Also in the Roundtable",
  modalities: [],
};
