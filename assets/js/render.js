/* ============================================================
   RENDER ENGINE  ·  Longevity House  ·  luxury edition
   ------------------------------------------------------------
   Builds the whole site from the files in /content.
   You normally won't need to edit this file.
   ============================================================ */
(function () {
  "use strict";

  const S = window.SITE || {};
  const C = window.CONTENT || {};
  const $ = (sel, root = document) => root.querySelector(sel);

  const ITEMS = [];
  function reg(title, sub, blurb, products, body, fallback) {
    ITEMS.push({ title, sub, blurb, products, body, fallback });
    return ITEMS.length - 1;
  }
  function emphasize(text, word) {
    if (!word || !text.includes(word)) return text;
    return text.replace(word, `<em>${word}</em>`);
  }
  /* image slot: shows the file if present, an elegant labelled slot if not */
  function slot(src, cls = "") {
    const name = (src || "").split("/").pop();
    return `<div class="slot ${cls}" data-file="${name}">
      <img src="${src}" alt="" onerror="this.parentElement.classList.add('empty'); this.remove();" />
    </div>`;
  }
  const arrow = `<span class="arr">→</span>`;

  /* ---------- CART STORE ---------- */
  const Cart = {
    KEY: "lh-cart",
    read() { try { return JSON.parse(localStorage.getItem(this.KEY)) || {}; } catch (e) { return {}; } },
    write(c) { try { localStorage.setItem(this.KEY, JSON.stringify(c)); } catch (e) {} updateCartBadge(); },
    add(id) { const c = this.read(); c[id] = (c[id] || 0) + 1; this.write(c); },
    setQty(id, qty) { const c = this.read(); if (qty <= 0) delete c[id]; else c[id] = qty; this.write(c); },
    clear() { this.write({}); },
    count() { return Object.values(this.read()).reduce((a, b) => a + b, 0); },
    tierById(id) { return (C.coaching.tiers || []).find(t => t.id === id); },
    lines() { return Object.entries(this.read()).map(([id, qty]) => ({ tier: this.tierById(id), qty })).filter(l => l.tier); },
    total() { return this.lines().reduce((s, l) => s + l.tier.priceNumber * l.qty, 0); },
  };
  const money = n => "$" + n.toLocaleString("en-US");
  function updateCartBadge() {
    const b = $(".cart-link .cart-count"); if (!b) return;
    const n = Cart.count(); b.textContent = n; b.style.display = n > 0 ? "" : "none";
  }

  /* ============================================================
     HEADER / FOOTER
     ============================================================ */
  function buildHeader() {
    const mount = $("#site-header"); if (!mount) return;
    const sub = ["cart", "checkout"].includes(document.body.dataset.build);
    const pre = sub ? "index.html" : "";
    const nav = S.nav.filter(i => i.href !== "#home");
    const half = Math.ceil(nav.length / 2);
    const link = i => `<a href="${pre}${i.href}" data-section="${i.href.slice(1)}">${i.label}</a>`;
    const words = S.brandName.split(" ");
    mount.innerHTML = `
      <nav class="nav">
        <div class="nav-side left">${nav.slice(0, half).map(link).join("")}</div>
        <a href="${pre || "#home"}" class="brand">${words[0]}<br/>${words.slice(1).join(" ")}</a>
        <div class="nav-side right">
          ${nav.slice(half).map(link).join("")}
          <a href="cart.html" class="cart-link" aria-label="Cart">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1.3"/><circle cx="17" cy="20" r="1.3"/><path d="M3 4h2l2.4 11h10.2l2-8H7"/></svg>
            <span class="cart-count" style="display:none;">0</span>
          </a>
          <a href="${pre}${S.ctaHref}" class="btn nav-cta">${S.ctaLabel}</a>
        </div>
        <button class="nav-toggle" aria-label="Menu"><span></span><span></span></button>
        <div class="nav-mobile">
          ${S.nav.map(link).join("")}
          <a href="cart.html">Cart</a>
          <a href="${pre}${S.ctaHref}" class="btn">${S.ctaLabel}</a>
        </div>
      </nav>`;
    $(".nav-toggle", mount).addEventListener("click", () => document.body.classList.toggle("nav-open"));
    mount.querySelectorAll(".nav-mobile a").forEach(a => a.addEventListener("click", () => document.body.classList.remove("nav-open")));
    updateCartBadge();
  }

  function buildFooter() {
    const mount = $("#site-footer"); if (!mount) return;
    const words = S.brandName.split(" ");
    const loc = S.contact.location ? `<span>${S.contact.location}</span>` : "";
    mount.innerHTML = `
      <div class="foot-main">
        <div class="brand">${words[0]}<br/>${words.slice(1).join(" ")}</div>
        <div class="foot-links">${S.nav.filter(i => i.href !== "#home").map(i => `<a href="${i.href}">${i.label}</a>`).join("")}</div>
        <div class="foot-right">
          <a href="mailto:${S.contact.email}">${S.contact.email}</a>
          <a href="#">${S.contact.instagram}</a>
          ${loc}
        </div>
      </div>
      <div class="foot-bottom">
        <span>${S.footerCredit}</span>
        <span class="tag">${S.tagline}</span>
      </div>`;
  }

  /* ============================================================
     SECTIONS
     ============================================================ */
  function sectionHome() {
    const P = C.home;
    const ticker = (P.ticker || []).map(w => `<span>${w}</span>`).join(`<i>•</i>`);
    return `
      <section class="hero page-section" id="home">
        ${slot(P.image, "hero-img")}
        <div class="hero-in">
          <h1>${P.cascade.line1}<br/>${P.cascade.line2}</h1>
          ${P.cascade.line3 ? `<p class="tagline">${P.cascade.line3}</p>` : ""}
          <div class="hair"></div>
          <div class="hero-ctas">
            <a href="${P.primaryCtaHref}" class="btn">${P.primaryCtaLabel} ${arrow}</a>
            ${P.secondaryCtaLabel ? `<a href="${P.secondaryCtaHref}" class="textlink">${P.secondaryCtaLabel} ${arrow}</a>` : ""}
          </div>
        </div>
        <div class="ticker">${ticker}</div>
        <div class="est">${S.established}</div>
      </section>`;
  }

  function sectionApproach() {
    const P = C.approach, v = P.venn;
    const pillars = P.pillars.map((p, i) => `
      <button class="pillar" data-pillar="${i}">
        <span class="ix">${["I", "II", "III"][i]}</span>
        <span class="pt"><span class="ptitle">${p.title}</span><span class="psub">${p.sub}</span></span>
        ${arrow}
      </button>`).join("");
    return `
      <section class="section approach page-section" id="approach">
        <div class="split">
          ${slot(P.image, "split-img")}
          <div class="split-tx">
            <div class="eyebrow">${P.eyebrow}</div>
            <h2>${emphasize(P.headline, P.headlineItalicWord)}</h2>
            <p class="lede">${P.lede}</p>
            <div class="venn-lists">
              <div>
                <div class="k">${v.left.kicker}</div>
                <div class="t">${v.left.title}</div>
                <ul>${v.left.items.map(i => `<li>${i}</li>`).join("")}</ul>
              </div>
              <div>
                <div class="k">${v.right.kicker}</div>
                <div class="t">${v.right.title}</div>
                <ul>${v.right.items.map(i => `<li>${i}</li>`).join("")}</ul>
              </div>
            </div>
            <div class="hair"></div>
            <p class="bridge">${emphasize(P.bridgeText, "principles")}</p>
          </div>
        </div>
        <div class="pillars">${pillars}</div>
      </section>`;
  }

  function sectionRoundtable() {
    const P = C.roundtable;
    const seats = P.seats.map(s => `
      <div class="rt-dot ${s.position}"></div>
      <div class="rt-seat ${s.position}">
        <span class="stitle">${s.title}</span>
        <span class="ssub">${s.sub}</span>
      </div>`).join("");
    return `
      <section class="section roundtable page-section" id="roundtable">
        <div class="split reverse">
          <div class="split-tx">
            <div class="eyebrow">${P.eyebrow}</div>
            <h2>${emphasize(P.headline, P.headlineItalicWord)}</h2>
            <p class="lede">${P.lede}</p>
            ${(P.modalities && P.modalities.length) ? `
            <div class="hair"></div>
            <div class="k">${P.modalitiesLabel}</div>
            <ul class="mods">${P.modalities.map(m => `<li>${m.name}</li>`).join("")}</ul>` : ""}
          </div>
          <div class="rt-viz">
            <div class="rt-table">
              ${seats}
              <div class="rt-center"><span>${P.centerLabel}<small>${P.centerSub}</small></span></div>
            </div>
          </div>
        </div>
      </section>`;
  }

  function sectionCoaching() {
    const P = C.coaching;
    const cards = P.values.map(v => `
      <div class="pcard">
        ${slot(`assets/img/value-${v.icon}.jpg`, "pcard-img")}
        <div class="pcard-b">
          <h3>${v.title}</h3>
          <p>${v.text}</p>
          ${arrow}
        </div>
      </div>`).join("");
    const tiers = P.tiers.map((t, i) => {
      const mi = reg(t.title, t.duration, t.blurb, null, null, P.comingSoon);
      return `
      <div class="tier${t.featured ? " featured" : ""}" data-modal="${mi}">
        <div class="k">${t.name}</div>
        <h3>${t.title}</h3>
        <div class="dur">${t.duration}</div>
        <div class="price">${t.price}</div>
        <div class="unit">${t.priceNote}</div>
        <ul>${t.includes.map(x => `<li>${x}</li>`).join("")}</ul>
        <button class="btn tier-select" data-add="${t.id}">Select ${arrow}</button>
      </div>`;
    }).join("");
    return `
      <section class="section coaching page-section" id="coaching">
        <div class="head2">
          <div>
            <div class="eyebrow">${P.valueEyebrow}</div>
            <h2>${emphasize(P.valueHeadline, P.valueHeadlineItalic)}</h2>
          </div>
          <p class="lede">${P.valueLede}</p>
        </div>
        <div class="pcards">${cards}</div>
      </section>
      <section class="section pricing page-section" id="pricing">
        <div class="head-c">
          <div class="eyebrow">${P.pricingEyebrow}</div>
          <h2>${emphasize(P.pricingHeadline, P.pricingHeadlineItalic)}</h2>
          <p class="lede">${P.pricingLede}</p>
        </div>
        <div class="tiers">${tiers}</div>
        <div class="closing">
          <div class="eyebrow">${P.closingKicker}</div>
          <h3>${emphasize(P.closingHeadline, P.closingHeadlineItalic)}</h3>
          <a href="${P.closingCtaHref}" class="btn">${P.closingCtaLabel} ${arrow}</a>
        </div>
      </section>`;
  }

  function sectionResources() {
    const P = C.resources;
    const essays = P.essays.map(e => {
      const i = reg(e.title, e.sub, e.blurb, null, e.body, P.comingSoon);
      return `
      <button class="essay" data-modal="${i}">
        <span class="num">${e.num}</span>
        <span class="et"><span class="t">${e.title}</span><span class="s">${e.sub}</span></span>
        ${arrow}
      </button>`;
    }).join("");
    const cats = P.categories.map(c => {
      const n = (c.products || []).length;
      const i = reg(c.name, c.sub, c.blurb, c.products, null, P.comingSoon);
      return `
      <button class="cat" data-modal="${i}">
        <span class="cn">${c.name}</span>
        <span class="cs">${c.sub}</span>
        ${n ? `<span class="cc">${n} picks</span>` : ""}
      </button>`;
    }).join("");
    return `
      <section class="section resources page-section" id="resources">
        <div class="head-c">
          <div class="eyebrow">${P.eyebrow}</div>
          <h2>${emphasize(P.headline, P.headlineItalic)}</h2>
          <p class="lede">${P.lede}</p>
        </div>
        <div class="res-grid">
          <div class="essays">
            <div class="k">${P.essaysLabel}</div>
            ${essays}
          </div>
          <div class="supps">
            <div class="k">${P.supplementLabel}</div>
            <h3>${emphasize(P.supplementHeadline, P.supplementHeadlineItalic)}</h3>
            <p>${P.supplementIntro}</p>
            <div class="cats">${cats}</div>
            <div class="foot-note">${P.supplementFootnote}</div>
          </div>
        </div>
      </section>`;
  }

  function sectionBegin() {
    const P = C.begin;
    const steps = P.steps.map(s => `
      <div class="step"><span class="num">${s.num}</span><div><h4>${s.title}</h4><p>${s.text}</p></div></div>`).join("");
    /* Google appointment pages only embed with the gv=true flag — add it if missing */
    let bookUrl = (S.bookingUrl || "").trim();
    if (bookUrl && /calendar\.google\.com/.test(bookUrl) && !/gv=true/.test(bookUrl)) {
      bookUrl += (bookUrl.includes("?") ? "&" : "?") + "gv=true";
    }
    const openUrl = bookUrl.replace(/[?&]gv=true/, "");
    let booking;
    if (!bookUrl) {
      booking = `<div class="embed"><div class="k">${P.embedTag}</div><div class="en">${P.embedPlaceholder}</div></div>`;
    } else if (S.bookingMode === "embed") {
      booking = `<iframe src="${bookUrl}" title="Booking calendar" loading="lazy"></iframe>`;
    } else {
      booking = `
        <div class="book-invite">
          <p class="bi-blurb">${S.bookingBlurb || ""}</p>
          <ul class="bi-points">${(S.bookingPoints || []).map(x => `<li>${x}</li>`).join("")}</ul>
          <a class="btn solid bi-btn" href="${openUrl}" target="_blank" rel="noopener">${S.bookingButton || "Reserve your call"} ${arrow}</a>
          <div class="bi-note">Opens a secure booking page in a new tab.</div>
        </div>`;
    }
    return `
      <section class="section begin page-section" id="begin">
        <div class="band">
          ${slot(P.image, "band-img")}
          <div class="band-tx">
            <div class="eyebrow">${P.eyebrow}</div>
            <h2>${emphasize(P.headline, P.headlineItalic)}</h2>
            <p class="lede">${P.lede}</p>
            <div class="steps">${steps}</div>
          </div>
        </div>
        <div class="booking">
          <div class="b-head">
            <div>
              <div class="bt">${emphasize(S.bookingHeadline, "first session")}</div>
              <div class="bs">${S.bookingSubtitle}</div>
            </div>
            <div class="pill">${S.bookingDuration}</div>
          </div>
          ${booking}
        </div>
      </section>`;
  }

  /* ============================================================
     MODALS
     ============================================================ */
  function infoModalHtml() {
    return `
      <div class="overlay" id="info-modal"><div class="modal">
        <button class="close" aria-label="Close"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
        <div class="eyebrow m-eye"></div>
        <h3></h3>
        <p class="m-body"></p>
        <div class="essay-body"></div>
        <div class="products"></div>
      </div></div>`;
  }
  function renderBlocks(blocks) {
    return blocks.map(b => {
      if (b.h) return `<h4>${b.h}</h4>`;
      if (b.p) return `<p>${b.p}</p>`;
      if (b.note) return `<p class="note">${b.note}</p>`;
      if (b.list) return `<ul>${b.list.map(x => `<li>${x}</li>`).join("")}</ul>`;
      return "";
    }).join("");
  }
  function wireInfoModal() {
    const ov = $("#info-modal"); if (!ov) return;
    const m = $(".modal", ov);
    function open(i) {
      const it = ITEMS[i]; if (!it) return;
      $(".m-eye", m).textContent = it.sub || "";
      $("h3", m).textContent = it.title;
      const body = $(".m-body", m), essay = $(".essay-body", m), list = $(".products", m);
      essay.innerHTML = ""; essay.style.display = "none";
      list.innerHTML = ""; list.style.display = "none"; body.style.display = "none";
      m.classList.toggle("reading", !!(it.body && it.body.length));
      if (it.body && it.body.length) { essay.innerHTML = renderBlocks(it.body); essay.style.display = ""; }
      else if (it.products && it.products.length) {
        list.innerHTML = it.products.map(p => `
          <a class="product" href="${p.url}" target="_blank" rel="noopener noreferrer">
            <span><span class="pn">${p.name}</span><span class="pd">${p.note || ""}</span></span>${arrow}
          </a>`).join("");
        list.style.display = "";
      } else { body.textContent = (it.blurb && it.blurb.trim()) ? it.blurb : (it.fallback || "More coming soon."); body.style.display = ""; }
      ov.classList.add("open"); m.scrollTop = 0; document.body.style.overflow = "hidden";
    }
    const close = () => { ov.classList.remove("open"); document.body.style.overflow = ""; };
    document.querySelectorAll("[data-modal]").forEach(el => el.addEventListener("click", () => open(parseInt(el.dataset.modal, 10))));
    $(".close", m).addEventListener("click", close);
    ov.addEventListener("click", e => { if (e.target === ov) close(); });
    document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
  }

  function pillarModalHtml() {
    return `
      <div class="overlay" id="pillar-modal"><div class="modal">
        <button class="close" aria-label="Close"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
        <div class="ix-large"></div>
        <div class="eyebrow p-lab"></div>
        <h3></h3>
        <p class="statement"></p>
        <p class="detail"></p>
        <div class="m-foot"><div class="pos"></div><div class="marrows">
            <button data-dir="-1" aria-label="Previous"><svg viewBox="0 0 24 24"><path d="M19 12H5M11 6l-6 6 6 6"/></svg></button>
            <button data-dir="1" aria-label="Next"><svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>
          </div></div>
      </div></div>`;
  }
  function wireApproachModal() {
    const ov = $("#pillar-modal"); if (!ov) return;
    const P = C.approach, m = $(".modal", ov); let idx = 0;
    function fill(i) {
      const p = P.pillars[i]; idx = i;
      $(".ix-large", m).textContent = ["I", "II", "III"][i];
      $(".p-lab", m).textContent = `Principle ${["one", "two", "three"][i]} of three`;
      $("h3", m).innerHTML = emphasize(p.modalTitle, p.modalTitle.split(" ").slice(-1)[0]);
      $(".statement", m).textContent = p.modalStatement;
      $(".detail", m).textContent = p.modalDetail;
      $(".pos", m).innerHTML = P.pillars.map((_, k) => k === i ? `<strong>${["I","II","III"][k]}</strong>` : ["I","II","III"][k]).join(" · ");
    }
    const open = i => { fill(i); ov.classList.add("open"); document.body.style.overflow = "hidden"; };
    const close = () => { ov.classList.remove("open"); document.body.style.overflow = ""; };
    document.querySelectorAll(".pillar").forEach(t => t.addEventListener("click", () => open(parseInt(t.dataset.pillar, 10))));
    $(".close", m).addEventListener("click", close);
    ov.addEventListener("click", e => { if (e.target === ov) close(); });
    document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
    m.querySelectorAll(".marrows button").forEach(b => b.addEventListener("click", () => fill((idx + parseInt(b.dataset.dir, 10) + P.pillars.length) % P.pillars.length)));
  }

  function wireScrollSpy() {
    const links = document.querySelectorAll(".nav-side a[data-section]");
    const map = {}; links.forEach(l => { map[l.dataset.section] = l; });
    const alias = { pricing: "coaching" };
    const obs = new IntersectionObserver(es => es.forEach(en => {
      if (!en.isIntersecting) return;
      const id = alias[en.target.id] || en.target.id;
      links.forEach(l => l.classList.remove("active"));
      if (map[id]) map[id].classList.add("active");
    }), { rootMargin: "-40% 0px -55% 0px" });
    document.querySelectorAll(".page-section").forEach(s => obs.observe(s));
  }

  /* ============================================================
     CART & CHECKOUT PAGES
     ============================================================ */
  function buildCartPage() {
    const mount = $("#page");
    function render() {
      const lines = Cart.lines();
      const rows = lines.map(l => `
        <div class="cart-row">
          <div><span class="ci-t">${l.tier.title}</span><span class="ci-m">${l.tier.price} ${l.tier.unit}</span></div>
          <div class="qty"><button data-qty="${l.tier.id}:-1">−</button><span>${l.qty}</span><button data-qty="${l.tier.id}:1">+</button></div>
          <div class="lt">${money(l.tier.priceNumber * l.qty)}</div>
          <button class="rm" data-remove="${l.tier.id}">×</button>
        </div>`).join("");
      mount.innerHTML = `
        <section class="section subpage">
          <div class="narrow">
            <div class="head-c"><div class="eyebrow">Your Selections</div><h2>Your <em>cart.</em></h2></div>
            ${lines.length ? `
              <div class="cart-list">${rows}</div>
              <div class="cart-sum"><span class="k">Total</span><span class="tot">${money(Cart.total())}</span></div>
              <div class="cart-actions"><a href="index.html#pricing" class="textlink">← Keep browsing</a><a href="checkout.html" class="btn solid">Continue to checkout ${arrow}</a></div>
            ` : `
              <p class="empty">Your cart is empty — the coaching paths live on the main page.</p>
              <div class="cart-actions center"><a href="index.html#pricing" class="btn solid">See the three ways to begin ${arrow}</a></div>`}
          </div>
        </section>`;
      mount.querySelectorAll("[data-qty]").forEach(b => b.addEventListener("click", () => { const [id, d] = b.dataset.qty.split(":"); Cart.setQty(id, (Cart.read()[id] || 0) + parseInt(d, 10)); render(); }));
      mount.querySelectorAll("[data-remove]").forEach(b => b.addEventListener("click", () => { Cart.setQty(b.dataset.remove, 0); render(); }));
    }
    render();
  }

  function buildCheckoutPage() {
    const mount = $("#page");
    const CK = S.checkout || {};
    const lines = Cart.lines();
    const empty = () => {
      mount.innerHTML = `
        <section class="section subpage"><div class="narrow">
          <div class="head-c"><div class="eyebrow">Checkout</div><h2>Nothing here <em>yet.</em></h2></div>
          <p class="empty">Choose a coaching path first, then come back to check out.</p>
          <div class="cart-actions center"><a href="index.html#pricing" class="btn solid">See the three ways to begin ${arrow}</a></div>
        </div></section>`;
    };

    /* a finished order is remembered so a refresh on the thank-you screen keeps it */
    let saved = null;
    try { saved = JSON.parse(sessionStorage.getItem("lh-order")); } catch (e) {}
    if (!lines.length && !saved) return empty();

    const total = Cart.total();
    const rows = lines.map(l => `<div class="sum-row"><span>${l.tier.title} × ${l.qty}</span><span>${money(l.tier.priceNumber * l.qty)}</span></div>`).join("");
    const orderNo = () => {
      const A = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; let x = "";
      for (let i = 0; i < 6; i++) x += A[Math.floor(Math.random() * A.length)];
      return `${CK.orderPrefix || "LH"}-${x}`;
    };
    const copyRow = (label, val, cls = "") => `
      <div class="z-row">
        <div><div class="k">${label}</div><div class="z-val ${cls}">${val}</div></div>
        <button class="btn z-copy" data-copy="${val}">Copy</button>
      </div>`;

    /* stripeEnabled: false hides card checkout. The Stripe screens below stay in place. */
    const stripeOn = CK.stripeEnabled !== false;

    /* ---------- screen 1: details ---------- */
    function screenDetails() {
      const cardOpt = stripeOn ? `
              <button type="button" class="pay-opt on" data-method="card" aria-pressed="true">
                <span class="radio"></span>
                <span class="po-text"><span class="po-t">Credit or debit card</span><span class="po-s">Secure card payment on the next step.</span></span>
                <span class="card-mark" aria-hidden="true"></span>
              </button>` : "";
      mount.innerHTML = `
        <section class="section subpage"><div class="narrow wide">
          <div class="head-c"><div class="eyebrow">Checkout</div><h2>Almost <em>there.</em></h2></div>
          <div class="co-grid">
            <div class="co-form">
              <div class="k">Your details</div>
              <label><span>Full name</span><input type="text" id="co-name" autocomplete="name" placeholder="Your name" /></label>
              <label><span>Email</span><input type="email" id="co-email" autocomplete="email" placeholder="you@somewhere.com" /></label>
              <label><span>Phone <small>(optional)</small></span><input type="tel" id="co-phone" autocomplete="tel" placeholder="(555) 555-5555" /></label>
              <label><span>Anything Nicole should know? <small>(optional)</small></span><textarea id="co-note" rows="3" placeholder="A line or two — whatever feels honest."></textarea></label>
              <div class="k" style="margin-top:28px">Payment</div>
              ${cardOpt}
              <button type="button" class="pay-opt${stripeOn ? "" : " on"}" data-method="zelle" aria-pressed="${stripeOn ? "false" : "true"}">
                <span class="radio"></span>
                <span class="po-text"><span class="po-t">Zelle</span><span class="po-s">Payment instructions appear on the next step.</span></span>
                <span class="zelle-mark">Z</span>
              </button>
              <div id="co-err" class="co-err" style="display:none"></div>
            </div>
            <div class="co-sum">
              <div class="k">Order summary</div>
              <div class="sum-list">${rows}</div>
              <div class="sum-tot"><span>Total</span><span>${money(total)}</span></div>
              <button class="btn solid pay" id="co-next">Continue to payment ${arrow}</button>
              <p class="pay-note" id="co-pay-note"></p>
            </div>
          </div>
        </div></section>`;
      const notes = {
        card: "Pay securely by card on the next step. Card details go straight to Stripe — we never see them.",
        zelle: "No card needed. You’ll send the total via Zelle on the next step.",
      };
      let method = stripeOn ? "card" : "zelle";
      const pick = m => {
        method = m;
        mount.querySelectorAll(".pay-opt").forEach(o => { const on = o.dataset.method === m; o.classList.toggle("on", on); o.setAttribute("aria-pressed", on); });
        $("#co-pay-note").textContent = notes[m];
      };
      mount.querySelectorAll(".pay-opt").forEach(o => o.addEventListener("click", () => pick(o.dataset.method)));
      pick(method);
      $("#co-next").addEventListener("click", () => {
        const name = $("#co-name").value.trim(), email = $("#co-email").value.trim();
        const err = $("#co-err");
        if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          err.textContent = "Please add your name and a valid email so we can confirm your payment."; err.style.display = ""; return;
        }
        const order = {
          id: orderNo(), ts: new Date().toISOString(), name, email,
          phone: $("#co-phone").value.trim(), note: $("#co-note").value.trim(),
          items: lines.map(l => ({ id: l.tier.id, title: l.tier.title, qty: l.qty, price: l.tier.priceNumber })),
          total, status: "pending", method,
        };
        try { sessionStorage.setItem("lh-order", JSON.stringify(order)); } catch (e) {}
        if (stripeOn && method === "card") screenCard(order); else screenPay(order);
        window.scrollTo(0, 0);
      });
    }

    /* ---------- screen 2a: pay by card (Stripe embedded form) ---------- */
    const appearance = {
      theme: "stripe",
      labels: "auto",
      inputs: "spaced",
      variables: {
        borderRadius: "4px",
        colorBackground: "#ffffff",
        colorDanger: "#df1b41",
        colorPrimary: "#0570de",
        colorSuccess: "#00c853",
        colorText: "#30313d",
        fontFamily: "default",
        fontSizeBase: "16px",
        spacingUnit: "4px",
      },
    };
    function screenCard(order, notice) {
      if (!stripeOn) {
        order.method = "zelle";
        try { sessionStorage.setItem("lh-order", JSON.stringify(order)); } catch (e) {}
        screenPay(order);
        return;
      }
      mount.innerHTML = `
        <section class="section subpage"><div class="narrow">
          <div class="zelle-card card-pay">
            <div class="z-head">
              <div>
                <h2 class="z-h">Complete your <em>payment.</em></h2>
                <p class="z-amt">Pay <strong>${money(order.total)}</strong> by card · Order ${order.id}</p>
              </div>
              <span class="card-mark lg" aria-hidden="true"></span>
            </div>
            <div id="co-err" class="co-err" ${notice ? "" : 'style="display:none"'}>${notice || ""}</div>
            <div class="stripe-wrap"><div id="checkout-form"><p class="stripe-loading">Loading secure card form…</p></div></div>
            <p class="z-note">Payments are processed by Stripe. Your card details never touch our servers.</p>
            <button class="textlink" id="co-back" type="button">← Pay with Zelle instead</button>
          </div>
        </div></section>`;
      const err = $("#co-err");
      const fail = msg => { err.textContent = msg; err.style.display = ""; };
      $("#co-back").addEventListener("click", () => {
        order.method = "zelle";
        try { sessionStorage.setItem("lh-order", JSON.stringify(order)); } catch (e) {}
        screenPay(order); window.scrollTo(0, 0);
      });
      if (typeof window.Stripe !== "function") return fail("The card form couldn’t load. Check your connection, or pay with Zelle instead.");

      (async () => {
        try {
          const r = await fetch("/api/create-checkout-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              items: order.items.map(i => ({ id: i.id, qty: i.qty })),
              order: { id: order.id, name: order.name, email: order.email, phone: order.phone, note: order.note },
            }),
          });
          const json = await r.json().catch(() => ({}));
          if (!r.ok || !json.client_secret || !json.publishable_key) throw new Error(json.error || "Card checkout isn’t available right now.");

          const stripe = window.Stripe(json.publishable_key);
          const checkout = stripe.initCheckoutFormSdk({ clientSecret: Promise.resolve(json.client_secret), appearance });
          $("#checkout-form").innerHTML = "";
          const form = checkout.createForm({ layout: "expanded" });
          form.mount("#checkout-form");

          const loadActionsResult = await checkout.loadActions();
          if (loadActionsResult.type !== "success") throw new Error("The card form couldn’t start. Please refresh and try again.");
          form.on("confirm", async (event) => {
            err.style.display = "none";
            try {
              const result = await loadActionsResult.actions.confirm({ formConfirmEvent: event });
              if (result && result.type === "error") fail(result.error.message);
              /* on success Stripe redirects back here with ?session_id=… */
            } catch (e) {
              console.error("Payment confirmation error:", e);
              fail("Something went wrong confirming your payment. You have not been charged twice — please try again.");
            }
          });
        } catch (e) {
          console.error(e);
          $(".stripe-wrap").style.display = "none";
          const msg = e instanceof TypeError ? "We couldn’t reach the payment server." : e.message;
          fail(`${msg} Please try again in a moment, or pay with Zelle instead.`);
        }
      })();
    }

    /* ---------- return from Stripe: verify the card payment ---------- */
    async function handleCardReturn(sessionId) {
      mount.innerHTML = `<section class="section subpage"><div class="narrow"><p class="stripe-loading">Confirming your payment…</p></div></section>`;
      history.replaceState(null, "", "checkout.html");
      const order = saved || { id: "", items: [], total: 0, name: "", email: "", method: "card" };
      try {
        const r = await fetch(`/api/session-status?session_id=${encodeURIComponent(sessionId)}`);
        const s = await r.json();
        if (!r.ok) throw new Error(s.error);
        if (s.status === "complete") {
          order.status = "paid"; order.method = "card"; order.sentTs = new Date().toISOString();
          if (s.order) order.id = s.order;
          if (!order.total && s.amount_total) order.total = s.amount_total / 100;
          if (!order.email && s.email) order.email = s.email;
          await logOrder(order);
          try { sessionStorage.setItem("lh-order", JSON.stringify(order)); } catch (e) {}
          Cart.clear();
          return screenThanks(order);
        }
        if (saved && saved.items.length) return screenCard(saved, "Your payment didn’t go through. Please try again, or pay with Zelle.");
      } catch (e) { console.error(e); }
      if (saved && saved.status === "paid") return screenThanks(saved);
      lines.length ? screenDetails() : empty();
    }

    /* ---------- screen 2: pay via Zelle ---------- */
    function screenPay(order) {
      mount.innerHTML = `
        <section class="section subpage"><div class="narrow">
          <div class="zelle-card">
            <div class="z-head">
              <div>
                <h2 class="z-h">Complete your <em>payment.</em></h2>
                <p class="z-amt">Send <strong>${money(order.total)}</strong> via Zelle.</p>
              </div>
              <span class="zelle-mark lg">Z</span>
            </div>
            ${copyRow("Zelle email", CK.zelleEmail || "(Zelle email not set yet)")}
            ${copyRow("Zelle name", CK.zelleName || "")}
            ${copyRow("Order number", order.id, "serif")}
            ${copyRow("Amount", money(order.total))}
            <ol class="z-steps">${(CK.steps || []).map(t => `<li>${t}</li>`).join("")}</ol>
            <p class="z-note">${CK.stepsNote || ""}</p>
            <button class="btn solid pay" id="co-sent">I’ve sent my payment ${arrow}</button>
          </div>
        </div></section>`;
      mount.querySelectorAll("[data-copy]").forEach(b => b.addEventListener("click", async () => {
        try { await navigator.clipboard.writeText(b.dataset.copy); b.textContent = "Copied"; setTimeout(() => b.textContent = "Copy", 1400); } catch (e) {}
      }));
      $("#co-sent").addEventListener("click", async () => {
        const btn = $("#co-sent"); btn.disabled = true; btn.textContent = "Recording…";
        order.status = "sent"; order.sentTs = new Date().toISOString();
        await logOrder(order);
        try { sessionStorage.setItem("lh-order", JSON.stringify(order)); } catch (e) {}
        Cart.clear();
        screenThanks(order); window.scrollTo(0, 0);
      });
    }

    /* ---------- screen 3: receipt ---------- */
    function screenThanks(order) {
      const items = order.items.map(i => `<div class="sum-row"><span>${i.title} × ${i.qty}</span><span>${money(i.price * i.qty)}</span></div>`).join("");
      const phone = CK.supportPhone ? ` or call ${CK.supportPhone}` : "";
      const card = order.method === "card";
      mount.innerHTML = `
        <section class="section subpage"><div class="narrow">
          <div class="eyebrow">Order ${order.id}</div>
          <h2 class="th-h">${CK.thanksHeadline || "Thank you."}</h2>
          <p class="lede">${card ? (CK.cardThanksBody || "") : (CK.thanksBody || "")}</p>
          <div class="hair"></div>
          <div class="th-grid">
            <div><div class="k">${card ? "Amount paid" : "Amount sent"}</div><div class="th-amt">${money(order.total)}</div><div class="th-sub">${card ? "by card · receipt emailed by Stripe" : `via Zelle to ${CK.zelleEmail || ""}`}</div></div>
            <div><div class="k">Confirmation to</div><div class="th-who">${order.name}</div><div class="th-sub">${order.email}${order.phone ? " · " + order.phone : ""}</div></div>
          </div>
          <div class="co-sum th-sum">
            <div class="k">Order summary</div>
            <div class="sum-list">${items}</div>
            <div class="sum-tot"><span>Total</span><span>${money(order.total)}</span></div>
          </div>
          <p class="th-help">Questions about your order? Email <a href="mailto:${CK.supportEmail || S.contact.email}">${CK.supportEmail || S.contact.email}</a>${phone}. Quote ${order.id}.</p>
          <a href="index.html" class="btn solid">Return to Longevity House ${arrow}</a>
        </div></section>`;
    }

    /* ---------- Google Sheet logging ---------- */
    async function logOrder(order) {
      if (!CK.sheetWebhook) return;
      const body = new URLSearchParams({
        order: order.id, status: order.method === "card" ? "paid (card)" : order.status, placed: order.ts, sent: order.sentTs || "",
        name: order.name, email: order.email, phone: order.phone, note: order.note,
        items: order.items.map(i => `${i.title} × ${i.qty}`).join("; "), total: order.total,
      });
      try { await fetch(CK.sheetWebhook, { method: "POST", mode: "no-cors", body }); } catch (e) {}
    }

    const sessionId = new URLSearchParams(location.search).get("session_id");
    if (sessionId && stripeOn) handleCardReturn(sessionId);
    else if (saved && (saved.status === "sent" || saved.status === "paid") && !lines.length) screenThanks(saved);
    else if (sessionId && saved && saved.items && saved.items.length) {
      saved.method = "zelle";
      try { sessionStorage.setItem("lh-order", JSON.stringify(saved)); } catch (e) {}
      screenPay(saved);
    }
    else screenDetails();
  }

  /* ---------- BOOT ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    buildHeader();
    const build = document.body.dataset.build, mount = $("#page");
    if (build === "cart") buildCartPage();
    else if (build === "checkout") buildCheckoutPage();
    else if (mount) {
      mount.innerHTML = sectionHome() + sectionApproach() + sectionRoundtable() + sectionCoaching() + sectionResources() + sectionBegin() + infoModalHtml() + pillarModalHtml();
      wireInfoModal(); wireApproachModal(); wireScrollSpy();
      document.querySelectorAll("[data-add]").forEach(b => b.addEventListener("click", e => { e.stopPropagation(); Cart.add(b.dataset.add); window.location.href = "cart.html"; }));
      /* header turns solid once you scroll past the hero */
      const hdr = $("#site-header");
      const onScroll = () => hdr.classList.toggle("scrolled", window.scrollY > 40);
      window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
    }
    buildFooter();
  });
})();
