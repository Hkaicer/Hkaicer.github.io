/* =====================================================
   Houssam Kaicer — Portfolio002
   Interactive architecture maps on the case studies
   · every stage is linked both ways to its bullet under the map
   · data travels along the links and changes shape as it is processed
   · a guided run plays one full cycle, stage by stage
   With reduced motion nothing travels, but stages still highlight
   and the guided run still steps through.
   ===================================================== */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var SVGNS = "http://www.w3.org/2000/svg";
  var STEP_MS = 2600;

  function lang() { return document.documentElement.lang === "fr" ? "fr" : "en"; }
  function t(key) {
    var dict = typeof I18N !== "undefined" && I18N[lang()];
    return (dict && dict[key]) || "";
  }
  function make(name, attrs, parent) {
    var el = document.createElementNS(SVGNS, name);
    Object.keys(attrs || {}).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    if (parent) parent.appendChild(el);
    return el;
  }

  /* what travels on a link: its shape around (0, 0) and its speed in map units per ms */
  var KINDS = {
    event:  { speed: 0.10,  draw: function (g) { make("circle", { r: 2.3 }, g); } },
    window: { speed: 0.075, draw: function (g) { make("rect", { x: -3.5, y: -3.5, width: 7, height: 7, rx: 1.6 }, g); } },
    score:  { speed: 0.07,  draw: function (g) { make("circle", { r: 3 }, g); } },
    alert:  { speed: 0.12,  draw: function (g) { make("rect", { x: -3.4, y: -3.4, width: 6.8, height: 6.8, transform: "rotate(45)" }, g); } },
    beat:   { speed: 0.10,  draw: function (g) { make("circle", { r: 2.1 }, g); } },
    down:   { speed: 0.07,  draw: function (g) { make("circle", { r: 3 }, g); } },
    fix:    { speed: 0.33,  draw: function (g) { make("circle", { r: 3 }, g); } }
  };

  /* one entry per map (data-diagram on .diagram-wrap)
     rest:   how often each link emits at rest, in ms ("from>to")
     fanout: links whose emission goes out on every branch at once
     steps:  the guided run; text keys reuse the bullets, so nothing new is claimed */
  var CONFIG = {
    pfe: {
      play: "cs.diag.play",
      done: "cs.diag.done",
      rest: { "collect>ingest": 110, "ingest>profile": 170, "profile>score": 1000, "score>explain": 2600, "explain>deliver": 7000 },
      fanout: { "explain>deliver": true },
      steps: [
        { stage: "collect",     title: "cs.diag.st1", text: "cs.s2.b1" },
        { stage: "ingest",      title: "cs.diag.st2", text: "cs.s2.b2" },
        { stage: "profile",     title: "cs.diag.st3", text: "cs.s2.b3" },
        { stage: "score",       title: "cs.diag.st4", text: "cs.s2.b4", ms: 3400, fx: "models" },
        { stage: "explain",     title: "cs.diag.st5", text: "cs.s2.b6" },
        { stage: "deliver",     title: "cs.diag.st6", text: "cs.s2.b7", ms: 3000, fx: "cascade" },
        { stage: "orchestrate", title: "cs.diag.st7", text: "cs.s2.b5", ms: 3200, fx: "sweep", wide: true }
      ]
    },
    bbrs: {
      play: "bcs.diag.play",
      done: "bcs.s3.title",
      rest: { "aps>poll": 230, "poll>health": 250, "health>watch": 800 },
      fanout: {},
      // the access point is down from the first step until the on-site fix lands
      downFrom: 0,
      fixAt: 4,
      steps: [
        { stage: "aps",       title: "bcs.diag.st1", text: "bcs.diag.c1", also: ["sites"] },
        { stage: "poll",      title: "bcs.diag.st2", text: "bcs.s2.b1", trace: { kind: "down", to: ["poll"] } },
        { stage: "health",    title: "bcs.diag.st3", text: "bcs.s2.b2", trace: { kind: "down", to: ["health"] } },
        { stage: "alert",     title: "bcs.diag.st4", text: "bcs.s2.b3", ms: 3000, also: ["support"], trace: { kind: "alert", to: ["alert", "support"] } },
        { stage: "support",   title: "bcs.diag.st5", text: "bcs.s3.pr2", ms: 3600, fx: "fix", also: ["aps"] },
        { stage: "watch",     title: "bcs.diag.st6", text: "bcs.s2.b4" },
        { stage: "provision", title: "bcs.diag.st7", text: "bcs.s2.b5", ms: 3200, fx: "sweep", wide: true }
      ]
    }
  };

  /* ---------- geometry: links sampled once, then read by interpolation ---------- */
  function sample(el) {
    var len = 0;
    try { len = el.getTotalLength(); } catch (e) { len = 0; }
    if (!len) return null;
    var n = Math.max(6, Math.round(len / 5)), xy = [];
    for (var i = 0; i <= n; i++) {
      var p = el.getPointAtLength(len * i / n);
      xy.push(p.x, p.y);
    }
    return { len: len, n: n, xy: xy };
  }
  function pointAt(s, t) {
    var f = Math.max(0, Math.min(1, t)) * s.n;
    var i = Math.min(s.n - 1, Math.floor(f)), r = f - i, k = 2 * i;
    return [s.xy[k] + (s.xy[k + 2] - s.xy[k]) * r, s.xy[k + 1] + (s.xy[k + 3] - s.xy[k + 1]) * r];
  }

  function setup(wrap) {
    var cfg = CONFIG[wrap.getAttribute("data-diagram")];
    var svg = wrap.querySelector(".pipeline-svg");
    var ui = wrap.querySelector(".diagram-ui");
    if (!cfg || !svg || !ui) return;

    var scroller = wrap.querySelector(".diagram-scroll");
    var layer = svg.querySelector(".particles");
    var playBtn = ui.querySelector(".dui-play");
    var playLabel = playBtn.querySelector("[data-i18n]");
    var stepsBox = ui.querySelector(".dui-steps");
    var capNum = ui.querySelector(".dui-num");
    var capTitle = ui.querySelector(".dui-title");
    var capText = ui.querySelector(".dui-text");
    var W = (svg.viewBox && svg.viewBox.baseVal && svg.viewBox.baseVal.width) || 960;
    var rest = cfg.rest || {}, fanout = cfg.fanout || {};

    if (!reduced) svg.classList.add("live");

    /* ---------- stages, links and bullets ---------- */
    var stages = {};
    function stage(id) { return stages[id] || (stages[id] = { els: [], items: [] }); }
    svg.querySelectorAll("[data-stage]").forEach(function (el) { stage(el.getAttribute("data-stage")).els.push(el); });
    wrap.parentNode.querySelectorAll(".cs-list li[data-stage]").forEach(function (li) { stage(li.getAttribute("data-stage")).items.push(li); });

    // a status light on every node, and a flash that fires when something arrives
    svg.querySelectorAll(".dnode > .node").forEach(function (rect) {
      var g = rect.parentNode;
      var x = +rect.getAttribute("x"), y = +rect.getAttribute("y"), w = +rect.getAttribute("width");
      var led = make("circle", { "class": "led", cx: x + w - 10, cy: y + 10, r: 2.6 }, g);
      if (rect.classList.contains("anim-in")) {
        led.classList.add("anim-in");
        led.style.setProperty("--dd", rect.style.getPropertyValue("--dd"));
      }
      g._flash = make("circle", { "class": "led-flash", cx: x + w - 10, cy: y + 10, r: 4 }, g);
      g._box = { x: x, y: y, w: w, h: +rect.getAttribute("height") };
    });

    var links = [], groups = {};
    svg.querySelectorAll(".flow [data-from]").forEach(function (el) {
      var l = { el: el, from: el.getAttribute("data-from"), to: el.getAttribute("data-to"), kind: el.getAttribute("data-kind") || "", path: sample(el) };
      l.key = l.from + ">" + l.to;
      links.push(l);
      (groups[l.key] = groups[l.key] || []).push(l);
      // what it flashes on arrival: the node of the target stage nearest to its end
      if (l.path) {
        var end = pointAt(l.path, 1), best = null, bd = Infinity;
        stage(l.to).els.forEach(function (g) {
          var b = g._box;
          if (!b) return;
          var cx = Math.max(b.x, Math.min(end[0], b.x + b.w)), cy = Math.max(b.y, Math.min(end[1], b.y + b.h));
          var d = (cx - end[0]) * (cx - end[0]) + (cy - end[1]) * (cy - end[1]);
          if (d < bd) { bd = d; best = g; }
        });
        l.target = best;
      }
    });

    /* ---------- particles ---------- */
    var parts = [], pool = {}, active = null, nextAt = {};

    function spawn(link, kind, done) {
      if (reduced || !link.path || !KINDS[kind]) { if (done) done(); return; }
      var bin = pool[kind] || (pool[kind] = []);
      var g = bin.pop();
      if (!g) {
        g = make("g", { "class": "pt pt-" + kind });
        KINDS[kind].draw(g);
      }
      layer.appendChild(g);
      parts.push({ g: g, link: link, kind: kind, t: 0, dur: Math.max(650, link.path.len / KINDS[kind].speed), done: done, hot: null });
    }

    function flash(g) {
      var f = g && g._flash, now = performance.now();
      if (!f || !f.animate || (f._t && now - f._t < 250)) return;
      f._t = now;
      f.animate([{ opacity: 0.9 }, { opacity: 0 }], { duration: 520, easing: "ease-out" });
    }

    function emit(now) {
      Object.keys(rest).forEach(function (key) {
        var gap = rest[key], group = groups[key];
        if (!gap || !group) return;
        if (nextAt[key] === undefined) nextAt[key] = now + Math.random() * gap;
        if (now < nextAt[key]) return;
        var ends = key.split(">"), hot = active && (ends[0] === active || ends[1] === active);
        nextAt[key] = now + gap * (hot ? 0.45 : 1) * (0.6 + Math.random() * 0.8);
        if (fanout[key]) group.forEach(function (l) { spawn(l, l.kind); });
        else { var l = group[(Math.random() * group.length) | 0]; spawn(l, l.kind); }
      });
    }

    function tick(dt, now) {
      emit(now);
      for (var i = parts.length - 1; i >= 0; i--) {
        var p = parts[i];
        p.t += dt / p.dur;
        if (p.t >= 1) {
          flash(p.link.target);
          layer.removeChild(p.g);
          pool[p.kind].push(p.g);
          parts.splice(i, 1);
          if (p.done) p.done();
          continue;
        }
        // steady streams flow linearly, single packets ease in and out
        var e = p.kind === "event" || p.kind === "beat" ? p.t : (p.t < 0.5 ? 2 * p.t * p.t : 1 - Math.pow(-2 * p.t + 2, 2) / 2);
        var xy = pointAt(p.link.path, e);
        p.g.setAttribute("transform", "translate(" + xy[0].toFixed(1) + " " + xy[1].toFixed(1) + ")");
        var hot = !active || !p.link.key || p.link.el.classList.contains("on");
        if (hot !== p.hot) { p.hot = hot; p.g.classList.toggle("cold", !hot); }
      }
    }

    var loop = false, visible = false, last = 0;
    function frame(now) {
      if (!loop) return;
      var dt = last ? Math.min(50, now - last) : 16;
      last = now;
      tick(dt, now);
      requestAnimationFrame(frame);
    }
    function startLoop() {
      if (reduced || loop || !visible || document.hidden) return;
      loop = true;
      last = 0;
      requestAnimationFrame(frame);
    }
    function stopLoop() { loop = false; }
    document.addEventListener("visibilitychange", function () { if (document.hidden) stopLoop(); else startLoop(); });

    /* ---------- highlight + caption ---------- */
    function highlight(id, also, wide) {
      active = id;
      var on = {};
      if (id) on[id] = true;
      (also || []).forEach(function (x) { on[x] = true; });
      Object.keys(stages).forEach(function (k) {
        stages[k].els.forEach(function (el) { el.classList.toggle("on", !!on[k]); });
        stages[k].items.forEach(function (li) { li.classList.toggle("on", !!on[k]); });
      });
      links.forEach(function (l) { l.el.classList.toggle("on", !!(on[l.from] || on[l.to])); });
      svg.classList.toggle("focus", !!id && !wide);
    }

    function setText(el, key) {
      if (key) { el.setAttribute("data-i18n", key); el.innerHTML = t(key); }
      else { el.removeAttribute("data-i18n"); el.innerHTML = ""; }
    }
    function caption(i, doneKey) {
      var st = i >= 0 ? cfg.steps[i] : null;
      capNum.textContent = st ? (i < 9 ? "0" : "") + (i + 1) + " · " : "";
      setText(capTitle, st ? st.title : null);
      setText(capText, st ? st.text : (doneKey || "diag.hint"));
      ui.classList.toggle("has-step", !!st);
      ui.classList.toggle("is-done", !!doneKey);
    }

    /* ---------- per-step effects ---------- */
    var fxTimers = [];
    function later(fn, ms) { fxTimers.push(setTimeout(fn, ms)); }

    var sweepEl = svg.querySelector(".bar-sweep"), sweepAnim = null;
    function sweep(ms) {
      if (!sweepEl || reduced || !sweepEl.animate) return;
      svg.classList.add("sweeping");
      sweepAnim = sweepEl.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }],
        { duration: Math.max(800, ms - 400), easing: "linear", fill: "forwards" });
    }

    // BBRS only: one access point goes down, a chip says so, the on-site fix brings it back
    var ap = svg.querySelector("[data-ap]"), chip = null, chipRect = null, chipText = null;
    var fixArc = svg.querySelector(".fix-arc"), fixPath = fixArc ? sample(fixArc) : null;
    function chipSet(key, up) {
      if (!ap) return;
      if (!chip) {
        var b = ap._box;
        chip = make("g", { "class": "ap-chip", transform: "translate(" + (b.x + b.w / 2) + " " + (b.y - 15) + ")" }, svg);
        chipRect = make("rect", { x: -40, y: -10, width: 80, height: 20, rx: 10 }, chip);
        chipText = make("text", { y: 3.5, "text-anchor": "middle", "font-size": 9.5, "font-weight": 700, "font-family": "'JetBrains Mono', monospace" }, chip);
      }
      chip.setAttribute("data-key", key);
      chipText.textContent = t(key);
      var w = 24 + (chipText.getComputedTextLength ? chipText.getComputedTextLength() : 60);
      chipRect.setAttribute("x", (-w / 2).toFixed(1));
      chipRect.setAttribute("width", w.toFixed(1));
      chip.classList.toggle("up", !!up);
      chip.classList.add("show");
    }
    function apDown(down) {
      if (!ap) return;
      ap.classList.toggle("is-down", down);
      if (down) chipSet("bcs.diag.down", false);
      else if (chip) chip.classList.remove("show");
    }
    function fix() {
      if (!fixArc || !fixPath) return;
      fixArc.classList.add("show");
      later(function () {
        spawn({ el: fixArc, path: fixPath, target: ap }, "fix", function () {
          if (current !== cfg.fixAt) return;
          apDown(false);
          chipSet("bcs.diag.up", true);
          later(function () {
            if (chip) chip.classList.remove("show");
            fixArc.classList.remove("show");
          }, 1500);
        });
      }, 450);
    }

    // one packet on every link touching the stage, so each step reads at a glance
    function burst(id) {
      links.forEach(function (l) {
        if (!rest[l.key] || (l.from !== id && l.to !== id)) return;
        spawn(l, l.kind);
      });
    }
    function trace(spec) {
      later(function () {
        links.forEach(function (l) {
          if (l.from !== l.to && spec.to.indexOf(l.to) !== -1) spawn(l, spec.kind);
        });
      }, 250);
    }

    function clearFx() {
      fxTimers.forEach(clearTimeout);
      fxTimers = [];
      svg.querySelectorAll(".m.lit").forEach(function (m) { m.classList.remove("lit"); });
      if (sweepAnim) { sweepAnim.cancel(); sweepAnim = null; }
      svg.classList.remove("sweeping");
      if (fixArc) fixArc.classList.remove("show");
    }

    function effects(st, i, scenario) {
      clearFx();
      if (cfg.fixAt !== undefined) apDown(!!scenario && i >= cfg.downFrom && i <= cfg.fixAt);
      if (st.fx === "models") {
        svg.querySelectorAll(".m").forEach(function (m, k) { later(function () { m.classList.add("lit"); }, 350 + k * 420); });
      }
      if (st.fx === "cascade") {
        stage(st.stage).els.forEach(function (el, k) {
          el.classList.remove("on");
          later(function () { el.classList.add("on"); }, 120 + k * 300);
        });
      }
      if (st.fx === "sweep") sweep(st.ms || STEP_MS);
      if (st.fx === "fix" && scenario) fix();
      if (st.trace && scenario) trace(st.trace);
      burst(st.stage);
    }

    // on a narrow screen the map scrolls sideways: keep the current stage in view
    function follow(st) {
      if (st.wide || !scroller || scroller.scrollWidth <= scroller.clientWidth + 4) return;
      var xs = [];
      stage(st.stage).els.forEach(function (el) { if (el._box) xs.push(el._box.x, el._box.x + el._box.w); });
      if (!xs.length) return;
      var mid = (Math.min.apply(null, xs) + Math.max.apply(null, xs)) / 2;
      var k = svg.getBoundingClientRect().width / W;
      scroller.scrollTo({ left: Math.max(0, mid * k - scroller.clientWidth / 2), behavior: reduced ? "auto" : "smooth" });
    }

    /* ---------- showing a step, resting, the guided run ---------- */
    var current = -1, pinned = false, running = false, runTimer = 0, resumeAt = 0, touched = false;

    var stepBtns = cfg.steps.map(function (st, i) {
      var b = document.createElement("button");
      var s = document.createElement("span");
      b.type = "button";
      b.className = "dui-step mono";
      b.setAttribute("aria-pressed", "false");
      s.setAttribute("data-i18n", st.title);
      s.innerHTML = t(st.title);
      b.appendChild(s);
      b.addEventListener("click", function () {
        touched = true;
        stopRun();
        show(i, true, true);
        resumeAt = i;
      });
      stepsBox.appendChild(b);
      return b;
    });

    function show(i, pin, scenario) {
      var st = cfg.steps[i];
      current = i;
      pinned = !!pin;
      highlight(st.stage, st.also, st.wide);
      stepBtns.forEach(function (b, k) {
        b.classList.toggle("on", k === i);
        b.setAttribute("aria-pressed", k === i ? "true" : "false");
      });
      stepBtns[i].style.setProperty("--ms", (st.ms || STEP_MS) + "ms");
      caption(i);
      effects(st, i, scenario);
      follow(st);
    }

    function settle() {
      current = -1;
      pinned = false;
      clearFx();
      highlight(null);
      stepBtns.forEach(function (b) { b.classList.remove("on"); b.setAttribute("aria-pressed", "false"); });
      caption(-1);
      if (cfg.fixAt !== undefined) apDown(false);
    }

    function setPlay() {
      var key = running ? "diag.pause" : cfg.play;
      playLabel.setAttribute("data-i18n", key);
      playLabel.innerHTML = t(key);
      playBtn.setAttribute("aria-pressed", running ? "true" : "false");
    }

    function step(i) {
      if (i >= cfg.steps.length) { finish(); return; }
      show(i, false, true);
      resumeAt = i;
      runTimer = setTimeout(function () { step(i + 1); }, (cfg.steps[i].ms || STEP_MS) * (reduced ? 1.3 : 1));
    }
    function play() {
      if (running) { pauseRun(); return; }
      clearTimeout(runTimer);
      running = true;
      wrap.classList.add("playing");
      setPlay();
      step(resumeAt);
    }
    function pauseRun() {
      clearTimeout(runTimer);
      running = false;
      wrap.classList.remove("playing");
      setPlay();
      pinned = current >= 0;
    }
    function stopRun() { if (running) pauseRun(); }
    function finish() {
      clearTimeout(runTimer);
      running = false;
      resumeAt = 0;
      wrap.classList.remove("playing");
      setPlay();
      clearFx();
      highlight(null);
      stepBtns.forEach(function (b) { b.classList.remove("on"); b.setAttribute("aria-pressed", "false"); });
      current = -1;
      caption(-1, cfg.done);
      runTimer = setTimeout(function () { if (!running && current < 0) caption(-1); }, 3500);
    }

    playBtn.addEventListener("click", function () { touched = true; play(); });

    /* ---------- pointer: hover previews (mouse), click or tap pins ---------- */
    function indexOf(id) {
      var i;
      for (i = 0; i < cfg.steps.length; i++) if (cfg.steps[i].stage === id) return i;
      for (i = 0; i < cfg.steps.length; i++) if ((cfg.steps[i].also || []).indexOf(id) !== -1) return i;
      return -1;
    }
    var leaveTimer = 0;
    function linkUp(el, id) {
      var i = indexOf(id);
      if (i < 0) return;
      el.addEventListener("pointerenter", function (e) {
        if (e.pointerType !== "mouse" || running || pinned) return;
        clearTimeout(leaveTimer);
        touched = true;
        if (current !== i) show(i, false);
      });
      el.addEventListener("pointerleave", function (e) {
        if (e.pointerType !== "mouse" || running || pinned) return;
        leaveTimer = setTimeout(settle, 90);
      });
      el.addEventListener("click", function () {
        touched = true;
        stopRun();
        clearTimeout(leaveTimer);
        if (pinned && current === i) { settle(); resumeAt = 0; return; }
        show(i, true);
        resumeAt = i;
      });
    }
    svg.querySelectorAll(".dnode, .dzone").forEach(function (el) { linkUp(el, el.getAttribute("data-stage")); });
    Object.keys(stages).forEach(function (k) { stages[k].items.forEach(function (li) { linkUp(li, k); }); });

    wrap.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && (pinned || running)) { stopRun(); settle(); resumeAt = 0; }
    });

    /* ---------- only animate while on screen; play one cycle the first time it is seen ---------- */
    var autoplayed = false;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        var e = entries[0];
        visible = e.isIntersecting;
        if (visible) startLoop();
        else { stopLoop(); stopRun(); }
        if (!autoplayed && !reduced && e.intersectionRatio >= 0.55) {
          autoplayed = true;
          setTimeout(function () { if (!touched && !running && visible) play(); }, 1700);
        }
      }, { threshold: [0, 0.55] }).observe(wrap);
    } else {
      visible = true;
      startLoop();
    }

    // texts with data-i18n follow the language switch on their own; the SVG chip does not
    document.addEventListener("langchange", function () {
      if (chip && chip.classList.contains("show")) chipSet(chip.getAttribute("data-key"), chip.classList.contains("up"));
    });

    setPlay();
    caption(-1);
  }

  document.querySelectorAll(".diagram-wrap[data-diagram]").forEach(setup);
})();
