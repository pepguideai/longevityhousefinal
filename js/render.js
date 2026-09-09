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
          <p class="tagline">${P.cascade.line3}</p>
          <div class="hair"></div>
          <div class="hero-ctas">
            <a href="${P.primaryCtaHref}" class="btn">${P.primaryCtaLabel} ${arrow}</a>
            <a href="${P.secondaryCtaHref}" class="textlink">${P.secondaryCtaLabel} ${arrow}</a>
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
      <div class="rt-seat ${s.position}">
        <div class="dot"></div>
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
            <div class="hair"></div>
            <div class="k">${P.modalitiesLabel}</div>
            <ul class="mods">${P.modalities.map(m => `<li>${m.name}</li>`).join("")}</ul>
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
    const booking = (S.bookingUrl && S.bookingUrl.trim())
      ? `<iframe src="${S.bookingUrl}" title="Booking calendar"></iframe>`
      : `<div class="embed"><div class="k">${P.embedTag}</div><div class="en">${P.embedPlaceholder}</div></div>`;
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
        <button class="close" aria-label="Close">×</button>
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
        <button class="close" aria-label="Close">×</button>
        <div class="ix-large"></div>
        <div class="eyebrow p-lab"></div>
        <h3></h3>
        <p class="statement"></p>
        <p class="detail"></p>
        <div class="m-foot"><div class="pos"></div><div class="marrows"><button data-dir="-1">←</button><button data-dir="1">→</button></div></div>
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
    const lines = Cart.lines();
    if (!lines.length) {
      mount.innerHTML = `
        <section class="section subpage"><div class="narrow">
          <div class="head-c"><div class="eyebrow">Checkout</div><h2>Nothing here <em>yet.</em></h2></div>
          <p class="empty">Choose a coaching path first, then come back to check out.</p>
          <div class="cart-actions center"><a href="index.html#pricing" class="btn solid">See the three ways to begin ${arrow}</a></div>
        </div></section>`;
      return;
    }
    const rows = lines.map(l => `<div class="sum-row"><span>${l.tier.title} × ${l.qty}</span><span>${money(l.tier.priceNumber * l.qty)}</span></div>`).join("");
    const links = (S.checkout && S.checkout.paymentLinks) || {};
    const one = lines.length === 1 ? lines[0].tier.id : null;
    const payUrl = one && links[one] && links[one].trim() ? links[one] : null;
    mount.innerHTML = `
      <section class="section subpage"><div class="narrow wide">
        <div class="head-c"><div class="eyebrow">Checkout</div><h2>Almost <em>there.</em></h2></div>
        <div class="co-grid">
          <div class="co-form">
            <div class="k">Your details</div>
            <label><span>Name</span><input type="text" id="co-name" placeholder="Your name" /></label>
            <label><span>Email</span><input type="email" id="co-email" placeholder="you@somewhere.com" /></label>
            <label><span>Anything Nicole should know? <small>(optional)</small></span><textarea id="co-note" rows="3" placeholder="A line or two — whatever feels honest."></textarea></label>
          </div>
          <div class="co-sum">
            <div class="k">Order summary</div>
            <div class="sum-list">${rows}</div>
            <div class="sum-tot"><span>Total</span><span>${money(Cart.total())}</span></div>
            ${payUrl
              ? `<a class="btn solid pay" href="${payUrl}">Pay securely ${arrow}</a><p class="pay-note">Payment is handled securely by Stripe.</p>`
              : `<button class="btn solid pay" id="co-submit">Complete request ${arrow}</button><p class="pay-note">${(S.checkout && S.checkout.pendingNote) || "Payments are coming soon."}</p>`}
            <div id="co-confirm" class="confirm" style="display:none;">Thank you — your selection is noted. Nicole will be in touch at the email you provided.</div>
          </div>
        </div>
      </div></section>`;
    const sub = $("#co-submit");
    if (sub) sub.addEventListener("click", () => { $("#co-confirm").style.display = ""; sub.disabled = true; sub.textContent = "Request received"; Cart.clear(); });
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
