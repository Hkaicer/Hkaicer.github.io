/* =====================================================
   Houssam Kaicer — Portfolio001
   Language toggle · theme · typing effect · reveals · filters · nav
   ===================================================== */
(function () {
  "use strict";

  document.documentElement.classList.add("js");

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- theme (light / dark) ----------
     The inline <head> script already set data-theme before first paint,
     so here we only handle the toggle. */
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }
  var themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var cur = document.documentElement.getAttribute("data-theme") || "light";
      applyTheme(cur === "dark" ? "light" : "dark");
    });
  }

  /* ---------- language ---------- */
  var currentLang = localStorage.getItem("lang") || "en";

  function applyLang(lang) {
    currentLang = lang;
    localStorage.setItem("lang", lang);
    document.documentElement.lang = lang;

    var dict = I18N[lang];
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (dict[key] !== undefined) el.innerHTML = dict[key];
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-ph");
      if (dict[key] !== undefined) el.setAttribute("placeholder", dict[key]);
    });
    document.querySelectorAll("[data-i18n-al]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-al");
      if (dict[key] !== undefined) el.setAttribute("aria-label", dict[key]);
    });

    document.querySelectorAll(".lang-btn").forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-lang") === lang);
    });

    // the CV download matches the selected language
    var cvBtn = document.getElementById("cvBtn");
    if (cvBtn) {
      cvBtn.setAttribute("href", lang === "fr"
        ? "assets/cv/CV_Houssam_Kaicer_FR.pdf"
        : "assets/cv/CV_Houssam_Kaicer_EN.pdf");
    }

    // brief fade so the swap doesn't feel abrupt
    document.body.classList.remove("lang-fade");
    void document.body.offsetWidth; // restart animation
    document.body.classList.add("lang-fade");

    restartTyping();
  }

  document.querySelectorAll(".lang-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (btn.getAttribute("data-lang") !== currentLang) applyLang(btn.getAttribute("data-lang"));
    });
  });

  /* ---------- typing effect ---------- */
  var typedEl = document.getElementById("typed");
  var typeTimer = null;

  function restartTyping() {
    if (typeTimer) clearTimeout(typeTimer);
    if (!typedEl) return;

    var words = TYPED_WORDS[currentLang];
    if (reducedMotion) { typedEl.textContent = words[0]; return; }

    var wordIdx = 0, charIdx = 0, deleting = false;

    function tick() {
      var word = words[wordIdx];

      if (!deleting) {
        charIdx++;
        typedEl.textContent = word.slice(0, charIdx);
        if (charIdx === word.length) {
          deleting = true;
          typeTimer = setTimeout(tick, 1800); // pause on full word
          return;
        }
        typeTimer = setTimeout(tick, 55 + Math.random() * 45);
      } else {
        charIdx--;
        typedEl.textContent = word.slice(0, charIdx);
        if (charIdx === 0) {
          deleting = false;
          wordIdx = (wordIdx + 1) % words.length;
        }
        typeTimer = setTimeout(tick, 28);
      }
    }
    tick();
  }

  /* ---------- project filters ---------- */
  var filterBtns = document.querySelectorAll(".filter-btn");
  var projectCards = document.querySelectorAll(".project-card");

  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var filter = btn.getAttribute("data-filter");
      filterBtns.forEach(function (b) { b.classList.toggle("active", b === btn); });
      projectCards.forEach(function (card) {
        var cats = card.getAttribute("data-cats") || "";
        var show = filter === "all" || cats.split(" ").indexOf(filter) !== -1;
        card.classList.toggle("hidden", !show);
      });
    });
  });

  /* ---------- scroll reveals ---------- */
  var reveals = document.querySelectorAll(".reveal");

  if (reducedMotion || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("in"); });
  } else {
    // stagger siblings that enter together
    var groups = new Map();
    reveals.forEach(function (el) {
      var parent = el.parentElement;
      var n = groups.get(parent) || 0;
      el.style.setProperty("--d", Math.min(n * 90, 450) + "ms");
      groups.set(parent, n + 1);
    });

    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    reveals.forEach(function (el) { revealObserver.observe(el); });

    // safety net: if the observer never fires (blocked/broken), show everything
    setTimeout(function () {
      if (!document.querySelector(".reveal.in")) {
        reveals.forEach(function (el) { el.classList.add("in"); });
      }
    }, 2500);
  }

  /* ---------- nav: scrolled state + progress bar ---------- */
  var nav = document.getElementById("nav");
  var progressBar = document.getElementById("progressBar");
  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      nav.classList.toggle("scrolled", window.scrollY > 8);
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- nav: active link (index page sections only) ---------- */
  var sections = document.querySelectorAll("main section[id]");
  var navLinks = document.querySelectorAll(".nav-links a");

  if (sections.length && "IntersectionObserver" in window) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navLinks.forEach(function (link) {
            link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id);
          });
        }
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    sections.forEach(function (s) { sectionObserver.observe(s); });
  }

  /* ---------- mobile menu ---------- */
  var burger = document.getElementById("burger");
  var linksPanel = document.getElementById("navLinks");

  if (burger && linksPanel) {
    burger.addEventListener("click", function () {
      var open = linksPanel.classList.toggle("open");
      burger.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    navLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        linksPanel.classList.remove("open");
        burger.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- contact form ----------
     Submits to Formspree in the background so the visitor never leaves the page.
     Put your own form URL in FORMSPREE_ENDPOINT (see README). Until that is done,
     the form falls back to opening the visitor's mail app, so it is never broken. */
  var FORMSPREE_ENDPOINT = "https://formspree.io/f/xljrrkvk";

  var contactForm = document.getElementById("contactForm");
  if (contactForm) {
    var statusEl = document.getElementById("cfStatus");
    var sendBtn = contactForm.querySelector(".cf-send");

    function t(key) {
      return (I18N[currentLang] && I18N[currentLang][key]) || "";
    }

    // The status line carries a data-i18n key, so applyLang re-translates it on
    // a language switch without us tracking it separately.
    function setStatus(key, kind) {
      if (!statusEl) return;
      if (key) {
        statusEl.setAttribute("data-i18n", key);
        statusEl.innerHTML = t(key);
      } else {
        statusEl.removeAttribute("data-i18n");
        statusEl.textContent = "";
      }
      statusEl.className = "cf-status mono" + (kind ? " cf-" + kind : "");
    }

    function mailtoFallback(name, email, subject, message) {
      var body = [message, "", t("contact.mailFrom") + name + (email ? " (" + email + ")" : "")];
      window.location.href = "mailto:hkaicer11@gmail.com"
        + "?subject=" + encodeURIComponent(subject || t("contact.mailSubject"))
        + "&body=" + encodeURIComponent(body.join("\n"));
    }

    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = (document.getElementById("cfName").value || "").trim();
      var email = (document.getElementById("cfEmail").value || "").trim();
      var subject = (document.getElementById("cfSubject").value || "").trim();
      var message = (document.getElementById("cfMsg").value || "").trim();
      var gotchaEl = document.getElementById("cfGotcha");

      if (!email || !message) {
        setStatus("contact.formMissing", "err");
        return;
      }

      if (FORMSPREE_ENDPOINT.indexOf("YOUR_FORM_ID") !== -1) {
        mailtoFallback(name, email, subject, message);
        return;
      }

      setStatus("contact.formSending", null);
      if (sendBtn) sendBtn.disabled = true;

      fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name,
          email: email,
          message: message,
          _subject: subject || t("contact.mailSubject"),
          _gotcha: gotchaEl ? gotchaEl.value : ""
        })
      }).then(function (res) {
        if (res.ok) {
          contactForm.reset();
          setStatus("contact.formOk", "ok");
        } else {
          setStatus("contact.formErr", "err");
        }
      }).catch(function () {
        setStatus("contact.formErr", "err");
      }).then(function () {
        if (sendBtn) sendBtn.disabled = false;
      });
    });
  }

  /* ---------- footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- init ---------- */
  applyLang(currentLang);
})();
