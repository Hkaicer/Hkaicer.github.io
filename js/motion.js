/* =====================================================
   Houssam Kaicer — Portfolio002
   Motion layer · hero network · word reveals · profile card · drawn icons ·
   card light · timeline progress · diagram build-up · decoding kickers
   Purely decorative: with reduced motion, or if this file fails, the site
   reads exactly the same, only still.
   ===================================================== */
(function () {
  "use strict";

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var root = document.documentElement;
  root.classList.add("motion");
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  // run fn at most once per animation frame
  function onFrame(fn) {
    var queued = false;
    return function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () { queued = false; fn(); });
    };
  }

  /* ---------- hero: a slow network, packets travelling along its links ---------- */
  function heroNetwork(hero) {
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext && canvas.getContext("2d");
    if (!ctx) return;
    canvas.className = "hero-net";
    canvas.setAttribute("aria-hidden", "true");
    var bg = hero.querySelector(".hero-bg");
    hero.insertBefore(canvas, bg ? bg.nextSibling : hero.firstChild);

    var compact = hero.classList.contains("hero-compact");
    var LINK = compact ? 130 : 150;
    var REACH = 170;
    var w = 0, h = 0;
    var nodes = [], packets = [];
    var pointer = { x: -1e4, y: -1e4 };
    var running = false, inView = true, last = 0, nextPacket = 0;

    function makeNode() {
      var a = Math.random() * Math.PI * 2;
      var speed = 0.006 + Math.random() * 0.012; // px per ms
      return {
        x: Math.random() * w, y: Math.random() * h,
        vx: Math.cos(a) * speed, vy: Math.sin(a) * speed,
        r: 1.1 + Math.random() * 1.3,
        hub: Math.random() < 0.14,
        glow: 0
      };
    }

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = hero.clientWidth;
      h = hero.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var want = Math.max(16, Math.min(compact ? 46 : 72, Math.round((w * h) / 15000)));
      while (nodes.length < want) nodes.push(makeNode());
      nodes.length = want;
      nodes.forEach(function (n) {
        if (n.x > w) n.x = Math.random() * w;
        if (n.y > h) n.y = Math.random() * h;
      });
    }

    function spawnPacket() {
      if (packets.length > 5) return;
      var a = nodes[(Math.random() * nodes.length) | 0];
      var near = nodes.filter(function (b) {
        var dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
        return b !== a && d2 < LINK * LINK;
      });
      if (!near.length) return;
      var b = near[(Math.random() * near.length) | 0];
      packets.push({ a: a, b: b, t: 0, dur: 700 + Math.random() * 600 });
    }

    function draw(dt) {
      var i, j, n, a, b, dx, dy, d2, d;
      ctx.clearRect(0, 0, w, h);

      for (i = 0; i < nodes.length; i++) {
        n = nodes[i];
        n.x += n.vx * dt;
        n.y += n.vy * dt;
        if (n.x < 0) n.vx = Math.abs(n.vx); else if (n.x > w) n.vx = -Math.abs(n.vx);
        if (n.y < 0) n.vy = Math.abs(n.vy); else if (n.y > h) n.vy = -Math.abs(n.vy);
        if (n.glow > 0) n.glow = Math.max(0, n.glow - dt / 900);
      }

      ctx.lineWidth = 1;
      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        for (j = i + 1; j < nodes.length; j++) {
          b = nodes[j];
          dx = a.x - b.x; dy = a.y - b.y; d2 = dx * dx + dy * dy;
          if (d2 > LINK * LINK) continue;
          ctx.strokeStyle = "rgba(127, 179, 245, " + ((1 - Math.sqrt(d2) / LINK) * 0.22).toFixed(3) + ")";
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
        dx = a.x - pointer.x; dy = a.y - pointer.y; d = Math.sqrt(dx * dx + dy * dy);
        if (d < REACH) {
          ctx.strokeStyle = "rgba(95, 211, 222, " + ((1 - d / REACH) * 0.35).toFixed(3) + ")";
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(pointer.x, pointer.y); ctx.stroke();
        }
      }

      for (i = 0; i < nodes.length; i++) {
        n = nodes[i];
        if (n.glow > 0) {
          ctx.fillStyle = "rgba(17, 168, 181, " + (0.3 * n.glow).toFixed(3) + ")";
          ctx.beginPath(); ctx.arc(n.x, n.y, n.r + 7 * n.glow, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = n.hub ? "rgba(95, 211, 222, 0.85)" : "rgba(220, 232, 244, 0.5)";
        ctx.beginPath(); ctx.arc(n.x, n.y, n.hub ? n.r + 0.8 : n.r, 0, Math.PI * 2); ctx.fill();
      }

      for (i = packets.length - 1; i >= 0; i--) {
        var p = packets[i];
        p.t += dt / p.dur;
        dx = p.a.x - p.b.x; dy = p.a.y - p.b.y;
        if (p.t >= 1 || dx * dx + dy * dy > LINK * LINK * 1.6) {
          if (p.t >= 1) p.b.glow = 1;
          packets.splice(i, 1);
          continue;
        }
        var e = p.t < 0.5 ? 2 * p.t * p.t : 1 - Math.pow(-2 * p.t + 2, 2) / 2;
        var x = p.a.x + (p.b.x - p.a.x) * e, y = p.a.y + (p.b.y - p.a.y) * e;
        ctx.fillStyle = "rgba(95, 211, 222, 0.18)";
        ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#9BE7EE";
        ctx.beginPath(); ctx.arc(x, y, 1.8, 0, Math.PI * 2); ctx.fill();
      }
    }

    function frame(now) {
      if (!running) return;
      var dt = last ? Math.min(48, now - last) : 16;
      last = now;
      if (now > nextPacket) { spawnPacket(); nextPacket = now + 450 + Math.random() * 850; }
      draw(dt);
      requestAnimationFrame(frame);
    }
    function start() {
      if (running || !inView || document.hidden) return;
      running = true;
      last = 0;
      requestAnimationFrame(frame);
    }
    function stop() { running = false; }

    resize();
    start();
    requestAnimationFrame(function () { canvas.classList.add("on"); });

    if ("ResizeObserver" in window) new ResizeObserver(onFrame(resize)).observe(hero);
    else window.addEventListener("resize", onFrame(resize));

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        if (inView) start(); else stop();
      }).observe(hero);
    }
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop(); else start();
    });

    if (finePointer) {
      hero.addEventListener("pointermove", function (e) {
        var r = hero.getBoundingClientRect();
        pointer.x = e.clientX - r.left;
        pointer.y = e.clientY - r.top;
      });
      hero.addEventListener("pointerleave", function () { pointer.x = pointer.y = -1e4; });
    }
  }
  document.querySelectorAll(".hero").forEach(heroNetwork);

  /* ---------- headings: words rise out of a mask ----------
     Splits on ordinary spaces only, so a French non-breaking space keeps
     "détail ?" together. Re-run after a language switch rewrites the text. */
  var SPLIT = ".hero h1, main h2";

  function splitWords(el) {
    if (el.querySelector(".w")) return;
    var made = [];
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.nodeValue.split(/([ \t\r\n]+)/).forEach(function (part) {
            if (!part) return;
            if (!part.trim()) { frag.appendChild(document.createTextNode(part)); return; }
            var outer = document.createElement("span");
            var inner = document.createElement("span");
            outer.className = "w";
            inner.textContent = part;
            outer.appendChild(inner);
            frag.appendChild(outer);
            made.push(inner);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1 && child.tagName !== "BR") {
          walk(child);
        }
      });
    })(el);
    var step = Math.min(45, 700 / Math.max(made.length, 1));
    made.forEach(function (s, i) { s.style.setProperty("--wd", Math.round(i * step) + "ms"); });
    el.classList.add("split");
  }
  document.querySelectorAll(SPLIT).forEach(splitWords);

  /* ---------- kickers decode like a terminal line ---------- */
  var DECODE = ".kicker, .hero .eyebrow";
  var GLYPHS = "abcdefghijklmnopqrstuvwxyz0123456789/<>_#*";

  function decode(el) {
    if (el.children.length) return;
    var target = el.textContent;
    var token = {};
    var start = performance.now();
    var dur = 450 + target.length * 14;
    el._decode = token;
    (function step(now) {
      if (el._decode !== token) return;
      var p = Math.min(1, (now - start) / dur);
      var shown = Math.floor(p * target.length);
      var out = target.slice(0, shown);
      for (var i = shown; i < target.length; i++) {
        var ch = target.charAt(i);
        out += /[\s·]/.test(ch) ? ch : GLYPHS.charAt((Math.random() * GLYPHS.length) | 0);
      }
      el.textContent = p < 1 ? out : target;
      if (p < 1) requestAnimationFrame(step); else el._decode = null;
    })(start);
  }
  if ("IntersectionObserver" in window) {
    var decodeObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        decodeObserver.unobserve(entry.target);
        decode(entry.target);
      });
    }, { threshold: 0.6 });
    document.querySelectorAll(DECODE).forEach(function (el) { decodeObserver.observe(el); });
  }

  /* ---------- hero: profile card tilts toward the cursor, rows cascade in ---------- */
  var card = document.querySelector(".hero .profile-card");
  if (card) {
    card.querySelectorAll(".prow").forEach(function (row, i) { row.style.setProperty("--i", i); });
    setTimeout(function () { card.classList.add("rows-in"); }, 450);

    var tilt = document.createElement("div");
    tilt.className = "tilt";
    card.parentNode.insertBefore(tilt, card);
    tilt.appendChild(card);

    if (finePointer) {
      tilt.addEventListener("pointermove", function (e) {
        var r = tilt.getBoundingClientRect();
        var px = Math.max(-0.5, Math.min(0.5, (e.clientX - r.left) / r.width - 0.5));
        var py = Math.max(-0.5, Math.min(0.5, (e.clientY - r.top) / r.height - 0.5));
        tilt.classList.add("hover");
        tilt.style.setProperty("--ry", (px * 9).toFixed(2) + "deg");
        tilt.style.setProperty("--rx", (-py * 7).toFixed(2) + "deg");
        tilt.style.setProperty("--gx", ((px + 0.5) * 100).toFixed(1) + "%");
        tilt.style.setProperty("--gy", ((py + 0.5) * 100).toFixed(1) + "%");
      });
      tilt.addEventListener("pointerleave", function () {
        tilt.classList.remove("hover");
        tilt.style.setProperty("--rx", "0deg");
        tilt.style.setProperty("--ry", "0deg");
      });
    }
  }

  /* ---------- capabilities: icons draw their own outline ---------- */
  document.querySelectorAll(".cap-icon svg").forEach(function (svg) {
    svg.querySelectorAll("path, circle, rect, ellipse, line, polyline, polygon").forEach(function (shape) {
      var len = 0;
      try { len = shape.getTotalLength(); } catch (e) { len = 0; }
      if (!len) return;
      shape.style.setProperty("--len", Math.ceil(len + 1));
      shape.classList.add("draw");
    });
  });

  /* ---------- projects: a soft light follows the cursor ---------- */
  if (finePointer) {
    document.querySelectorAll(".project-card").forEach(function (c) {
      c.addEventListener("pointermove", function (e) {
        var r = c.getBoundingClientRect();
        c.style.setProperty("--mx", Math.round(e.clientX - r.left) + "px");
        c.style.setProperty("--my", Math.round(e.clientY - r.top) + "px");
      });
    });
  }

  /* ---------- experience: the timeline fills as you scroll ---------- */
  var timeline = document.querySelector(".timeline");
  if (timeline) {
    var bar = document.createElement("span");
    bar.className = "tl-progress";
    bar.setAttribute("aria-hidden", "true");
    timeline.insertBefore(bar, timeline.firstChild);
    var dots = Array.prototype.slice.call(timeline.querySelectorAll(".tl-dot"));

    var updateTimeline = onFrame(function () {
      var r = timeline.getBoundingClientRect();
      var line = window.innerHeight * 0.62;
      bar.style.setProperty("--tp", Math.min(1, Math.max(0, (line - r.top) / r.height)).toFixed(4));
      dots.forEach(function (dot) {
        dot.parentNode.classList.toggle("passed", dot.getBoundingClientRect().top + 6 < line);
      });
    });
    window.addEventListener("scroll", updateTimeline, { passive: true });
    window.addEventListener("resize", updateTimeline);
    updateTimeline();
  }

  /* ---------- case studies: diagrams build up from left to right ----------
     Once built, the staging classes are removed so js/diagram.js owns the
     node transitions from then on. */
  document.querySelectorAll(".diagram-wrap .pipeline-svg").forEach(function (svg) {
    var vb = svg.viewBox && svg.viewBox.baseVal;
    var W = (vb && vb.width) || 960;
    function stage(el, x, extra) {
      el.classList.add("anim-in");
      el.style.setProperty("--dd", Math.round(150 + (x / W) * 900 + (extra || 0)) + "ms");
    }
    svg.querySelectorAll(".group-box, .glabel").forEach(function (el) { stage(el, 0); });
    svg.querySelectorAll("rect.node").forEach(function (rect) {
      var x = rect.x.baseVal.value;
      stage(rect, x);
      for (var t = rect.nextElementSibling; t && t.tagName.toLowerCase() === "text"; t = t.nextElementSibling) stage(t, x);
    });
    svg.querySelectorAll(".flow > *").forEach(function (el) {
      var x = W / 2;
      try { var b = el.getBBox(); x = b.x + b.width; } catch (e) { /* not rendered yet */ }
      stage(el, x, 120);
    });
    svg.querySelectorAll(".bar, .bartext").forEach(function (el) { stage(el, W, 150); });

    if ("IntersectionObserver" in window) {
      var built = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        built.disconnect();
        setTimeout(function () {
          svg.querySelectorAll(".anim-in").forEach(function (el) {
            el.classList.remove("anim-in");
            el.style.removeProperty("--dd");
          });
        }, 2600);
      }, { threshold: 0.12 });
      built.observe(svg.closest(".diagram-wrap"));
    }
  });

  /* ---------- language switch: re-split rewritten headings, stop stale decodes ---------- */
  document.addEventListener("langchange", function () {
    document.querySelectorAll(DECODE).forEach(function (el) { el._decode = null; });
    document.querySelectorAll(SPLIT).forEach(splitWords);
  });
})();
