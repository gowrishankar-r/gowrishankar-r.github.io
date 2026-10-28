/* ==========================================================
   Gowrishankar R – Portfolio interactions
   ========================================================== */
(function () {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- Footer year ---------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Toast helper ---------- */
  const toast = $("#toast");
  let toastTimer;
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 3500);
  }

  /* ---------- Placeholder links (LinkedIn / GitHub not in resume) ---------- */
  $$(".placeholder-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      showToast("Add your " + (link.dataset.name || "profile") + " URL in index.html to activate this link.");
    });
  });

  /* ---------- Mobile navigation ---------- */
  const navToggle = $("#navToggle");
  const navMenu = $("#navMenu");

  function setMenu(open) {
    navMenu.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.innerHTML = open ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
  }
  navToggle.addEventListener("click", () => setMenu(!navMenu.classList.contains("open")));
  $$(".nav-link").forEach((l) => l.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navMenu.classList.contains("open")) {
      setMenu(false);
      navToggle.focus();
    }
  });

  /* ---------- Active navigation highlighting ---------- */
  const sections = $$("main section[id]");
  const navLinks = $$(".nav-link");
  if ("IntersectionObserver" in window) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            navLinks.forEach((l) => {
              const active = l.getAttribute("href") === "#" + entry.target.id;
              l.classList.toggle("active", active);
              if (active) l.setAttribute("aria-current", "true");
              else l.removeAttribute("aria-current");
            });
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => navObserver.observe(s));
  }

  /* ---------- Scroll reveal ---------- */
  const revealEls = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach((el, i) => {
      el.style.transitionDelay = (i % 4) * 70 + "ms"; // small stagger
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach((el) => el.classList.add("visible"));
  }

  /* ---------- Count-up for numeric stats ---------- */
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  $$("[data-count]").forEach((el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    if (reduceMotion || isNaN(target)) return;
    el.textContent = (0).toFixed(decimals);
    const obs = new IntersectionObserver((entries, o) => {
      if (!entries[0].isIntersecting) return;
      const start = performance.now();
      const duration = 1200;
      (function tick(now) {
        const p = Math.min((now - start) / duration, 1);
        el.textContent = (target * p).toFixed(decimals);
        if (p < 1) requestAnimationFrame(tick);
      })(start);
      o.disconnect();
    });
    obs.observe(el);
  });

  /* ---------- Back-to-top button ---------- */
  const toTop = $("#toTop");
  window.addEventListener("scroll", () => toTop.classList.toggle("show", window.scrollY > 500), { passive: true });
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));

  /* ---------- Contact form validation ---------- */
  const form = $("#contactForm");
  const status = $("#formStatus");
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const rules = {
    name: (v) => (v.trim().length < 2 ? "Please enter your name (at least 2 characters)." : ""),
    email: (v) => (!emailPattern.test(v.trim()) ? "Please enter a valid email address." : ""),
    subject: (v) => (v.trim().length < 3 ? "Please enter a subject (at least 3 characters)." : ""),
    message: (v) => (v.trim().length < 10 ? "Please write a message (at least 10 characters)." : ""),
  };

  function validateField(input) {
    const msg = rules[input.name](input.value);
    const field = input.closest(".field");
    $(".error", field).textContent = msg;
    field.classList.toggle("invalid", Boolean(msg));
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    return !msg;
  }

  $$("input, textarea", form).forEach((input) => {
    input.addEventListener("blur", () => validateField(input));
    input.addEventListener("input", () => {
      if (input.closest(".field").classList.contains("invalid")) validateField(input);
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    status.textContent = "";
    const inputs = $$("input, textarea", form);
    const results = inputs.map(validateField);
    if (results.includes(false)) {
      inputs[results.indexOf(false)].focus(); // focus first invalid field
      return;
    }

    /* No backend yet: open the visitor's email app with the message pre-filled.
       To send real emails, replace this block with a fetch() call to a form
       service such as Formspree, or add the netlify attribute to the <form>. */
    const data = Object.fromEntries(new FormData(form).entries());
    const body = `${data.message}\n\n— ${data.name} (${data.email})`;
    window.location.href =
      "mailto:vrs.gowrishankar@gmail.com?subject=" + encodeURIComponent(data.subject) +
      "&body=" + encodeURIComponent(body);

    status.textContent = "Thanks! Your email app should open with the message ready to send.";
    form.reset();
  });
})();
