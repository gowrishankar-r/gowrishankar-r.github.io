/* ==========================================================
   Gowrishankar R – Portfolio interactions (no dependencies)
   1. Mobile menu   2. Active-section highlighting   3. Footer year   4. Scroll reveal
   ========================================================== */
(function () {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- Footer year ---------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Mobile navigation ---------- */
  const toggle = $("#navToggle");
  const menu = $("#navMenu");

  function setMenu(open) {
    menu.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
  }

  if (toggle && menu) {
    toggle.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
    $$(".nav-link", menu).forEach((link) => link.addEventListener("click", () => setMenu(false)));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menu.classList.contains("open")) {
        setMenu(false);
        toggle.focus();
      }
    });
    // Close the menu if the window is resized to desktop width
    window.addEventListener("resize", () => {
      if (window.innerWidth > 1120) setMenu(false);
    });
  }

  /* ---------- Active navigation highlighting ---------- */
  const links = $$(".nav-link");
  const sections = links
    .map((l) => document.getElementById((l.getAttribute("href") || "").slice(1)))
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((l) => {
            const active = l.getAttribute("href") === "#" + entry.target.id;
            if (active) l.setAttribute("aria-current", "true");
            else l.removeAttribute("aria-current");
          });
        });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    sections.forEach((s) => observer.observe(s));
  }

  /* ---------- Scroll reveal (progressive enhancement) ---------- */
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if ("IntersectionObserver" in window && !reduce) {
    document.documentElement.classList.add("js-reveal");
    const targets = $$(".section-head, .card, .sample-group > h3, .sample, .step, .award-list li, .workflow-head");
    targets.forEach((el, i) => { el.classList.add("reveal"); el.style.transitionDelay = (i % 4) * 60 + "ms"; });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        io.unobserve(e.target);
        setTimeout(() => { e.target.style.transitionDelay = ""; }, 800);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
    targets.forEach((el) => io.observe(el));
  }
})();
